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

          // Simple tier check for free users (no need for database lookup)
          if (profile.tier === 'free') {
            const MONTHLY_LIMIT = 50; // Simple hardcoded limit for free tier
            
            if (profile.total_notes_generated >= MONTHLY_LIMIT) {
              return NextResponse.json({ 
                error: `Monthly limit reached. Free tier users can generate up to ${MONTHLY_LIMIT} notes per month.`,
                monthlyLimit: MONTHLY_LIMIT,
                currentCount: profile.total_notes_generated
              }, { status: 429 }); // Too many requests
            }
          }
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

        // Return success with updated coin balance
        return NextResponse.json({ 
          noteHtml: generatedHtml,
          coinsRemaining: new_balance,
          coinsSpent: coinsRequired,
          profile: updatedProfile
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
  // Template-specific styling variations
  const templateStyles = {
    creative: {
      description: 'hand-drawn style with colorful elements and organic layouts',
      emphasis: 'Use vibrant colors, organic shapes, and artistic flourishes. Make it feel like a creative art journal.',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd']
    },
    academic: {
      description: 'professional format perfect for research and academic work',
      emphasis: 'Use clean, structured layouts with academic formatting. Include proper citations and formal presentation.',
      colors: ['#2c3e50', '#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6']
    },
    mindmap: {
      description: 'visual connections and hierarchical information structure',
      emphasis: 'Create branching, tree-like structures with connecting lines and hierarchical organization.',
      colors: ['#27ae60', '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c']
    },
    timeline: {
      description: 'chronological layout perfect for historical topics',
      emphasis: 'Organize information chronologically with clear time markers and sequential flow.',
      colors: ['#f39c12', '#e67e22', '#d35400', '#c0392b', '#8e44ad', '#2c3e50']
    },
    comparison: {
      description: 'side-by-side analysis and comparison charts',
      emphasis: 'Use parallel columns and comparison tables to highlight differences and similarities.',
      colors: ['#3498db', '#2980b9', '#e74c3c', '#c0392b', '#27ae60', '#f39c12']
    },
    notebook: {
      description: 'traditional lined paper with handwritten aesthetics',
      emphasis: 'Mimic classic notebook paper with ruled lines and natural handwriting flow.',
      colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1']
    }
  };

  const selectedTemplate = templateStyles[template as keyof typeof templateStyles] || templateStyles.creative;
  
  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${selectedTemplate.description} - ${selectedTemplate.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
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
    3.  **TEMPLATE CONSISTENCY:** Apply the "${selectedTemplate.description}" style throughout. This is mandatory.
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
    \`\`\`css
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
    \`\`\`

    **ADVANCED DECORATIVE ELEMENTS:**
    - **Hand-Drawn Arrow (SVG):** To connect ideas, place this SVG inside a grid item. You MUST change the \`transform\` style to rotate it randomly (e.g., \`style="transform: rotate(-5deg);"\`).
      \`\`\`html
      <svg class="arrow" viewBox="0 0 100 50">
        <path d="M5,25 C25,10 75,10 95,25" stroke-dasharray="100" stroke-dashoffset="100">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" fill="freeze" />
        </path>
        <path d="M85,15 L95,25 L85,35">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.8s" fill="freeze" />
        </path>
      </svg>
      \`\`\`
    - **Wavy Underline:** Wrap any text with \`<span class="wavy-underline">...\` to apply a wavy underline.
    - **Circled Text:** Wrap any text with \`<span class="circle-text">...\` to draw a circle around it.
    - **Annotations:** Add small side notes with \`<span class="annotation">...\` next to a word or phrase.

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
    - The "${selectedTemplate.description}" template style must be applied consistently
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
