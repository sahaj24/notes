// Improved Mind Map Template
mindmap: {
  description: 'visual connections and hierarchical information structure',
  emphasis: 'Create branching, tree-like structures with connecting lines and hierarchical organization.',
  colors: ['#27ae60', '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c'],
  specialInstructions: `
    Create a professional mind mapping diagram that EXACTLY resembles modern digital mind mapping software:
    
    CORE STRUCTURE:
    - Place the main topic in a large, prominent circular or oval node at the CENTER of the document
    - Create exactly 5-7 main branches radiating outward from the central node like spokes
    - Each main branch must have its own distinct color from the color palette
    - Each branch must have multiple levels of sub-branches (at least 3 levels deep)
    
    CONNECTIONS:
    - Connect ALL nodes with visible, curved connector lines (not straight lines)
    - Make connector lines thicker for main branches, thinner for sub-branches
    - Use arrows on connectors to show direction/flow of ideas
    - Ensure branches never cross or overlap each other
    
    NODE DESIGN:
    - Main topic node: large oval/circle with bold text and distinctive border
    - Main branch nodes: medium-sized rounded rectangles with solid color backgrounds
    - Sub-branch nodes: smaller rounded rectangles with lighter color backgrounds
    - Detail nodes: small capsule shapes with very light backgrounds
    
    VISUAL HIERARCHY:
    - Decrease node size as you move outward from center
    - Use font size to reinforce hierarchy (larger for main concepts, smaller for details)
    - Add small icons or symbols inside nodes to represent different types of information
    
    CONTENT REQUIREMENTS:
    - Use ONLY concise, keyword-focused text (maximum 3-5 words per node)
    - Include at least 30 total nodes across all branches
    - Group related concepts visually by proximity and color
    
    IMPORTANT VISIBILITY REQUIREMENTS:
    - Use a WHITE or VERY LIGHT background for the entire mind map
    - Ensure high contrast between text and node backgrounds
    - Make all text clearly readable with appropriate font sizes
    - Use bright, vibrant colors for nodes and connections
    
    MUST INCLUDE:
    - A distinctive central node with the main topic
    - Color-coded branches with consistent color scheme
    - Visual indicators showing relationships between concepts
    - A clean, organized radial structure
    - A small legend explaining the color coding system
    - At least one "floating" node with a dashed connector to show related but separate ideas
  `,
  customCSS: `
    /* Reset grid layout for mindmap */
    .note-paper {
      display: block !important;
      grid-template-columns: none !important;
      grid-auto-rows: auto !important;
      grid-auto-flow: row !important;
      gap: 0 !important;
      background-color: #ffffff !important;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(240, 240, 240, 0.5) 0%, #ffffff 100%),
        linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px), 
        linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px) !important;
      background-size: 100% 100%, 20px 20px, 20px 20px !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
      overflow: hidden !important;
      border: 1px solid #e0e0e0 !important;
      padding: 20px !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      position: relative !important;
    }
    
    body {
      background-color: #f5f5f5;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      padding: 1rem;
      margin: 0;
      color: #333333;
    }
  `
}