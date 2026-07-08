# Critick Frontend Architecture Documentation

Welcome to the official documentation for the **Critick** frontend. This guide details the structure, design system, and a comprehensive roadmap for converting this static HTML/CSS frontend into a full-scale MERN (MongoDB, Express.js, React.js, Node.js) application.

---

## 1. Project Overview

Critick is a modern, premium movie review and rating platform. The frontend was explicitly built using **HTML5 and CSS3** (zero JavaScript or frameworks) to establish a solid foundation of semantic structure and CSS styling. The aesthetics draw heavy inspiration from platforms like Netflix, IMDb, and Letterboxd, utilizing a dark theme, glassmorphism, and minimal CSS animations to achieve a 2026 UI/UX standard.

---

## 2. Folder Structure

The current folder structure is organized simply, keeping styling separate from markup:

```
Movie Review & Rating Website/
│
├── index.html           # Home Page
├── movies.html          # Movies Listing & Filters
├── movie-details.html   # Detailed view of a single movie
├── reviews.html         # Community reviews and ratings
├── profile.html         # User profile and activity timeline
├── login.html           # Authentication (Login)
├── register.html        # Authentication (Sign Up)
├── about.html           # About platform, Mission, Team, FAQ
├── DOCUMENTATION.md     # Project documentation & MERN conversion guide
│
└── css/
    └── styles.css       # Global stylesheet (variables, components, utilities)
```

---

## 3. Design System

We employ a unified Design System controlled through CSS Variables (`:root`) in `styles.css`. This ensures that updating the brand color or spacing only requires a single line change.

### 4. Color Palette
- **Background (`--bg-primary`):** `#0B0F19` (Deep, immersive navy-black)
- **Secondary Background (`--bg-secondary`):** `#141A29` (Slightly lighter, used for cards and contrast)
- **Accent (`--accent`):** `#FFD54F` (A premium gold/yellow, reminiscent of IMDb stars)
- **Text Primary (`--text-primary`):** `#FFFFFF`
- **Text Secondary (`--text-secondary`):** `#B8C0D0`
- **Success (`--success`):** `#22C55E`
- **Danger (`--danger`):** `#EF4444`

### 5. Typography
- **Primary Font:** `'Inter', sans-serif`
- **Hierarchy:** We rely on large, bold headers (`h1`-`h3`) combined with high line-height paragraphs to maintain a clean, readable layout.

### 6. Component Breakdown
The HTML is heavily sectioned and commented to mimic a component-based architecture.
- **Navbar:** Sticky, glassmorphism top navigation.
- **Hero:** Large, immersive banner.
- **Movie Card:** Reusable poster card with hover overlay, rating badge, and metadata.
- **Review Card:** User avatar, name, rating, and review text.
- **Glass Panel:** A generic container class (`.glass-panel`) used for cards, sidebars, and stats.

### 7. Responsive Strategy
The application uses CSS Media Queries with a "Desktop-First" approach collapsing down to mobile:
- `max-width: 1024px`: Adapts grid layouts (e.g., 4 columns to 2 columns).
- `max-width: 768px`: Collapses the navbar into a hamburger menu UI, stacks sidebars under main content, and adjusts typography sizes.

---

## How to Convert This Frontend into MERN Stack

This frontend is explicitly structured so that converting it into a **MERN Stack** app will be highly systematic.

### 8. Future React Component Structure
When migrating to React, the `index.html` and `styles.css` will be ported over. The HTML sections should be split into the following functional components:

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── GlassPanel.jsx
│   │   └── Loader.jsx
│   ├── movie/
│   │   ├── MovieCard.jsx
│   │   ├── MovieGrid.jsx
│   │   └── RatingBadge.jsx
│   └── reviews/
│       └── ReviewCard.jsx
├── pages/
│   ├── Home.jsx
│   ├── Movies.jsx
│   ├── MovieDetails.jsx
│   ├── Profile.jsx
│   └── Auth.jsx (Login/Register)
└── App.jsx
```

* **Why?** This structure mirrors the HTML comments. By isolating `MovieCard` into a component, you can map over an array of movies from your MongoDB database and render them dynamically without duplicating markup.

### 9. Suggested MongoDB Collections
To support this platform, your database should contain the following collections:

1. **`users`**
   - `_id`, `username`, `email`, `passwordHash`, `avatarUrl`, `bio`, `role` (user/admin).
2. **`movies`**
   - `_id`, `title`, `releaseYear`, `runtime`, `synopsis`, `posterUrl`, `genres` (Array), `director`, `cast` (Array).
3. **`reviews`**
   - `_id`, `userId` (Ref), `movieId` (Ref), `rating` (1-10), `text`, `createdAt`, `likesCount`.
4. **`watchlists`**
   - `_id`, `userId` (Ref), `movies` (Array of Refs).

### 10. Suggested REST APIs (Express.js)
You will need to build an Express router exposing these endpoints:

- **Auth:**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Movies:**
  - `GET /api/movies` (with query params for filtering by genre, year)
  - `GET /api/movies/:id` (fetch detailed info)
- **Reviews:**
  - `GET /api/movies/:id/reviews`
  - `POST /api/reviews` (protected route)
- **User:**
  - `GET /api/users/:id/profile`
  - `GET /api/users/:id/watchlist`

### 11. Authentication Workflow
- **Frontend:** The `login.html` form will be controlled by React state. On submit, it posts credentials to `/api/auth/login`.
- **Backend:** Node.js verifies the password using `bcrypt` and issues a **JWT (JSON Web Token)**.
- **State Management:** React Context API or Redux will store the user object and the JWT. The token will be saved to `localStorage` or HttpOnly cookies and attached to the `Authorization` header for protected requests (like posting a review).

### 12. Future Rating System Architecture
Currently, the rating (e.g., `8.8`) is hardcoded. In the MERN stack:
- Every time a user submits a review via `POST /api/reviews`, a MongoDB aggregate function or Mongoose middleware should recalculate the average rating for that specific `movieId`.
- The `movies` collection should cache this `averageRating` and `reviewCount` to avoid heavy database computations on every page load.

### 13. Future Review System Architecture
- Reviews require pagination. The backend should implement `limit` and `skip` (or cursor-based pagination) for the `/api/movies/:id/reviews` endpoint.
- On the frontend (`reviews.html` -> `Reviews.jsx`), an infinite scroll mechanism or the existing pagination buttons will trigger state updates, appending new fetched reviews to the DOM.

---

By adhering to semantic HTML, strict BEM-like class naming, and separating visual components into distinct code blocks, this static project provides a perfectly mapped blueprint for rapid React.js integration.
