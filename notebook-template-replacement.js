// Multi-page document template with completely different content on each page
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
}