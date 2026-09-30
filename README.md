# Dom Min Blog

Dom Min's portfolio site. Plain HTML and CSS, no build step. Open any page through a local server (not by double clicking the file), because the map and Notion embeds refuse to load from `file://`:

```
python3 serve.py
```

then visit http://localhost:8000. (`serve.py` works like GitHub Pages, so clean links such as `/work` open `work.html`.)

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Environmental | `environmental.html` |
| Social | `social.html` |
| School | `school.html` |
| Work & volunteering | `work.html` |
| Brew logs | `brew-logs.html` |
| Contact | `contact.html` |

Shared styles live in `styles.css`. Scripts: `nav.js` (nav underline and page transition), `cover.js` (home slideshow), `peek.js` (home section previews), `reveal.js` (entrance animation).

The pages link these as `styles.css?v=2`, `nav.js?v=2`, and so on. After changing a CSS or JS file, bump the number in every page so visitors don't keep a cached old copy.

## Editing

- **Text:** edit the copy directly in each page's HTML.
- **Home slideshow:** photos are the `<img class="cover-img">` tags in `index.html`. Portraits live in `images/portraits/`.
- **Home section bands:** each pillar's photo, line and numbers are in the `<article class="spread">` blocks in `index.html`. The hover previews on the map are built from these automatically.
- **Photos:** use web-sized JPGs (about 1600px on the long side), not HEIC.
