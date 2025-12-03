# Logo Setup Instructions

## Step 1: Save Your Logo Image

1. Save your coffee cup logo image to the `public/` folder
2. Name it `logo.png` (or convert to PNG if it's in another format)
3. Recommended sizes:
   - **Main logo**: 512x512px or larger (square, transparent background preferred)
   - **Favicon**: 32x32px or 64x64px (will be auto-generated from main logo)

## Step 2: Image Format Requirements

- **Format**: PNG (preferred) or SVG
- **Background**: Transparent or black (matches your design)
- **Dimensions**: Square aspect ratio works best (1:1)
- **File size**: Keep under 500KB for optimal performance

## Step 3: Optional - Create Favicon

If you want a separate favicon, you can also save:
- `public/favicon.ico` - Traditional favicon (16x16, 32x32, or 48x48px)

The current setup will use `/logo.png` for favicons if `favicon.ico` doesn't exist.

## Step 4: Verify

After saving the logo:
1. Run `npm run dev`
2. Check the header - logo should appear next to "SipLocal" text
3. Check browser tab - favicon should appear
4. Test on mobile - logo should scale properly

## Current Implementation

The logo is now integrated in:
- ✅ Header component (next to "SipLocal" text)
- ✅ Browser favicon
- ✅ Apple touch icon (for iOS home screen)
- ✅ Open Graph image (for social media sharing)
- ✅ Twitter card image

## File Location

```
public/
  └── logo.png  ← Save your logo here
```

## Notes

- The logo will automatically be optimized by Next.js Image component
- The logo scales responsively (smaller on mobile, larger on desktop)
- If the logo doesn't appear, check:
  1. File is named exactly `logo.png` (case-sensitive)
  2. File is in the `public/` folder (not `src/` or elsewhere)
  3. Browser cache - try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

