# Mobile Experience Guide

This document outlines mobile optimization strategies and touch gesture support in PMP Study Pro.

## Mobile-First Design

### Responsive Breakpoints
- **Mobile:** < 640px (max-width: sm)
- **Tablet:** 640px - 1024px (md)
- **Desktop:** > 1024px (lg)

### Implementation
All components use TailwindCSS responsive utilities:
```html
<div class="px-4 sm:px-6 lg:px-8">
  <!-- Padding: 16px on mobile, 24px on tablet, 32px on desktop -->
</div>
```

## Touch Gestures

### Implemented Gestures

#### 1. Navigation Swipe
- **Mobile Menu:** Swipe left to close, swipe right to open
- **Threshold:** 50px horizontal movement
- **Implemented in:** `Navbar.svelte`

#### 2. Flashcard Swipe
- **Swipe Left:** Rate as "Good" (or move to next card)
- **Swipe Right:** Rate as "Easy" (or move to previous card)
- **Threshold:** 50px horizontal movement
- **Implemented in:** `FlashcardRatingButtons.svelte`

#### 3. Card Flip
- **Tap:** Flip card (already exists)
- **Space/Enter:** Keyboard alternative

### Technical Implementation

```typescript
let touchStartX = $state(0);
let touchEndX = $state(0);

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (diff > swipeThreshold) {
    // Swipe left action
  } else if (diff < -swipeThreshold) {
    // Swipe right action
  }
}
```

## Touch-Friendly UI

### Button Sizing
- **Minimum size:** 44x44px (recommended by iOS HIG)
- **Spacing:** At least 8px between buttons
- **Implementation:**
```css
button {
  min-height: 44px;
  min-width: 44px;
  /* Prevent double-tap zoom */
  touch-action: manipulation;
}
```

### Interactive Element Sizing
```css
a, button, [role="button"] {
  /* Ensure clickable area is at least 44x44px */
  min-height: 44px;
  min-width: 44px;
  padding: 0.5rem 1rem;
}
```

## Mobile Navigation

### Optimizations Implemented
- [x] Hamburger menu for small screens
- [x] Touch-friendly navigation buttons
- [x] Swipe gesture to open/close menu
- [x] Language toggle in mobile menu
- [x] Smooth animations (respects prefers-reduced-motion)

### Mobile Menu Structure
```
Mobile Menu (< 768px)
├── Dashboard
├── Study
├── Flashcards
├── Practice
├── Exams
├── Formulas
└── Language (en/es)
```

## Keyboard Navigation

### Supported Shortcuts
- **Space/Enter:** Flip flashcard
- **1-4:** Rate flashcard (Again, Hard, Good, Easy)
- **?:** Show shortcuts (implement modal if needed)
- **Tab:** Navigate between elements
- **Shift+Tab:** Reverse navigation

### Focus Management
- Clear focus indicators (2px primary outline)
- Logical tab order (left-to-right, top-to-bottom)
- Skip to main content link (hidden, shows on focus)

## Performance on Mobile

### Metrics
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

### Optimizations
- [x] Lazy loading images (`loading="lazy"`)
- [x] Code splitting by route
- [x] Service worker caching
- [x] Responsive images (if added)
- [x] Minified CSS and JavaScript

## Network Optimization

### Adaptive Strategy
```typescript
// Check network speed
if ('connection' in navigator) {
  const connection = (navigator as any).connection;
  if (connection.effectiveType === '4g') {
    // Load high-quality assets
  } else {
    // Use compressed assets
  }
}
```

## Battery Considerations

### Battery-Aware Optimizations
- Respect `prefers-reduced-motion` (reduces animations)
- Limit continuous animations
- Use efficient CSS animations (transform, opacity)
- Avoid forced layouts and reflows

## Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

This ensures:
- Device width = viewport width (no horizontal scrolling)
- Initial zoom level = 1x (not zoomed in)
- User can zoom (accessibility requirement)

## Testing on Mobile

### Real Devices
1. iPhone SE / 12 / 13 (various iOS versions)
2. Samsung Galaxy A / S series (various Android versions)
3. Tablet (iPad, Samsung Tab)

### Emulation
- Chrome DevTools Device Emulation
- Firefox Responsive Design Mode
- Safari Web Inspector (iOS Safari)

### Test Cases
- [ ] All pages load correctly on small screens
- [ ] Navigation works without horizontal scrolling
- [ ] Touch targets are easily tappable (44x44px)
- [ ] Forms are usable on small screens
- [ ] Keyboard shortcuts work
- [ ] Gestures respond correctly
- [ ] Images display correctly
- [ ] Text is readable without pinch-zoom
- [ ] No horizontal scrolling

## Common Mobile Issues

### Issue: Double-Tap Zoom Delay
**Solution:** Use `touch-action: manipulation`
```css
button, a {
  touch-action: manipulation;
}
```

### Issue: Form Input Zoom on iPhone
**Solution:** Use font-size >= 16px
```css
input {
  font-size: 16px; /* Prevents iOS zoom on focus */
}
```

### Issue: Sticky Elements Blocking Content
**Solution:** Reserve space or adjust positioning
```css
.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  /* Other styles */
}
```

### Issue: Fixed Keyboard on Mobile
**Solution:** Use viewport-fit meta tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## Progressive Enhancement

### Core Functionality
Works on all browsers:
- Navigation
- Flashcard viewing
- Quiz taking
- Progress tracking

### Enhanced Features (with JS)
- Touch gestures
- Keyboard shortcuts
- Smooth animations
- Dark mode toggle

### Graceful Degradation
- No JavaScript? Navigation still works
- No CSS? Content is readable
- No images? Fallback text provided

## Accessibility on Mobile

### Touch & Mouse
- All interactions work with both
- No hover-only states
- Focus indicators visible

### Screen Readers
- Semantic HTML
- ARIA labels
- Proper heading hierarchy

### Keyboard Navigation
- Full keyboard support
- Visible focus indicators
- Logical tab order

## Future Enhancements

### Potential Features
- [ ] Offline PWA notifications
- [ ] Haptic feedback (vibration) on interactions
- [ ] Accelerometer for card flip (shake to flip)
- [ ] Geolocation-based features
- [ ] Camera for flashcard scanning
- [ ] Voice commands

### Progressive Web App
- [x] Installable to home screen
- [x] Works offline
- [x] Responsive design
- [ ] App shortcuts
- [ ] Share functionality

## Monitoring Mobile Usage

### Metrics to Track
- Mobile vs. desktop traffic
- Device/OS breakdown
- Touch gesture usage
- Mobile page speed
- Mobile errors/crashes

### Tools
- Google Analytics 4
- Sentry (error tracking)
- Web Vitals
- User feedback

## Resources

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/)
- [Material Design](https://material.io/design/)
- [Web.dev Mobile Guide](https://web.dev/mobile/)
