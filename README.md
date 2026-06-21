# BinCapicity_RawData

A mobile web app for capturing box capacity data: scan a product barcode, measure box dimensions, enter weight/quantity, and export everything as a CSV.

## Live Demo

**[https://vkchauhan2020.github.io/BinCapicity_RawData/](https://vkchauhan2020.github.io/BinCapicity_RawData/)**

Open this link directly on your Android or iOS phone to test the app — it's served over HTTPS, which is required for camera access. Deployment is automated via `.github/workflows/deploy-pages.yml` on every push to `main`.

> **One-time setup required:** if the link above 404s, go to the repo's **Settings → Pages** and set the source to **GitHub Actions** — the workflow will then publish automatically.

## Stack

- Vanilla JavaScript + [Vite](https://vitejs.dev/) (no backend, fully static, client-side only)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) for barcode scanning (EAN-13, EAN-8, UPC-A, UPC-E, Code128, QR)
- WebXR Device API + Hit Test for AR dimension measurement (**Android Chrome only** — see Browser Support below)

## Getting Started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
npm test         # run unit tests (node --test)
```

**Camera access requires HTTPS** (except on `localhost`). To test on a real phone, deploy `dist/` to a static HTTPS host (GitHub Pages, Netlify, Vercel) or use a tunneling tool (e.g. `ngrok`) pointed at the dev server.

## Browser Support

| Feature | Android Chrome | iOS Safari |
|---|---|---|
| Barcode scanning | ✅ | ✅ |
| AR dimension measurement | ✅ (ARCore-backed WebXR hit-test) | ❌ falls back to manual entry |
| Manual dimension entry | ✅ (always available) | ✅ |
| CSV export | ✅ | ✅ |

## App Flow

1. **Scan** — tap "Start Scanning", point the rear camera at the barcode.
2. **Measure** — on supported Android devices, choose "Measure with AR" and tap 4 box corners (front-left base → front-right base → back-left base → top-front-left) to compute L/W/H in cm. Otherwise, enter dimensions manually.
3. **Weight & Qty** — enter approximate weight (kg) and units per box.
4. Repeat for more boxes, or go to the list to review/delete entries and **Export CSV**.

CSV headers: `Article,Case L,Case W,Case H,Weight (g),EA/Box` (weight is converted from kg to grams).

## Manual Device Testing Checklist

The following cannot be verified in an automated/sandboxed environment and must be checked on real hardware after deployment:

- [ ] Camera permission prompt appears on "Start Scanning" tap (Android Chrome & iOS Safari); denial shows a clear error + retry.
- [ ] Real barcodes (EAN-13, UPC-A, Code128, QR) decode accurately from the rear camera at typical handling distances.
- [ ] On an ARCore-capable Android device, `navigator.xr.isSessionSupported('immersive-ar')` returns true and the AR session launches.
- [ ] AR hit-test reticle tracks a real surface; the 4-tap sequence yields L/W/H within reasonable tolerance of a tape measure.
- [ ] On iOS Safari, AR is correctly detected as unsupported (no crash) and the manual entry form appears immediately.
- [ ] CSV downloads correctly and opens with the right content on both Android Chrome and iOS Safari.