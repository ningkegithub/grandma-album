# 外婆的时光相册

A static family photo album. No build step or third-party script dependencies.

## Preserve the original design

The owner's chosen visual baseline is original commit `e81aa936dc4bb08edc306bdb3766bcad436dd9f1`: the warm-paper seal cover, three-column square thumbnail overview with compact date/title captions, and pure dark full-screen photo viewer. Do not substitute single-column cards, an editorial cover, or large viewer panels. Thumbnail density and the original photo-viewing experience are intentional.

Short taps toggle caption visibility without resizing the photo; a clear horizontal swipe can change photos. Stationary long presses, vertical movement and pinch zoom remain browser-owned. Custom pointer capture starts only after horizontal movement, never on initial press. Holds of450ms or longer and context menus do not become caption taps. Close, previous/next and the compact year control remain visible, with semantic labels and keyboard focus.

## Data and functional repairs

- `photos.js` is the single source for all 836 records; cards and viewer share stable chronological order.
- Keep dates, people, and uncertain information faithful to the source. Do not invent relationships or events.
- Preserve orientation-corrected originals/thumbnails and their cache-busting URL suffixes. The unreferenced p837/p838 assets are retained.
- The grid's small sticky year picker remains reachable on long lists. The viewer's year picker jumps directly to the first photo of the chosen year. Closing the viewer restores list position and focus.
- Music is on demand, never autoplayed. Failed image loads provide retry feedback.

## Saving in WeChat

The main viewer already displays the full original. The save button shows an inline long-press hint in the existing caption slot; it does not open another dialog, navigate, or replace the image. “知道了” dismisses that hint. Caption and hint share the same reserved grid cell, so showing/hiding either must not move the photo.

No download links, blobs, fetch-to-download or new windows are used. The image element keeps intrinsic-ratio dimensions and native touch callout. Context menus are not cancelled, and post-long-press synthetic clicks do not trigger custom tap behavior. If saving is unavailable in WeChat, the inline hint suggests trying the phone browser. Actual WeChat behavior still requires a real-phone check; a desktop right-click test is not a substitute.

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

## Keep controls off the photograph

The dark viewer now reserves a compact top row for year/save/close and a bottom row for previous/count/next. The image fits its own stage at its natural aspect ratio; the caption is a separate dark row. Do not return to floating controls over the image. Check control/image rectangle intersections on both portrait and landscape photos at narrow, short phone-sized viewports. The main image retains intrinsic-ratio sizing and native long-press behavior.
