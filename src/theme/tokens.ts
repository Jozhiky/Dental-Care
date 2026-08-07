// Exhaustive Design Tokens Architecture for Oral & Kids - Dental Care
// Centralized source of truth for Typography, Colors, Spacings, Radii, and Elevations.

export const DESIGN_TOKENS = {
  // 1. Typography Tokens System
  typography: {
    fontFamilies: {
      sans: "'Inter', system-ui, -apple-system, sans-serif",
      heading: "'Outfit', 'Inter', system-ui, sans-serif",
    },
    sizes: {
      micro: '0.625rem',   // 10px - Sub-captions, teeth tags
      caption: '0.6875rem',// 11px - Metadata, badges
      bodySm: '0.75rem',   // 12px - Secondary text, tables
      body: '0.8125rem',   // 13px - Regular body text
      bodyLg: '0.875rem',  // 14px - Emphasized text
      subheading: '1rem',  // 16px - Section headers
      heading: '1.125rem', // 18px - Card titles
      display: '1.25rem',  // 20px - Main screen titles
      titleLg: '1.5rem',   // 24px - Brand titles
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.04em',
      wider: '0.08em',
    },
  },

  // 2. Spatial Scale Tokens (Spacing Scale)
  spacing: {
    '3xs': '0.125rem', // 2px
    '2xs': '0.25rem',  // 4px
    xs: '0.375rem',  // 6px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
  },

  // 3. Color Tokens System
  colors: {
    // Official Logo Palette
    brandPrimary: '#1A7B82',      // Deep Clinical Teal
    brandPrimaryDark: '#0F766E',  // Darker Hover Teal
    brandSecondary: '#788A96',    // Platinum Slate Gray
    brandSecondaryDark: '#64748B',// Dark Slate Neutral
    brandAccentLight: '#E6F4F1',  // Mint Ice Accent

    // High Contrast Canvas & Text Surfaces
    canvasBg: '#F8FAFC',          // Clinical White-Slate Canvas
    cardBg: '#FFFFFF',            // Surface Card Background
    cardBgHover: '#FAFDFD',       // Light Teal Tint Hover
    
    textPrimary: '#0F172A',       // Deep Ink Dark
    textSecondary: '#334155',     // Slate Medium
    textMuted: '#64748B',         // Subtle Muted Slate
    textLight: '#94A3B8',         // Caption Muted

    // Quadrant Differentiation Tokens
    deciduousBg: '#FEF3C7',       // Warm Amber Background for Milk Teeth (51-85)
    deciduousBorder: '#F59E0B',   // Warm Amber Border
    deciduousText: '#78350F',     // Dark Amber Text
    
    permanentBg: '#E6F4F1',       // Teal Background for Adult Teeth (11-48)
    permanentBorder: '#1A7B82',   // Teal Border
    permanentText: '#0F766E',     // Dark Teal Text

    // Clinical Condition Diagnostic States (High-Visibility)
    conditions: {
      SANO: { fill: '#FFFFFF', stroke: '#94A3B8', label: 'Sano / Limpio', text: '#334155' },
      CARIES: { fill: '#DC2626', stroke: '#991B1B', label: 'Caries Activa', text: '#FFFFFF' },
      OBTURADO: { fill: '#059669', stroke: '#047857', label: 'Restauración / Obturado', text: '#FFFFFF' },
      SELLANTE: { fill: '#1A7B82', stroke: '#0F766E', label: 'Sellante Preventivo', text: '#FFFFFF' },
      PULPECTOMIA: { fill: '#D97706', stroke: '#B45309', label: 'Pulpectomía / Endodoncia', text: '#FFFFFF' },
      CORONA_ACERO: { fill: '#7C3AED', stroke: '#5B21B6', label: 'Corona Estética / Acero', text: '#FFFFFF' },
      EXTRACCION_INDICADA: { fill: '#E11D48', stroke: '#9F1239', label: 'Extracción Indicada', text: '#FFFFFF' },
      AUSENTE: { fill: '#64748B', stroke: '#475569', label: 'Diente Ausente', text: '#FFFFFF' },
    },
  },

  // 4. Radii & Surface Elevation Tokens
  surfaces: {
    radii: {
      sm: '0.375rem', // 6px
      md: '0.5rem',   // 8px
      lg: '0.75rem',  // 12px
      xl: '1rem',     // 16px
      '2xl': '1.25rem',// 20px
      '3xl': '1.5rem', // 24px
      full: '9999px',
    },
    shadows: {
      card: '0 8px 24px -4px rgba(26, 123, 130, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
      cardHover: '0 16px 36px -6px rgba(26, 123, 130, 0.14), 0 6px 12px -2px rgba(15, 23, 42, 0.05)',
      floatingHeader: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
      activeRing: '0 0 0 2px #1A7B82',
    },
    borders: {
      subtle: '1px solid #E2E8F0',
      strong: '1px solid #CBD5E1',
      brand: '1px solid #1A7B82',
    },
  },
} as const;
