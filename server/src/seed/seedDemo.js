const connectDB = require('../config/db');
const User = require('../models/User.model');
const Review = require('../models/Review.model');
const Title = require('../models/Title.model');
const Activity = require('../models/Activity.model');
const bcrypt = require('bcryptjs');

async function seedDemo() {
  console.log('🎭 [Seed Demo] Creating clearly labelled Demo accounts and reviews...');

  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Could not connect to MongoDB.');
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(12);

  // 1. Create demo users
  const demoUsersData = [
    { name: 'Rahul Sharma (Demo)', username: 'rahul_demo', email: 'rahul.demo@critick.com', role: 'user', plan: 'pro' },
    { name: 'Sneha Verma (Demo)', username: 'sneha_demo', email: 'sneha.demo@critick.com', role: 'critic', plan: 'critic' },
    { name: 'Aman Singh (Demo)', username: 'aman_demo', email: 'aman.demo@critick.com', role: 'user', plan: 'free' },
    { name: 'Neha Kapoor (Demo)', username: 'neha_demo', email: 'neha.demo@critick.com', role: 'critic', plan: 'critic' },
  ];

  const createdUsers = [];
  for (const u of demoUsersData) {
    let user = await User.findOne({ username: u.username });
    if (!user) {
      user = await User.create({
        ...u,
        passwordHash: await bcrypt.hash('DemoPass123!', salt),
        bio: `Movie enthusiast & reviewer [Demo Account]`,
      });
    }
    createdUsers.push(user);
  }

  // 2. Fetch some titles from catalog
  const titles = await Title.find().limit(10);
  if (titles.length === 0) {
    console.warn('⚠️ No titles found in DB. Please run "npm run seed:catalog" first.');
    process.exit(1);
  }

  const sampleReviews = [
    {
      title: 'A Cinematic Masterpiece That Redefines The Genre',
      body: 'Dune: Part Two is a breathtaking masterpiece. The scale, sound design, and character arcs are magnificent. Timothée Chalamet and Zendaya give unforgettable performances.',
      rating: 5,
    },
    {
      title: 'Tense, Gripping, and Horrifyingly Human',
      body: 'Oppenheimer is a masterclass in tension and narrative pacing. Cillian Murphy delivers the role of a lifetime. The audio design alone will leave you stunned in your seat.',
      rating: 5,
    },
    {
      title: 'Pure Visual & Narrative Perfection',
      body: 'Spider-Man: Across the Spider-Verse is a stunning visual achievement. Every single frame looks like a hand-painted comic panel brought to dynamic life.',
      rating: 5,
    },
    {
      title: 'Gritty, Atmospheric, and Deeply Satisfying',
      body: 'The Batman delivers a dark, detective-focused noir story. Robert Pattinson portrays the caped crusader with intense vulnerability and vengeance.',
      rating: 4,
    },
  ];

  let reviewCount = 0;
  for (let i = 0; i < Math.min(titles.length, sampleReviews.length); i++) {
    const titleDoc = titles[i];
    const userDoc = createdUsers[i % createdUsers.length];
    const revData = sampleReviews[i];

    const existingReview = await Review.findOne({ user: userDoc._id, imdbID: titleDoc.imdbID });
    if (!existingReview) {
      const review = await Review.create({
        user: userDoc._id,
        imdbID: titleDoc.imdbID,
        mediaType: titleDoc.type,
        titleSnapshot: titleDoc.title,
        posterUrlSnapshot: titleDoc.posterUrl,
        rating: revData.rating,
        title: revData.title,
        body: revData.body,
        containsSpoilers: false,
      });

      await Activity.create({
        user: userDoc._id,
        type: 'reviewed',
        imdbID: titleDoc.imdbID,
        mediaType: titleDoc.type,
        title: titleDoc.title,
      });

      reviewCount++;
    }
  }

  console.log(`✅ [Demo Seed Complete] Created/Verified ${createdUsers.length} Demo users and ${reviewCount} Demo reviews.`);
  process.exit(0);
}

seedDemo();
