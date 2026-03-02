# API Builder UI — Design Theme Alignment

## Goal
Update the apibuilder-ui SvelteKit app to match the visual theme and style of the marketing website at https://www.apibuilder.io

## Marketing Site Theme (extracted)

### Colors
- Primary blue: `#00659a` (links, buttons, nav background, key accents)
- White: `#fff` (backgrounds, button text)
- Dark text: `#333333` (body text)
- Button hover: scale(1.1) transform, color inversion
- Nav background: `#00659a` (solid blue)
- Shadows: `0px 0px 17px -8px #000` on buttons

### Typography
- Font family: **Poppins** (weights: 300, 400, 600, 700) — Google Fonts
- Body: 14px, Poppins
- H1: 4.6875em (65px), weight 300 (light!)
- H3: 1.125em, bold
- H4: 2.25em, weight 800
- Line height: 1.3em

### Buttons
- Fully rounded: `border-radius: 9999px` (pill shape)
- Padding: 16px top/bottom, 35px left/right
- Font weight: 600
- Max-width: 160px
- Transition: all ease-out 0.2s
- Hover: scale(1.1) transform
- `.btn1`: white bg, #00659a text
- `.btn2`: transparent bg, white border, hover inverts
- `.btn3`: white bg, #00659a text, box-shadow; hover inverts to blue bg/white text

### General Style
- Clean, spacious, white backgrounds
- Blue accent color throughout
- Thin line illustrations in blue palette
- Sections with generous padding
- Modern, minimal feel
- No text decoration on links

## Current UI App
- SvelteKit + Tailwind CSS
- Uses Inter font (should switch to Poppins)
- Colors defined in tailwind.config.js (ab-blue: #2b6cb0, ab-dark-blue: #1a365d — these should change to match)
- Has component classes in app.css: btn-primary, btn-secondary, card, etc.
- Components: Header, Footer, OrgSidebar, spec viewers, etc.

## What to Change
1. **Font**: Switch from Inter to Poppins (add Google Fonts import)
2. **Colors**: Update tailwind.config.js colors to match marketing site:
   - Primary: `#00659a` (was #2b6cb0)
   - Dark: `#333333` for text
   - Keep success green and error red
3. **Buttons**: Make pill-shaped (rounded-full), add hover scale, match marketing button styles
4. **Spacing**: More generous padding/margins to match the airy marketing feel
5. **Header/Nav**: Match the marketing site's nav style (blue background, white text)
6. **Cards/Sections**: Clean shadows, match the marketing site's section styling
7. **Overall**: Make the app feel like it belongs with the marketing site — same visual family

## Reference Screenshot
See docs/marketing-site-reference.jpg in the repo
