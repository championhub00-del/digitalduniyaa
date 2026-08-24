# DigitalDuniya — Setup Guide

Pakistan's digital hub: **Blog**, **Free Tools**, and **Digital Products Shop**.

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
copy .env.example .env.local

# 3. Edit .env.local — add your MongoDB URI and admin password

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXT_PUBLIC_SITE_URL` | Live domain (must match Google Search Console) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `INDEXNOW_KEY` | 32-char key for Bing/Yandex instant indexing |

## Admin Panel

- **Main Admin:** `/admin` — blogs, AI generator, comments, earnings
- **Shop:** `/admin/shop` — add/edit digital products, manage orders
- **Payments:** `/admin/payments` — JazzCash, EasyPaisa, bank details

## Digital Products Flow

1. Admin → Shop → add product with price + Google Drive download link
2. Customer buys on `/shop` → pays via JazzCash/EasyPaisa/Bank
3. Admin → Orders → **Mark Paid** → customer gets download link
4. Free products (price = 0) → instant download

## SEO & Google Indexing Fix

This setup includes:

- **ISR caching** (`revalidate: 3600`) on blog & shop pages
- **Auto IndexNow + Google sitemap ping** when you publish/edit a blog or product
- **Dynamic sitemap** at `/sitemap.xml` (blogs + products + all pages)
- **RSS feed** at `/feed.xml`
- **JSON-LD structured data** on all content pages
- **IndexNow key file** at `/{INDEXNOW_KEY}.txt` (auto-served)

### Google Search Console Checklist

1. Set `NEXT_PUBLIC_SITE_URL` to your exact domain (with or without www — pick one)
2. Verify property in Search Console (meta tag already in layout)
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`
4. Set `INDEXNOW_KEY` in Vercel env + redeploy
5. Request indexing for homepage once manually
6. New blogs/products auto-ping search engines on save

## Deploy on Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all env variables from `.env.example`
4. Deploy

## Tech Stack

- Next.js 15 (App Router)
- MongoDB + Mongoose
- Tailwind CSS 4
- Vercel Analytics
