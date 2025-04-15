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

        {/* Navbar */}
        <nav className="bg-gray-800 p-4 shadow-lg rounded-lg mb-6">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Business Hub</h1>
            <div className="space-x-4">
              <button
                className={`px-4 py-2 rounded text-white ${selectedPage === "BusinessListings" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => {
                  setSelectedPage("BusinessListings");
                  addNotification("Business Listings loaded! 📋");
                }}
              >
                Business Listings
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${selectedPage === "BusinessDeals" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => {
                  setSelectedPage("BusinessDeals");
                  addNotification("Business Deals loaded! 💼");
                }}
              >
                Business Deals
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* User Stats Bar */}
        <div className="bg-gray-700 p-4 rounded-lg mb-6 flex items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {userStats.icon}
            </div>
            <div className="ml-3">
              <p className="text-white font-bold">{userStats.title}</p>
              <p className="text-sm text-gray-300">Level {userStats.level}</p>
            </div>
          </div>
          <div className="flex-1 mx-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{userStats.points} pts</span>
              <span>{userStats.nextLevelPoints} pts</span>
            </div>
            <div className="w-full bg-gray-600 h-2 rounded-full">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${userStats.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div className="text-yellow-400">
            <span className="mr-1">🌟</span>
            <span className="font-bold">{userStats.points} pts</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex justify-center items-center p-6">
          {selectedPage === "BusinessListings" ? (
            <BusinessListings me={me} addPoints={addPoints} />
          ) : (
            <BusinessDeals me={me} addPoints={addPoints} />
          )}
        </div>
      </div>
    </ApolloProvider>
  );
};

export default BusinessDashboard;