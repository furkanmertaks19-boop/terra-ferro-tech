This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/getting-started/deploying) for more details.

## SEO

Public pages use the Next.js App Router metadata API (`src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`).

- Canonical domain: `https://www.terraferrotech.com`
- Locale: Albanian (`html lang="sq"`, Open Graph `sq_AL`)
- Published products are included in `/sitemap.xml`; draft and archived products are not
- `/admin`, `/api`, login, and preview routes are `noindex`

### Google Search Console

When Google issues a Search Console HTML-tag verification code, put it in `GOOGLE_SITE_VERIFICATION` (see `.env.example`). Do not invent a code.

The metadata field is `verification.google` in `src/app/layout.tsx`.

### Analytics

No GA4 measurement ID is configured. Do not add a tracking ID until one is issued.
