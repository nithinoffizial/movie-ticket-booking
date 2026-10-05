// Movie artwork and curated metadata helper for enhanced cinematic presentation
// Maps known movie titles to high quality posters, backdrop images, tags, and ratings

export const movieMeta = {
  'interstellar': {
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
    rating: '8.7',
    votes: '2.1M',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    director: 'Christopher Nolan',
    stars: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    badge: 'Blockbuster',
    accentColor: '#38bdf8'
  },
  'leo': {
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    rating: '7.9',
    votes: '950K',
    tagline: 'Bloody Sweet. The saga of a quiet man tested to his absolute limit.',
    description: 'A mild-mannered cafe owner in Kashmir becomes a local hero through an act of violence, which sets off repercussions with a dangerous drug cartel that believes he is someone from their past.',
    director: 'Lokesh Kanagaraj',
    stars: 'Thalapathy Vijay, Trisha, Sanjay Dutt, Arjun Sarja',
    badge: 'Trending #1',
    accentColor: '#f43f5e'
  },
  'vikram': {
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1400&q=80',
    rating: '8.3',
    votes: '820K',
    tagline: 'Once upon a time there lived a ghost...',
    description: 'A special investigator is assigned a case of serial killings, leading him on the trail of a clandestine black ops squad and a ruthless syndicate lord.',
    director: 'Lokesh Kanagaraj',
    stars: 'Kamal Haasan, Fahadh Faasil, Vijay Sethupathi',
    badge: 'Critic Choice',
    accentColor: '#eab308'
  },
  'inception': {
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
    rating: '8.8',
    votes: '2.5M',
    tagline: 'Your mind is the scene of the crime.',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
    director: 'Christopher Nolan',
    stars: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
    badge: 'Legendary',
    accentColor: '#a855f7'
  },
  'jailer': {
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    rating: '7.8',
    votes: '740K',
    tagline: 'Tiger Ka Hukum. The retired warden is back.',
    description: 'A retired jailer goes on a manhunt to find his son\'s killers. But the road will lead him to a familiar, darker place where old allegiances and lethal skills resurface.',
    director: 'Nelson Dilipkumar',
    stars: 'Superstar Rajinikanth, Mohanlal, Shiva Rajkumar, Vinayakan',
    badge: 'Popular',
    accentColor: '#f97316'
  }
};

// Returns poster and metadata based on movie title, or dynamic cinematic fallbacks
export const getMovieVisuals = (title = '', genre = '') => {
  const normalized = title.trim().toLowerCase();
  
  if (movieMeta[normalized]) {
    return movieMeta[normalized];
  }

  // Genre-based vibrant fallback backgrounds
  const genreBackdrops = {
    'action': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'sci-fi': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'drama': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    'comedy': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    'thriller': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    'romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
  };

  const matchedGenre = Object.keys(genreBackdrops).find(g => genre.toLowerCase().includes(g));
  const defaultPoster = genreBackdrops[matchedGenre] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

  return {
    poster: defaultPoster,
    backdrop: defaultPoster,
    rating: '8.0',
    votes: '100K+',
    tagline: 'Experience the magic on the big screen.',
    description: `${title} is a gripping ${genre || 'feature'} film, bringing unforgettable cinematic drama and action to premier theatres.`,
    director: 'Acclaimed Director',
    stars: 'Ensemble Cast',
    badge: 'Now Showing',
    accentColor: '#e50914'
  };
};
