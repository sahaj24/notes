import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = 'AIzaSyD2maptK3FUHCnFc6Y9cBRQuYRP1nB9WqQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { topic, template, pages } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Validate pages parameter
    const numPages = pages && pages >= 1 && pages <= 10 ? pages : 1;
    const coinsRequired = numPages; // 1 coin per page

    // Check authentication if provided
    let user = null;
    let userProfile = null;

    if (authHeader) {
      // Create authenticated Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

      if (!authError && authUser) {
        user = authUser;

        // Get user profile to check coins
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          userProfile = profile;

          // Check if user has enough coins
          if (profile.coins < coinsRequired) {
            return NextResponse.json({
              error: `Insufficient coins. You need ${coinsRequired} coins but have ${profile.coins}`,
              coinsRequired,
              coinsAvailable: profile.coins
            }, { status: 402 }); // Payment required
          }

          // No monthly limits - users can use all their coins freely
          // We already checked if they have enough coins above, so no additional limits needed
        }
      }
    }

    // Create a new prompt that asks for HTML/CSS output
    const prompt = createHtmlPrompt(topic, template, numPages);

    // Call Gemini API with retry logic
    const maxRetries = 3;
    let response: Response | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.9, // Slightly more creative
              topK: 40,
              topP: 0.95,
              maxOutputTokens: numPages > 1 ? 16384 : 8192, // Increased token limit for multi-page content
            },
          }),
        });

        if (response.ok) {
          break; // Success, exit loop
        }

        if (response.status === 503 && i < maxRetries - 1) {
          console.log(`Attempt ${i + 1} failed with 503. Retrying in 2 seconds...`);
          await new Promise(res => setTimeout(res, 2000)); // Wait 2s before retrying
          continue;
        }

      } catch (e) {
        console.error(`Fetch attempt ${i + 1} failed:`, e);
        if (i < maxRetries - 1) {
          await new Promise(res => setTimeout(res, 2000));
        } else {
          throw e; // Rethrow error on last attempt
        }
      }
    }


    if (!response || !response.ok) {
      const errorBody = await response?.text() || "Unknown error";
      console.error("Gemini API Error after retries:", errorBody);
      throw new Error(`Gemini API error: ${response?.status || '500'}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      console.error("Invalid API response structure:", data);
      throw new Error("Failed to get valid content from Gemini API.");
    }

    const generatedHtml = data.candidates[0].content.parts[0].text;

    // If user is authenticated, deduct coins and save note
    if (user && userProfile) {
      try {
        // Deduct coins using simple approach
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Calculate new coin balance and update profile
        const previous_balance = userProfile.coins;
        const new_balance = previous_balance - coinsRequired;

        const updateData = {
          coins: new_balance,
          total_coins_spent: userProfile.total_coins_spent + coinsRequired,
          total_notes_generated: userProfile.total_notes_generated + 1,
          last_transaction: {
            amount: coinsRequired,
            transaction_type: 'deduction',
            description: `Generated ${numPages} page note: "${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}"`,
            previous_balance,
            new_balance,
            timestamp: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        };

        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to deduct coins:', updateError);
          return NextResponse.json({
            error: 'Failed to process payment. Please try again.',
            details: updateError.message
          }, { status: 500 });
        }

        // Save note to database for history
        const noteData = {
          user_id: user.id,
          title: topic.substring(0, 100), // Limit title length
          content: generatedHtml,
          template: template || 'creative',
          pages: numPages,
          coins_spent: coinsRequired,
          created_at: new Date().toISOString()
        };

        const { data: savedNote, error: noteError } = await supabase
          .from('user_notes')
          .insert(noteData)
          .select()
          .single();

        if (noteError) {
          console.log('Note save failed but coins deducted:', noteError);
          // Don't fail the request, just log the error
        }

        // Return success with updated coin balance
        return NextResponse.json({
          noteHtml: generatedHtml,
          coinsRemaining: new_balance,
          coinsSpent: coinsRequired,
          profile: updatedProfile,
          noteId: savedNote?.id || null,
          saved: !!savedNote
        });

      } catch (dbError) {
        console.error('Database error after note generation:', dbError);
        // Note was generated but DB operations failed - still return the note
        return NextResponse.json({
          noteHtml: generatedHtml,
          warning: 'Note generated but payment processing had issues. Please contact support.'
        });
      }
    }

    // The AI now returns a full HTML document, so we just send that back.
    return NextResponse.json({
      noteHtml: generatedHtml,
      guestMode: true,
      message: 'Sign up to save notes and track usage!'
    });
  } catch (error: any) {
    console.error('Error generating note:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate note' },
      { status: 500 }
    );
  }
}

function createHtmlPrompt(topic: string, template: string = 'creative', numPages: number = 1): string {
  // Handle each template type separately
  if (template === 'timeline') {
    return createTimelinePrompt(topic, numPages);
  } else if (template === 'academic') {
    return createAcademicPrompt(topic, numPages);
  } else if (template === 'mindmap') {
    return createMindmapPrompt(topic, numPages);
  } else if (template === 'comparison') {
    return createComparisonPrompt(topic, numPages);
  } else if (template === 'notebook') {
    return createNotebookPrompt(topic, numPages);
  } else if (template === 'cheatsheet') {
    return createCheatsheetPrompt(topic, numPages);
  } else {
    // Default to creative template
    return createCreativePrompt(topic, numPages);
  }
}

// Creative template prompt - unchanged from original
function createCreativePrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'hand-drawn style with colorful elements and organic layouts',
    emphasis: 'Use vibrant colors, organic shapes, and artistic flourishes. Make it feel like a creative art journal.',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates beautiful visual notes specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be a **dense, beautiful, information collage**. The goal is to present information in a visually engaging, compact, and layered manner, as if it were cut and pasted into a physical scrapbook.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **DENSE, LAYERED COLLAGE - NO EMPTY SPACE:** This is the most important rule. The final note MUST look completely full and dense with NO empty or sparse areas. The layout should be compact and interlocking. Use the 8-column grid and a mix of \`col-span\` and \`row-span\` classes to create a dynamic layout with items of different sizes and shapes. Some items should be tall (\`row-span-3\`, \`row-span-4\`), others short. Some wide, some narrow. Fill EVERY available space on each page. Use the \`.tape\` class to create a layered, scrapbook feel.
    5.  **MAXIMUM CONTENT DENSITY:** Fill each page completely with rich, detailed content. Do NOT leave any section sparse or incomplete. Add more subsections, examples, details, and explanations to ensure full coverage of each page.
    6.  **EVEN DISTRIBUTION:** Distribute content evenly across all pages. Each page should have roughly equal amounts of content and visual density. No page should be significantly lighter or heavier than others.
    7.  **USE A VARIETY OF STYLES:** Do NOT wrap every single element in a colored box. Use a mix of styles: \`.section\` for main content, \`.sticky-note\` for callouts, \`.key-fact\` for small highlights, and \`.quote\` for citations. This variety is essential.
    8.  **NO DIAGRAMS OR IMAGES:** Do NOT include any placeholders for diagrams or images. The ONLY exception is the specific, hand-drawn SVG arrow code provided below.
    9.  **GENERATE RICH, ABUNDANT CONTENT:** Create at least 8-12 distinct sections of content per page, with detailed explanations, examples, and comprehensive coverage of "${topic}". Each page should be visually packed with information.
    10. **USE DECORATIVE ELEMENTS:** You MUST include decorative elements on EVERY page. This is mandatory. Use a mix of:
        - At least one hand-drawn arrow to connect ideas.
        - At least one wavy underline on a key phrase.
        - At least one circled piece of text.

    **VISUAL STYLE GUIDE (REPLICATE THIS):**
    -   **Main Container:** A wide, landscape-oriented \`<div class="note-paper">\`.
    -   **Handwriting Fonts:** Use varied handwriting Google Fonts.
    -   **Content Blocks:** Use a mix of \`.section\`, \`.sticky-note\`, \`.key-fact\`, and \`.quote\`.
    -   **Tape:** Use \`<div class="tape"></div>\` on some elements to make them look "taped on."

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Kalam:wght@300;400;700&family=Caveat&display=swap');
    body {
        background-color: #f4f4f4;
        background-image:
            linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px);
        background-size: 25px 25px;
        font-family: 'Kalam', cursive;
        padding: 2rem;
    }
    .note-paper {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        padding: 2.5rem;
        max-width: 1600px;  /* EVEN WIDER */
        margin: auto;
        margin-bottom: 2rem; /* Space between pages */
        display: grid;
        grid-template-columns: repeat(8, 1fr); /* 8 columns for wide layout */
        grid-auto-rows: min-content;
        grid-auto-flow: dense; /* IMPORTANT: This will help fill empty spaces */
        gap: 1.25rem; /* Reduced gap for a tighter layout */
        position: relative; /* For tape positioning */
    }
    .page-break {
        break-after: page;
        margin-bottom: 3rem;
    }
    .page-header {
        grid-column: 1 / -1;
        text-align: center;
        margin-bottom: 1rem;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(240,240,240,0.8));
        border-radius: 15px;
        font-family: 'Gochi Hand', cursive;
        font-size: 1.2rem;
        color: #666;
        transform: rotate(-0.5deg);
    }
    .page-continue {
        grid-column: 1 / -1;
        text-align: center;
        margin: 1rem 0;
        font-family: 'Caveat', cursive;
        font-size: 1.1rem;
        color: #888;
        font-style: italic;
    }
    .tape {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%) rotate(-4deg);
        width: 120px;
        height: 25px;
        background: rgba(255, 255, 0, 0.4);
        border-left: 2px dotted rgba(0,0,0,0.1);
        border-right: 2px dotted rgba(0,0,0,0.1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        z-index: 20;
    }
    .sticky-note {
        background-color: #fefabc;
        padding: 1rem;
        font-family: 'Caveat', cursive;
        box-shadow: 3px 3px 7px rgba(0,0,0,0.1);
        transform: rotate(4deg);
        z-index: 10; /* Make sure it can overlap */
        position: relative; /* For tape */
    }
    .key-fact {
        background: #e8f4f8;
        border-left: 5px solid #3498db;
        padding: 1rem;
        font-family: 'Caveat', cursive;
        z-index: 5;
        position: relative; /* For tape */
    }
    .quote {
        border-left: 5px solid #e74c3c;
        padding: 1rem;
        font-style: italic;
        color: #555;
        z-index: 5;
        position: relative; /* For tape */
    }
    .wavy-underline {
        text-decoration: #e74c3c wavy underline;
        text-underline-offset: 0.3em;
        text-decoration-thickness: 0.1em;
    }
    .circle-text {
        border: 3px solid #3498db;
        border-radius: 50%;
        padding: 0.5rem 1rem;
        display: inline-block;
        text-align: center;
        transform: rotate(-5deg);
        font-weight: bold;
    }
    .annotation {
        font-family: 'Caveat', cursive;
        font-size: 1rem;
        color: #555;
        position: relative;
        top: -10px;
        left: 10px;
        transform: rotate(3deg);
        background: #ffffff;
        padding: 0.2rem;
    }
    .arrow {
        width: 100px; /* Adjust size as needed */
        height: auto;
        stroke: #2c3e50;
        stroke-width: 3;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        /* AI will add random rotation inline */
    }
    h1 {
        font-family: 'Gochi Hand', cursive;
        font-size: 3.5rem;
        color: #2c3e50;
        grid-column: 1 / -1;
        text-align: center;
        margin-bottom: 1rem;
        transform: rotate(-1.5deg);
    }
    h2 {
        font-family: 'Gochi Hand', cursive;
        font-size: 2.2rem;
        color: #e74c3c;
        transform: rotate(1deg);
        padding: 0.5rem 1rem;
        display: inline-block;
    }
    /* Use this class for KEY sections that need emphasis */
    .section {
        padding: 1.5rem;
        border-radius: 10px;
        transform: rotate(calc( (RANDOM_INT(-10, 10) / 10) * 1deg));
        z-index: 1;
    }
    /* Grid classes for the 8-column layout */
    .col-span-1 { grid-column: span 1; }
    .col-span-2 { grid-column: span 2; }
    .col-span-3 { grid-column: span 3; }
    .col-span-4 { grid-column: span 4; }
    .col-span-5 { grid-column: span 5; }
    .col-span-6 { grid-column: span 6; }
    .col-span-7 { grid-column: span 7; }
    .col-span-8 { grid-column: 1 / -1; }
    .col-start-1 { grid-column-start: 1; }
    .col-start-2 { grid-column-start: 2; }
    .col-start-3 { grid-column-start: 3; }
    .col-start-4 { grid-column-start: 4; }
    .col-start-5 { grid-column-start: 5; }
    .col-start-6 { grid-column-start: 6; }
    .col-start-7 { grid-column-start: 7; }
    .col-start-8 { grid-column-start: 8; }
    .row-start-2 { grid-row-start: 2; }
    .row-start-3 { grid-row-start: 3; }
    .row-start-4 { grid-row-start: 4; }
    .row-start-5 { grid-row-start: 5; }
    .row-span-2 { grid-row: span 2; }
    .row-span-3 { grid-row: span 3; }
    .row-span-4 { grid-row: span 4; }
    mark {
        background: linear-gradient(180deg, rgba(255,255,255,0) 60%, #f9e79f 60%, #f9e79f 90%, rgba(255,255,255,0) 90%);
        background-position: 0 0.1em;
        background-repeat: repeat-x;
        padding: 0;
        color: inherit;
    }
    ul { list-style-type: '→ '; padding-left: 1.5rem; }
    p, li { font-size: 1.1rem; line-height: 1.6; }

    **ADVANCED DECORATIVE ELEMENTS:**
    - **Hand-Drawn Arrow (SVG):** To connect ideas, place this SVG inside a grid item. You MUST change the transform style to rotate it randomly (e.g., style="transform: rotate(-5deg);").
      <svg class="arrow" viewBox="0 0 100 50">
        <path d="M5,25 C25,10 75,10 95,25" stroke-dasharray="100" stroke-dashoffset="100">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" fill="freeze" />
        </path>
        <path d="M85,15 L95,25 L85,35">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.8s" fill="freeze" />
        </path>
      </svg>
    - **Wavy Underline:** Wrap any text with <span class="wavy-underline">... to apply a wavy underline.
    - **Circled Text:** Wrap any text with <span class="circle-text">... to draw a circle around it.
    - **Annotations:** Add small side notes with <span class="annotation">... next to a word or phrase.

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**📖 MULTI-PAGE STRUCTURE:**
    - Create ${numPages} separate <div class="note-paper"> containers
    - Each page should have a subtle page indicator (e.g., <div class="page-header">Page 1 of ${numPages}: [Page Title]</div>)
    - Use <div class="page-continue">...continued from previous page...</div> at the start of pages 2+
    - Each page should naturally continue the narrative/information from the previous page
    - Reference earlier content when appropriate (e.g., "As mentioned on page 1...")
    - Distribute content logically across pages (introduction → details → conclusion/examples)
    - CRITICAL: Each page must be completely filled with content - no page should be sparse or less dense than others
    - Balance the number of sections, sticky notes, key facts, and quotes evenly across all pages
    - Each page should have 8-12 content blocks to ensure full coverage
    ` : ''}
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a wide, dense, 8-column information collage with 500-700 words'}
    - MAXIMUM DENSITY: Fill every inch of every page with rich, detailed content
    - EVEN DISTRIBUTION: Each page must have equal visual weight and content density
    - You must use a mix of column spans, row spans, and different content blocks (\`.section\`, \`.sticky-note\`, \`.key-fact\`)
    - Use the \`.tape\` element to create a layered scrapbook effect
    - Use colored backgrounds **only where necessary for emphasis**
    - **You must use arrows, wavy underlines, and circles**
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    ${numPages > 1 ? `- Each page must build upon and reference previous pages naturally` : ''}
    - NO EMPTY SPACES: Every page should be completely filled with content blocks
  `;
}

// Timeline template prompt
function createTimelinePrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'chronological layout perfect for historical topics',
    emphasis: 'Organize information chronologically with clear time markers and sequential flow.',
    colors: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates beautiful visual notes specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be a **professional timeline** that presents information in chronological order with clear visual connections between events.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **TIMELINE SPECIFIC REQUIREMENTS:** 
        - Create a CHRONOLOGICAL timeline of events related to "${topic}"
        - Each event MUST have a specific date/year and be arranged in chronological order
        - Group events into distinct historical periods or eras with clear headers
        - Position events alternately on left and right sides of the central timeline
        - EVERY event MUST connect to the central timeline with visible connector lines
        - Use the exact HTML structure provided below
        - Focus on showing the progression and evolution of "${topic}" over time
    5.  **TIMELINE SPECIFIC STRUCTURE:** Since you are creating a timeline, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="timeline-container">
          <div class="timeline-line"></div>
          
          <!-- Era headers -->
          <div class="timeline-era">
            <div class="timeline-era-marker">ERA NAME</div>
          </div>
          
          <!-- Timeline events - alternate between odd and even -->
          <div class="timeline-event">
            <div class="timeline-event-content">
              <div class="timeline-date">DATE</div>
              <h3 class="timeline-event-title">EVENT TITLE</h3>
              <p class="timeline-event-description">Description text here...</p>
            </div>
            <div class="timeline-marker"></div>
            <div class="timeline-connector"></div>
          </div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@500;600;700&display=swap');
    
    body {
      background-color: #f8fafc;
      font-family: 'Inter', sans-serif;
      padding: 2rem;
      margin: 0;
      color: #1e293b;
      line-height: 1.5;
    }
    
    .note-paper {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 3rem 2rem;
      max-width: 1000px;
      margin: 0 auto;
      position: relative;
    }
    
    .timeline-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    .timeline-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 0.5rem;
    }
    
    .timeline-subtitle {
      font-size: 1.2rem;
      color: #64748b;
      font-weight: 400;
    }
    
    .timeline-container {
      position: relative;
      padding: 2rem 0;
      overflow: hidden;
    }
    
    .timeline-container::after {
      content: "";
      display: table;
      clear: both;
    }
    
    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: #3b82f6;
      transform: translateX(-50%);
      z-index: 1;
    }
    
    .timeline-era {
      position: relative;
      margin: 4rem 0;
      text-align: center;
      z-index: 2;
      clear: both;
    }
    
    .timeline-era-marker {
      display: inline-block;
      background-color: #1e40af;
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 30px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
    }
    
    .timeline-event {
      position: relative;
      margin-bottom: 4rem;
      width: 45%;
      z-index: 2;
      clear: both;
    }
    
    .timeline-event:nth-child(odd) {
      float: left;
      padding-right: 2rem;
      text-align: right;
    }
    
    .timeline-event:nth-child(even) {
      float: right;
      padding-left: 2rem;
      text-align: left;
    }
    
    .timeline-event-content {
      background-color: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-top: 4px solid #3b82f6;
    }
    
    .timeline-date {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }
    
    .timeline-event-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.75rem;
    }
    
    .timeline-event-description {
      color: #64748b;
      font-size: 1rem;
      line-height: 1.6;
    }
    
    .timeline-marker {
      position: absolute;
      top: 1.5rem;
      width: 20px;
      height: 20px;
      background-color: white;
      border: 4px solid #3b82f6;
      border-radius: 50%;
      z-index: 3;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }
    
    .timeline-event:nth-child(odd) .timeline-marker {
      right: -10px;
    }
    
    .timeline-event:nth-child(even) .timeline-marker {
      left: -10px;
    }
    
    .timeline-connector {
      position: absolute;
      top: 1.5rem;
      height: 4px;
      background-color: #3b82f6;
      z-index: 2;
    }
    
    .timeline-event:nth-child(odd) .timeline-connector {
      right: 10px;
      width: calc(2rem - 10px);
    }
    
    .timeline-event:nth-child(even) .timeline-connector {
      left: 10px;
      width: calc(2rem - 10px);
    }
    
    .timeline-category-political .timeline-date {
      background-color: #2563eb;
    }
    
    .timeline-category-political .timeline-marker {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    }
    
    .timeline-category-political .timeline-connector {
      background-color: #2563eb;
    }
    
    .timeline-category-cultural .timeline-date {
      background-color: #8b5cf6;
    }
    
    .timeline-category-cultural .timeline-marker {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
    }
    
    .timeline-category-cultural .timeline-connector {
      background-color: #8b5cf6;
    }
    
    .timeline-category-scientific .timeline-date {
      background-color: #10b981;
    }
    
    .timeline-category-scientific .timeline-marker {
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    }
    
    .timeline-category-scientific .timeline-connector {
      background-color: #10b981;
    }
    
    .timeline-image {
      width: 100%;
      height: 180px;
      background-color: #f1f5f9;
      border-radius: 6px;
      margin: 1rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    
    .timeline-reference {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-top: 1rem;
      font-style: italic;
    }
    
    .timeline-context {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 1rem;
      margin: 2rem 0;
      font-size: 0.95rem;
      color: #475569;
      border-left: 4px solid #cbd5e1;
    }
    
    .timeline-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 4rem;
      padding: 1.5rem;
      background-color: #f8fafc;
      border-radius: 8px;
    }
    
    .timeline-legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .timeline-legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }
    
    .timeline-legend-label {
      font-size: 0.9rem;
      color: #64748b;
    }
    
    .timeline-legend-color-political {
      background-color: #2563eb;
    }
    
    .timeline-legend-color-cultural {
      background-color: #8b5cf6;
    }
    
    .timeline-legend-color-scientific {
      background-color: #10b981;
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a comprehensive timeline with 500-700 words'}
    - CHRONOLOGICAL ORDER: Events must be arranged in chronological order with specific dates
    - ALTERNATING SIDES: Events must alternate between left and right sides of the timeline
    - CONNECTORS: Every event must connect to the central timeline with visible connector lines
    - ERAS: Group events into clear historical periods or eras with headers
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON HISTORY: Show the progression and evolution of "${topic}" over time
  `;
}

// Academic template prompt
function createAcademicPrompt(topic: string, numPages: number = 1): string {
  // Implementation for academic template
  const templateStyle = {
    description: 'professional format perfect for research and academic work',
    emphasis: 'Use clean, structured layouts with academic formatting. Include proper citations and formal presentation.',
    colors: ['#2c3e50', '#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates a formal academic paper specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be a **formal academic paper** that presents information in a scholarly, well-structured format with proper citations and academic elements.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **ACADEMIC SPECIFIC REQUIREMENTS:** 
        - Create a FORMAL ACADEMIC PAPER about "${topic}" with proper scholarly structure
        - Include a title, abstract, introduction, methodology, results, discussion, and conclusion
        - Add proper citations throughout the text in (Author, Year) format
        - Include a formal bibliography/references section at the end
        - Use formal academic language and terminology throughout
        - Create definition boxes for key terms and concepts
        - Format the document like a published research paper or scholarly article
    5.  **ACADEMIC SPECIFIC STRUCTURE:** Since you are creating an academic document, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="note-paper">
          <h1>TITLE OF THE ACADEMIC PAPER</h1>
          <div class="author">Author information</div>
          
          <div class="abstract">
            <strong>Abstract:</strong> Brief summary of the paper...
          </div>
          
          <h2>1. Introduction</h2>
          <p>Introduction content...</p>
          
          <h2>2. Section Title</h2>
          <p>Section content...</p>
          <h3>2.1 Subsection Title</h3>
          <p>Subsection content with <span class="citation">(Author, Year)</span> citations...</p>
          
          <div class="definition">
            <strong>Key Term:</strong> Definition of the term...
          </div>
          
          <div class="theorem">
            <strong>Theorem/Concept:</strong> Important concept explanation...
          </div>
          
          <table>
            <caption class="table-caption">Table 1: Description of table</caption>
            <tr><th>Header 1</th><th>Header 2</th></tr>
            <tr><td>Data 1</td><td>Data 2</td></tr>
          </table>
          
          <div class="footnote">
            <sup>1</sup> Footnote content...
          </div>
          
          <div class="references">
            <h2>References</h2>
            <div class="reference">Author, A. (Year). Title. Journal, Volume(Issue), pages.</div>
          </div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Serif+Pro:wght@400;600;700&display=swap');
    
    body {
      background-color: #f5f5f5;
      font-family: 'Source Serif Pro', serif;
      line-height: 1.6;
      color: #333;
      padding: 2rem;
    }
    
    .note-paper {
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      padding: 3rem;
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      color: #2c3e50;
      text-align: center;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .author {
      text-align: center;
      font-style: italic;
      margin-bottom: 2rem;
      color: #666;
    }
    
    .abstract {
      background-color: #f9f9f9;
      padding: 1.5rem;
      margin: 2rem 0;
      border-left: 4px solid #3498db;
      font-style: italic;
    }
    
    h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      color: #2c3e50;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }
    
    h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      color: #2c3e50;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      margin-bottom: 1rem;
      text-align: justify;
    }
    
    .citation {
      color: #666;
      font-size: 0.9rem;
    }
    
    .footnote {
      font-size: 0.8rem;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 1rem;
      margin-top: 2rem;
    }
    
    .definition {
      background-color: #f0f7fb;
      border-left: 5px solid #3498db;
      padding: 1rem;
      margin: 1rem 0;
    }
    
    .theorem {
      background-color: #f9f4f9;
      border-left: 5px solid #9b59b6;
      padding: 1rem;
      margin: 1rem 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    
    table, th, td {
      border: 1px solid #ddd;
    }
    
    th {
      background-color: #f2f2f2;
      padding: 0.75rem;
      text-align: left;
    }
    
    td {
      padding: 0.75rem;
    }
    
    .table-caption, .figure-caption {
      text-align: center;
      font-style: italic;
      color: #666;
      margin-bottom: 1rem;
    }
    
    .references {
      margin-top: 3rem;
      border-top: 2px solid #eee;
      padding-top: 1.5rem;
    }
    
    .reference {
      padding-left: 2em;
      text-indent: -2em;
      margin-bottom: 0.75rem;
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a formal academic paper with 500-700 words'}
    - ACADEMIC STRUCTURE: Include title, abstract, introduction, methodology, results, discussion, conclusion
    - CITATIONS: Include proper citations throughout the text in (Author, Year) format
    - REFERENCES: Include a formal bibliography/references section at the end
    - FORMAL LANGUAGE: Use scholarly language and terminology throughout
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON SCHOLARSHIP: Present information in a formal, academic manner
  `;
}

// Add implementations for other template functions (mindmap, comparison, notebook, cheatsheet)
// For brevity, I'll just include stubs for these functions

function createMindmapPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'visual connections and hierarchical information structure',
    emphasis: 'Create branching, tree-like structures with connecting lines and hierarchical organization.',
    colors: ['#27ae60', '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates a visual mind map specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be a **visual concept map** that presents information in a hierarchical structure with clear connections between related concepts.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **MINDMAP SPECIFIC REQUIREMENTS:** 
        - Create a VISUAL CONCEPT MAP with "${topic}" as the central node
        - Create primary branches for main subtopics and secondary branches for details
        - EVERY branch MUST connect to either the central topic or another branch
        - Use the exact HTML structure with proper positioning of branches around the center
        - Organize concepts hierarchically from general (center) to specific (outer branches)
        - Use color coding to distinguish different categories or themes
        - Focus on showing RELATIONSHIPS and CONNECTIONS between concepts
    5.  **MINDMAP SPECIFIC STRUCTURE:** Since you are creating a mind map, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="note-paper">
          <div class="mindmap-container">
            <div class="central-topic">MAIN TOPIC</div>
            
            <!-- Primary branches - position these around the central topic -->
            <div class="branch branch-primary branch-1" style="top: 100px; left: 400px;">
              Primary Branch 1
              <div class="connector connector-1" style="width: 100px; transform: rotate(45deg);"></div>
            </div>
            
            <div class="branch branch-primary branch-2" style="top: 200px; left: 500px;">
              Primary Branch 2
              <div class="connector connector-2" style="width: 120px; transform: rotate(15deg);"></div>
            </div>
            
            <!-- Secondary branches - connect to primary branches -->
            <div class="branch branch-secondary branch-1" style="top: 150px; left: 600px;">
              Secondary Branch 1
              <div class="connector connector-1" style="width: 80px; transform: rotate(0deg);"></div>
            </div>
            
            <!-- Add more branches as needed with appropriate positioning -->
            
            <!-- Cross connections between related concepts -->
            <div class="cross-connector" style="top: 180px; left: 550px; width: 100px; transform: rotate(30deg);"></div>
            
            <!-- Legend for color coding -->
            <div class="legend">
              <div class="legend-item">
                <div class="legend-color legend-color-1"></div>
                <div>Category 1</div>
              </div>
            </div>
          </div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.
        Position branches strategically around the central topic using absolute positioning.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Varela+Round&display=swap');
    
    body {
      background-color: #f9f9f9;
      font-family: 'Quicksand', sans-serif;
      padding: 2rem;
      margin: 0;
      color: #333;
      line-height: 1.5;
    }
    
    .note-paper {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }
    
    .mindmap-container {
      position: relative;
      min-height: 800px;
      padding: 2rem;
    }
    
    .central-topic {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      color: white;
      padding: 1.5rem;
      border-radius: 50%;
      width: 150px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-weight: 700;
      font-size: 1.4rem;
      box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
      z-index: 10;
    }
    
    .branch {
      position: absolute;
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      width: 180px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      text-align: center;
      z-index: 5;
    }
    
    .branch-primary {
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .branch-secondary {
      font-weight: 500;
      font-size: 0.95rem;
    }
    
    .branch-tertiary {
      font-weight: 400;
      font-size: 0.85rem;
    }
    
    .branch-1 {
      background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.1));
      border-top: 3px solid #27ae60;
    }
    
    .branch-2 {
      background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(41, 128, 185, 0.1));
      border-top: 3px solid #3498db;
    }
    
    .branch-3 {
      background: linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(142, 68, 173, 0.1));
      border-top: 3px solid #9b59b6;
    }
    
    .branch-4 {
      background: linear-gradient(135deg, rgba(230, 126, 34, 0.1), rgba(211, 84, 0, 0.1));
      border-top: 3px solid #e67e22;
    }
    
    .branch-5 {
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.1));
      border-top: 3px solid #e74c3c;
    }
    
    .branch-6 {
      background: linear-gradient(135deg, rgba(52, 73, 94, 0.1), rgba(44, 62, 80, 0.1));
      border-top: 3px solid #34495e;
    }
    
    .connector {
      position: absolute;
      background-color: #ccc;
      height: 2px;
      transform-origin: 0 0;
      z-index: 1;
    }
    
    .connector-1 {
      background-color: #27ae60;
    }
    
    .connector-2 {
      background-color: #3498db;
    }
    
    .connector-3 {
      background-color: #9b59b6;
    }
    
    .connector-4 {
      background-color: #e67e22;
    }
    
    .connector-5 {
      background-color: #e74c3c;
    }
    
    .connector-6 {
      background-color: #34495e;
    }
    
    .connector-label {
      position: absolute;
      font-size: 0.75rem;
      background-color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      z-index: 2;
    }
    
    .cross-connector {
      position: absolute;
      border: 1px dashed #aaa;
      z-index: 1;
    }
    
    .node-icon {
      display: block;
      margin: 0 auto 0.5rem;
      font-size: 1.5rem;
    }
    
    .legend {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-size: 0.8rem;
      z-index: 20;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .legend-color-1 {
      background-color: #27ae60;
    }
    
    .legend-color-2 {
      background-color: #3498db;
    }
    
    .legend-color-3 {
      background-color: #9b59b6;
    }
    
    .legend-color-4 {
      background-color: #e67e22;
    }
    
    .legend-color-5 {
      background-color: #e74c3c;
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a comprehensive mind map with 500-700 words'}
    - HIERARCHICAL STRUCTURE: Organize concepts from general (center) to specific (outer branches)
    - CONNECTIONS: Every branch must connect to either the central topic or another branch
    - COLOR CODING: Use different colors to distinguish categories or themes
    - POSITIONING: Position branches strategically around the central topic
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON RELATIONSHIPS: Show how different concepts within "${topic}" relate to each other
  `;
}

function createComparisonPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'side-by-side analysis and comparison charts',
    emphasis: 'Use parallel columns and comparison tables to highlight differences and similarities.',
    colors: ['#3498db', '#2980b9', '#e74c3c', '#c0392b', '#27ae60', '#f39c12']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates a direct comparison specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be a **direct comparison** that presents information in a side-by-side format to highlight differences and similarities.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **COMPARISON SPECIFIC REQUIREMENTS:** 
        - Create a DIRECT COMPARISON between two or more aspects of "${topic}"
        - Use side-by-side columns to compare different items, approaches, or perspectives
        - Include comparison tables with feature-by-feature analysis
        - Add pros and cons sections for each compared item
        - Use visual cues like checkmarks (✓) and X marks (✗) to show differences
        - Include a summary that synthesizes the key differences and similarities
        - Focus on CONTRASTING and EVALUATING different elements of "${topic}"
    5.  **COMPARISON SPECIFIC STRUCTURE:** Since you are creating a comparison document, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="note-paper">
          <h1 class="comparison-title">COMPARISON TITLE</h1>
          <p class="comparison-subtitle">Brief description of what's being compared</p>
          
          <!-- Two-column comparison -->
          <div class="comparison-container">
            <div class="comparison-column comparison-column-1">
              <h2 class="comparison-header comparison-header-1">ITEM 1</h2>
              <p>Description of first item...</p>
            </div>
            
            <div class="comparison-column comparison-column-2">
              <h2 class="comparison-header comparison-header-2">ITEM 2</h2>
              <p>Description of second item...</p>
            </div>
          </div>
          
          <!-- Feature comparison table -->
          <table class="comparison-table">
            <tr>
              <th>Feature</th>
              <th>ITEM 1</th>
              <th>ITEM 2</th>
            </tr>
            <tr>
              <td class="comparison-feature">Feature 1</td>
              <td class="comparison-check">✓</td>
              <td class="comparison-x">✗</td>
            </tr>
          </table>
          
          <!-- Pros and cons -->
          <div class="comparison-pros-cons">
            <div class="comparison-pros">
              <div class="comparison-pros-title">Pros</div>
              <ul class="comparison-list">
                <li>Benefit 1</li>
              </ul>
            </div>
            
            <div class="comparison-cons">
              <div class="comparison-cons-title">Cons</div>
              <ul class="comparison-list">
                <li>Drawback 1</li>
              </ul>
            </div>
          </div>
          
          <!-- Summary -->
          <div class="comparison-summary">
            <h3 class="comparison-summary-title">Summary</h3>
            <p>Overall comparison summary...</p>
          </div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Condensed:wght@400;700&display=swap');
    
    body {
      background-color: #f5f7fa;
      font-family: 'Roboto', sans-serif;
      padding: 2rem;
      margin: 0;
      color: #333;
      line-height: 1.5;
    }
    
    .note-paper {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .comparison-title {
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: #333;
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .comparison-subtitle {
      font-size: 1.2rem;
      color: #666;
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .comparison-container {
      display: flex;
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .comparison-column {
      flex: 1;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .comparison-column-1 {
      border-top: 4px solid #3498db;
    }
    
    .comparison-column-2 {
      border-top: 4px solid #e74c3c;
    }
    
    .comparison-header {
      text-align: center;
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .comparison-header-1 {
      color: #3498db;
    }
    
    .comparison-header-2 {
      color: #e74c3c;
    }
    
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    
    .comparison-table th {
      background-color: #f2f2f2;
      padding: 0.75rem;
      text-align: left;
      border: 1px solid #ddd;
      font-weight: 500;
    }
    
    .comparison-table td {
      padding: 0.75rem;
      border: 1px solid #ddd;
    }
    
    .comparison-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    .comparison-feature {
      font-weight: 500;
      color: #444;
    }
    
    .comparison-check {
      color: #27ae60;
      font-size: 1.2rem;
      text-align: center;
    }
    
    .comparison-x {
      color: #e74c3c;
      font-size: 1.2rem;
      text-align: center;
    }
    
    .comparison-rating {
      display: flex;
      align-items: center;
    }
    
    .comparison-star {
      color: #f39c12;
      font-size: 1.1rem;
      margin-right: 2px;
    }
    
    .comparison-star-empty {
      color: #ddd;
      font-size: 1.1rem;
      margin-right: 2px;
    }
    
    .comparison-bar-container {
      width: 100%;
      height: 8px;
      background-color: #eee;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .comparison-bar {
      height: 100%;
      border-radius: 4px;
    }
    
    .comparison-bar-1 {
      background-color: #3498db;
    }
    
    .comparison-bar-2 {
      background-color: #e74c3c;
    }
    
    .comparison-pros-cons {
      display: flex;
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .comparison-pros, .comparison-cons {
      flex: 1;
      padding: 1rem;
      border-radius: 6px;
    }
    
    .comparison-pros {
      background-color: rgba(39, 174, 96, 0.1);
      border-left: 3px solid #27ae60;
    }
    
    .comparison-cons {
      background-color: rgba(231, 76, 60, 0.1);
      border-left: 3px solid #e74c3c;
    }
    
    .comparison-pros-title, .comparison-cons-title {
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    
    .comparison-pros-title {
      color: #27ae60;
    }
    
    .comparison-cons-title {
      color: #e74c3c;
    }
    
    .comparison-list {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .comparison-list li {
      margin-bottom: 0.5rem;
    }
    
    .comparison-versus {
      display: flex;
      align-items: center;
      margin: 2rem 0;
      text-align: center;
    }
    
    .comparison-versus-item {
      flex: 1;
      padding: 1rem;
    }
    
    .comparison-versus-divider {
      font-size: 1.5rem;
      font-weight: 700;
      color: #666;
      padding: 0 1rem;
    }
    
    .comparison-summary {
      background-color: #f5f7fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 3rem;
      border-left: 4px solid #3498db;
    }
    
    .comparison-summary-title {
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
    }
    
    .comparison-recommendation {
      background-color: #f0f9ff;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
      border-left: 4px solid #3498db;
      font-weight: 500;
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a comprehensive comparison with 500-700 words'}
    - SIDE-BY-SIDE FORMAT: Use parallel columns to compare different items or aspects
    - FEATURE TABLES: Include tables that compare features or characteristics
    - PROS AND CONS: Include sections that list benefits and drawbacks of each item
    - VISUAL CUES: Use checkmarks, X marks, and other visual indicators to show differences
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON COMPARISON: Highlight differences and similarities between aspects of "${topic}"
  `;
}

function createNotebookPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'plain document',
    emphasis: 'Create a simple, clean document with minimal styling.',
    colors: ['#333333']
  };

  return `
    You are a master content creator, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page MUST cover a COMPLETELY DIFFERENT aspect of the topic.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates a simple, clean document specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS - EXTREMELY IMPORTANT:**
    - Create ${numPages} COMPLETELY SEPARATE pages with ENTIRELY DIFFERENT content
    - Each page MUST focus on a COMPLETELY DIFFERENT aspect of "${topic}" with ZERO OVERLAP
    - STRICT CONTENT REQUIREMENTS FOR EACH PAGE:
      - Page 1: Introduction and basic overview of "${topic}"
      - Page 2: Detailed analysis and examples of "${topic}"
      - Page 3 (if applicable): Advanced concepts and applications of "${topic}"
      - Page 4+ (if applicable): Specialized subtopics and case studies related to "${topic}"
    - Each page MUST have a DIFFERENT title that clearly indicates its specific focus
    - Each page MUST have COMPLETELY DIFFERENT content - NO REPETITION WHATSOEVER
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - NEVER repeat information from previous pages
    ` : ''}
    
    The final output must be an **EXTREMELY SIMPLE DOCUMENT** that is easy to read with minimal styling.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **DOCUMENT SPECIFIC REQUIREMENTS:** 
        - Create a SIMPLE DOCUMENT about "${topic}" with minimal styling
        - Use a clean, standard font that's easy to read
        - Organize content with simple headings and paragraphs
        - NO FANCY STYLING - just clean text on a white background
        - Keep the layout extremely simple and clean
        - Focus on making the content easy to read
    5.  **DOCUMENT SPECIFIC STRUCTURE:** Since you are creating a simple document, you MUST use this exact HTML structure:
        \`\`\`html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${topic}</title>
            <style>
                body {
                    background-color: #ffffff;
                    padding: 2rem;
                    margin: 0;
                    color: #333;
                    line-height: 1.6;
                    font-family: Arial, sans-serif;
                }
                
                /* Main document */
                .page {
                    max-width: 800px;
                    margin: 0 auto 60px;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    background-color: #ffffff;
                    page-break-after: always;
                }
                
                /* Page indicator */
                .page-indicator {
                    text-align: center;
                    font-size: 0.9rem;
                    color: #666;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                /* Headings */
                h1 {
                    font-size: 2rem;
                    margin-bottom: 1.5rem;
                    color: #333;
                }
                
                h2 {
                    font-size: 1.5rem;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    color: #333;
                }
                
                h3 {
                    font-size: 1.2rem;
                    margin-top: 1.2rem;
                    margin-bottom: 0.8rem;
                    color: #333;
                }
                
                /* Paragraphs */
                p {
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }
                
                /* Lists */
                ul, ol {
                    margin-bottom: 1rem;
                    padding-left: 2rem;
                }
                
                li {
                    margin-bottom: 0.5rem;
                }
                
                /* Section */
                .section {
                    margin-bottom: 2rem;
                }
            </style>
        </head>
        <body>
            ${numPages > 1 ? `
            <!-- Page 1: Introduction -->
            <div class="page">
                <div class="page-indicator">Page 1 of ${numPages}: Introduction to ${topic}</div>
                <h1>Introduction to ${topic}</h1>
                <div class="content">
                    <div class="section">
                        <h2>Overview</h2>
                        <p>Introduction content here...</p>
                    </div>
                </div>
            </div>

            <!-- Page 2: Detailed Analysis -->
            <div class="page">
                <div class="page-indicator">Page 2 of ${numPages}: Detailed Analysis of ${topic}</div>
                <h1>Detailed Analysis of ${topic}</h1>
                <div class="content">
                    <div class="section">
                        <h2>Key Concepts</h2>
                        <p>Detailed content here...</p>
                    </div>
                </div>
            </div>
            ` : `
            <div class="page">
                <h1>${topic}</h1>
                <div class="content">
                    <div class="section">
                        <h2>Main Topic</h2>
                        <p>Your content here...</p>
                    </div>
                </div>
            </div>
            `}
        </body>
        </html>
        \`\`\`
        
        You MUST use the HTML structure exactly as defined above. Do NOT modify the structure.

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} COMPLETELY DIFFERENT pages with NO REPETITION between pages` : 'Create a simple document with 500-700 words'}
    - EXTREME SIMPLICITY: Keep the design as simple as possible - just text on a white background
    - CLEAN ORGANIZATION: Keep the layout simple with just headings and paragraphs
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON READABILITY: Make the content clean and easy to read
    ${numPages > 1 ? `
    - DIFFERENT CONTENT: Each page MUST cover a COMPLETELY DIFFERENT aspect of the topic:
      - Page 1: Introduction and basic overview
      - Page 2: Detailed analysis and examples
      - Page 3 (if applicable): Advanced concepts and applications
      - Page 4+ (if applicable): Specialized subtopics and case studies
    - ZERO REPETITION: Never repeat information from one page to another
    ` : ''}
  `;

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates clean, readable notes specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be **EXTREMELY CLEAN AND READABLE NOTES** that are pleasant and easy to read.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **NOTEBOOK SPECIFIC REQUIREMENTS:** 
        - Create SIMPLE HANDWRITTEN NOTES about "${topic}" on plain white paper
        - Use natural handwriting fonts that are easy to read
        - Organize content with simple headings and paragraphs
        - NO LINES, NO RULED PAPER - just clean white background
        - Keep the layout extremely simple and clean
        - USE DIFFERENT COLOR PENS for different types of content:
          - Use blue-pen class for regular text
          - Use red-pen class for important points and corrections
          - Use green-pen class for examples and supporting details
          - Use purple-pen class for definitions or key concepts
        - Focus on making the notes look like they were written by a human
    5.  **NOTEBOOK SPECIFIC STRUCTURE:** Since you are creating a notebook page, you MUST use this exact HTML structure:
        \`\`\`html
        ${numPages > 1 ? `
        <!-- Page 1: Introduction -->
        <div class="page">
          <div class="page-indicator">Page 1 of ${numPages}: Introduction to ${topic}</div>
          <h1 class="title">Introduction to ${topic}</h1>
          <div class="content">
            <div class="section">
              <h2 class="heading">Overview</h2>
              <p class="text blue-pen">Introduction content here...</p>
            </div>
          </div>
        </div>

        <!-- Page 2: Details -->
        <div class="page">
          <div class="page-indicator">Page 2 of ${numPages}: Detailed Analysis of ${topic}</div>
          <h1 class="title">Detailed Analysis of ${topic}</h1>
          <div class="content">
            <div class="section">
              <h2 class="heading">Key Concepts</h2>
              <p class="text green-pen">Detailed content here...</p>
            </div>
          </div>
        </div>
        ` : `
        <div class="page">
          <!-- Page title -->
          <h1 class="title">${topic}</h1>
          
          <!-- Main content -->
          <div class="content">
            <!-- Section with heading -->
            <div class="section">
              <h2 class="heading">Main Topic</h2>
              <p class="text blue-pen">Regular text in blue pen...</p>
              <p class="text red-pen">Important points in red pen...</p>
              <p class="text green-pen">Examples in green pen...</p>
              <p class="text purple-pen">Key concepts in purple pen...</p>
              <p class="text"><span class="important">Important text with emphasis</span></p>
            </div>
          </div>
        </div>
        `}
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    body {
      background-color: #ffffff;
      padding: 2rem;
      margin: 0;
      color: #333;
      line-height: 1.6;
      font-family: Arial, sans-serif;
    }
    
    /* Main document */
    .page {
      max-width: 800px;
      margin: 0 auto 60px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      background-color: #ffffff;
      page-break-after: always;
    }
    
    /* Page indicator */
    .page-indicator {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    /* Page title */
    .title {
      font-family: 'Caveat', cursive;
      font-size: 2.2rem;
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }
    
    /* Content */
    .content {
      font-family: 'Caveat', cursive;
      font-size: 1.4rem;
      color: #2c3e50;
      line-height: 1.6;
    }
    
    /* Sections */
    .section {
      margin-bottom: 30px;
    }
    
    /* Headings */
    .heading {
      font-family: 'Caveat', cursive;
      font-size: 1.8rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 15px;
    }
    
    /* Text */
    .text {
      margin-bottom: 15px;
    }
    
    /* Different pen colors */
    .blue-pen {
      color: #3498db; /* Blue pen */
      font-family: 'Caveat', cursive;
    }
    
    .red-pen {
      color: #e74c3c; /* Red pen */
      font-family: 'Caveat', cursive;
    }
    
    .green-pen {
      color: #27ae60; /* Green pen */
      font-family: 'Caveat', cursive;
    }
    
    .purple-pen {
      color: #9b59b6; /* Purple pen */
      font-family: 'Indie Flower', cursive;
    }
    
    /* Important text */
    .important {
      font-weight: 700;
      text-decoration: underline;
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create simple handwritten notes with 500-700 words'}
    - EXTREME SIMPLICITY: Keep the design as simple as possible - just text on a white page
    - NATURAL HANDWRITING: Use handwriting fonts that look natural
    - CLEAN ORGANIZATION: Keep the layout simple with just headings and paragraphs
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON READABILITY: Make the notes clean and easy to read while still looking handwritten
  `;

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates handwritten-style notes specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be **realistic handwritten notes** that look like they were taken during a class or lecture, with ruled paper styling and natural handwriting flow.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **NOTEBOOK SPECIFIC REQUIREMENTS:** 
        - Create HANDWRITTEN-STYLE NOTES about "${topic}" as if taken during a class or lecture
        - Use ruled paper styling with horizontal lines and margin line
        - Include handwritten-style annotations, corrections, and margin notes
        - Add highlighting, circled text, and starred important points
        - Create a slightly messy, authentic handwritten appearance
        - Use indentation, bullet points, and natural organization
        - Focus on making the notes look like they were ACTUALLY HANDWRITTEN by a student
    5.  **NOTEBOOK SPECIFIC STRUCTURE:** Since you are creating a notebook page, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="note-paper">
          <div class="notebook-binding"></div>
          <!-- Add binding rings -->
          <div class="binding-ring" style="top: 100px;"></div>
          <div class="binding-ring" style="top: 300px;"></div>
          <div class="binding-ring" style="top: 500px;"></div>
          <div class="binding-ring" style="top: 700px;"></div>
          
          <h1 class="notebook-title">TITLE</h1>
          <div class="notebook-date">Date: DATE</div>
          
          <div class="notebook-content">
            <div class="notebook-section">
              <h2 class="notebook-heading">Section Heading</h2>
              
              <div class="notebook-bullet">
                Main point with <span class="notebook-highlight">highlighted text</span>
              </div>
              
              <div class="notebook-subbullet">
                Supporting detail with <span class="notebook-important">important text</span>
              </div>
              
              <div class="notebook-margin-note" style="top: 200px;">Side note!</div>
              
              <div class="notebook-starred">Starred important point</div>
              
              <div class="notebook-crossed">Crossed out text</div>
              
              <span class="notebook-circled">Circled text</span>
              
              <div class="notebook-correction" data-correction="corrected text">original text</div>
            </div>
          </div>
          
          <div class="notebook-page-number">1</div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Indie+Flower&family=Shadows+Into+Light&family=Pangolin&family=Homemade+Apple&family=Just+Me+Again+Down+Here&family=Reenie+Beanie&display=swap');
    
    body {
      background-color: #f0f0f0;
      font-family: 'Caveat', cursive;
      padding: 2rem;
      margin: 0;
      color: #333;
      line-height: 1.5;
    }
    
    .note-paper {
      background-color: #fffdf0; /* Cream color for authentic paper look */
      background-image: 
        linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
      background-size: 100% 25px, 1px 100%;
      background-position: 0 0, 60px 0;
      border: 1px solid #ccc;
      box-shadow: 0 5px 15px rgba(0,0,0,0.15), inset 0 0 50px rgba(200,180,0,0.05); /* Enhanced shadows */
      padding: 30px 30px 30px 80px;
      max-width: 850px;
      margin: 0 auto;
      position: relative;
      min-height: 1100px;
      transform: rotate(-0.8deg); /* More noticeable rotation */
      border-radius: 3px;
      overflow: visible;
    }
    
    .note-paper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 60px;
      height: 100%;
      width: 1px;
      background-color: #ff9999;
    }
    
    /* Coffee stain effect */
    .note-paper::after {
      content: '';
      position: absolute;
      top: 40px;
      right: 80px;
      width: 70px;
      height: 70px;
      background: radial-gradient(ellipse at center, rgba(188, 143, 143, 0.2) 0%, rgba(188, 143, 143, 0.1) 50%, rgba(188, 143, 143, 0) 70%);
      border-radius: 50%;
      z-index: 1;
      transform: rotate(-5deg) scale(1.2, 0.8);
      opacity: 0.6;
    }
    
    .notebook-binding {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 30px;
      background-color: #e74c3c;
      border-right: 1px solid #c0392b;
      z-index: 2;
    }
    
    .binding-ring {
      position: absolute;
      left: 15px;
      width: 30px;
      height: 15px;
      background-color: #bdc3c7;
      border-radius: 50%;
      border: 1px solid #95a5a6;
      transform: translateX(-50%);
      z-index: 3;
    }
    
    .binding-ring::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      border-radius: 50%;
      border: 1px solid #7f8c8d;
    }
    
    .notebook-title {
      font-family: 'Patrick Hand', cursive;
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      text-align: center;
      position: relative;
      z-index: 5;
      transform: rotate(-1deg); /* Slightly rotated for natural look */
      text-decoration: underline;
      text-decoration-style: wavy;
      text-decoration-color: #3498db;
    }
    
    .notebook-date {
      font-family: 'Indie Flower', cursive;
      font-size: 1rem;
      color: #7f8c8d;
      text-align: right;
      margin-bottom: 2rem;
      margin-right: 1rem;
      transform: rotate(1deg); /* Slightly rotated for natural look */
    }
    
    .notebook-content {
      font-family: 'Indie Flower', cursive; /* More natural handwriting font */
      font-size: 1.1rem;
      color: #2c3e50;
      line-height: 25px;
      position: relative;
      z-index: 5;
      /* Slight variation in letter spacing for more natural handwriting look */
      letter-spacing: -0.02em;
    }
    
    .notebook-section {
      margin-bottom: 2rem;
      position: relative;
    }
    
    /* Random coffee stain or smudge marks */
    .notebook-section:nth-child(3n)::before {
      content: '';
      position: absolute;
      width: 40px;
      height: 15px;
      background: rgba(160, 82, 45, 0.1);
      border-radius: 50%;
      transform: rotate(30deg);
      top: 20px;
      right: 30px;
      z-index: 1;
    }
    
    .notebook-heading {
      font-family: 'Shadows Into Light', cursive; /* More authentic handwriting */
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      text-decoration: underline;
      text-decoration-style: wavy;
      text-decoration-thickness: 1px;
      transform: rotate(-0.5deg); /* Slight rotation for natural look */
    }
    
    .notebook-subheading {
      font-family: 'Architects Daughter', cursive;
      font-size: 1.2rem;
      font-weight: 700;
      color: #34495e;
      margin-bottom: 0.5rem;
      margin-left: 1rem;
    }
    
    .notebook-bullet {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.25rem;
      transform: rotate(-0.2deg); /* Slight rotation for natural look */
    }
    
    .notebook-bullet::before {
      content: '•';
      position: absolute;
      left: 0.5rem;
      color: #3498db;
      font-size: 1.2rem; /* Slightly larger bullet */
    }
    
    /* Randomly vary bullet styles for authenticity */
    .notebook-bullet:nth-child(3n)::before {
      content: '→';
      color: #e74c3c;
    }
    
    .notebook-bullet:nth-child(5n)::before {
      content: '✓';
      color: #27ae60;
      font-size: 0.9rem;
    }
    
    .notebook-subbullet {
      position: relative;
      padding-left: 3rem;
      margin-bottom: 0.25rem;
      transform: rotate(0.3deg); /* Slight rotation for natural look */
    }
    
    .notebook-subbullet::before {
      content: '-';
      position: absolute;
      left: 2rem;
      color: #3498db;
    }
    
    /* Randomly vary subbullet styles for authenticity */
    .notebook-subbullet:nth-child(2n)::before {
      content: '○';
      font-size: 0.8rem;
    }
    
    .notebook-subbullet:nth-child(3n)::before {
      content: '>';
      color: #9b59b6;
    }
    
    .notebook-highlight {
      background-color: rgba(255, 255, 0, 0.3);
      padding: 0 2px;
      /* Make highlighting look hand-drawn with uneven edges */
      background-image: 
        linear-gradient(to right, rgba(255, 255, 0, 0.4) 0%, rgba(255, 255, 0, 0.2) 100%);
      border-radius: 3px;
    }
    
    .notebook-important {
      color: #e74c3c;
      font-weight: 700;
      /* Add slight rotation for natural look */
      display: inline-block;
      transform: rotate(-0.5deg);
    }
    
    .notebook-circled {
      display: inline-block;
      /* Make circle look hand-drawn with uneven stroke */
      border: 2px solid #e74c3c;
      border-radius: 50%;
      padding: 0 5px;
      /* Add slight wobble to the circle */
      border-style: solid;
      border-width: 2px 3px 2px 2px;
    }
    
    .notebook-starred::before {
      content: '★ ';
      color: #e74c3c;
      /* Make star look hand-drawn */
      display: inline-block;
      transform: rotate(5deg);
      font-size: 1.2rem;
    }
    
    .notebook-crossed {
      text-decoration: line-through;
      color: #7f8c8d;
      /* Make line-through look hand-drawn */
      text-decoration-thickness: 2px;
      text-decoration-style: wavy;
    }
    
    .notebook-correction {
      position: relative;
    }
    
    .notebook-correction::after {
      content: attr(data-correction);
      position: absolute;
      top: -15px;
      color: #e74c3c;
      font-size: 0.9rem;
      font-family: 'Shadows Into Light', cursive; /* Different handwriting font for corrections */
      transform: rotate(1deg); /* Slight rotation for natural look */
    }
    
    /* Add random doodles in margins */
    .notebook-doodle {
      position: absolute;
      font-size: 1.2rem;
      color: #7f8c8d;
      opacity: 0.7;
      transform: rotate(5deg);
      z-index: 2;
    }
    
    /* Add random pen color changes */
    .notebook-pen-change {
      color: #3498db; /* Blue pen */
      font-family: 'Pangolin', cursive; /* Different handwriting font */
    }
    
    .notebook-margin-note {
      position: absolute;
      left: 10px;
      transform: translateX(-100%);
      width: 40px;
      font-family: 'Indie Flower', cursive;
      font-size: 0.9rem;
      color: #e74c3c;
      text-align: right;
    }
    
    .notebook-arrow {
      position: absolute;
      background-color: #3498db;
      height: 2px;
      z-index: 1;
    }
    
    .notebook-arrow::after {
      content: '';
      position: absolute;
      right: -4px;
      top: -3px;
      width: 0;
      height: 0;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid #3498db;
    }
    
    .notebook-diagram {
      margin: 1rem 0;
      padding: 1rem;
      border: 1px dashed #95a5a6;
      text-align: center;
    }
    
    .notebook-page-number {
      position: absolute;
      bottom: 10px;
      right: 20px;
      font-family: 'Indie Flower', cursive;
      font-size: 0.9rem;
      color: #7f8c8d;
    }
    
    .notebook-sticky-note {
      position: absolute;
      width: 150px;
      height: 150px;
      background-color: #f9ca24;
      padding: 1rem;
      font-family: 'Indie Flower', cursive;
      font-size: 0.9rem;
      color: #333;
      transform: rotate(3deg);
      box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
      z-index: 10;
    }
    
    .notebook-blue-pen {
      color: #3498db;
    }
    
    .notebook-red-pen {
      color: #e74c3c;
    }
    
    .notebook-green-pen {
      color: #27ae60;
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create realistic handwritten notes with 500-700 words'}
    - RULED PAPER: Use horizontal lines and margin line like real notebook paper
    - HANDWRITTEN STYLE: Use handwriting fonts and natural, slightly messy organization
    - ANNOTATIONS: Include margin notes, corrections, and highlighting
    - VISUAL ELEMENTS: Add circled text, starred points, and crossed-out words
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON AUTHENTICITY: Make the notes look like they were actually handwritten by a student
  `;
}

function createCheatsheetPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'densely packed study reference with formulas and key facts',
    emphasis: 'Create an extremely compact, information-dense reference sheet with maximum content and minimal whitespace.',
    colors: ['#000000', '#333333', '#666666', '#0066cc', '#cc0000', '#009900']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates a dense, information-packed cheat sheet specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
    ${numPages > 1 ? `**MULTI-PAGE REQUIREMENTS:**
    - Each page should be a separate section that flows naturally from the previous
    - Use clear visual breaks between pages (like page breaks or distinct sections)
    - Each page should build upon and reference content from previous pages
    - Maintain consistent styling and theme across all pages
    - Include navigation or flow indicators if helpful
    - CRITICAL: Distribute content EVENLY across all ${numPages} pages - each page must be equally full and dense
    - Each page should contain roughly ${Math.round((400 * numPages) / numPages)}-${Math.round((600 * numPages) / numPages)} words of content
    - Fill every page completely with no sparse or empty areas
    - Balance visual elements and content blocks equally across all pages
    ` : ''}
    
    The final output must be an **extremely dense, information-packed reference sheet** that presents information in a compact, organized format ideal for studying.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **CHEATSHEET SPECIFIC REQUIREMENTS:** 
        - Create an EXTREMELY DENSE, INFORMATION-PACKED reference sheet about "${topic}"
        - Maximize information density with minimal white space
        - Use small font sizes and compact formatting to fit maximum content
        - Organize content into clear sections with headers
        - Include key definitions, formulas, and concepts in condensed format
        - Use abbreviations and symbols to save space
        - Focus on creating a COMPREHENSIVE REFERENCE that could be used for studying
    5.  **CHEATSHEET SPECIFIC STRUCTURE:** Since you are creating a cheat sheet, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="note-paper">
          <h1>${topic} Cheat Sheet</h1>
          
          <div class="section">
            <h2>Section Title</h2>
            
            <div class="definition">
              <span class="term">Term:</span> Definition of the term
            </div>
            
            <div class="formula">
              Formula or code snippet here
            </div>
            
            <div class="example">
              Example: Example text here
            </div>
            
            <table class="reference-table">
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
              </tr>
              <tr>
                <td>Data 1</td>
                <td>Data 2</td>
              </tr>
            </table>
            
            <div class="quick-reference">
              <div class="quick-reference-title">Quick Reference</div>
              <ul class="quick-list">
                <li>Key point 1</li>
                <li>Key point 2</li>
              </ul>
            </div>
          </div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap');
    
    body {
      background-color: #f5f5f5;
      font-family: 'Roboto', sans-serif;
      padding: 1rem;
      margin: 0;
      color: #333;
      line-height: 1.4;
    }
    
    .note-paper {
      background-color: #fff;
      border: 1px solid #ddd;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
      column-count: 3;
      column-gap: 1.5rem;
      column-rule: 1px solid #eee;
    }
    
    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #000;
      margin: 0.5rem 0;
      padding-bottom: 0.3rem;
      border-bottom: 2px solid #000;
      column-span: all;
      text-align: center;
    }
    
    h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0066cc;
      margin: 0.8rem 0 0.4rem 0;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid #0066cc;
      break-after: avoid;
    }
    
    h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #333;
      margin: 0.6rem 0 0.3rem 0;
      break-after: avoid;
    }
    
    p {
      font-size: 0.9rem;
      margin: 0.3rem 0;
    }
    
    ul, ol {
      margin: 0.3rem 0;
      padding-left: 1.2rem;
    }
    
    li {
      font-size: 0.9rem;
      margin: 0.1rem 0;
    }
    
    .section {
      margin-bottom: 1rem;
      break-inside: avoid;
    }
    
    .formula {
      font-family: 'Roboto Mono', monospace;
      background-color: #f9f9f9;
      padding: 0.3rem 0.5rem;
      margin: 0.3rem 0;
      border-left: 3px solid #0066cc;
      font-size: 0.9rem;
      break-inside: avoid;
    }
    
    .definition {
      margin: 0.3rem 0;
      padding-left: 0.5rem;
      border-left: 2px solid #333;
      font-size: 0.9rem;
    }
    
    .term {
      font-weight: 700;
    }
    
    .example {
      font-size: 0.85rem;
      color: #666;
      margin: 0.2rem 0 0.2rem 1rem;
      font-style: italic;
    }
    
    .note {
      font-size: 0.85rem;
      background-color: #fffde7;
      padding: 0.2rem 0.4rem;
      margin: 0.3rem 0;
      border: 1px solid #fff9c4;
    }
    
    .warning {
      font-size: 0.85rem;
      background-color: #ffebee;
      padding: 0.2rem 0.4rem;
      margin: 0.3rem 0;
      border: 1px solid #ffcdd2;
    }
    
    .tip {
      font-size: 0.85rem;
      background-color: #e8f5e9;
      padding: 0.2rem 0.4rem;
      margin: 0.3rem 0;
      border: 1px solid #c8e6c9;
    }
    
    .reference-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      margin: 0.5rem 0;
      break-inside: avoid;
    }
    
    .reference-table th {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      padding: 0.2rem 0.4rem;
      text-align: left;
      font-weight: 500;
    }
    
    .reference-table td {
      border: 1px solid #ddd;
      padding: 0.2rem 0.4rem;
    }
    
    .reference-table tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .code {
      font-family: 'Roboto Mono', monospace;
      font-size: 0.85rem;
      background-color: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }
    
    .highlight {
      background-color: #fff9c4;
      padding: 0 2px;
    }
    
    .important {
      color: #cc0000;
      font-weight: 500;
    }
    
    .divider {
      border-top: 1px dashed #ddd;
      margin: 0.5rem 0;
    }
    
    .box {
      border: 1px solid #ddd;
      padding: 0.5rem;
      margin: 0.5rem 0;
      break-inside: avoid;
    }
    
    .box-title {
      font-weight: 700;
      margin-bottom: 0.3rem;
      font-size: 0.9rem;
    }
    
    .quick-reference {
      background-color: #f5f5f5;
      padding: 0.5rem;
      margin: 0.5rem 0;
      border: 1px solid #ddd;
      break-inside: avoid;
    }
    
    .quick-reference-title {
      font-weight: 700;
      text-align: center;
      margin-bottom: 0.3rem;
      font-size: 0.9rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.2rem;
    }
    
    .quick-list {
      margin: 0;
      padding-left: 1rem;
      font-size: 0.85rem;
    }
    
    .quick-list li {
      margin: 0.1rem 0;
    }
    
    .footnote {
      font-size: 0.8rem;
      color: #666;
      margin-top: 0.2rem;
    }
    
    .abbreviation {
      font-weight: 700;
      color: #333;
    }
    
    .symbol {
      font-family: 'Roboto Mono', monospace;
      font-weight: 700;
    }
    
    @media print {
      body {
        padding: 0;
        background-color: #fff;
      }
      
      .note-paper {
        box-shadow: none;
        border: none;
        padding: 0.5rem;
      }
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a dense, information-packed cheat sheet with 500-700 words'}
    - MAXIMUM DENSITY: Pack as much information as possible into the available space
    - MINIMAL WHITESPACE: Use compact formatting and small font sizes
    - CLEAR ORGANIZATION: Organize content into logical sections with headers
    - CONDENSED FORMAT: Use abbreviations, symbols, and concise language
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON REFERENCE: Create a comprehensive reference that could be used for studying
  `;
}