# The Endless Internet

> An ARG-style mystery website. The site is, in the formal sense, the public record of a behavioral prediction system that, in the formal sense, was supposed to be secret.

## The site

This is a static HTML/CSS/JS site that simulates a corporate website for a fictional company called **Helix Technologies**. Hidden inside the surface is a multi-thread mystery:

- **BLUE** — official trail (FOIA, press, employment records)
- **YELLOW** — anomalous signals (glitch reports, console logs, dead letters)
- **RED** — Project MIRROR (the system itself, the truth, the after)
- **PURPLE** — Elena Vasquez's personal trail (voice memos, photos, letters)
- **GREEN** — side investigations (forum threads, journalist notes, court filings)

All five threads meet at [`/mirror/truth.html`](mirror/truth.html).

## How to play

Open [`index.html`](index.html) and start clicking. Look for clues (green underlined text on the home page) and follow them. The site tracks your discoveries in localStorage; clear it to start over.

The archive at [`/archive.html`](archive.html) is password-protected. Hint: the password is hidden in plain sight.

## Run locally

```bash
# any static server, e.g.:
python -m http.server 8000
# then open http://localhost:8000/
```

## Files

- `index.html` — homepage, 5 thread entry points
- `archive.html` — encrypted archive (password-gated)
- `mirror/` — the deep end of the red thread
- `helena/` — Elena Vasquez's personal trail
- `signals/` — anomalous corporate signals
- `press/` — FOIA, employment, ethics
- `forum/` — community forum threads
- `employees/` — team pages
- `puzzles/` — the cipher
- `assets/` — stylesheet and discovery engine

## Deploy

- `netlify.toml` + `_redirects` — Netlify-ready
- `robots.txt` — the disallows are, in the formal sense, advisory

## License

The story is fictional. The structure is, in the formal sense, yours.
