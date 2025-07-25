'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { CoinDisplay } from './CoinDisplay';
import { supabase } from '@/lib/supabase';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Logo from './Logo';

interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  emphasis?: string;
  colors?: string[];
  specialInstructions?: string;
}

interface GenerationHistory {
  id: string;
  title: string;
  content: string;
  template: string;
  pages: number;
  coins_spent: number;
  created_at: string;
}

export const BeautifulNote: React.FC = () => {
  const { user, signOut, session } = useAuth();
  const { profile, refreshProfile } = useUserProfile();
  const [topic, setTopic] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('creative');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noteHtml, setNoteHtml] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState<'input' | 'options' | 'result'>('input');
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html' | 'pdf' | 'image'>('html');
  const [isExporting, setIsExporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pages, setPages] = useState<number>(1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [coinWarning, setCoinWarning] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to auto-crop canvas and remove excess whitespace
  const cropCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = sourceCanvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;

    let minX = sourceCanvas.width, minY = sourceCanvas.height, maxX = 0, maxY = 0;
    const backgroundRGB = [244, 244, 244]; // #f4f4f4 background color
    const tolerance = 10; // Color tolerance for cropping

    // Find the bounds of non-background content
    for (let y = 0; y < sourceCanvas.height; y++) {
      for (let x = 0; x < sourceCanvas.width; x++) {
        const index = (y * sourceCanvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // Check if pixel is significantly different from background
        const isContent = a > 128 && (
          Math.abs(r - backgroundRGB[0]) > tolerance ||
          Math.abs(g - backgroundRGB[1]) > tolerance ||
          Math.abs(b - backgroundRGB[2]) > tolerance
        );

        if (isContent) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Add small padding around content
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(sourceCanvas.width, maxX + padding);
    maxY = Math.min(sourceCanvas.height, maxY + padding);

    // Create cropped canvas
    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;

    if (croppedWidth <= 0 || croppedHeight <= 0) {
      return sourceCanvas; // Return original if cropping failed
    }

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;

    const croppedCtx = croppedCanvas.getContext('2d');
    if (croppedCtx) {
      croppedCtx.drawImage(
        sourceCanvas,
        minX, minY, croppedWidth, croppedHeight,
        0, 0, croppedWidth, croppedHeight
      );
    }

    return croppedCanvas;
  };

  const templates: NoteTemplate[] = [
    {
      id: 'creative',
      name: 'Creative Collage',
      description: 'Hand-drawn style with colorful elements and organic layouts',
      icon: '🎨',
      color: 'bg-purple-500',
      emphasis: 'Use vibrant colors, organic shapes, and artistic flourishes. Make it feel like a creative art journal.',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'],
      specialInstructions: `
        Create a vibrant, artistic collage that resembles a creative journal or sketchbook.
        - Use a mix of handwritten-style fonts with varying sizes and rotations
        - Add colorful backgrounds for different sections (pastels and bright colors)
        - Include decorative elements like hand-drawn arrows, stars, and doodles
        - Create an organic, flowing layout that feels artistic and playful
        - Use sticky notes, torn paper effects, and tape elements for a scrapbook feel
        - Vary text alignment and styling to create visual interest
        - Add emphasis with underlines, highlights, and circled text
      `
    },
    {
      id: 'academic',
      name: 'Academic Study',
      description: 'Professional format perfect for research and academic work',
      icon: '🎓',
      color: 'bg-blue-500',
      emphasis: 'Use clean, structured layouts with academic formatting. Include proper citations and formal presentation.',
      colors: ['#2c3e50', '#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6'],
      specialInstructions: `
        Create a formal academic document that resembles a research paper or scholarly article:
        
        DOCUMENT STRUCTURE:
        - Include a formal title, author section, and abstract at the top
        - Organize content with numbered sections and subsections (1.0, 1.1, 1.2, etc.)
        - Add page numbers and running headers
        - Include a formal bibliography/references section at the end
        
        ACADEMIC ELEMENTS:
        - Add proper in-text citations (Author, Year) throughout the document
        - Include footnotes or endnotes for additional context
        - Create definition boxes for key terms and concepts
        - Add theorem/concept highlights with formal formatting
        - Include numbered lists for procedures or sequential information
        - Add footnotes or endnotes for additional context
        - Use formal language and terminology appropriate for academic contexts
        - Create tables for organizing complex information
        - Include sections for key terms, definitions, and important concepts
      `
    },
    {
      id: 'cheatsheet',
      name: 'Cheat Sheet',
      description: 'Densely packed study reference with formulas and key facts',
      icon: '📝',
      color: 'bg-green-500',
      emphasis: 'Create a compact, information-dense cheat sheet with minimal design and maximum content.',
      colors: ['#000000', '#333333', '#666666', '#0066cc', '#cc0000', '#009900'],
      specialInstructions: `
        Create a dense, information-packed cheat sheet for studying:
        
        LAYOUT:
        - Create a single-page, extremely dense reference sheet
        - Use multiple columns (2-3) to maximize information density
        - Minimize margins and white space to fit maximum content
        - Use a clean, simple design with minimal decorative elements
        
        CONTENT ORGANIZATION:
        - Group related information into clear sections with headers
        - Include key definitions, formulas, and concepts
        - Use bullet points and numbered lists for efficient information presentation
        - Add brief examples where necessary for clarity
        
        TEXT FORMATTING:
        - Use small font sizes to fit more content
        - Bold or underline key terms for emphasis
        - Use different font styles to distinguish between types of information
        - Include mathematical formulas and equations where relevant
        
        VISUAL ELEMENTS:
        - Use simple boxes or borders to separate sections
        - Include minimal diagrams only if absolutely necessary
        - Use symbols and abbreviations to save space
        - Add reference numbers or quick lookup indicators
        
        IMPORTANT REQUIREMENTS:
        - MUST be extremely dense with information
        - MUST use minimal design elements to maximize content
        - MUST organize information logically for quick reference
        - MUST include all essential information in a compact format
        - MUST be readable despite the high information density
      `
    },
    {
      id: 'timeline',
      name: 'Timeline',
      description: 'Sequential presentation of events or developments in chronological order',
      icon: '📅',
      color: 'bg-yellow-500',
      emphasis: 'Organize information chronologically with clear time markers and sequential flow.',
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
      `
    },
    {
      id: 'comparison',
      name: 'Comparison',
      description: 'Side-by-side analysis and comparison charts',
      icon: '⚖️',
      color: 'bg-red-500',
      emphasis: 'Use parallel columns and comparison tables to highlight differences and similarities.',
      colors: ['#3498db', '#2980b9', '#e74c3c', '#c0392b', '#27ae60', '#f39c12'],
      specialInstructions: `
        Create a clear comparison layout that effectively highlights similarities and differences:
        
        STRUCTURE:
        - Use a two-column layout for direct comparisons between items
        - Create comparison tables with clear headers and aligned rows
        - Divide the page into distinct comparison sections
        - Use a clean, organized layout with clear visual separation between compared items
        
        COMPARISON ELEMENTS:
        - Include side-by-side tables with matching criteria for each item
        - Use visual cues like checkmarks (✓) and X marks (✗) to show presence/absence
        - Add rating systems (stars, numbers, or bars) for quantitative comparisons
        - Create pro/con lists for each item being compared
        - Include "versus" sections that directly contrast key points
        
        VISUAL ELEMENTS:
        - Use color coding to distinguish between the items being compared
        - Add clear headers and labels for each comparison category
        - Include a legend explaining any symbols or scoring systems used
        - Use Venn diagrams or other visual elements to show overlapping characteristics
        
        CONTENT ORGANIZATION:
        - Group comparisons by category or feature
        - Include summary sections that synthesize key differences and similarities
        - Add conclusion or recommendation sections based on the comparison
        - Ensure balanced coverage of all items being compared
        
        IMPORTANT REQUIREMENTS:
        - MUST use a clean, organized layout with clear visual separation
        - MUST include direct side-by-side comparisons
        - MUST use visual elements to highlight differences and similarities
        - MUST maintain consistent criteria across all compared items
        - MUST include a summary or conclusion based on the comparison
      `
    },
    {
      id: 'notebook',
      name: 'Classic Notebook',
      description: 'Traditional handwritten notes on lined paper with annotations',
      icon: '📝',
      color: 'bg-gray-500',
      emphasis: 'Mimic classic notebook paper with ruled lines and natural handwriting flow.',
      colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1'],
      specialInstructions: `
        Create a realistic notebook page with handwritten notes:
        
        PAPER STRUCTURE:
        - Create blue horizontal ruled lines like college-ruled notebook paper
        - Include a red vertical margin line on the left side
        - Add subtle paper texture with slight discoloration
        - Include realistic spiral binding graphics on the left edge
        
        HANDWRITING ELEMENTS:
        - Use exclusively handwriting-style fonts that look like real pen writing
        - Include natural handwriting imperfections like crossed-out words
        - Add margin notes and annotations in different colored "pens"
        - Include hand-drawn arrows connecting related concepts
        
        ORGANIZATION:
        - Include a handwritten title and date at the top of the page
        - Create a natural, slightly messy layout that maintains readability
        - Use indentation and bullet points like a student would in real notes
        - Add highlighting in yellow for important points
        
        VISUAL ELEMENTS:
        - Include circled or starred items for emphasis
        - Add small hand-drawn diagrams or illustrations where appropriate
        - Use different pen colors for main text, important notes, and annotations
        - Add realistic page number in the corner
        
        IMPORTANT REQUIREMENTS:
        - MUST look like authentic handwritten notes
        - MUST include ruled lines and margin line
        - MUST use handwriting-style fonts exclusively
        - MUST include annotations and highlighting
        - MUST have a natural, slightly messy organization
      `
    }
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl/Cmd + N', action: 'New note' },
    { key: 'Ctrl/Cmd + S', action: 'Save/Export note' },
    { key: 'Ctrl/Cmd + Enter', action: 'Generate note' },
    { key: 'Esc', action: 'Close panels' }
  ];

  const handleGenerateNote = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate notes');
      return;
    }

    const coinsRequired = pages;

    // Check if user has enough coins
    if (user && profile && profile.coins < coinsRequired) {
      setCoinWarning(`You need ${coinsRequired} coins but only have ${profile.coins}. Please upgrade your account or earn more coins.`);
      return;
    }

    // Check tier limits for free and pro users
    if (user && profile && profile.monthly_note_limit && profile.monthly_notes_count >= profile.monthly_note_limit) {
      if (profile.tier === 'free') {
        setCoinWarning(`You've reached your monthly limit of ${profile.monthly_note_limit} notes. Please upgrade to Pro for 200 notes or Enterprise for unlimited notes.`);
      } else if (profile.tier === 'pro') {
        setCoinWarning(`You've reached your monthly limit of ${profile.monthly_note_limit} notes. Please upgrade to Enterprise for unlimited notes.`);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setCoinWarning(null);
    setNoteHtml(null);
    setCurrentStep('result');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // Add authorization header if user is logged in
      if (user && session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic,
          template: selectedTemplate,
          pages
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setCoinWarning(data.error || 'Insufficient coins');
          return;
        } else if (response.status === 429) {
          setCoinWarning(data.error || 'Monthly limit reached');
          return;
        }
        throw new Error(data.error || `Failed to generate note. Status: ${response.status}`);
      }

      if (!data.noteHtml) {
        throw new Error("Received invalid note structure from server.");
      }

      const cleanedHtml = data.noteHtml
        .replace(/```html\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/^```\s*/g, '')
        .replace(/```/g, '')                  // Remove any remaining ```
        .replace(/^\s*html\s*/i, '')          // Remove standalone 'html' text
        .replace(/^\s*<!DOCTYPE/i, '<!DOCTYPE') // Ensure DOCTYPE starts properly
        .trim();
      setNoteHtml(cleanedHtml);

      // If user is authenticated, refresh their profile and history
      if (user && data.coinsRemaining !== undefined) {
        await refreshProfile();
        await fetchHistory(); // Refresh history from database
      }

    } catch (err: any) {
      setError(err.message);
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!noteHtml) return;

    // Close history panel and left sidebar when exporting
    console.log('Export clicked - closing history panel and left sidebar');
    setShowHistory(false);
    setSidebarVisible(false);

    // Add delay to allow panels to close before taking screenshot/export
    if (exportFormat === 'image') {
      await new Promise(resolve => setTimeout(resolve, 500));
    } else if (exportFormat === 'pdf') {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsExporting(true);
    try {
      if (exportFormat === 'html') {
        // Download as HTML file
        const blob = new Blob([noteHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `note-${topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'image') {
        // Simple and reliable PNG export method with proper styling and width
        console.log('Starting PNG export...');

        // Get the actual dimensions from the iframe content with reasonable limits
        let contentWidth = 1200; // Default balanced width
        let contentHeight = 1000; // Default height

        if (iframeRef.current?.contentDocument) {
          const iframeDoc = iframeRef.current.contentDocument;
          const body = iframeDoc.body;
          if (body) {
            // Get the actual content dimensions but cap at reasonable size
            const detectedWidth = Math.max(body.scrollWidth, body.offsetWidth);
            contentWidth = Math.min(Math.max(detectedWidth, 1000), 1400); // Between 1000-1400px
            contentHeight = Math.max(body.scrollHeight, body.offsetHeight, 1000);
            console.log(`Detected content dimensions: ${detectedWidth}px, using: ${contentWidth}x${contentHeight}`);
          }
        }

        // Get styles from the iframe document
        let iframeStyles = '';
        if (iframeRef.current?.contentDocument) {
          const iframeDoc = iframeRef.current.contentDocument;
          const styleElements = iframeDoc.querySelectorAll('style');
          iframeStyles = Array.from(styleElements).map(style => style.textContent || '').join('\n');
        }

        // Create a temporary container in the main document with minimal padding
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = `${contentWidth}px`;
        container.style.minWidth = `${contentWidth}px`;
        container.style.background = '#f4f4f4';
        container.style.fontFamily = "'Kalam', cursive";
        container.style.padding = '15px'; // Minimal padding
        container.style.paddingBottom = '15px'; // Minimal bottom padding
        container.style.boxSizing = 'border-box';
        container.style.overflow = 'visible';
        container.style.minHeight = 'auto';
        container.style.height = 'auto';

        // Create and add a style element with iframe styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          /* Import Google Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Kalam:wght@300;400;700&family=Caveat&display=swap');
          
          /* Original iframe styles */
          ${iframeStyles}
          
          /* Additional style enforcement for container */
          .temp-export-container {
            font-family: 'Kalam', cursive;
            color: #333;
            background: #f4f4f4;
            width: ${contentWidth}px;
            min-width: ${contentWidth}px;
          }
          
          .temp-export-container h1, .temp-export-container h2, .temp-export-container h3 {
            font-family: 'Gochi Hand', cursive;
          }
          
          .temp-export-container em {
            font-family: 'Caveat', cursive;
          }
        `;

        // Add the style to document head temporarily
        document.head.appendChild(styleElement);

        // Add class to container for styling
        container.className = 'temp-export-container';

        // Set the HTML content directly from noteHtml with thorough cleaning
        let cleanedContent = noteHtml;

        // Remove all markdown code block markers thoroughly
        cleanedContent = cleanedContent
          .replace(/```html\s*/g, '')           // Remove ```html at start
          .replace(/```\s*$/g, '')              // Remove ``` at end
          .replace(/^```\s*/g, '')              // Remove ``` at start
          .replace(/```/g, '')                  // Remove any remaining ```
          .replace(/^\s*html\s*/i, '')          // Remove standalone 'html' text
          .trim();

        container.innerHTML = cleanedContent;

        // Add the container to the document
        document.body.appendChild(container);

        try {
          // Wait a moment for fonts to load and render
          await new Promise(resolve => setTimeout(resolve, 1500)); // Increased wait time for better rendering

          // Get the actual height after content is rendered with minimal buffer
          const actualHeight = Math.max(
            container.scrollHeight,
            container.offsetHeight,
            container.getBoundingClientRect().height,
            contentHeight // Also use the initial content height estimate
          );

          console.log(`Container dimensions: ${contentWidth}x${actualHeight}`);

          // Use html2canvas with minimal padding settings and then crop
          const canvas = await html2canvas(container, {
            backgroundColor: '#f4f4f4',
            scale: 1.5, // Balanced scale for good quality without being too large
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: contentWidth,
            height: actualHeight + 30, // Minimal bottom padding
            windowWidth: contentWidth,
            windowHeight: actualHeight + 30,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            ignoreElements: (element) => {
              return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT';
            }
          });

          // Auto-crop the canvas to remove excess whitespace
          const croppedCanvas = cropCanvas(canvas);

          // Convert to PNG and download
          croppedCanvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `note-${topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              console.log('PNG export successful!');
            } else {
              throw new Error('Failed to create blob from canvas');
            }
          }, 'image/png', 1.0);

        } catch (error) {
          console.error('PNG export error:', error);
          alert('Failed to export as PNG. Please try again or use the PDF export option.');
        } finally {
          // Clean up - remove the temporary container and style element
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
          }
        }
      } else if (exportFormat === 'pdf') {
        // Direct PDF export using screenshot-to-PDF method
        console.log('Starting direct PDF export...');

        // Get the actual dimensions from the iframe content with reasonable limits
        let contentWidth = 1200; // Default balanced width
        let contentHeight = 1000; // Default height

        if (iframeRef.current?.contentDocument) {
          const iframeDoc = iframeRef.current.contentDocument;
          const body = iframeDoc.body;
          if (body) {
            // Get the actual content dimensions but cap at reasonable size
            const detectedWidth = Math.max(body.scrollWidth, body.offsetWidth);
            contentWidth = Math.min(Math.max(detectedWidth, 1000), 1400); // Between 1000-1400px
            contentHeight = Math.max(body.scrollHeight, body.offsetHeight, 1000);
            console.log(`Detected content dimensions: ${detectedWidth}px, using: ${contentWidth}x${contentHeight}`);
          }
        }

        // Get styles from the iframe document
        let iframeStyles = '';
        if (iframeRef.current?.contentDocument) {
          const iframeDoc = iframeRef.current.contentDocument;
          const styleElements = iframeDoc.querySelectorAll('style');
          iframeStyles = Array.from(styleElements).map(style => style.textContent || '').join('\n');
        }

        // Create a temporary container in the main document with minimal padding
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = `${contentWidth}px`;
        container.style.minWidth = `${contentWidth}px`;
        container.style.background = '#f4f4f4';
        container.style.fontFamily = "'Kalam', cursive";
        container.style.padding = '15px'; // Minimal padding
        container.style.paddingBottom = '15px'; // Minimal bottom padding
        container.style.boxSizing = 'border-box';
        container.style.overflow = 'visible';
        container.style.minHeight = 'auto';
        container.style.height = 'auto';

        // Create and add a style element with iframe styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          /* Import Google Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Kalam:wght@300;400;700&family=Caveat&display=swap');
          
          /* Original iframe styles */
          ${iframeStyles}
          
          /* Additional style enforcement for container */
          .temp-export-container {
            font-family: 'Kalam', cursive;
            color: #333;
            background: #f4f4f4;
            width: ${contentWidth}px;
            min-width: ${contentWidth}px;
          }
          
          .temp-export-container h1, .temp-export-container h2, .temp-export-container h3 {
            font-family: 'Gochi Hand', cursive;
          }
          
          .temp-export-container em {
            font-family: 'Caveat', cursive;
          }
        `;

        // Add the style to document head temporarily
        document.head.appendChild(styleElement);

        // Add class to container for styling
        container.className = 'temp-export-container';

        // Set the HTML content directly from noteHtml with thorough cleaning
        let cleanedContent = noteHtml;

        // Remove all markdown code block markers thoroughly
        cleanedContent = cleanedContent
          .replace(/```html\s*/g, '')           // Remove ```html at start
          .replace(/```\s*$/g, '')              // Remove ``` at end
          .replace(/^```\s*/g, '')              // Remove ``` at start
          .replace(/```/g, '')                  // Remove any remaining ```
          .replace(/^\s*html\s*/i, '')          // Remove standalone 'html' text
          .trim();

        container.innerHTML = cleanedContent;

        // Add the container to the document
        document.body.appendChild(container);

        try {
          // Wait a moment for fonts to load and render
          await new Promise(resolve => setTimeout(resolve, 1500)); // Increased wait time for better rendering

          // Get the actual height after content is rendered with minimal buffer
          const actualHeight = Math.max(
            container.scrollHeight,
            container.offsetHeight,
            container.getBoundingClientRect().height,
            contentHeight // Also use the initial content height estimate
          );

          console.log(`Container dimensions: ${contentWidth}x${actualHeight}`);

          // Use html2canvas to capture the screenshot with minimal padding and then crop
          const canvas = await html2canvas(container, {
            backgroundColor: '#f4f4f4',
            scale: 1.5, // Balanced scale for good quality without being too large
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: contentWidth,
            height: actualHeight + 30, // Minimal bottom padding
            windowWidth: contentWidth,
            windowHeight: actualHeight + 30,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            ignoreElements: (element) => {
              return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT';
            }
          });

          // Auto-crop the canvas to remove excess whitespace
          const croppedCanvas = cropCanvas(canvas);

          // Convert canvas to image data
          const imageData = croppedCanvas.toDataURL('image/png');

          // Calculate PDF dimensions (A4 size with some margin)
          const pdfWidth = 210; // A4 width in mm
          const pdfHeight = 297; // A4 height in mm
          const margin = 10; // 10mm margin
          const maxImageWidth = pdfWidth - (margin * 2);
          const maxImageHeight = pdfHeight - (margin * 2);

          // Calculate image dimensions to fit in PDF using cropped canvas
          const imageWidth = croppedCanvas.width;
          const imageHeight = croppedCanvas.height;
          const aspectRatio = imageWidth / imageHeight;

          let finalWidth = maxImageWidth;
          let finalHeight = maxImageWidth / aspectRatio;

          // If height exceeds page, scale down
          if (finalHeight > maxImageHeight) {
            finalHeight = maxImageHeight;
            finalWidth = maxImageHeight * aspectRatio;
          }

          // Create PDF
          const pdf = new jsPDF({
            orientation: finalHeight > finalWidth ? 'portrait' : 'landscape',
            unit: 'mm',
            format: 'a4'
          });

          // Add the image to PDF
          pdf.addImage(
            imageData,
            'PNG',
            margin,
            margin,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );

          // Generate filename
          const filename = `note-${topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;

          // Download the PDF
          pdf.save(filename);

          console.log('PDF export (direct download) successful!');

        } catch (error) {
          console.error('PDF export error:', error);
          alert('Failed to export as PDF. Please try again or use the PNG export option.');
        } finally {
          // Clean up - remove the temporary container and style element
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
          }
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackToLanding = () => {
    window.location.href = '/notes'; // Redirect to /notes route instead of reloading
  };

  const resetToInput = () => {
    setCurrentStep('input');
    setTopic('');
    setPages(1);
    setError(null);
    setCoinWarning(null);
    setNoteHtml(null);
  };

  // Fetch history from database
  const fetchHistory = async () => {
    if (!user || !session) return;

    try {
      const response = await fetch('/api/user/notes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const dbHistory = result.data.map((note: any) => ({
          id: note.id,
          topic: note.title,
          template: note.template,
          timestamp: new Date(note.created_at),
          preview: note.title.substring(0, 50) + (note.title.length > 50 ? '...' : ''),
          pages: note.pages || 1,
          coins_spent: note.coins_spent || 1
        }));
        setHistory(dbHistory);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  // Load history when user is authenticated
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user && session) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [user?.id, session?.access_token]);

  // Load a note from history
  const loadFromHistory = async (noteId: string) => {
    if (!user || !session) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const note = result.data;

        setTopic(note.title);
        setSelectedTemplate(note.template);
        setPages(note.pages || 1);
        setNoteHtml(note.content);
        setCurrentStep('result');
        setShowHistory(false);
      } else {
        setError('Failed to load note from history');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load note from history');
    } finally {
      setIsLoading(false);
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    // Skip during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return;

    // Debounce keyboard events to prevent multiple triggers
    let keyboardDebounceTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear any existing timer
      clearTimeout(keyboardDebounceTimer);

      // Set a new timer
      keyboardDebounceTimer = setTimeout(() => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'n':
              e.preventDefault();
              resetToInput();
              break;
            case 's':
              e.preventDefault();
              if (noteHtml) {
                handleExport();
              }
              break;
            case 'Enter':
              e.preventDefault();
              if (currentStep === 'input' && topic.trim()) {
                handleGenerateNote();
              }
              break;
          }
        } else if (e.key === 'Escape') {
          // Close panels on Escape
          setShowHistory(false);
          setShowHelp(false);
        }
      }, 100); // Small debounce delay
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyboardDebounceTimer);
    };
  }, [currentStep, topic, noteHtml]);

  // This useEffect is removed - history loading is now handled by the auth-ready useEffect above

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Load user data on component mount
  useEffect(() => {
    // User data is now handled by AuthContext
  }, []);

  const handleLogout = async () => {
    console.log('🔥 LOGOUT CLICKED!'); // Debug

    try {
      setShowUserMenu(false);
      console.log('🔄 Starting signOut process...'); // Debug

      // Try multiple logout approaches
      try {
        await signOut();
        console.log('✅ AuthContext signOut successful'); // Debug
      } catch (authError) {
        console.log('❌ AuthContext signOut failed, trying direct supabase...', authError); // Debug
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Direct supabase signOut failed:', error);
        } else {
          console.log('✅ Direct supabase signOut successful'); // Debug
        }
      }

      // Clear state and redirect regardless
      console.log('🧹 Clearing state...'); // Debug
      setHistory([]);
      setNoteHtml(null);
      setTopic('');
      setCurrentStep('input');

      console.log('🔀 Redirecting to login...'); // Debug
      window.location.href = '/login';

    } catch (error) {
      console.error('💥 Complete logout failure:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToLanding}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-700 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <Logo href="/" size="md" showText={true} />
          </div>

          <div className="flex items-center space-x-4">
            {/* Coin Display for authenticated users */}
            {user && <CoinDisplay />}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">History</span>
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Help</span>
            </button>

            {noteHtml && (
              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="html">HTML File</option>
                  <option value="image">PNG Image</option>
                  <option value="pdf">PDF (Print)</option>
                </select>

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 text-sm"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            )}

            {/* User menu */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.user_metadata?.full_name || user?.email || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="absolute top-16 right-0 w-80 h-full bg-white shadow-xl z-20 border-l border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Quick Guide</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">How to Use Notopy</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-1">1. Enter a Topic</h5>
                    <p className="text-sm text-blue-700">
                      Type any subject you want to learn about in the input field.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-1">2. Select Pages</h5>
                    <p className="text-sm text-blue-700">
                      Choose how many pages of notes you need (each page costs 1 coin).
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-1">3. Generate</h5>
                    <p className="text-sm text-blue-700">
                      Click "Generate Note" and watch as AI creates beautiful notes for you.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-1">Be Specific</h5>
                    <p className="text-sm text-green-700">
                      "Quantum physics basics for beginners" works better than just "quantum physics".
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-1">Save Your Work</h5>
                    <p className="text-sm text-green-700">
                      Use the Export button to download your notes as PNG, PDF, or HTML.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Need More Coins?</h4>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    Visit the <a href="/pricing" className="font-medium underline">Pricing Page</a> to purchase more coins and generate more notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-full pt-16">
        {/* Sidebar */}
        <div className={`${sidebarVisible ? 'w-96' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-white border-r border-gray-200`}>
          <div className="p-6 h-full overflow-y-auto">
            {currentStep === 'input' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Note</h2>
                  <p className="text-gray-600">Transform any topic into a beautiful, structured note</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to create notes about?
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., ' Renaissance history' or 'ML basics'"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none h-20 bg-white text-gray-900 placeholder-gray-500 font-sans"
                    disabled={isLoading}
                  />

                  {/* Example topics */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'The Renaissance Period',
                        'Machine Learning Basics',
                        'Climate Change Impact'
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => setTopic(example)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of pages
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={pages}
                      onChange={(e) => setPages(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={isLoading}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full min-w-[3rem] text-center">
                        {pages}
                      </span>
                      <span className="text-sm text-gray-500">
                        page{pages > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Single page</span>
                    <span>Multiple pages</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {pages > 1 ? `Each page will build upon the previous one with continuing content.` : 'A single comprehensive page with all the content.'}
                  </p>

                  {/* Cost Display */}
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-800">Cost for this note:</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          ¢
                        </div>
                        <span className="text-sm font-medium text-yellow-800">{pages} coin{pages > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {user && profile && (
                      <div className="mt-2 text-xs text-yellow-700">
                        You have {profile.coins} coins available
                        {profile.coins < pages && (
                          <span className="text-red-600 font-medium"> (insufficient funds)</span>
                        )}
                      </div>
                    )}
                    {!user && (
                      <div className="mt-2 text-xs text-yellow-700">
                        <a href="/signup" className="text-yellow-800 underline hover:text-yellow-900">
                          Sign up
                        </a> to get 30 free coins and save your notes!
                      </div>
                    )}
                  </div>
                </div>

                {/* Coin Warning */}
                {coinWarning && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2">{coinWarning}</p>
                        {user && profile && profile.coins < pages && (
                          <div className="space-y-2">
                            <a
                              href="#pricing"
                              className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                            >
                              Upgrade Account
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose a template
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedTemplate === template.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center text-xl shadow-md`}>
                            <span className="filter drop-shadow-sm">{template.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateNote}
                  disabled={isLoading || !topic.trim()}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating your note...</span>
                    </div>
                  ) : (
                    'Generate Note'
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'result' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Note</h2>
                  <button
                    onClick={resetToInput}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Create New
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Topic</h3>
                    <p className="text-sm text-gray-600">{topic}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Template</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{templates.find(t => t.id === selectedTemplate)?.icon}</span>
                      <span className="text-sm text-gray-600">{templates.find(t => t.id === selectedTemplate)?.name}</span>
                    </div>
                  </div>

                  {noteHtml && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(noteHtml)}
                          className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm"
                        >
                          Copy HTML
                        </button>
                        <button
                          onClick={async () => {
                            const prevFormat = exportFormat;
                            setExportFormat('image');
                            await handleExport();
                            setExportFormat(prevFormat);
                          }}
                          disabled={isExporting}
                          className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm disabled:opacity-50"
                        >
                          {isExporting && exportFormat === 'image' ? 'Generating Image...' : 'Download as Image'}
                        </button>
                        <button
                          onClick={handleExport}
                          className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm"
                        >
                          Export Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-30 bg-white border border-gray-300 shadow-lg p-2 rounded-r-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-gray-900"
          style={{ left: sidebarVisible ? '24rem' : '0' }}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${sidebarVisible ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-hidden">
          {!noteHtml && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to create amazing notes?</h2>
                <p className="text-gray-600 mb-6">
                  Enter your topic and choose a template to generate beautiful, AI-powered notes with handwritten aesthetics and creative layouts.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>✨ AI-powered generation</span>
                  <span>•</span>
                  <span>🎨 Beautiful designs</span>
                  <span>•</span>
                  <span>📄 Multiple formats</span>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-black rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Crafting your beautiful note...</h2>
                <p className="text-gray-600 mb-4">This may take a few moments as our AI creates something special</p>

                {/* Status messages */}
                <div className="max-w-md mx-auto">
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <span>Analyzing your topic...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span>Structuring content...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span>Applying visual design...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {noteHtml && (
            <div className="h-full relative">
              {/* Floating action buttons */}
              <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <button
                  onClick={async () => {
                    console.log('Copy HTML clicked - closing history panel and left sidebar');
                    setShowHistory(false); // Close history panel
                    setSidebarVisible(false); // Close left sidebar
                    // Small delay to ensure panels are closed
                    await new Promise(resolve => setTimeout(resolve, 200));
                    navigator.clipboard.writeText(noteHtml);
                  }}
                  className="p-2 bg-black/10 backdrop-blur-sm rounded-lg hover:bg-black/20 transition-colors duration-200"
                  title="Copy HTML"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>

                <button
                  onClick={async () => {
                    console.log('Quick image export clicked - closing history panel and left sidebar');
                    setShowHistory(false); // Close history panel
                    setSidebarVisible(false); // Close left sidebar
                    // Delay to ensure panels are closed before screenshot
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const prevFormat = exportFormat;
                    setExportFormat('image');
                    await handleExport();
                    setExportFormat(prevFormat);
                  }}
                  disabled={isExporting}
                  className="p-2 bg-black/10 backdrop-blur-sm rounded-lg hover:bg-black/20 transition-colors duration-200 disabled:opacity-50"
                  title="Download as Image"
                >
                  {isExporting && exportFormat === 'image' ? (
                    <svg className="w-5 h-5 text-gray-700 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={async () => {
                    console.log('Print clicked - closing history panel and left sidebar');
                    setShowHistory(false); // Close history panel
                    setSidebarVisible(false); // Close left sidebar
                    // Small delay to ensure panels are closed
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.print();
                    }
                  }}
                  className="p-2 bg-black/10 backdrop-blur-sm rounded-lg hover:bg-black/20 transition-colors duration-200"
                  title="Print"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                <iframe
                  ref={iframeRef}
                  srcDoc={noteHtml}
                  title="Generated Note"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-lg z-40 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Note History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No notes generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => loadFromHistory(item.id)}
                    >
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'} • {item.template}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.pages} page{item.pages !== 1 ? 's' : ''} • {item.coins_spent} coin{item.coins_spent !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
