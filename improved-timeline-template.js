// Modern Timeline Template
timeline: {
  description: 'chronological layout perfect for historical topics',
  emphasis: 'Create a professional historical timeline with clear connections between events.',
  colors: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
  specialInstructions: `
    Create a professional historical timeline with a clean, modern design:
    
    STRUCTURE:
    - Use a vertical timeline with a prominent central line running down the middle
    - Position events alternately on left and right sides of the timeline
    - CRITICAL: Each event MUST connect to the central timeline with visible connector lines
    - Use a clean white background with minimal textures or patterns
    - Organize events chronologically from top to bottom
    
    EVENT CARDS:
    - Create clean, modern event cards with subtle shadows
    - Include a clear date, title, and description for each event
    - Use a consistent card design throughout the timeline
    - Add a small colored accent to each card (blue tones)
    - Keep text highly readable with good contrast
    
    VISUAL ELEMENTS:
    - Use circular markers where each event connects to the timeline
    - Add clear connector lines between events and the timeline
    - Include simple icons or small images where appropriate
    - Use a clean, professional typography with good readability
    
    CONTENT ORGANIZATION:
    - Group events into clear historical periods or eras
    - Include era headers to separate different time periods
    - For each event, include: date, title, and concise description
    - Add brief context notes where helpful
    
    STYLING:
    - Use a clean, modern aesthetic with plenty of white space
    - Apply a professional blue color scheme for accents
    - Create a visually balanced layout with proper spacing
    - Ensure high contrast for readability
    
    IMPORTANT REQUIREMENTS:
    - MUST use a clean white background (no textures or patterns)
    - MUST have visible connector lines between events and timeline
    - MUST alternate events on left and right sides
    - MUST use a vertical layout (not horizontal)
    - MUST have clear visual hierarchy with dates, titles, and descriptions
  `,
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
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
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .timeline-event-content:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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
  `
}