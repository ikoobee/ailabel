# Contributing to ailabel

Thanks for your interest in improving ailabel!

## Getting started

Requirements: Node 18+ (for tests only — the site itself has zero dependencies).

```bash
git clone https://github.com/ikoobee/ailabel.git
cd ailabel
npx --yes serve .      # local preview, any static server works
npm test               # metadata regression tests must pass before every commit
```

## Ground rules

- **Keep it zero-dependency, zero-build.** The site runs as plain static
  files with native ES Modules — no bundler, no runtime libraries. The
  metadata writer (`js/metadata.js`) and the render engine (`js/engine.js`)
  are pure functions and must stay Node-testable.
- **Byte-level changes need tests.** If you touch the XMP packet or the
  PNG/JPEG injection, add or update cases in `tools/test-metadata.mjs`;
  verify with `exiftool -XMP:all` on real outputs when in doubt.
- **Labeling only, no removal.** The project deliberately provides no
  label-removal capability — please don't propose one.
- **Language:** code, comments, commits, issues and PRs in English. The UI
  ships bilingual (zh-CN / en) — add new strings to both dictionaries in
  `js/i18n.js`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Pull requests

1. Fork / branch from `main`.
2. Make your change; `npm test` green.
3. Open a PR against `main` describing what changed and why, with test
   evidence for metadata behavior changes.

## License

By contributing, you agree that your contributions will be licensed under the
MIT License that covers this project — **inbound = outbound**.
