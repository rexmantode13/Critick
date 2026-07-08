# 🎬 Critick — Movie Review & Rating Website

A modern, fully responsive movie review and rating platform built with **pure HTML, CSS, and JavaScript**. Critick allows users to discover, review, rate, and track their favorite movies in a sleek, dark-themed editorial interface.

> **Live Demo:** _Deploy on [Vercel](https://vercel.com) or [GitHub Pages](https://pages.github.com) for instant hosting._

---

## 📸 Preview

| Homepage | Movies Page | Reviews Page |
|----------|-------------|--------------|
| Hero section with search, trending movies, categories, community reviews, and stats. | Filterable movie catalog with sidebar, genre checkboxes, and pagination. | Full-length user reviews with helpful/reply actions. |

---

## ✨ Features

### Core Features
- **🏠 Homepage** — Hero banner, trending movies, categories, fan favourites, coming soon, top critics, community reviews, and platform stats.
- **🎥 Movies Catalog** — Browse 12+ movies with filter sidebar (genre, year, rating), sorting options, and pagination.
- **📝 Community Reviews** — Read detailed reviews from community members with helpful/reply interactions.
- **🎞️ Movie Details** — Full movie pages with synopsis, rating panel, cast grid (TMDB photos), and user reviews.
- **📋 Wishlist** — Personal watchlist to save movies for later.
- **👤 User Profile** — Profile page with avatar, bio, stats (watched/reviews/followers), favourite movies, and activity timeline.
- **🔐 Authentication** — Login and Register forms with validation-ready structure.
- **ℹ️ About Page** — Platform mission, developer profile, and FAQ section.
- **⭐ Critick Pro** — Premium subscription page with 3-tier pricing (Free/Pro/Critic), billing toggle (monthly/yearly), and FAQ accordion.

### Design & UX Features
- **🌑 Dark Mode Design** — Sophisticated dark theme with `#0a0a0a` primary background and glassmorphism panels.
- **✨ Micro-Animations** — Scroll-reveal fade-in, staggered card entrances, hero ambient glow, stat number pop-in, button shimmer, logo animation, and critic card hover effects.
- **📱 Fully Responsive** — Mobile-first media queries with hamburger navigation at `≤768px`, adaptive grid layouts, and touch-friendly targets.
- **🔤 Modern Typography** — [Inter](https://fonts.google.com/specimen/Inter) font family from Google Fonts (weights 300–800).
- **🎨 CSS Variables** — Complete design token system for colors, spacing, shadows, and transitions.
- **♿ Accessibility** — Semantic HTML5 elements, ARIA labels on interactive elements, and proper heading hierarchy.

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| **HTML5** | Semantic structure, SEO meta tags, accessibility attributes |
| **CSS3** | Custom properties (variables), Flexbox, CSS Grid, glassmorphism, `backdrop-filter`, `aspect-ratio`, keyframe animations, media queries |
| **JavaScript (Vanilla)** | Navbar scroll effect, Intersection Observer (scroll animations), billing toggle, FAQ accordion |
| **Google Fonts** | [Inter](https://fonts.google.com/specimen/Inter) — modern sans-serif typeface |
| **TMDB API (Images)** | Movie poster artwork via `image.tmdb.org` CDN + local fallback images |
| **SVG Icons** | Inline SVG icons for navigation, categories, and social links (no external icon libraries) |

### No External Dependencies
This project uses **zero JavaScript frameworks or CSS libraries** — it's built entirely with vanilla HTML, CSS, and JS. No npm, no build step, no bundlers required.

---

## 📁 Project Structure

```
Movie Review & Rating Website/
│
├── index.html              # Homepage — hero, trending, categories, reviews, stats
├── movies.html             # Movies catalog with filter sidebar & pagination
├── movie-details.html      # Individual movie page (Dune: Part Two)
├── reviews.html            # Community reviews listing
├── wishlist.html           # User's personal watchlist
├── profile.html            # User profile with stats & activity timeline
├── login.html              # Login authentication page
├── register.html           # Registration page
├── about.html              # About platform, mission, developer, FAQ
├── pro.html                # Critick Pro subscription & pricing page
├── README.md               # Project documentation (this file)
├── DOCUMENTATION.md        # Additional technical documentation
│
├── css/
│   └── styles.css          # Global stylesheet — variables, components, responsive
│
└── images/
    ├── gladiator-2.jpg         # Gladiator II movie poster (local)
    ├── deadpool-wolverine.jpg  # Deadpool & Wolverine poster (local)
    ├── pj-explained.jpg        # Critic avatar — PJ Explained
    ├── yogi-bolta-hai.jpg      # Critic avatar — Yogi Bolta Hai
    └── bnftv.jpg               # Critic avatar — BnfTV
```

---

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0a` | Main background |
| `--bg-secondary` | `#171717` | Cards, footer, alternate sections |
| `--accent` | `#ffffff` | Buttons, highlights, interactive elements |
| `--text-primary` | `#ffffff` | Headings, primary text |
| `--text-secondary` | `#a3a3a3` | Body text, descriptions |
| `--border-color` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--glass-bg` | `rgba(23,23,23,0.7)` | Glassmorphism panels |
| `--success` | `#22C55E` | Positive indicators |
| `--danger` | `#EF4444` | Warnings, logout |

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)
- **Scale:** Fluid sizing from `0.75rem` to `4rem`

### Component Library
The CSS includes reusable components:
- **Buttons** — `.btn-primary`, `.btn-outline` with hover transforms and shimmer
- **Cards** — `.movie-card`, `.review-card`, `.category-card`, `.stat-card`
- **Forms** — `.form-control`, `.form-group`, `.form-label`
- **Layout** — `.container`, `.glass-panel`, `.movie-grid`, `.review-grid`
- **Badges** — `.badge`, `.badge-accent`
- **Navigation** — `.navbar`, `.nav-links`, `.hamburger`

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local development server (optional but recommended)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/movie-review-rating-website.git
   cd movie-review-rating-website
   ```

2. **Run with a local server** (choose one):
   ```bash
   # Using npx serve (Node.js required)
   npx serve . -l 3000

   # Using Python
   python -m http.server 3000

   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Or just open directly:
Simply double-click `index.html` in your file explorer — it works without a server!

---

## 🌐 Deployment

### Vercel
1. Push the project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → Import your repo.
3. Vercel auto-detects it as a static site — no configuration needed.
4. Click **Deploy** — your site is live!

### GitHub Pages
1. Push the project to GitHub.
2. Go to **Settings → Pages**.
3. Under "Source", select `main` branch and `/ (root)`.
4. Click **Save** — your site will be live at `https://username.github.io/repo-name/`.

### Netlify
1. Drag and drop the project folder into [netlify.com](https://netlify.com).
2. Instant deployment — no build command required.

> **Note:** All images are either stored locally in the `images/` folder or loaded from the TMDB CDN (`image.tmdb.org`), ensuring they load reliably on any hosting platform.

---

## 📄 Pages Overview

| Page | File | Description |
|------|------|-------------|
| **Home** | `index.html` | Landing page with hero, movie sections, categories, reviews, stats |
| **Movies** | `movies.html` | Filterable movie catalog with sidebar and pagination |
| **Movie Details** | `movie-details.html` | Individual movie page with cast, synopsis, and reviews |
| **Reviews** | `reviews.html` | Community review feed with search and sorting |
| **Wishlist** | `wishlist.html` | User's saved movies watchlist |
| **Profile** | `profile.html` | User profile with stats, favorites, and activity timeline |
| **Login** | `login.html` | Authentication login form |
| **Register** | `register.html` | Account registration form |
| **About** | `about.html` | Platform info, mission, developer bio, FAQ |
| **Critick Pro** | `pro.html` | Subscription plans with pricing toggle and FAQ |

---

## 🎬 Movie Data & Assets

### Poster Images
- **Local images** (committed to repo): Gladiator II, Deadpool & Wolverine, and critic avatars.
- **TMDB CDN**: Other movie posters loaded from `https://image.tmdb.org/t/p/w500/` — a reliable, public image CDN by [The Movie Database](https://www.themoviedb.org/).

### Movies Featured
| Movie | Year | Genre | Rating |
|-------|------|-------|--------|
| Furiosa: A Mad Max Saga | 2024 | Action | 8.2 |
| Dune: Part Two | 2024 | Sci-Fi | 8.8 |
| Oppenheimer | 2023 | Drama | 8.4 |
| Across the Spider-Verse | 2023 | Animation | 8.6 |
| The Batman | 2022 | Action | 7.8 |
| Everything Everywhere All at Once | 2022 | Sci-Fi | 7.8 |
| Interstellar | 2014 | Sci-Fi | 9.0 |
| Inception | 2010 | Sci-Fi | 8.8 |
| The Shawshank Redemption | 1994 | Drama | 9.3 |
| Deadpool & Wolverine | 2024 | Action | 7.9 |
| Gladiator II | 2024 | Drama | 7.5 |
| No Time to Die | 2021 | Action | 7.2 |

---

## 🔧 CSS Architecture

The stylesheet (`css/styles.css`) is organized into clear sections:

1. **CSS Variables** — Theme tokens for colors, typography, spacing, and shadows
2. **Reset & Base Styles** — Box-sizing reset, body defaults, link/list resets
3. **Typography** — Heading styles, gradient text, accent text
4. **Utilities** — Container, flex, grid helpers, glassmorphism, buttons, forms, badges
5. **Components** — Navbar, hero, movie cards, review cards, categories, stats, footer
6. **Page-Specific Styles** — Movies layout, movie details, auth forms, profile
7. **Responsive Design** — Media queries for `1024px`, `768px` breakpoints
8. **Animations** — Scroll reveal, stagger delays, hero glow, stat pulse, shimmer

---

## 🧩 JavaScript Functionality

All JavaScript is **inline** within each HTML file (no separate JS files) for simplicity:

| Feature | Method | Used On |
|---------|--------|---------|
| Navbar scroll effect | `scroll` event + `classList.toggle` | All pages |
| Scroll reveal animations | `IntersectionObserver` | Homepage, Movies |
| Billing toggle (Pro page) | `innerHTML` swap + `classList.toggle` | `pro.html` |
| FAQ accordion | `classList.toggle('open')` | `pro.html` |

---

## 📋 Future Enhancements (MERN Stack Migration)

This project is structured for future migration to a full-stack application:

- [ ] **Backend:** Node.js + Express API for user authentication and review CRUD
- [ ] **Database:** MongoDB for users, movies, reviews, and watchlists
- [ ] **Frontend:** React component architecture (components are already modular in CSS)
- [ ] **API Integration:** TMDB API for live movie data, search, and recommendations
- [ ] **Authentication:** JWT-based auth with bcrypt password hashing
- [ ] **Real-time:** WebSocket support for live review notifications

---

## 👨‍💻 Developer

**Rex Mantode** — Founder & Full-Stack Developer

Passionate about cinema and clean code. Built Critick as a platform where every film lover can find, rate, and talk about the movies they care about.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Credits & Acknowledgments

- **[TMDB](https://www.themoviedb.org/)** — Movie poster images and artwork
- **[Google Fonts](https://fonts.google.com/)** — Inter typeface
- **[Unsplash](https://unsplash.com/)** — Hero background photography
- **[Lucide Icons](https://lucide.dev/)** — SVG icon design inspiration

---

<p align="center">
  Built with ❤️ by <strong>Rex Mantode</strong> &nbsp;|&nbsp; &copy; 2026 Critick
</p>
