# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-15

Initial public release.

### Added

- Dual-track AI labeling in one pass: visible badge (position/size/opacity/
  stroke, corner or tile modes) + implicit XMP metadata.
- Byte-level metadata injection (`js/metadata.js`): IPTC
  `DigitalSourceType = trainedAlgorithmicMedia` + `xmp:CreatorTool` via
  native PNG iTXt / JPEG APP1, idempotent (skip on existing XMP).
- 19 regression tests for the XMP packet, injection positions, CRC32 and
  idempotency (`tools/test-metadata.mjs`).
- Live preview of the visible label, label text presets, procedurally drawn
  AI-style sample image, batch processing up to 20 images.
- Bilingual UI (zh-CN / en) with language persistence.
- Zero dependencies, zero build — native ES Modules, deployable as static
  files anywhere.

### Known limits

- WebP outputs skip the metadata label (visible badge still applies).
- No C2PA/Content Credentials signing.
- The tool is a labeling aid, not legal advice.
