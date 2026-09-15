# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |
| < 1.0   | ❌        |

## Reporting a vulnerability

Please use [GitHub private security reporting](https://github.com/ikoobee/ailabel/security/advisories)
if it is available on this repository — that is the fastest and most private
channel. Alternatively, email **ikoobee@outlook.com** with details and a
reproduction if applicable.

Please do **not** open a public issue for security problems.

What to include:

- Description of the issue and its impact
- Steps or PoC to reproduce
- Affected file(s) / code path if you know them

You should receive a response within 7 days. We ask that you give us up to
90 days to address the issue before public disclosure.

## Scope notes

This project is a fully client-side static site: it sends no data anywhere by
default. Security-relevant areas include the byte-level metadata injection
(`js/metadata.js`), file handling (`js/engine.js`), and the analytics shim
(`js/analytics.js`, disabled by default).
