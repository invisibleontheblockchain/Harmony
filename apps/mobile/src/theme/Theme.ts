export const Theme = {
  colors: {
    // Background Layers
    bgPrimary: '#121212',      // Deepest background base layer
    bgSecondary: '#2A2A3A',    // Elevated card surfaces, inputs, sidebars
    bgTertiary: '#3A3A52',     // Dropdowns, modal panels, active highlights
    bgHover: '#333346',        // Interactive hover states

    // Accent Gradient Colors
    accentPurple: '#7B5CFF',   // Signature violet (brand core)
    accentPink: '#FF5CD6',     // Neon pink accent (highlights / logo gradient)
    accentBlue: '#3A8BFF',     // Muted secondary blue (links / info states)
    accentCyan: '#00E5FF',     // Electric cyan accent (indicators / glows)
    accentGlow: 'rgba(123, 92, 255, 0.35)', // Accent drop shadow overlay glow

    // Text Colors
    textPrimary: '#F2F2F7',    // Off-white for clean readability
    textSecondary: '#A1A1AA',  // Medium gray metadata, labels, captions
    textTertiary: '#52525B',   // Dark gray placeholders, disabled controls
    textInverse: '#121212',    // Inverse text for use on light/accent buttons

    // Semantic Statuses
    success: '#10B981',        // Success messages, positive balance sheets
    warning: '#F59E0B',        // Warnings, pending payouts
    error: '#EF4444',          // Errors, deletions, invalid states
    info: '#3B82F6',           // Informational prompts

    // Borders & Inlines
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderDefault: 'rgba(255, 255, 255, 0.16)',
    borderAccent: 'rgba(123, 92, 255, 0.5)',
  },

  fonts: {
    // Space Grotesk Google Font Weight Tokens
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },

  fontSizes: {
    xs: 11,     // Micro texts, timestamps, badge labels
    sm: 13,     // Captions, list descriptions, secondary details
    base: 15,   // Standard body texts, paragraph copies
    md: 17,     // Card labels, secondary page section headers
    lg: 20,     // Primary page section sub-headers
    xl: 24,     // Page header titles
    xxl: 32,    // Hero headlines, full-screen player tracks
    xxxl: 48,   // Large landing displays
  },

  spacing: {
    space1: 4,
    space2: 8,
    space3: 12,
    space4: 16,  // Base standard padding
    space5: 20,
    space6: 24,  // Standard layout margin
    space8: 32,
    space10: 40,
    space12: 48,
  },

  radius: {
    sm: 6,       // Small chips, tags, badge shapes
    md: 10,      // Buttons, input fields, standard card containers
    lg: 16,      // Modals, large surface panels
    xl: 24,      // Bottom sheet surfaces
    full: 9999,  // Pill shapes, avatar layouts
  },

  animations: {
    fast: 120,    // Simple hover/interactive response timings (ms)
    base: 200,    // Basic screen/panel transit timings (ms)
    slow: 350,    // Transitions for panels and side draws (ms)
    spring: {
      tension: 180,
      friction: 12,
    }
  }
};
