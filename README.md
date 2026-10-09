# 🎬 Critick — Cinematic Discovery, Reviews & Ratings

> A dark, minimal, editorial Movie & Web Series Review and Rating platform on the **MERN stack** (MongoDB, Express, React, Node.js) powered by the **OMDb API**.

Designed at the intersection of a high-end film publication and a modern discovery product: cinematic typography, bespoke design tokens, human-curated reviews, and zero AI-generated aesthetic shortcuts.

---

## 🌟 Key Features

- **Editorial Homepage**: Curated hero titles, trending releases, popular picks, top-rated masterpieces, hidden gems, and community highlights.
- **Deep Film & Series Pages**: High-resolution posters, Rotten Tomatoes / Metacritic / IMDb aggregates, cast monograms, season accordions for web series, and recommendation trays.
- **Human-Designed Review System**: Full-length reviews, star ratings, spoiler protection with toggle blur, comment replies, and community helpful upvotes.
- **Universal Watchlist**: Seamlessly works for guest users (local storage) and auto-syncs upon logging in or registering.
- **User Profiles & Activity**: Customizable avatars, bio, favorite titles list, rating breakdown, and recent activity timeline.
- **Critick Pro Subscriptions**: Multi-tier memberships (*Free*, *Pro Film Buff*, *Verified Critic*) with interactive monthly/annual billing and FAQ accordions.
- **Admin Moderation Console**: Protected role-based administration dashboard to moderate flagged reviews, adjust user permissions, and maintain community integrity.
- **Resilient OMDb Integration**: Caches fetched titles in MongoDB for 30 days to respect daily rate limits, with high-fidelity curated fallbacks for instant offline startup.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router 6** (Lazy loading, protected routes, guest routes, admin routes)
- **Vanilla CSS Design System** (Global tokens, Fraunces serif display + Inter typography, smooth micro-interactions, responsive grid & flexbox layouts)
- **Axios** with automatic JWT silent refresh interceptors
- **Context API** (`AuthContext`, `WatchlistContext`, `ToastContext`)

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose 8**
- **Security & Performance**: Helmet (custom CSP for OMDb media), CORS, express-mongo-sanitize, express-rate-limit, compression, morgan
- **Authentication**: JWT access & refresh tokens via secure HTTP-only cookies, bcryptjs password hashing
- **Data Source**: OMDb API (`omdbapi.com`) with rate-limit tracking, Axios client, and MongoDB persistent caching

---

## 📁 Project Structure

```text
Critick/
├── client/                     # Frontend React application (Vite)
│   ├── public/                 # Static assets & SVG fallbacks
│   ├── src/
│   │   ├── api/                # API service wrappers (axiosClient)
│   │   ├── components/         # Reusable UI, Layout, Movie & Review components
│   │   ├── context/            # Auth, Watchlist, and Toast context providers
│   │   ├── pages/              # 12 application pages (Home, Movies, MovieDetail, etc.)
│   │   ├── styles/             # Design tokens, base CSS, utilities
│   │   ├── utils/              # Formatters & helper utilities
│   │   ├── App.jsx             # Router and route guards
│   │   └── main.jsx            # React root entry
│   ├── index.html              # HTML shell with Google Fonts
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json
│
├── server/                     # Backend API server (Express & Mongoose)
│   ├── src/
│   │   ├── config/             # DB connection & environment variables
│   │   ├── controllers/        # Express controllers (auth, catalog, review, user, admin)
│   │   ├── middleware/         # Auth, validation, rate limiting, error handling
│   │   ├── models/             # Mongoose schemas (User, Title, Review, Watchlist, etc.)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── scripts/            # Admin creation & OMDb verification scripts
│   │   ├── seed/               # Curated catalog & demo users/reviews seeder
│   │   ├── services/           # OMDb API service & node-cache
│   │   ├── utils/              # Logger, API response wrappers, OMDb mapper
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server entry point
│   └── package.json
│
├── package.json                # Root scripts (setup, dev, build, start, seed)
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 2. Setup Dependencies & Environments
Run the one-step setup command from the repository root:
```bash
npm run setup
```
This automatically:
- Copies `server/.env.example` to `server/.env` (if not already created)
- Copies `client/.env.example` to `client/.env` (if not already created)
- Installs all dependencies across the server, client, and root workspace

### 3. (Optional) Configure OMDb API Key
If you have an OMDb API key (free at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)), add it to `server/.env`:
```env
OMDB_API_KEY=your_key_here
```
> *Note: Critick includes high-fidelity curated editorial metadata out-of-the-box, allowing full exploration and testing even before adding an external API key.*

### 4. Seed the Database
Initialize the admin user, curated movie catalog, and demo data:
```bash
# 1. Create the administrator account
npm run create-admin

# 2. Seed 88+ curated movies and series into MongoDB
npm run seed:catalog

# 3. Seed demo users, reviews, and community activity
npm run seed:demo
```

### 5. Launch Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔑 Default Accounts

| Role | Username / Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@critick.com` | `Admin123!` | Full Admin Console (`/admin`), User Moderation, Content Deletion |
| **Critic** | `sneha_demo` | `DemoPass123!` | Verified Critic Badge, Publishing Reviews |
| **Pro User**| `rahul_demo` | `DemoPass123!` | Pro Plan, Extended Watchlist, Community Reviews |
| **Free User**| `aman_demo` | `DemoPass123!` | Standard User Features |

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run setup` | Copies `.env` files and installs dependencies across all workspaces |
| `npm run dev` | Runs Express API and Vite React client concurrently |
| `npm run build` | Compiles production bundle for the client |
| `npm run start` | Starts the production Express server |
| `npm run create-admin` | Seeds the default administrator account |
| `npm run seed:catalog` | Imports curated cinematic titles into MongoDB |
| `npm run seed:demo` | Seeds demo reviewers, critique posts, and activity history |
| `npm run verify:omdb` | Validates live OMDb API connection and test titles |

---



## 📜 License
© 2026 Critick. Designed and built with a passion for cinema.
