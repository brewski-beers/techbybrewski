# DNS Cutover Checklist — Firebase App Hosting → Vercel

This document tracks the manual steps required to cut production traffic from Firebase App Hosting to Vercel with zero downtime.

**Issue:** brewski-beers/techbybrewski#80

## Prerequisites

- [ ] #77 merged — Vercel project created and env vars set
- [ ] #78 merged — Preview deploys disabled
- [ ] #79 merged — Production deploy on `main` confirmed working

## Step-by-step

### 1 — Lower DNS TTL (do this 1+ hour before cutover)

At your DNS registrar (wherever `techbybrewski.com` is managed):

- Find the A and/or CNAME records for `techbybrewski.com` and `www.techbybrewski.com`
- Lower TTL to **300 seconds** (5 minutes)
- Wait at least 1 hour for TTL change to propagate globally

### 2 — Add custom domain in Vercel

In the Vercel dashboard:

- Project → Settings → Domains → Add Domain
- Add `techbybrewski.com` and `www.techbybrewski.com`
- Note the A record IP and CNAME target that Vercel provides

### 3 — Update DNS records at registrar

Point both apex and www to Vercel:

| Record | Host | Value | TTL |
|--------|------|-------|-----|
| A | `@` (apex) | Vercel IP (from step 2) | 300 |
| CNAME | `www` | `cname.vercel-dns.com` | 300 |

### 4 — Confirm SSL cert provisioned

- Vercel Dashboard → Project → Settings → Domains
- Both domains should show green checkmarks with valid certs (auto-provisioned via Let's Encrypt)
- This can take 5–10 minutes after DNS propagates

### 5 — Verify propagation

```bash
curl -sI https://techbybrewski.com | head -5
curl -sI https://www.techbybrewski.com | head -5
curl -sI https://techbybrewski.com | grep -i 'x-firebase\|firebase'
```

### 6 — Remove custom domain from Firebase App Hosting

In Firebase Console → App Hosting → your backend → Domains: remove `techbybrewski.com` and `www.techbybrewski.com`.

### 7 — Restore TTL

After 30–60 minutes of confirmed health, raise TTL back to 3600s at your registrar.

## Post-cutover confirmation

- [ ] `techbybrewski.com` resolves to Vercel (not Firebase)
- [ ] HTTPS works with valid cert on both apex and www
- [ ] Public pages load Firestore data correctly
- [ ] No downtime observed
- [ ] Firebase App Hosting custom domain removed
