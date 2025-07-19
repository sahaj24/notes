// Copy this entire function and replace the existing createNotebookPrompt function in route.ts

function createNotebookPrompt(topic: string, numPages: number = 1): string {
  const templateStyle = {
    description: 'authentic student notebook with messy handwriting and doodles',
    emphasis: 'Create realistic student notes with imperfect handwriting, doodles, and authentic paper texture.',
    colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1']
  };

  return `
    You are a master visual note-taker and graphic designer, using HTML and CSS as your medium. 
    
    **🎯 HIGHEST PRIORITY - FOLLOW THESE EXACTLY:**
    1. **PRIMARY TOPIC:** "${topic}" - This is the MAIN subject. ALL content must be directly related to this topic. Do NOT deviate or add unrelated information.
    2. **MANDATORY TEMPLATE:** ${templateStyle.description} - ${templateStyle.emphasis} This template style is NON-NEGOTIABLE and must be applied throughout.
    3. **PAGES REQUIREMENT:** Create exactly ${numPages} page${numPages > 1 ? 's' : ''} of content. Each page must continue naturally from the previous page, building upon the information presented earlier.
    
    Your task is to generate a SINGLE, SELF-CONTAINED HTML document that creates authentic handwritten notes specifically about: "${topic}" across ${numPages} page${numPages > 1 ? 's' : ''}.
    
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
    
    The final output must be **EXTREMELY REALISTIC HANDWRITTEN NOTES** that look exactly like they were taken by a student during a class or lecture.

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY OR THE TASK WILL FAIL:**
    1.  **HTML ONLY:** Your entire response MUST be only the HTML code. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. NO MARKDOWN, NO EXPLANATIONS.
    2.  **TOPIC ADHERENCE:** Every single piece of content must relate directly to "${topic}". Do not include generic examples or unrelated information.
    3.  **TEMPLATE CONSISTENCY:** Apply the "${templateStyle.description}" style throughout. This is mandatory.
    4.  **NOTEBOOK SPECIFIC REQUIREMENTS:** 
        - Create EXTREMELY REALISTIC HANDWRITTEN NOTES about "${topic}" as if taken during a class
        - Use MULTIPLE handwriting fonts to create authentic variation in writing style
        - Include messy handwriting, crossed-out words, and corrections
        - Add margin notes, arrows pointing to important concepts, and highlighting
        - Include doodles, stars, and other student markings in margins
        - Create a slightly messy, imperfect layout that looks AUTHENTICALLY HANDWRITTEN
        - Use different pen colors (blue, black, red) as if the student switched pens
        - Add coffee stains, wrinkled paper effects, and other realistic elements
        - Focus on making the notes look EXACTLY like they were written by a real student
    5.  **NOTEBOOK SPECIFIC STRUCTURE:** Since you are creating a notebook page, you MUST use this exact HTML structure:
        \`\`\`html
        <div class="notebook-page">
          <!-- Page header with title and date -->
          <div class="notebook-header">
            <h1 class="notebook-title">${topic}</h1>
            <div class="notebook-date">Date: Today's Class</div>
          </div>
          
          <!-- Main content with ruled lines -->
          <div class="notebook-content">
            <!-- Section with heading -->
            <div class="notebook-section">
              <h2 class="notebook-heading">Main Topic</h2>
              
              <!-- Regular notes with bullets -->
              <div class="notebook-text">
                <div class="notebook-bullet">Main point with <span class="notebook-highlight">highlighted text</span></div>
                <div class="notebook-subbullet">Supporting detail with <span class="notebook-important">important text</span></div>
              </div>
              
              <!-- Margin notes -->
              <div class="notebook-margin-note" style="top: 150px;">Remember this!</div>
              
              <!-- Special elements -->
              <div class="notebook-starred">Important point</div>
              <div class="notebook-crossed">Incorrect information</div>
              <span class="notebook-circled">Key concept</span>
              
              <!-- Corrections -->
              <div class="notebook-correction" data-correction="correct term">wrong term</div>
              
              <!-- Doodles and decorations -->
              <div class="notebook-doodle" style="top: 200px; right: 30px;">✎</div>
              <div class="notebook-doodle" style="top: 300px; left: 20px;">★</div>
            </div>
          </div>
          
          <!-- Page number -->
          <div class="notebook-page-number">1</div>
          
          <!-- Coffee stain -->
          <div class="coffee-stain"></div>
        </div>
        \`\`\`
        
        You MUST use the CSS classes exactly as defined in the CSS section. Do NOT modify the class names or structure.

    **CSS TO USE:**
    /* In the <style> tag */
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Indie+Flower&family=Shadows+Into+Light&family=Pangolin&family=Homemade+Apple&family=Just+Me+Again+Down+Here&family=Reenie+Beanie&family=Patrick+Hand&family=Kalam&display=swap');
    
    body {
      background-color: #f0f0f0;
      padding: 2rem;
      margin: 0;
      color: #333;
      line-height: 1.5;
      font-family: 'Caveat', cursive;
    }
    
    /* Main notebook page */
    .notebook-page {
      background-color: #fffdf0; /* Cream color for authentic paper look */
      background-image: 
        linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
      background-size: 100% 25px;
      background-position: 0 0;
      border: 1px solid #ccc;
      box-shadow: 0 5px 15px rgba(0,0,0,0.15), inset 0 0 50px rgba(200,180,0,0.05); /* Enhanced shadows */
      padding: 40px 60px 40px 80px;
      max-width: 800px;
      margin: 0 auto 40px;
      position: relative;
      min-height: 1100px;
      transform: rotate(-0.8deg); /* Slightly rotated for natural look */
      border-radius: 3px;
      overflow: visible;
    }
    
    /* Red margin line */
    .notebook-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 60px;
      height: 100%;
      width: 1px;
      background-color: rgba(255, 0, 0, 0.3);
      z-index: 1;
    }
    
    /* Coffee stain effect */
    .coffee-stain {
      position: absolute;
      top: 40px;
      right: 80px;
      width: 100px;
      height: 70px;
      background: radial-gradient(ellipse at center, rgba(188, 143, 143, 0.4) 0%, rgba(188, 143, 143, 0.2) 50%, rgba(188, 143, 143, 0) 70%);
      border-radius: 50%;
      z-index: 1;
      transform: rotate(-5deg) scale(1.2, 0.8);
      opacity: 0.6;
      pointer-events: none;
    }
    
    /* Page header */
    .notebook-header {
      margin-bottom: 30px;
      position: relative;
      z-index: 2;
    }
    
    .notebook-title {
      font-family: 'Patrick Hand', cursive;
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 10px;
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
      margin-bottom: 20px;
      margin-right: 20px;
      transform: rotate(1deg); /* Slightly rotated for natural look */
    }
    
    /* Main content */
    .notebook-content {
      font-family: 'Caveat', cursive; /* Base handwriting font */
      font-size: 1.2rem;
      color: #2c3e50;
      line-height: 25px;
      position: relative;
      z-index: 5;
      letter-spacing: -0.02em;
    }
    
    /* Sections */
    .notebook-section {
      margin-bottom: 30px;
      position: relative;
    }
    
    /* Random smudge marks */
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
      pointer-events: none;
    }
    
    .notebook-heading {
      font-family: 'Shadows Into Light', cursive; /* Different handwriting font */
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 10px;
      text-decoration: underline;
      text-decoration-style: wavy;
      text-decoration-thickness: 1px;
      transform: rotate(-0.5deg); /* Slight rotation for natural look */
    }
    
    .notebook-text {
      margin-bottom: 20px;
    }
    
    /* Bullet points */
    .notebook-bullet {
      position: relative;
      padding-left: 20px;
      margin-bottom: 5px;
      transform: rotate(-0.2deg); /* Slight rotation for natural look */
      font-family: 'Caveat', cursive;
    }
    
    .notebook-bullet::before {
      content: '•';
      position: absolute;
      left: 5px;
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
      padding-left: 40px;
      margin-bottom: 5px;
      transform: rotate(0.3deg); /* Slight rotation for natural look */
      font-family: 'Indie Flower', cursive; /* Different handwriting font */
    }
    
    .notebook-subbullet::before {
      content: '-';
      position: absolute;
      left: 25px;
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
    
    /* Highlighting */
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
      font-family: 'Patrick Hand', cursive; /* Different handwriting font */
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
    
    .notebook-starred {
      position: relative;
      padding-left: 25px;
      margin: 10px 0;
      font-family: 'Shadows Into Light', cursive; /* Different handwriting font */
    }
    
    .notebook-starred::before {
      content: '★';
      position: absolute;
      left: 0;
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
      text-decoration: line-through;
      color: #7f8c8d;
    }
    
    .notebook-correction::after {
      content: attr(data-correction);
      position: absolute;
      top: -15px;
      left: 0;
      color: #e74c3c;
      font-size: 0.9rem;
      font-family: 'Shadows Into Light', cursive; /* Different handwriting font for corrections */
      transform: rotate(1deg); /* Slight rotation for natural look */
    }
    
    .notebook-margin-note {
      position: absolute;
      left: -60px;
      width: 50px;
      font-family: 'Reenie Beanie', cursive; /* Different handwriting font */
      font-size: 0.9rem;
      color: #e74c3c;
      text-align: right;
      transform: rotate(-2deg);
    }
    
    /* Doodles */
    .notebook-doodle {
      position: absolute;
      font-size: 1.5rem;
      color: #7f8c8d;
      opacity: 0.7;
      transform: rotate(5deg);
      z-index: 2;
      font-family: 'Just Me Again Down Here', cursive;
    }
    
    /* Different pen colors */
    .blue-pen {
      color: #3498db;
      font-family: 'Indie Flower', cursive;
    }
    
    .red-pen {
      color: #e74c3c;
      font-family: 'Shadows Into Light', cursive;
    }
    
    .black-pen {
      color: #2c3e50;
      font-family: 'Caveat', cursive;
    }
    
    /* Page number */
    .notebook-page-number {
      position: absolute;
      bottom: 20px;
      right: 30px;
      font-family: 'Indie Flower', cursive;
      font-size: 1rem;
      color: #7f8c8d;
      transform: rotate(2deg);
    }
    
    /* Paper wrinkle effect */
    .notebook-page::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 80% 40%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%),
        radial-gradient(circle at 10% 60%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 30%);
      pointer-events: none;
      z-index: 1;
    }
    
    /* Tape effect */
    .tape {
      position: absolute;
      width: 80px;
      height: 20px;
      background-color: rgba(255, 255, 255, 0.6);
      opacity: 0.7;
      transform: rotate(-2deg);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      z-index: 10;
    }
    
    .tape-top-left {
      top: -5px;
      left: 30px;
      transform: rotate(-5deg);
    }
    
    .tape-top-right {
      top: -5px;
      right: 40px;
      transform: rotate(5deg);
    }

    Now, generate the complete, self-contained HTML document for the topic: "${topic}" with exactly ${numPages} page${numPages > 1 ? 's' : ''}.
    
    **🚨 CRITICAL REMINDERS:**
    - The topic "${topic}" must be the SOLE focus of all content
    - The "${templateStyle.description}" template style must be applied consistently
    - ${numPages > 1 ? `Create exactly ${numPages} pages with ${numPages * 500}-${numPages * 700} words total distributed EVENLY` : 'Create realistic handwritten notes with 500-700 words'}
    - AUTHENTIC HANDWRITING: Use multiple handwriting fonts and styles
    - IMPERFECTIONS: Include crossed-out words, corrections, and messy writing
    - STUDENT ELEMENTS: Add highlighting, margin notes, and doodles
    - REALISTIC PAPER: Include ruled lines, margin line, and paper texture
    - ALL content must be directly related to "${topic}" - no generic examples or unrelated information
    - FOCUS ON AUTHENTICITY: Make the notes look EXACTLY like they were handwritten by a real student
    
    IMPORTANT: For maximum authenticity, randomly switch between different handwriting fonts (Caveat, Indie Flower, Shadows Into Light, Patrick Hand, etc.) throughout the notes as if the student's handwriting naturally varied. Also switch between different pen colors (blue-pen, red-pen, black-pen classes) in different sections.
  `;
}