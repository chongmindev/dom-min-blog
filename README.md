# Dom Min Blog

Dom Min's portfolio site. Plain HTML and CSS, no build step. Open any page through a local server (not by double clicking the file), because the map and Notion embeds refuse to load from `file://`:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Environmental | `environmental.html` |
| Social | `social.html` |
| School | `school.html` |
| Brew logs | `brew-logs.html` |
| Contact | `contact.html` |

Shared styles live in `styles.css`. Scripts: `nav.js` (nav underline and page transition), `cover.js` (home slideshow), `peek.js` (home section previews), `reveal.js` (entrance animation).

## Editing

- **Text:** placeholders are in square brackets, like `[Add 1-2 sentences about Spread:Seed.]`. Search for `[` and replace them.
- **Home slideshow:** photos are the `<img class="cover-img">` tags in `index.html`. Put portraits in `images/portraits/` and point the tags at them. The first four after the portrait are stand-ins.
- **Home section bands:** each pillar's photo, line and numbers are in the `<article class="spread">` blocks in `index.html`. The hover previews on the map are built from these automatically.
- **Photos:** use web-sized JPGs (about 1600px on the long side), not HEIC.

## To do before sharing

- Replace the stand-in cover photos (the first one is not Dom).
- Fill in the bracketed placeholder copy.
- Add Spread:Seed photos (the Environmental band shows "Photos coming soon").
