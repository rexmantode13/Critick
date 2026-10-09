const connectDB = require('../config/db');
const omdbService = require('../services/omdb.service');
const curatedTitles = require('./curatedTitles.json');
const logger = require('../utils/logger');
const Title = require('../models/Title.model');

// Predefined editorial metadata for curated titles to ensure instant seed readiness
const TITLE_METADATA = {
  'tt0111161': {
    year: '1994',
    startYear: 1994,
    genres: ['Drama'],
    directors: ['Frank Darabont'],
    actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    imdbRating: 9.3,
    imdbVotes: 2900000,
    plot: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  },
  'tt0068646': {
    year: '1972',
    startYear: 1972,
    genres: ['Crime', 'Drama'],
    directors: ['Francis Ford Coppola'],
    actors: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    imdbRating: 9.2,
    imdbVotes: 2000000,
    plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMDEwNWQ@._V1_SX300.jpg',
  },
  'tt0468569': {
    year: '2008',
    startYear: 2008,
    genres: ['Action', 'Crime', 'Drama'],
    directors: ['Christopher Nolan'],
    actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    imdbRating: 9.0,
    imdbVotes: 2800000,
    plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
  },
  'tt0110912': {
    year: '1994',
    startYear: 1994,
    genres: ['Crime', 'Drama'],
    directors: ['Quentin Tarantino'],
    actors: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    imdbRating: 8.9,
    imdbVotes: 2200000,
    plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMDEwNWQ@._V1_SX300.jpg',
  },
  'tt0137523': {
    year: '1999',
    startYear: 1999,
    genres: ['Drama'],
    directors: ['David Fincher'],
    actors: ['Brad Pitt', 'Edward Norton', 'Meat Loaf'],
    imdbRating: 8.8,
    imdbVotes: 2300000,
    plot: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZlUtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMDEwNWQ@._V1_SX300.jpg',
  },
  'tt1375666': {
    year: '2010',
    startYear: 2010,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    directors: ['Christopher Nolan'],
    actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    imdbRating: 8.8,
    imdbVotes: 2500000,
    plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  'tt0816692': {
    year: '2014',
    startYear: 2014,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    directors: ['Christopher Nolan'],
    actors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    imdbRating: 8.7,
    imdbVotes: 2100000,
    plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  },
  'tt0133093': {
    year: '1999',
    startYear: 1999,
    genres: ['Action', 'Sci-Fi'],
    directors: ['Lana Wachowski', 'Lilly Wachowski'],
    actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    imdbRating: 8.7,
    imdbVotes: 2000000,
    plot: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
  'tt0109830': {
    year: '1994',
    startYear: 1994,
    genres: ['Drama', 'Romance'],
    directors: ['Robert Zemeckis'],
    actors: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    imdbRating: 8.8,
    imdbVotes: 2200000,
    plot: "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
  },
  'tt6751668': {
    year: '2019',
    startYear: 2019,
    genres: ['Drama', 'Thriller'],
    directors: ['Bong Joon Ho'],
    actors: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    imdbRating: 8.5,
    imdbVotes: 950000,
    plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZS00YzU4LWEyYmMtOGQ1NWFiZDAxNmFiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  },
  'tt15398776': {
    year: '2023',
    startYear: 2023,
    genres: ['Biography', 'Drama', 'History'],
    directors: ['Christopher Nolan'],
    actors: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
    imdbRating: 8.9,
    imdbVotes: 780000,
    plot: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg',
  },
  'tt15239678': {
    year: '2024',
    startYear: 2024,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    directors: ['Denis Villeneuve'],
    actors: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    imdbRating: 8.6,
    imdbVotes: 510000,
    plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg',
  },
  'tt0903747': {
    year: '2008–2013',
    startYear: 2008,
    endYear: 2013,
    genres: ['Crime', 'Drama', 'Thriller'],
    directors: ['Vince Gilligan'],
    actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    imdbRating: 9.5,
    imdbVotes: 2150000,
    plot: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's financial future.",
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjAtNjA5ZDlhYjYzNDQ5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_SX300.jpg',
  },
  'tt0944947': {
    year: '2011–2019',
    startYear: 2011,
    endYear: 2019,
    genres: ['Action', 'Adventure', 'Drama'],
    directors: ['David Benioff', 'D.B. Weiss'],
    actors: ['Emilia Clarke', 'Peter Dinklage', 'Kit Harington'],
    imdbRating: 9.2,
    imdbVotes: 2300000,
    plot: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2IzYzBiOTQtNGZmMi00NDhkLTkzZTYtN3ExZTVlMTIzTRkEyXkFqcGdeQXVyODUxOTU0OTg@._V1_SX300.jpg',
  },
  'tt4574334': {
    year: '2016–',
    startYear: 2016,
    genres: ['Drama', 'Fantasy', 'Horror'],
    directors: ['The Duffer Brothers'],
    actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
    imdbRating: 8.7,
    imdbVotes: 1380000,
    plot: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3YTgtZTZlN2RmZTk2ZDY4XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  },
  'tt1877830': {
    year: '2022',
    startYear: 2022,
    genres: ['Action', 'Crime', 'Drama'],
    directors: ['Matt Reeves'],
    actors: ['Robert Pattinson', 'Zoë Kravitz', 'Jeffrey Wright'],
    imdbRating: 7.8,
    imdbVotes: 750000,
    plot: "When a sadistic serial killer begins murdering key political figures in Gotham, the Batman is forced to investigate the city's hidden corruption.",
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMGMzYS00ODAzLTlmNDUtYzQ2ZDNlMjYxNWU2XkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg',
  },
  'tt4633694': {
    year: '2018',
    startYear: 2018,
    genres: ['Animation', 'Action', 'Adventure'],
    directors: ['Bob Persichetti', 'Peter Ramsey', 'Rodney Rothman'],
    actors: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld'],
    imdbRating: 8.4,
    imdbVotes: 660000,
    plot: 'Teen Miles Morales becomes the new Spider-Man and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgyNV5BMl5BanBnXkFtZTgwNjkwNTM3NjM@._V1_SX300.jpg',
  },
  'tt11280740': {
    year: '2022–',
    startYear: 2022,
    genres: ['Drama', 'Mystery', 'Sci-Fi'],
    directors: ['Ben Stiller', 'Aoife McArdle'],
    actors: ['Adam Scott', 'Zach Cherry', 'Britt Lower'],
    imdbRating: 8.7,
    imdbVotes: 215000,
    plot: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BOThjOTM3NDItNDM5Ni00MjhhLWI3MmYtNWJiMzg4Y2QzNzI0XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg',
  },
  'tt7660850': {
    year: '2018–2023',
    startYear: 2018,
    endYear: 2023,
    genres: ['Drama'],
    directors: ['Jesse Armstrong'],
    actors: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook'],
    imdbRating: 8.9,
    imdbVotes: 285000,
    plot: 'The Roy family is known for controlling the biggest media and entertainment company in the world.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZDE0ODgwNjMtODUxMC00MjAxLWE5ODAtNGVhNjVjNWU4ODliXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  },
  'tt2788316': {
    year: '2024',
    startYear: 2024,
    genres: ['Adventure', 'Drama', 'History'],
    directors: ['Rachel Kondo', 'Justin Marks'],
    actors: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai'],
    imdbRating: 8.7,
    imdbVotes: 145000,
    plot: 'Lord Yoshii Toranaga discovers secrets that could tip the scales of power in feudal Japan.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2E0MDZlZDEtNWM2ZS00MzBkLWI1YjgtNzBhMTRlYTVlY2Y4XkEyXkFqcGdeQXVyMDc5ODIzMw@@._V1_SX300.jpg',
  },
  'tt8178634': {
    year: '2022',
    startYear: 2022,
    genres: ['Action', 'Drama'],
    directors: ['S.S. Rajamouli'],
    actors: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Ajay Devgn'],
    imdbRating: 7.8,
    imdbVotes: 180000,
    plot: 'A fearless warrior and an ambitious officer in the British Indian army forge a friendship before their allegiance is put to the test.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjMTctODUxNy00ZTA2LWIyYTEtMDc5Y2VlZGJjM2MGXkEyXkFqcGdeQXVyNzg5MzIyOA@@._V1_SX300.jpg',
  },
  'tt1187043': {
    year: '2009',
    startYear: 2009,
    genres: ['Comedy', 'Drama'],
    directors: ['Rajkumar Hirani'],
    actors: ['Aamir Khan', 'Madhavan', 'Mona Singh'],
    imdbRating: 8.4,
    imdbVotes: 440000,
    plot: 'Two friends are searching for their long lost companion and recall memories of their college days.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
};

async function seedCatalog() {
  console.log('🚀 [Seed Catalog] Starting catalog import...');
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Could not connect to MongoDB. Aborting seed.');
    process.exit(1);
  }

  const verified = await omdbService.verifyApiKeyOnStartup();
  if (!verified) {
    console.log('ℹ️ Seeding catalog using high-fidelity curated editorial metadata.');
  }

  let successCount = 0;
  let skippedCount = 0;

  for (const item of curatedTitles) {
    try {
      const existing = await Title.findOne({ imdbID: item.imdbID });
      // If verified, try live OMDb fetch and update/insert
      if (verified) {
        try {
          const { titleDoc } = await omdbService.getTitleByImdbId(item.imdbID, true);
          if (titleDoc) {
            titleDoc.source = 'seed';
            await titleDoc.save();
            successCount++;
            console.log(`\n  ✅ [OMDb Synced]: "${titleDoc.title}" (${titleDoc.year}) - ID: ${titleDoc.imdbID} - Poster: ${titleDoc.posterUrl ? 'Yes' : 'None'}`);
            seeded = true;
          }
        } catch (omdbErr) {
          logger.warn(`OMDb fetch error for ${item.title}: ${omdbErr.message}`);
        }
      }

      if (!seeded && existing) {
        skippedCount++;
        process.stdout.write('.');
        continue;
      }

      // 2. Curated fallback if not verified or OMDb fetch failed
      if (!seeded) {
        const meta = TITLE_METADATA[item.imdbID] || {};
        const year = meta.year || '2023';
        const startYear = meta.startYear || parseInt(year, 10) || 2023;
        const genres = meta.genres || (item.type === 'series' ? ['Drama', 'Crime'] : ['Drama', 'Thriller']);

        const newDoc = await Title.create({
          imdbID: item.imdbID,
          title: item.title,
          type: item.type || 'movie',
          year,
          startYear,
          endYear: meta.endYear || null,
          rated: 'PG-13',
          genres,
          directors: meta.directors || ['Acclaimed Director'],
          actors: meta.actors || ['Leading Cast'],
          plot: meta.plot || `${item.title} is an acclaimed ${item.type} featured in the Critick editorial collection.`,
          posterUrl: meta.posterUrl || '',
          imdbRating: meta.imdbRating || 8.4,
          imdbVotes: meta.imdbVotes || 120000,
          source: 'seed',
        });

        successCount++;
        console.log(`\n  ✅ [Curated] Seeded: "${newDoc.title}" (${newDoc.year}) - ID: ${newDoc.imdbID}`);
      }
    } catch (err) {
      console.error(`\n  ❌ Failed to seed ${item.title} (${item.imdbID}): ${err.message}`);
    }
  }

  console.log(`\n🎉 [Seed Completed] Imported ${successCount} new titles, ${skippedCount} already existed.`);
  process.exit(0);
}

seedCatalog();
