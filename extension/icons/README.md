# Extension Icons

Generate PNG icons from icon.svg:

```bash
# Using Inkscape (if installed):
inkscape icon.svg -w 16 -h 16 -o icon16.png
inkscape icon.svg -w 48 -h 48 -o icon48.png
inkscape icon.svg -w 128 -h 128 -o icon128.png

# Using ImageMagick:
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png

# Using the frontend sharp script:
cd ../../frontend && node scripts/generate-icons.mjs
# Then copy the generated icons here
```

Required files:
- icon16.png  (16×16)
- icon48.png  (48×48)
- icon128.png (128×128)
