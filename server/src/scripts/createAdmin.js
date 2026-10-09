const connectDB = require('../config/db');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  console.log('👑 [Create Admin] Initializing Admin Account...');

  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Could not connect to MongoDB.');
    process.exit(1);
  }

  const existingAdmin = await User.findOne({
    $or: [{ email: 'admin@critick.com' }, { username: 'admin' }],
  });

  if (existingAdmin) {
    console.log(`ℹ️ Admin account already exists (username: "${existingAdmin.username}", role: "${existingAdmin.role}")`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Admin123!', salt);

  const admin = await User.create({
    name: 'Critick Admin',
    username: 'admin',
    email: 'admin@critick.com',
    passwordHash,
    role: 'admin',
    plan: 'critic',
    bio: 'Official Admin & Lead Moderator for Critick platform.',
  });

  console.log(`✅ Admin account created successfully!`);
  console.log(`  Email:    admin@critick.com`);
  console.log(`  Password: Admin123!`);
  console.log(`  Role:     ${admin.role}`);

  process.exit(0);
}

createAdmin();
