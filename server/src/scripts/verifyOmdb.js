const axios = require('axios');
const connectDB = require('../config/db');
const omdbService = require('../services/omdb.service');
const Title = require('../models/Title.model');

const TEST_TITLES = [
  { imdbID: 'tt1375666', expectedTitle: 'Inception' },
  { imdbID: 'tt0816692', expectedTitle: 'Interstellar' },
  { imdbID: 'tt15398776', expectedTitle: 'Oppenheimer' },
  { imdbID: 'tt0903747', expectedTitle: 'Breaking Bad' },
];

async function verifyOmdb() {
  console.log('\n==================================================');
  console.log('🔍 [VERIFY OMDB] Verifying Real OMDb Data Integration');
  console.log('==================================================\n');

  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Database connection failed. Make sure MongoDB is running.');
    process.exit(1);
  }

  const isKeyValid = await omdbService.verifyApiKeyOnStartup();
  if (!isKeyValid) {
    console.error('❌ Verification failed: Valid OMDB_API_KEY required in server/.env');
    process.exit(1);
  }

  let failures = 0;

  for (const testItem of TEST_TITLES) {
    try {
      const { titleDoc } = await omdbService.getTitleByImdbId(testItem.imdbID);
      
      if (!titleDoc) {
        console.error(`❌ [FAIL] Could not fetch record for ${testItem.expectedTitle} (${testItem.imdbID})`);
        failures++;
        continue;
      }

      if (!titleDoc.title.toLowerCase().includes(testItem.expectedTitle.toLowerCase())) {
        console.error(`❌ [FAIL] Title mismatch: Got "${titleDoc.title}", expected "${testItem.expectedTitle}"`);
        failures++;
        continue;
      }

      // Verify poster URL HTTP status with HEAD request
      let posterStatus = 'N/A';
      if (titleDoc.posterUrl) {
        try {
          const posterRes = await axios.head(titleDoc.posterUrl, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
          posterStatus = `HTTP ${posterRes.status} OK`;
        } catch (e) {
          posterStatus = `HTTP Error (${e.message})`;
        }
      }

      console.log(`🎬 Title:       ${titleDoc.title}`);
      console.log(`📅 Year:        ${titleDoc.year}`);
      console.log(`🎬 Director:    ${titleDoc.directors.join(', ') || 'N/A'}`);
      console.log(`🎭 Top Actors:  ${titleDoc.actors.slice(0, 3).join(', ') || 'N/A'}`);
      console.log(`⭐ IMDb Rating: ${titleDoc.imdbRating} (${titleDoc.imdbVotes?.toLocaleString() || 0} votes)`);
      console.log(`🖼️ Poster Status: ${posterStatus} (${titleDoc.posterUrl})`);
      console.log('--------------------------------------------------\n');
    } catch (err) {
      console.error(`❌ Error testing ${testItem.expectedTitle}: ${err.message}`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`❌ OMDb Verification failed with ${failures} error(s).`);
    process.exit(1);
  }

  console.log('✅ ALL OMDB VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}

verifyOmdb();
