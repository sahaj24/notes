// Ultra-simple document template - just plain text with minimal styling
function createNotebookPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'simple document',
    emphasis: 'Create a clean, easy-to-read document with minimal styling.',
    colors: ['#333333']
  };

  return `
    You are a master content creator, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates a simple, clean document specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
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
        <div class="document">
          <!-- Document title -->
          <h1>${topic}</h1>
          
          <!-- Main content -->
          <div class="content">
            <!-- Section with heading -->
            <div class="section">
              <h2>Main Topic</h2>
              <p>Your content here...</p>
            </div>
          </div>
        </div>
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
    .document {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
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

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create a simple document with 500-700 words'}
    - EXTREME SIMPLICITY: Keep the design as simple as possible - just text on a white background
    - CLEAN ORGANIZATION: Keep the layout simple with just headings and paragraphs
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON READABILITY: Make the content clean and easy to read
  `;
}