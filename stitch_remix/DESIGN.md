---
name: Jade Serenity & Local Heritage
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#3d4a41'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#6d7a70'
  outline-variant: '#bccabe'
  surface-tint: '#006d43'
  primary: '#006d43'
  on-primary: '#ffffff'
  primary-container: '#00a86b'
  on-primary-container: '#00331d'
  inverse-primary: '#59de9b'
  secondary: '#006c45'
  on-secondary: '#ffffff'
  secondary-container: '#50ffb0'
  on-secondary-container: '#007349'
  tertiary: '#545f73'
  on-tertiary: '#ffffff'
  tertiary-container: '#8893a9'
  on-tertiary-container: '#212c3e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#78fbb6'
  primary-fixed-dim: '#59de9b'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#50ffb0'
  secondary-fixed-dim: '#1fe296'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005233'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system for this real estate platform balances the tranquility of "Jade Serenity" with the structural legacy of "Local Heritage." It is designed to evoke a sense of permanence, prosperity, and cultural belonging for the Cebuano market.

The visual style is **Sophisticated Minimalism with Heritage Accents**. It utilizes expansive white space and high-quality architectural photography, grounded by a subtle, low-opacity background texture. This texture features delicate, Chinese-style brush strokes depicting *Bahay na Bato* structures—a nod to the syncretic history of Filipino-Chinese architecture. The interface must feel professional and reliable, yet deeply rooted in the local landscape.

## Colors
The palette is built on the dual nature of Jade. In **Light Mode**, the primary Jade (#00A86B) acts as a symbol of growth and serenity, set against crisp white and light gray backgrounds to maintain a feeling of airiness. Text is rendered in charcoal for high legibility without the harshness of pure black.

In **Dark Mode**, the system shifts to an "Obsidian & Neon" aesthetic. The background becomes a deep slate/obsidian, while the Jade transitions into a vibrant Neon-Jade/Mint (#50FFB0) for critical actions and accents. This provides a high-contrast, modern technical feel suitable for late-night browsing and luxury showcases.

## Typography
The typography is professional, modern, and highly legible. 

**Manrope** is used for headlines to provide a refined, geometric structure that feels contemporary. **Hanken Grotesk** serves as the primary body face, offering a sharp yet approachable reading experience for property descriptions and data. For technical details, price tags, and utility labels, **JetBrains Mono** is employed to introduce a precise, "architectural" quality to the data.

Across all levels, maintain generous line heights to preserve the "Serenity" aspect of the brand narrative.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy emphasizes vertical rhythm based on an 8px square grid.

Content should feel uncrowded. Large property hero sections should utilize the full container width, while text-heavy editorial content should be constrained to a 8-column center-aligned track to improve readability. Use dynamic padding (64px to 128px) between major sections to allow the heritage background pattern to breathe and become visible in the negative space.

## Elevation & Depth
Depth in this design system is achieved through **Tonal Layers** and **Subtle Glassmorphism**. 

Instead of heavy drop shadows, use thin, 1px borders in a slightly darker or lighter shade than the surface color to define boundaries. For floating elements like navigation bars or property filters, apply a high-diffusion backdrop blur (20px) with a semi-transparent surface (80% opacity). This creates a "Frosted Jade" effect that feels premium and light. In Dark Mode, elevation is communicated by lightening the slate background color of the elevated element rather than adding shadows.

## Shapes
The shape language is **Soft (0.25rem / 4px)**. This choice mirrors the sturdy, straight lines of traditional Filipino architecture while softening the corners just enough to feel modern and digital-first. 

Buttons and input fields should follow this consistent 4px radius. Large cards (Property Cards) may use a `rounded-lg` (8px) setting to create a distinct container feel. Circular shapes are reserved exclusively for avatars and floating action buttons to provide a clear functional contrast against the structural UI.

## Components
### Buttons
Primary buttons use the Jade fill with white text (Light) or Mint fill with Obsidian text (Dark). Use a subtle 2px bottom "press" effect rather than a shadow to give a tactile, grounded feel.

### Input Fields
Inputs are clean with a 1px charcoal border in light mode. On focus, the border transitions to Jade with a soft 2px outer glow in the same color. Labels use the JetBrains Mono font for a professional, form-entry aesthetic.

### Cards
Property cards are the centerpiece. They feature a full-bleed image at the top, a 4px corner radius, and a very light gray border. Information is organized using a strict grid: Price in Manrope Bold, Location in Hanken Grotesk, and Specs (sqm, beds) in JetBrains Mono.

### Heritage Background Pattern
The *Bahay na Bato* brush pattern must be implemented as a fixed or slow-parallax background element. Set its opacity to 3% in Light Mode and 5% in Dark Mode. It should never compete with content, only appearing in the widest margins and largest whitespace gaps.