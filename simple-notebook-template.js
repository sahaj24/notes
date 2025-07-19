// Ultra simple notebook template with just clean page and human handwriting
function createNotebookPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'clean page with natural handwriting',
    emphasis: 'Create simple notes with natural handwriting on plain white paper.',
    colors: ['#2c3e50', '#34495e', '#7f8c8d']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates simple handwritten notes specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
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
    
    The final output must be **VERY SIMPLE HANDWRITTEN NOTES** that look like they were written by a human on plain white paper.

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
        - Focus on making the notes look like they were written by a human
    5.  **NOTEBOOK SPECIFIC STRUCTURE:** Since you are creating a notebook page, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="page">
          <!-- Page title -->
          <h1 class="title">${topic}</h1>
          
          <!-- Main content -->
          <div class="content">
            <!-- Section with heading -->
            <div class="section">
              <h2 class="heading">Main Topic</h2>
              <p class="text">Your content here...</p>
            </div>
          </div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Indie+Flower&display=swap');
    
    body {
      background-color: #f5f5f5;
      padding: 2rem;
      margin: 0;
      color: #333;
      line-height: 1.5;
      font-family: 'Caveat', cursive;
    }
    
    /* Main page */
    .page {
      background-color: #ffffff; /* Clean white paper */
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 40px 60px;
      max-width: 800px;
      margin: 0 auto 40px;
      position: relative;
      min-height: 1000px;
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
}