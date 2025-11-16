# Contributing to Samadhaan

Thanks for your interest in improving Samadhaan! This guide explains how to propose changes, report bugs, and submit pull requests in a way that keeps the project healthy and easy to maintain.

## 🧭 How to contribute

1. **Discuss first (recommended)**
   - Open an issue for new features or large refactors.
   - Label the issue (bug, enhancement, docs, etc.) so maintainers can triage it quickly.
2. **Fork & clone**
   ```bash
   git clone https://github.com/Devendraxp/samadhaan.git
   cd samadhaan
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feat/short-description
   ```
4. **Keep environments in sync**
   - Duplicate `.env.sample` into `.env` inside `server/` (and `client/` if needed) and fill in secrets.
   - When calling backend APIs from browsers or tools that rely on cookies, append `?source=web` so authentication works as expected.
5. **Install dependencies & run locally**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
6. **Add or update tests** relevant to your changes. The repo currently contains simple service-level tests under `server/src/tests`; add more coverage whenever you change behavior.
7. **Lint / format**
   - Use the project’s configured linters/formatters (ESLint, Prettier, Tailwind conventions).
   - Avoid unrelated formatting churn in pull requests.
8. **Commit with context**
   - Follow conventional, descriptive commit messages (`feat: add complaint filters`, `fix: guard anonymous names`).
   - Smaller, focused commits are preferred over giant “everything” commits.
9. **Open a pull request**
   - Include a summary of changes, screenshots (for UI), and testing notes.
   - Link the related issue using GitHub keywords (`Fixes #123`).

## ✅ Pull request checklist

- [ ] Code builds locally for both `client/` and `server/`.
- [ ] New environment variables are documented in `.env.sample`.
- [ ] Added/updated tests cover the change.
- [ ] No secrets or personal data checked in.
- [ ] API docs (Swagger) updated if routes or payloads changed.

## 🐞 Reporting issues

When filing a bug report, please include:
- Steps to reproduce (with curl/HTTP samples if relevant).
- Expected vs. actual behavior.
- Screenshots or logs where possible.
- Environment info (OS, browser, Node version, etc.).

## 🤝 Code of conduct

Be respectful, constructive, and inclusive. Harassment, discrimination, and hostile behavior are not tolerated. If you witness or experience an issue, please reach out to the maintainers privately.

Happy contributing! 🙌
