import React, { useState, useEffect, useRef, Suspense, createContext, useContext } from 'react';
// Removed: import ReactDOM from 'react-dom'; // Reverting to ReactDOM.render for compatibility
// Removed: import { createRoot } from 'react-dom/client'; // This was causing conflict when used with ReactDOM.render
import { motion } from 'framer-motion';
import { BookOpen, Users, MessageSquare, Lightbulb, Search, UploadCloud, Home, Compass, Award, Palette, Sun, Moon } from 'lucide-react'; // Added Sun and Moon icons

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration and Initialization ---
// Global variables provided by the Canvas environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Theme Context ---
const ThemeContext = createContext(null);

// --- Theme Definitions ---
const themes = {
  christian: {
    name: 'Christian',
    bg: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-gray-900',
    text: 'text-gray-100',
    headerBg: 'bg-blue-800 bg-opacity-70',
    footerBg: 'bg-blue-800 bg-opacity-70',
    primaryAccent: 'text-yellow-300',
    secondaryAccent: 'text-yellow-200',
    buttonActiveBg: 'bg-yellow-600',
    buttonInactiveBg: 'bg-blue-700',
    buttonInactiveText: 'text-blue-100',
    buttonHoverBg: 'hover:bg-yellow-700',
    buttonHoverText: 'hover:text-white',
    cardBg: 'bg-blue-800 bg-opacity-60',
    featureCardBg: 'bg-blue-700 bg-opacity-70',
    featureCardIcon: 'text-yellow-400',
    featureCardText: 'text-blue-100',
    featureCardBorderHover: 'hover:border-yellow-500',
    guidingLightFrom: 'from-yellow-300',
    guidingLightTo: 'to-yellow-600',
    guidingLightShadow: '0 0 60px rgba(255, 255, 150, 0.8), inset 0 0 40px rgba(255, 255, 150, 0.6)',
  },
  dark: {
    name: 'Dark',
    bg: 'bg-gradient-to-br from-gray-950 via-gray-900 to-black',
    text: 'text-gray-200',
    headerBg: 'bg-gray-800 bg-opacity-70',
    footerBg: 'bg-gray-800 bg-opacity-70',
    primaryAccent: 'text-purple-400',
    secondaryAccent: 'text-purple-300',
    buttonActiveBg: 'bg-purple-700',
    buttonInactiveBg: 'bg-gray-700',
    buttonInactiveText: 'text-gray-300',
    buttonHoverBg: 'hover:bg-purple-800',
    buttonHoverText: 'hover:text-white',
    cardBg: 'bg-gray-800 bg-opacity-60',
    featureCardBg: 'bg-gray-700 bg-opacity-70',
    featureCardIcon: 'text-purple-500',
    featureCardText: 'text-gray-300',
    featureCardBorderHover: 'hover:border-purple-500',
    guidingLightFrom: 'from-purple-400',
    guidingLightTo: 'to-purple-700',
    guidingLightShadow: '0 0 60px rgba(160, 0, 255, 0.5), inset 0 0 40px rgba(160, 0, 255, 0.3)',
  },
  light: {
    name: 'Light',
    bg: 'bg-gradient-to-br from-white via-gray-50 to-gray-200',
    text: 'text-gray-800',
    headerBg: 'bg-white bg-opacity-70',
    footerBg: 'bg-white bg-opacity-70',
    primaryAccent: 'text-blue-600',
    secondaryAccent: 'text-blue-500',
    buttonActiveBg: 'bg-blue-600',
    buttonInactiveBg: 'bg-gray-200',
    buttonInactiveText: 'text-gray-700',
    buttonHoverBg: 'hover:bg-blue-700',
    buttonHoverText: 'hover:text-white',
    cardBg: 'bg-white bg-opacity-60',
    featureCardBg: 'bg-gray-100 bg-opacity-70',
    featureCardIcon: 'text-blue-600',
    featureCardText: 'text-gray-700',
    featureCardBorderHover: 'hover:border-blue-500',
    guidingLightFrom: 'from-blue-300',
    guidingLightTo: 'to-blue-600',
    guidingLightShadow: '0 0 60px rgba(0, 100, 255, 0.3), inset 0 0 40px rgba(0, 100, 255, 0.2)',
  },
  blackGrayWhite: {
    name: 'Monochrome',
    bg: 'bg-gradient-to-br from-black via-gray-900 to-gray-700', // Realistic dark background
    text: 'text-gray-100',
    headerBg: 'bg-gray-800 bg-opacity-70',
    footerBg: 'bg-gray-800 bg-opacity-70',
    primaryAccent: 'text-white',
    secondaryAccent: 'text-gray-300',
    buttonActiveBg: 'bg-white',
    buttonActiveText: 'text-gray-900', // Specific text color for active button
    buttonInactiveBg: 'bg-gray-700',
    buttonInactiveText: 'text-gray-300',
    buttonHoverBg: 'hover:bg-gray-600',
    buttonHoverText: 'hover:text-white',
    cardBg: 'bg-gray-800 bg-opacity-60',
    featureCardBg: 'bg-gray-700 bg-opacity-70',
    featureCardIcon: 'text-gray-200',
    featureCardText: 'text-gray-300',
    featureCardBorderHover: 'hover:border-white',
    guidingLightFrom: 'from-gray-400',
    guidingLightTo: 'to-gray-600',
    guidingLightShadow: '0 0 60px rgba(200, 200, 200, 0.5), inset 0 0 40px rgba(200, 200, 200, 0.3)',
  },
};

// --- Main App Component ---
function App() {
  const [activePage, setActivePage] = useState('home');
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes.christian); // Default theme

  // Firebase Authentication Effect
  useEffect(() => {
    const signIn = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log("User authenticated:", user.uid);
      } else {
        setUserId(crypto.randomUUID());
        console.log("User not authenticated, using random ID.");
      }
      setIsAuthReady(true);
    });

    signIn();
    return () => unsubscribe();
  }, []);

  // Function to switch themes
  const switchTheme = (themeName) => {
    setCurrentTheme(themes[themeName]);
  };

  // Conditional rendering for the main content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'books':
        return <BooksPage />;
      case 'forum':
        return <ForumPage />;
      case 'quizzes':
        return <QuizzesPage />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'search':
        return <SearchPage />;
      case 'upload':
        return <UploadPage />;
      case 'journey':
        return <ReadingJourneyPage />;
      case 'pathways':
        return <PathwaysPage />;
      case 'community':
        return <CommunityPage />;
      case 'personalization':
        return <PersonalizationPage switchTheme={switchTheme} currentThemeName={currentTheme.name} />; // Pass theme switcher
      default:
        return <HomePage />;
    }
  };

  // Main layout for the application
  return (
    <ThemeContext.Provider value={currentTheme}>
      <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} font-inter flex flex-col`}>
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`${currentTheme.headerBg} p-4 shadow-lg rounded-b-xl mx-4 mt-4 flex justify-between items-center z-10`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className={`w-8 h-8 ${currentTheme.primaryAccent}`} />
            <h1 className={`text-3xl font-bold ${currentTheme.secondaryAccent} drop-shadow-md`}>New Christian Digital Library</h1>
          </div>
          <nav className="flex space-x-4">
            {/* Navigation Buttons */}
            {[
              { name: 'Home', icon: Home, page: 'home' },
              { name: 'Books', icon: BookOpen, page: 'books' },
              { name: 'Forum', icon: MessageSquare, page: 'forum' },
              { name: 'Quizzes', icon: Lightbulb, page: 'quizzes' },
              { name: 'Flashcards', icon: BookOpen, page: 'flashcards' },
              { name: 'Journey', icon: Compass, page: 'journey' },
              { name: 'Pathways', icon: Award, page: 'pathways' },
              { name: 'Community', icon: Users, page: 'community' },
              { name: 'Personalize', icon: Palette, page: 'personalization' },
              { name: 'Search', icon: Search, page: 'search' },
              { name: 'Upload', icon: UploadCloud, page: 'upload' },
            ].map((item) => (
              <motion.button
                key={item.page}
                onClick={() => setActivePage(item.page)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300
                  ${activePage === item.page ? `${currentTheme.buttonActiveBg} ${currentTheme.buttonActiveText || 'text-white'} shadow-lg` : `${currentTheme.buttonInactiveBg} ${currentTheme.buttonInactiveText} ${currentTheme.buttonHoverBg} ${currentTheme.buttonHoverText}`}
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.name}</span>
              </motion.button>
            ))}
          </nav>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 flex items-center justify-center relative">
          {/* Render the active page content */}
          {renderContent()}
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${currentTheme.footerBg} p-4 shadow-lg rounded-t-xl mx-4 mb-4 text-center ${currentTheme.buttonInactiveText} text-sm`}
        >
          <p>&copy; 2025 New Christian Digital Library. All rights reserved.</p>
          {isAuthReady && (
            <p className="mt-2 text-xs">
              User ID: <span className={`font-mono ${currentTheme.buttonInactiveText} break-all`}>{userId}</span> (App ID: <span className={`font-mono ${currentTheme.buttonInactiveText}`}>{appId}</span>)
            </p>
          )}
        </motion.footer>
      </div>
    </ThemeContext.Provider>
  );
}

// --- Page Components ---

// Home Page Component
const HomePage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden`}
    >
      {/* CSS-based Guiding Light */}
      <div className="absolute inset-0 z-0 opacity-20 flex items-center justify-center">
        <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${theme.guidingLightFrom} ${theme.guidingLightTo} shadow-inner-xl animate-pulse-slow`}
             style={{
               boxShadow: theme.guidingLightShadow,
               animation: 'pulse-slow 4s infinite alternate'
             }}>
        </div>
      </div>
      {/* Add custom CSS for pulse-slow animation */}
      <style>{`
        @keyframes pulse-slow {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.2; }
        }
      `}</style>

      <div className="relative z-10">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`text-5xl font-extrabold ${theme.secondaryAccent} mb-6 drop-shadow-lg`}
        >
          Welcome to the New Christian Digital Library
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className={`text-xl ${theme.featureCardText} mb-8 max-w-2xl mx-auto`}
        >
          Discover spiritual wisdom, engage in fellowship, and deepen your understanding of faith through our curated collection.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {/* Feature Cards updated for Christian theme */}
          <FeatureCard icon={BookOpen} title="Explore Scripture" description="Dive into biblical texts and commentaries." />
          <FeatureCard icon={MessageSquare} title="Join Fellowship" description="Connect and share insights with others." />
          <FeatureCard icon={Lightbulb} title="Grow in Wisdom" description="Engage with quizzes and guided reflections." />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      className={`${theme.featureCardBg} p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-xs transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-transparent ${theme.featureCardBorderHover}`}
      whileHover={{ y: -5 }}
    >
      <Icon className={`w-12 h-12 ${theme.featureCardIcon} mb-4 drop-shadow-md`} />
      <h3 className={`text-2xl font-semibold ${theme.text} mb-2`}>{title}</h3>
      <p className={`${theme.featureCardText}`}>{description}</p>
    </motion.div>
  );
};

// Placeholder Page Components (Updated for Christian theme)
const BooksPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>The Wisdom Codex</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Explore our curated collection of Christian literature and resources. (Coming Soon!)</p>
      <BookOpen className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const ForumPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>The Fellowship Hearth</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Share your reflections and engage in meaningful discussions. (Coming Soon!)</p>
      <MessageSquare className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const QuizzesPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Guided Meditations</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Test your understanding and deepen your spiritual insights. (Coming Soon!)</p>
      <Lightbulb className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const FlashcardsPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Verse Flashcards</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Memorize key scriptures and concepts with interactive cards. (Coming Soon!)</p>
      <BookOpen className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const SearchPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Seek Truth</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Find the exact biblical passage or theological topic you're seeking. (Coming Soon!)</p>
      <Search className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const UploadPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Contribute Wisdom</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Admins can add new resources to the library here. (Coming Soon!)</p>
      <UploadCloud className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

// --- New Feature Placeholder Pages ---

const ReadingJourneyPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Your Reading Journey</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Track your spiritual growth, earn achievements, and review your reading journal. (Coming Soon!)</p>
      <Compass className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const PathwaysPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Pathways of Knowledge</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Discover curated reading plans and personalized recommendations for spiritual exploration. (Coming Soon!)</p>
      <Award className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const CommunityPage = () => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Community & Study Circles</h2>
      <p className={`text-lg ${theme.featureCardText}`}>Collaborate with fellow believers, share insights, and join private study groups. (Coming Soon!)</p>
    <Users className={`w-24 h-24 ${theme.featureCardIcon} mx-auto mt-8`} />
    </motion.div>
  );
};

const PersonalizationPage = ({ switchTheme, currentThemeName }) => {
  const theme = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-8 ${theme.cardBg} rounded-3xl shadow-2xl max-w-4xl w-full`}
    >
      <h2 className={`text-4xl font-bold ${theme.secondaryAccent} mb-4`}>Personalize Your Archive</h2>
      <p className={`text-lg ${theme.featureCardText} mb-8`}>Customize your library experience with different themes.</p>

      <div className="flex justify-center gap-6 flex-wrap">
        {Object.keys(themes).map((key) => (
          <motion.button
            key={key}
            onClick={() => switchTheme(key)}
            className={`flex flex-col items-center p-4 rounded-xl shadow-lg transition-all duration-300
              ${currentThemeName === themes[key].name ? 'ring-4 ring-yellow-500 transform scale-105' : 'hover:scale-105'}
              ${themes[key].featureCardBg.replace('bg-opacity-70', 'bg-opacity-90')} ${themes[key].text}`}
            whileHover={{ y: -5 }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2
              ${themes[key].guidingLightFrom.replace('from-', 'bg-gradient-to-br from-')} ${themes[key].guidingLightTo.replace('to-', 'to-')}`}
              style={{ boxShadow: themes[key].guidingLightShadow }}
            >
              {key === 'christian' && <BookOpen className="w-8 h-8 text-white" />}
              {key === 'dark' && <Moon className="w-8 h-8 text-white" />}
              {key === 'light' && <Sun className="w-8 h-8 text-white" />}
              {key === 'blackGrayWhite' && <Palette className="w-8 h-8 text-white" />}
            </div>
            <span className="font-semibold mt-2">{themes[key].name}</span>
          </motion.button>
        ))}
      </div>
      <p className={`text-sm ${theme.featureCardText} mt-8`}>More personalization options coming soon!</p>
    </motion.div>
  );
};


// Render the App component
// The Canvas environment is expected to handle the root rendering.
// This component should be exported as default for the environment to pick it up.
export default App;

// Add Inter font to the document head and Tailwind CSS CDN
// These are typically handled by the environment's build process or directly in index.html
// However, if the environment requires them to be injected by the component,
// they should be placed outside the default export or handled via a dedicated script.
// For now, keeping them here as a fallback, but they might be redundant.
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

const tailwindScript = document.createElement('script');
tailwindScript.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(tailwindScript);

const tailwindConfigScript = document.createElement('script');
tailwindConfigScript.innerHTML = `
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
        },
        colors: {
          // Christian Theme Colors
          'blue-950': '#0A0A2A',
          'blue-900': '#1A1A4A',
          'blue-800': '#2A2A6A',
          'blue-700': '#3A3A8A',
          'blue-100': '#DDEEFF',
          'yellow-100': '#FFFDD0',
          'yellow-200': '#FFECB3',
          'yellow-300': '#FFD700',
          'yellow-400': '#FFC107',
          'yellow-500': '#FFB300',
          'yellow-600': '#FFA000',

          // Dark Theme Colors
          'gray-950': '#0A0A0A',
          'gray-900': '#1A1A1A',
          'gray-800': '#2A2A2A',
          'gray-700': '#3A3A3A',
          'gray-600': '#4A4A4A',
          'gray-500': '#5A5A5A',
          'gray-400': '#6A6A6A',
          'gray-300': '#7A7A7A',
          'gray-200': '#8A8A8A',
          'purple-700': '#6B2FA7',
          'purple-800': '#5B2A97',
          'purple-400': '#A020F0',
          'purple-500': '#8A2BE2',

          // Light Theme Colors
          'gray-50': '#F9FAFB',
          'gray-100': '#F3F4F6',
          'gray-200': '#E5E7EB',
          'gray-700': '#374151',
          'gray-800': '#1F2937',
          'blue-300': '#93C5FD',
          'blue-500': '#3B82F6',
          'blue-600': '#2563EB',
          'blue-700': '#1D4ED8',
        }
      },
    },
  };
`;
document.head.appendChild(tailwindConfigScript);
