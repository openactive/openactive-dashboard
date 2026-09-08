# OpenActive dashboard

A web application for looking at open data about physical activities in the UK to find out how much there is, where it is, and how reliable the data feeds are.

The web page has three parts:

- a summary of the whole ecosystem
- a map and filters to explore opportunities by area, publishers, activities and NHS trusts
- a feed quality table based on the filtered search

How the code works is in [`docs/`](docs/README.md).

## Setup

You need Node **24.11.0**.

```bash
nvm install 24.11.0
nvm use 24.11.0
npm install
```

Copy [`.env.example`](.env.example) to `.env.local` and fill in:

- `OPENACTIVE_API_BASE_URL`
- `OPENACTIVE_API_TOKEN`

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Other commands:

```bash
npm test          # run tests once
npm run test:watch
npm run lint
npm run build
```

## Testing

Unit tests use [Vitest](https://vitest.dev/).

```bash
npm test          # run once
npm run test:watch  # watch mode
```

CI runs `npm test` on pull requests and pushes to `main` (see `.github/workflows/test.yml`).
