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

The Node test exercises data and application behavior using a minimal DOM test double. It is not a browser layout or accessibility audit. Check the live Pages preview on mobile and desktop, including keyboard Tab/Escape, thumbnail failure/retry, repeated navigation, zoom, resume after reload, and manual music controls.

## Preview and release

GitHub Pages is the review preview: https://ningkegithub.github.io/grandma-album/

Do not publish to Netlify until the owner approves the completed changes. Keep automatic Netlify deployment disabled while reviewing.

Music: Meditation Impromptu 03 by Kevin MacLeod (incompetech.com), CC BY 3.0.
