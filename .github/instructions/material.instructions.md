---
description: 'Angular design and CSS instructions'
applyTo: '**'
---

# CSS Instructions for Angular Material Azure/Blue Theme

## Project Context

This Angular application uses Angular Material with an Azure/Blue color theme. All CSS suggestions should align with this design system and maintain consistency across the application.

## Color Palette Guidelines

### Primary Colors

- **Primary Blue**: `#0078d4` (Azure Blue)
- **Primary Light**: `#40e0ff`
- **Primary Dark**: `#005a9e`
- **Primary Text**: `#ffffff`

### Secondary Colors

- **Secondary**: `#6c757d` (Neutral Gray)
- **Secondary Light**: `#9ca3af`
- **Secondary Dark**: `#495057`

### Surface & Background

- **Surface**: `#ffffff`
- **Background**: `#f5f5f5`
- **Card Background**: `#ffffff`
- **Elevated Surface**: `#ffffff` with `box-shadow: 0 2px 4px rgba(0,120,212,0.1)`

### Text Colors

- **Primary Text**: `#212529`
- **Secondary Text**: `#6c757d`
- **Disabled Text**: `#adb5bd`
- **Text on Primary**: `#ffffff`

## Material Design Principles

### Spacing

- Use Angular Material's standard spacing scale: 4px, 8px, 16px, 24px, 32px, 48px
- Apply consistent margin/padding using multiples of 8px
- Component spacing should follow Material Design's 8dp grid system

### Typography

- Use Angular Material typography classes: `mat-display-*`, `mat-headline-*`, `mat-title-*`, `mat-body-*`
- Maintain consistent font weights and line heights
- Default font family: Roboto, sans-serif

### Elevation & Shadows

- Use Material Design elevation levels (0dp, 1dp, 2dp, 4dp, 6dp, 8dp, 12dp, 16dp, 24dp)
- Azure theme shadows: `box-shadow: 0 Xpx Ypx rgba(0,120,212,0.Z)`
- Cards: 2dp elevation
- FAB: 6dp elevation
- Dialogs: 24dp elevation

## Component Styling Guidelines

### Buttons

```css
/* Primary button style */
.mat-mdc-raised-button.mat-primary {
  background-color: #0078d4;
  color: #ffffff;
}

/* Button hover states */
.mat-mdc-raised-button.mat-primary:hover {
  background-color: #005a9e;
}
```

### Cards

- Always use `mat-card` with consistent padding
- Apply subtle shadows for elevation
- Maintain 16px internal padding
- Use `border-radius: 8px` for modern look

### Forms

- Use Angular Material form fields with outline appearance
- Focus states should use primary blue color
- Error states use Material Design error color (`#d32f2f`)
- Validation messages in secondary text color

### Navigation

- Toolbar background: Primary blue (`#0078d4`)
- Sidenav: White background with subtle shadows
- Active navigation items: Light blue background (`rgba(0,120,212,0.1)`)

## Layout Guidelines

### Container Widths

- Max content width: `1200px`
- Sidebar width: `280px`
- Mobile breakpoints follow Material Design standards

### Responsive Design

```css
/* Mobile first approach */
@media (min-width: 600px) {
  /* sm */
}
@media (min-width: 960px) {
  /* md */
}
@media (min-width: 1280px) {
  /* lg */
}
@media (min-width: 1920px) {
  /* xl */
}
```

## Custom CSS Classes

### Utility Classes

```css
.azure-primary {
  color: #0078d4;
}
.azure-bg {
  background-color: #0078d4;
}
.text-muted {
  color: #6c757d;
}
.surface-elevated {
  box-shadow: 0 2px 4px rgba(0, 120, 212, 0.1);
}
.border-radius-md {
  border-radius: 8px;
}
```

### Component Modifiers

- Use BEM methodology for custom components
- Prefix custom classes with `app-` to avoid conflicts
- Keep specificity low, leverage CSS custom properties

## Animation Guidelines

- Use Angular Animations API for complex animations
- Transition duration: 200ms-300ms for most interactions
- Easing: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design standard)
- Hover transitions: 150ms ease-in-out

## Accessibility Requirements

- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Focus indicators must be visible and use primary blue
- Interactive elements minimum 44px touch target
- Use semantic HTML and ARIA labels appropriately

## File Organization

- Global styles in `src/styles.scss`
- Component-specific styles in component `.scss` files
- Theme customization in `src/theme.scss`
- Utility classes in `src/app/shared/styles/_utilities.scss`

## Performance Considerations

- Use Angular Material's theming system instead of custom CSS where possible
- Minimize CSS bundle size by avoiding unused Material modules
- Use CSS custom properties for dynamic theming
- Leverage Angular's OnPush change detection for style-heavy components

## Code Generation Preferences

When generating CSS:

1. Always use SCSS syntax with proper nesting
2. Include hover and focus states for interactive elements
3. Apply the azure/blue color scheme consistently
4. Use Angular Material mixins and functions when available
5. Follow the spacing and typography guidelines above
6. Include responsive design considerations
7. Add appropriate comments for complex styles
