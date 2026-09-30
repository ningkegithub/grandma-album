# 外婆的时光相册

A static family photo album. No build step or third-party script dependencies.

## Preserve the original design

The owner's chosen visual baseline is original commit `e81aa936dc4bb08edc306bdb3766bcad436dd9f1`: the warm-paper seal cover, three-column square thumbnail overview with compact date/title captions, and pure dark full-screen photo viewer. Do not substitute single-column cards, an editorial cover, or large viewer panels. Thumbnail density and the original photo-viewing experience are intentional.

The original optional swipe, pinch, double-tap zoom, and tap-to-hide-caption gestures are retained. Close, previous/next and the compact year control remain visible. Semantic controls and keyboard focus management are maintained.

## Data and functional repairs

- `photos.js` is the single source for all 836 records; cards and viewer share stable chronological order.
- Keep dates, people, and uncertain information faithful to the source. Do not invent relationships or events.
- Preserve orientation-corrected originals/thumbnails and their cache-busting URL suffixes. The unreferenced p837/p838 assets are retained.
- The grid's small sticky year picker remains reachable on long lists. The viewer's year picker jumps directly to the first photo of the chosen year. Closing the viewer restores list position and focus.
- Music is on demand, never autoplayed. Failed image loads provide retry feedback.

## Saving in WeChat

The save action displays the actual original image in a same-page dark dialog, with an obvious return control. It does not use download links, blobs, fetch-to-download, or a new window: WeChat on iPhone can turn downloads into an unusable zero-byte file preview. The original image retains its native long-press/right-click menu.

Saving is controlled by the browser; do not claim a photo has been saved without confirmation. A real WeChat phone check remains necessary. Narrow desktop browser checks do not substitute for that.

## Checks

```sh
node --check album.js
node --check photos.js
node tests/album.test.cjs
python -m http.server 8765
```

The Node test uses a minimal DOM test double and is not a visual browser audit. Compare live screenshots against the original cover/grid/viewer, then check year jumps, list restoration, keyboard/Escape, optional gestures, failed-image retry, and the inline original-image save path on phone-sized viewports.

## Publication

GitHub Pages is the review preview: https://ningkegithub.github.io/grandma-album/

Do not publish to Netlify until the owner explicitly approves. Keep Netlify automatic deployment disabled during review.

Music: Meditation Impromptu 03 by Kevin MacLeod (incompetech.com), CC BY 3.0.
