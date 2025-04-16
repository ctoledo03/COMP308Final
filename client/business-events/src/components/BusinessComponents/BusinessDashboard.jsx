import React, { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import BusinessListings from "./BusinessListings";
import BusinessDeals from "./BusinessDeals";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "http://localhost:4003/graphql",
  cache: new InMemoryCache(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gamification Levels
const BUSINESS_LEVELS = [
  { level: 1, points: 0, title: "Startup Explorer", icon: "🚀" },
  { level: 2, points: 50, title: "Deal Maker", icon: "🤝" },
  { level: 3, points: 150, title: "Business Strategist", icon: "📈" },
  { level: 4, points: 300, title: "Market Leader", icon: "🏆" },
  { level: 5, points: 500, title: "Industry Titan", icon: "⭐" },
];

// Calculate user stats
const calculateUserStats = () => {
  const businessPoints = parseInt(localStorage.getItem('business_points') || '0');
  const level = BUSINESS_LEVELS.find(l => businessPoints >= l.points) || BUSINESS_LEVELS[0];
  const nextLevel = BUSINESS_LEVELS.find(l => l.points > businessPoints) || level;
  const progress = nextLevel === level ? 100 : ((businessPoints - level.points) / (nextLevel.points - level.points)) * 100;

  return {
    points: businessPoints,
    level: level.level,
    title: level.title,
    icon: level.icon,
    progress,
    nextLevelPoints: nextLevel.points,
  };
};

const BusinessDashboard = ({ me }) => {
  const [selectedPage, setSelectedPage] = useState("BusinessListings");
  const [userStats, setUserStats] = useState(calculateUserStats());
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUserCard, setShowUserCard] = useState(false);
  

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      setUserStats(calculateUserStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addPoints = (points) => {
    const currentPoints = parseInt(localStorage.getItem('business_points') || '0');
    const newPoints = currentPoints + points;
    localStorage.setItem('business_points', newPoints.toString());
    setUserStats(calculateUserStats());

    // Check for level up
    const newStats = calculateUserStats();
    if (newStats.level > userStats.level) {
      setShowLevelUp(true);
      triggerConfetti();
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 4000);
  };

  const handleSwitchView = () => {
    window.dispatchEvent(new CustomEvent('requestSwitchView', { detail: { requestedView: 'community' } }));
  }

  const logout = () => {
    window.dispatchEvent(new CustomEvent('logoutSuccess', { detail: { isLoggedIn: false } }));
  };

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Notification System */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <AnimatePresence>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-gray-800 border-l-4 border-blue-500 text-white px-4 py-3 shadow-lg rounded-md"
              >
                {notification.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Level Up Animation */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            >
              <div className="bg-gray-800 border-4 border-yellow-500 rounded-lg p-8 text-center">
                <h2 className="text-4xl text-yellow-400 font-bold mb-4">LEVEL UP!</h2>
                <div className="text-6xl mb-4">{userStats.icon}</div>
                <p className="text-2xl text-white mb-2">You reached Level {userStats.level}</p>
                <p className="text-xl text-gray-300">{userStats.title}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Profile Card */}
        <AnimatePresence>
          {showUserCard && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 z-40 bg-gray-800 rounded-xl p-5 shadow-xl border border-blue-600 w-80"
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mr-3">
                  {me.username ? me.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{me.username || "User"}</h3>
                  <p className="text-blue-400 text-sm">{userStats.title}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Level {userStats.level}</span>
                  <span>{userStats.totalPoints}/{userStats.nextLevelPoints} points</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${userStats.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-yellow-400">{userStats.totalPoints}</p>
                  <p className="text-xs text-gray-300">Total Points</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-400">{userStats.achievements}</p>
                  <p className="text-xs text-gray-300">Achievements</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowUserCard(false)}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
              >
                Close
              </button>

              <button 
                onClick={() => handleSwitchView()}
                className="w-full py-2 mt-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
              >
                Community View
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navbar */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 shadow-xl border-b border-gray-700 sticky top-0 z-30"
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
              >
                Business Hub
              </motion.div>
              
              <div className="hidden md:flex space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    selectedPage === "CommunityPost" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPage("BusinessListings")}
                >
                  <span className="mr-2">📝</span> Business Listings
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    selectedPage === "HelpRequest" 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPage("BusinessDeals")}
                >
                  <span className="mr-2">🏷️</span> Business Deals
                </motion.button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* User Stats Overview */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserCard(!showUserCard)}
                className="flex items-center bg-gray-700 rounded-full px-3 py-1 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2">
                  {userStats.level}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs">{userStats.title}</p>
                  <p className="text-xs text-yellow-400 font-medium">{userStats.totalPoints} pts</p>
                </div>
                <div className="ml-2 text-xs">
                  <span className="text-yellow-400">
                    {showUserCard ? "▲" : "▼"}
                  </span>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }} 
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition shadow-lg"
                onClick={logout}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="flex-grow flex justify-center items-center p-6">
          {selectedPage === "BusinessListings" ? (
            <BusinessListings me={me} addPoints={addPoints} userStats={userStats} />
          ) : (
            <BusinessDeals me={me} addPoints={addPoints} userStats={userStats}/>
          )}
        </div>
      </div>
    </ApolloProvider>
  );
};

export default BusinessDashboard;