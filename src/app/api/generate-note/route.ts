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

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error:", errorBody);
      throw new Error(`Gemini API error: ${response.status}`);
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
    You are an expert web designer with a flair for creating beautiful, artistic, hand-drawn web content.
    Your task is to generate a single, self-contained HTML document for a note on the topic: "${topic}".

    **CRITICAL INSTRUCTIONS:**
    1.  **SINGLE HTML OUTPUT:** Your entire response must be ONLY the HTML code. Do not include any explanations, markdown, or any text outside the \`<html>\` tags.
    2.  **SELF-CONTAINED:** All CSS must be included in a \`<style>\` tag in the \`<head>\`. Do not use external files.
    3.  **GOOGLE FONTS:** You MUST import and use handwriting-style Google Fonts (e.g., 'Gochi Hand', 'Patrick Hand', 'Kalam', 'Caveat'). The \`@import\` rule must be at the top of your \`<style>\` block.

    **VISUAL STYLE REQUIREMENTS:**
    -   **AESTHETIC:** The note should look like a page from a creative's scrapbook or a beautiful study guide. It should be colorful, engaging, and feel personal and hand-made.
    -   **LAYOUT:**
        -   Use a main container with a slightly off-white, textured background.
        -   The layout should be organic. Use CSS Grid or Flexbox to position elements in a non-linear, scrapbook-like way.
        -   Apply slight, random rotations to elements (\`transform: rotate(-2deg);\`, \`transform: rotate(1.5deg);\`) to give a hand-placed feel.
    -   **COLORS:** Use a vibrant, cohesive color palette. Good palettes include warm, pastel, or complementary colors. Use them for text, backgrounds, and highlights.
    -   **SHAPES & HIGHLIGHTS:**
        -   Use CSS to create organic, "blob-like" backgrounds for sections using complex \`border-radius\` values (e.g., \`border-radius: 65% 35% 30% 70% / 60% 40% 60% 40%;\`).
        -   Simulate marker highlights for important text. This can be a \`<span>\` with a bright, slightly transparent background color.
        -   Use hand-drawn style borders (\`border: 2px solid #000; border-radius: 10px;\`).
    -   **CONTENT STRUCTURE:**
        -   The note must have a main title (\`<h1>\`).
        -   It must have several sections with subheadings (\`<h2>\`).
        -   Use bullet points (\`<ul>\`, \`<li>\`) and short paragraphs (\`<p>\`).
        -   Include at least one "fun fact" or "quote" section that is styled distinctively.

    **EXAMPLE of a CSS rule for an organic shape:**
    .blob-background {
        background-color: #ffda79a0; /* Yellow with transparency */
        padding: 2rem;
        border-radius: 65% 35% 30% 70% / 60% 40% 60% 40%;
        transform: rotate(-1.5deg);
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}".
    `;
}
