# Performance Checklist

- Keep pages static-first with Astro server rendering only when required.
- Use optimized SVG or modern image formats in `/public/assets`.
- Add explicit image width/height to avoid layout shifts.
- Load only critical fonts and use `display=swap`.
- Avoid client-side hydration unless interaction requires it.
- Prefer CSS over runtime JS for layout/animation.
- Minimize third-party scripts and track bundle size.
- Run `npm run build` and inspect generated assets in `dist/`.
- Validate with Lighthouse for LCP, CLS, and INP after deployment.

## Astro Config Recommendations

- Keep `output` static unless SSR is needed.
- Add compression/caching at CDN layer.
- If dynamic images are introduced, use `astro:assets` and responsive sizes.
