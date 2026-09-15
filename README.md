# ailabel

**English** | [简体中文](README.zh-CN.md)

Label AI-generated images both ways at once: a **visible badge** on the picture and the **standard XMP metadata** (IPTC `DigitalSourceType = trainedAlgorithmicMedia`) inside the file bytes. 100% in-browser; nothing is uploaded.

[![CI](https://github.com/ikoobee/ailabel/actions/workflows/ci.yml/badge.svg)](https://github.com/ikoobee/ailabel/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)

![ailabel](assets/og-cover.png)

## Why

Regulators and platforms increasingly expect AI-generated media to carry both a human-visible mark and machine-readable provenance. ailabel does the two tracks in one pass:

- **Standards-based implicit label** — writes `Iptc4xmpExt:DigitalSourceType = .../trainedAlgorithmicMedia` plus `xmp:CreatorTool` via native PNG iTXt / JPEG APP1 byte injection. No libraries, no re-encoding loss beyond the label render, readable by mainstream toolchains (ExifTool, IPTC validators).
- **Clean output metadata** — the visible label render re-encodes the image, which strips original EXIF including GPS; the only metadata in the output is what you chose to write.
- **Idempotent injection** — files that already carry the XMP are skipped (`reason: 'exists'`), never double-written; verified by 19 regression tests.
- **Live preview + presets** — one-click label texts ("AI Generated" etc. or custom), position/size/opacity/stroke controls with live preview, tile mode for crop-resistance, batch up to 20 images.
- **Zero dependencies, zero build** — native ES Modules + Canvas; deployable as static files anywhere. No account, no upload, no telemetry.

## How it works

```
decode → applyWatermark (visible badge) → toBlob
      → byte-level XMP injection (implicit label) → output
```

`js/engine.js` renders the visible badge (defaults tuned for labeling: bottom-right, 4% font, 90% opacity, white-with-stroke). `js/metadata.js` then injects the XMP packet into the output bytes — pure functions, fully Node-testable.

## Quick Start

```bash
git clone https://github.com/ikoobee/ailabel.git
cd ailabel
npx --yes serve .          # any static file server works
# open http://localhost:3000 — drop an image (or click "try a sample"), Generate
```

Run the metadata regression tests (Node 18+):

```bash
npm test
```

## Use it programmatically

```js
import { buildAiXmp, injectAiMetadata } from './js/metadata.js';

const xmp = buildAiXmp({ tool: 'my-app' });
const res = injectAiMetadata(pngOrJpegBytes, 'image/png', xmp);
// res.injected === true, or reason: 'exists' | 'unsupported' | 'not-png'
```

## Self-hosting

Replace `your-domain.example` in `index.html`, `robots.txt`, `sitemap.xml` and `blog/zh/ai-image-label-guide.html` with your domain, then drop the folder on any static host. Analytics ship disabled (`provider: 'none'` in `js/analytics.js`).

## Scope & limits (stated honestly)

- **Not legal advice.** This is a technical aid for labeling; whether it satisfies a specific regulation (e.g. China's AI content labeling rules, the EU AI Act transparency obligations) depends on your context.
- **WebP**: the metadata label is currently skipped for WebP outputs (the visible badge still applies); the UI says so.
- **No label removal.** ailabel only adds labels; it deliberately provides no removal capability.
- C2PA/Content Credentials signing is not included.

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). By contributing you agree your contributions are licensed under the project's MIT license (inbound = outbound).

## License

[MIT](LICENSE) © Ethan (ikoobee)
