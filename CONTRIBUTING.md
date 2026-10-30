# Contributing to the ASTra website

Thanks for helping. This repository is the website for [ASTra](https://github.com/Attentionform/astra), live at [attentionform.com](https://attentionform.com). It is a static site built with Astro, React islands for the demos, and Tailwind 4. The ASTra engine, command-line tool and MCP server live in the [ASTra repository](https://github.com/Attentionform/astra); changes to those go there, with their own [contributing guide](https://github.com/Attentionform/astra/blob/main/CONTRIBUTING.md).

Please follow the [Code of Conduct](https://github.com/Attentionform/astra/blob/main/CODE_OF_CONDUCT.md).

## What helps most

- Fixing a wrong, unclear or out-of-date sentence in the docs pages.
- Fixing a broken link, a layout problem on a phone, or an accessibility problem (contrast, keyboard use, missing labels).
- Small improvements to speed or to the page markup.

For anything bigger, such as a new page, a new section or a redesign, **open an issue first** so we can agree on it before you spend the time.

## What we do not accept

- Changes to the logos, the brand files or the ASTra and Attentionform names. They are not covered by the license (see [License](#license)).
- Numbers, versions, tool names or command lines typed straight into a page. See the facts rule below.
- New heavy dependencies for something a few lines of code can do.

## Set up

You need Node.js 22.23.4 or newer (what Astro 7 asks for).

```bash
git clone https://github.com/Attentionform/astra-website.git
cd astra-website
npm ci
npm run dev        # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with live reload |
| `npm run check` | Type-checks the Astro and TypeScript files |
| `npm run lint` | Runs oxlint |
| `npm run build` | Builds the site into `dist/` |
| `npm run preview` | Builds, then serves the result with Cloudflare's local runtime (`wrangler dev`) |

## Where things are

- `src/pages`: one file per page. `src/pages/docs` holds the documentation pages.
- `src/layouts`: the page shell (`Base.astro`) and the docs shell (`Docs.astro`).
- `src/components`: shared parts such as the header, footer and code block.
- `src/nav.ts` and `src/docs-nav.ts`: the menus. **A new page needs an entry here in the same commit.**
- `src/site.config.ts`: the organization, repository and contact links. Links to GitHub, Discord, X and the email addresses come from this file, so change them there and nowhere else.
- `src/data/site-facts.json`: facts generated from the built ASTra packages.
- `public/`: files served as they are (images, logos, `robots.txt`).

## The facts rule

Package names, versions, tool and operation counts, command lines and the template gallery result come from `src/data/site-facts.json`, never from typing them into a page. That file is generated from a built checkout of the ASTra repository:

```bash
ASTRA_REPO=/path/to/astra npm run facts
```

Run it when the ASTra packages change, and commit the result. If a number on a page looks wrong, fix its source, not the page.

## Writing style

- Plain words and short sentences. Say what a thing does, then stop.
- Write to the reader ("you"). No marketing superlatives.
- **No em dashes.** Use a comma, a colon, parentheses or a new sentence.
- Check that every command you show actually runs.

## Before you open a pull request

1. `npm run check`, `npm run lint` and `npm run build` all pass.
2. If you changed how a page looks, look at it in the browser at phone width and at desktop width, and add a screenshot to the pull request.
3. Keep one change in one pull request.
4. Sign off every commit with `git commit -s`. The sign-off line is your statement that you wrote the change, or have the right to submit it, under the license below.

Open the pull request against `main`. A maintainer reviews it. When it is merged to `main`, the site is built and deployed automatically, so a merged change is live within a few minutes.

## License

The website code is under the [MIT License](LICENSE). The names, logos, page text, images and sample documents are not: they stay with Attentionform, all rights reserved.

By contributing you agree that:

- code you contribute is licensed under the MIT License, like the rest of the code;
- text or images you contribute may be used by Attentionform on the site and in its materials, and you confirm they are yours to give.

## Security

Do not report a security problem in a public issue. Follow the [security policy](https://github.com/Attentionform/astra/blob/main/SECURITY.md) or write to astra@attentionform.com.

## Questions

Open an issue here, ask in the [Discord server](https://discord.gg/YmJrmXUNF), or write to astra@attentionform.com.
