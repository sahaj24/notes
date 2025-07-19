// This is a temporary file to fix the syntax error in the route.ts file
// The issue is with the CSS template string in the timeline section
// We need to properly close the template string and add the medieval section

// Find the line with the import URL that's causing the issue
// @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

// The correct syntax should be:
/*
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
      `
    },
    medieval: {
      description: 'medieval manuscript with ornate decorations and calligraphy',
      emphasis: 'Create an ancient manuscript look with ornate decorations, illuminated capitals, and calligraphy.',
      colors: ['#8B4513', '#CD853F', '#A0522D', '#D2B48C', '#800000', '#DAA520'],
      specialInstructions: `
        Create a medieval manuscript style document with ornate decorations and calligraphy.
        - Use decorative borders and illuminated capitals at the beginning of sections
        - Include ornate dividers between sections
        - Use a formal, calligraphic font style throughout
        - Add decorative drop caps for the first letter of key paragraphs
        - Include medieval-style illustrations and decorative elements
        - Use a parchment-like background texture
        - Create the appearance of aged, weathered paper
        - Add decorative headers and footers
        - Use rich, deep colors typical of medieval manuscripts
      `,
      customCSS: `
        body {
          background-color: #f5f1e6;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d1c8b7' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
          font-family: 'EB Garamond', serif;
          padding: 2rem;
          color: #3d2c12;
        }
      `
    },
*/