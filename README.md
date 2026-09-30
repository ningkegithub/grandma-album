# 外婆的时光相册

A small static album for comfortable reading. No build step or third-party script dependencies.

## Files

- `photos.js` is the single source for all 836 photo records. The timeline and viewer use the same stable chronological order. Keep uncertain information explicitly uncertain.
- `album.js` provides year navigation, accessible full-size viewing, local-device resume, and opt-in music.
- `album.css` defaults to one generous column on phones, with two columns on wider screens.
- Existing `photos/`, `thumbs/`, and `music/` assets are used unchanged. The unreferenced p837/p838 assets are retained.

## Check

```sh
node --check album.js
node --check photos.js
node tests/album.test.cjs
python -m http.server 8765
```

The Node test exercises data and application behavior using a minimal DOM test double. It is not a browser layout or accessibility audit. Check the live Pages preview on mobile and desktop, including keyboard Tab/Escape, thumbnail failure/retry, repeated navigation, resume after reload, and manual music controls. The cover must be checked with and without saved progress; short viewports and long captions must remain usable.

## Preview and release

GitHub Pages is the review preview: https://ningkegithub.github.io/grandma-album/

Do not publish to Netlify until the owner approves the completed changes. Keep automatic Netlify deployment disabled while reviewing.

Music: Meditation Impromptu 03 by Kevin MacLeod (incompetech.com), CC BY 3.0.

## Saving and phone verification

The save action displays the real original image in a same-page dialog. It deliberately does not use download links, blobs, fetch-to-download, or a new window: WeChat on iPhone can turn download links into an unusable zero-byte file preview. Long-press/right-click saving is controlled by the browser. Never claim a photo has been saved without confirmation from that browser. A real WeChat phone check remains necessary; desktop narrow-window testing is not a substitute.

The viewer has one scrolling photo-and-caption area, a quiet back/count header, and fixed-in-layout previous/next controls. There is one music control in the album header. Keyboard focus outlines are shown after keyboard input rather than persisting after touch.

## Year navigation

The single year toolbar stays at the top while browsing and reflects the year at the top of the visible timeline. Choosing a year jumps immediately, with the heading clear of the sticky toolbar. The full-photo viewer also offers a year selector that opens the first photo of that year. Returning from the viewer restores the exact timeline scroll position; resuming after a fresh load first positions the timeline at the saved photo.

Design references: [Apple's date browsing guide](https://support.apple.com/guide/iphone/find-photos-and-videos-by-date-iph0ea0234e0/ios) and [Google Photos' iPhone guide](https://support.google.com/photos/answer/6220402?co=GENIE.Platform%3DiOS&hl=en-GB). These motivate direct time navigation and date access inside the photo viewer. The native year picker keeps large touch targets without a separate timeline rail or a new floating toolbar.
