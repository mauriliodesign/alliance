# Alliance Jiu Jitsu Lisboa — React + Vite

A faithful rebuild of [alliancejjlisboa.com](https://alliancejjlisboa.com/) using **React + Vite + Tailwind CSS v4**.

Same copy, same images, same dark/yellow brand identity. Trilingual (🇵🇹 PT / 🇬🇧 EN / 🇪🇸 ES) with automatic language detection and a manual switcher.

## Stack

- **React 18** + **Vite 6**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **react-icons** for iconography
- Lightweight i18n via React Context (no external i18n lib)
- Scroll-reveal animations via `IntersectionObserver`

## Sections

`Navbar` · `Hero` · `Programs` · `Trial steps` · `Coach / Team` · `Method` ·
`Schedule` (filterable grid) · `Pricing` · `Reopening banner` · `FAQ` (accordion) ·
`Footer` · `Booking modal` · floating `WhatsApp` button.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Project structure

```
public/
  images/   all.webp, alliance-photo-7.webp
  brand/    logo-alliance-sem-fundo.png
  fonts/    Bebas Neue + DM Sans (woff2)
src/
  components/   section components + Booking/Language contexts
  i18n/         translations (pt/en/es) + LanguageContext
  hooks/        useReveal (scroll animations)
  App.jsx, main.jsx, index.css
```

## Notes

- The booking form has no backend; on submit it forwards the lead to WhatsApp
  (`+351 924 851 474`) and shows a success state. Wire it to a real endpoint as needed.
- The original site did not expose plan prices, so the pricing cards show the
  "From / A partir de" prefix without specific amounts. Add values in
  `src/i18n/translations.js` when available.
- The weekly schedule grid uses representative class slots consistent with the
  stated opening hours (Mon–Fri 07:00–21:30, Sat 10:00–12:00). Adjust in
  `src/components/Schedule.jsx`.
