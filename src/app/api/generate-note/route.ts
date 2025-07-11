import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = 'AIzaSyD2maptK3FUHCnFc6Y9cBRQuYRP1nB9WqQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Create a new prompt that asks for HTML/CSS output
    const prompt = createHtmlPrompt(topic);

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
              temperature: 0.8, // Slightly more creative
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096, // Increased token limit for more content
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

    // The AI now returns a full HTML document, so we just send that back.
    return NextResponse.json({ noteHtml: generatedHtml });
  } catch (error: any) {
    console.error('Error generating note:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate note' },
      { status: 500 }
    );
  }
}

function createHtmlPrompt(topic: string): string {
  return `
    You are an expert web designer and digital artist. Your task is to generate a SINGLE, SELF-CONTAINED HTML document about: "${topic}".
    The final output must look exactly like a page from a student's high-quality digital notebook (like GoodNotes or Notability), matching the style of the reference image provided.
    Your goal is to create a single, dense, and information-rich page of notes in a **landscape (wide) orientation**.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **USE STYLES PURPOSEFULLY, NOT EVERYWHERE:** This is the most important rule. Do NOT wrap every single element in a colored box or section. Use colored backgrounds and highlights **selectively** to emphasize the most important information, just like in the reference image. Some text should be on plain white paper, while key sections get a subtle, rectangular colored background. The page should look clean and human-made, not cluttered with boxes.
    3.  **NO DECORATIVE SHAPES:** Do NOT generate any purely decorative shapes, especially circles or ovals. All colored backgrounds must be simple, slightly rounded rectangles that contain text content.
    4.  **NO DIAGRAMS OR IMAGES:** Do NOT include any placeholders for diagrams, images, or SVGs.
    5.  **SELF-CONTAINED & LANDSCAPE ORIENTATION:** All CSS must be in a \`<style>\` tag. The note paper MUST be wider than it is tall.
    6.  **DENSE, COLLAGE LAYOUT:** Use CSS Grid to create a dynamic, multi-column collage. You MUST make aggressive use of \`grid-column\` and \`grid-row\` to spread content across the wide page. Generate enough content to make the page feel complete.

    **VISUAL STYLE GUIDE (REPLICATE THIS):**
    -   **Main Container:** A wide, landscape-oriented \`<div class="note-paper">\`.
    -   **Handwriting Fonts:** Use varied handwriting Google Fonts.
    -   **Selective Highlights:** Use \`<mark>\` for inline text highlighting and \`<div class="section">\` with a background color for key sections. **Again, do not put every item in a colored section.**

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
        min-height: 900px; /* EVEN SHORTER */
        margin: auto;
        display: grid;
        grid-template-columns: repeat(6, 1fr); /* 6 columns for wide layout */
        grid-auto-rows: min-content;
        gap: 1.5rem;
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
    }
    /* Grid classes for the 6-column layout */
    .col-span-1 { grid-column: span 1; }
    .col-span-2 { grid-column: span 2; }
    .col-span-3 { grid-column: span 3; }
    .col-span-4 { grid-column: span 4; }
    .col-span-5 { grid-column: span 5; }
    .col-span-6 { grid-column: 1 / -1; }
    .col-start-1 { grid-column-start: 1; }
    .col-start-2 { grid-column-start: 2; }
    .col-start-3 { grid-column-start: 3; }
    .col-start-4 { grid-column-start: 4; }
    .col-start-5 { grid-column-start: 5; }
    .col-start-6 { grid-column-start: 6; }
    .row-start-2 { grid-row-start: 2; }
    .row-start-3 { grid-row-start: 3; }
    .row-start-4 { grid-row-start: 4; }
    .row-start-5 { grid-row-start: 5; }
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

    Now, generate the complete, self-contained HTML document for the topic: "${topic}".
    Follow the instructions precisely. Create a wide, dense, collage-style layout, and use colored backgrounds **only where necessary for emphasis**.
    `;
}
