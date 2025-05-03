import React, { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import './index.css';

import CommunityPostList from "./components/CommunityPostList";
import HelpRequestList from "./components/HelpRequestList";
import BusinessDeals from "./components/BusinessDeals";
import CommunityEvents from "./components/CommunityEvents"
import ChatBox from "./components/Chatbox";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "https://communityengagement-commengmicroservice.onrender.com/graphql",
  cache: new InMemoryCache(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Combined user stats calculation
const calculateUserStats = () => {
  // Retrieve all gamification data
  const helpPoints = parseInt(localStorage.getItem('help_points') || '0');
  const chatXp = parseInt(localStorage.getItem('chat_xp') || '0');
  const communityXp = parseInt(localStorage.getItem('community_xp') || '0');
  
  // Community achievements
  const communityAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
  
  // Help achievements
  const helpAchievements = JSON.parse(localStorage.getItem('help_achievements') || '[]');
  
  // Combined stats
  const totalPoints = helpPoints + chatXp + communityXp;
  const totalAchievements = (communityAchievements.length + helpAchievements.length);
  
  // Calculate overall level (1-10 scale)
  const level = Math.max(1, Math.min(10, Math.floor(totalPoints / 100) + 1));
  
  // Get title based on level
  const titles = [
    "Newcomer", "Participant", "Helper", "Contributor", 
    "Trusted Member", "Community Leader", "Engagement Pro", 
    "Local Legend", "Community Champion", "Hub Master"
  ];
  
  return {
    totalPoints,
    level,
    title: titles[level - 1] || "Hub Master",
    achievements: totalAchievements,
    nextLevelPoints: level * 100,
    progress: (totalPoints % 100) / 100 * 100
  };
};

const App = ({ me }) => {
  const [selectedPage, setSelectedPage] = useState("CommunityPost");
  const [userStats, setUserStats] = useState(calculateUserStats());
  const [showUserCard, setShowUserCard] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dailyStreakClaimed, setDailyStreakClaimed] = useState(() => {
    const lastClaimDate = localStorage.getItem('last_daily_claim');
    return lastClaimDate === new Date().toDateString();
  });
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  
  // Track user activity for daily rewards
  useEffect(() => {
    // Update stats periodically
    const updateStats = () => {
      setUserStats(calculateUserStats());
    };
    
    // Set interval to check stats
    const interval = setInterval(updateStats, 10000); // every 10 seconds
    
    // Check for daily streak on load
    if (!dailyStreakClaimed) {
      const lastLogin = localStorage.getItem('last_login_date');
      const today = new Date().toDateString();
      
      // If last login was before today, show daily reward
      if (lastLogin !== today) {
        setShowDailyReward(true);
      }
    }
    
    // Set today as last login
    localStorage.setItem('last_login_date', new Date().toDateString());
    
    // Add navigation notification
    addNotification("Welcome to Community Hub! 👋");
    
    return () => clearInterval(interval);
  }, []);
  
  // Track page changes for gamification
  useEffect(() => {
    // Add notification based on page change
    if (selectedPage === "CommunityPost") {
      addNotification("Community Posts loaded!");
    } else if (selectedPage === "HelpRequest") {
      addNotification("Help Requests loaded!");
    } else if (selectedPage === "BusinessDeals") {
      addNotification("Business Deals Loaded!");
    } else if (selectedPage === "CommunityEvents") {
      addNotification("Community Events loaded!");
    }
    
  }, [selectedPage]);
  
  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 4000);
  };
  
  const claimDailyReward = () => {
    // Add points for daily login
    const dailyPoints = 25;
    const helpPoints = parseInt(localStorage.getItem('help_points') || '0');
    localStorage.setItem('help_points', (helpPoints + dailyPoints).toString());
    
    // Save claim status
    localStorage.setItem('last_daily_claim', new Date().toDateString());
    
    // Update UI
    setDailyStreakClaimed(true);
    setShowDailyReward(false);
    
    // Update stats
    setUserStats(calculateUserStats());
    
    // Add notification
    addNotification(`Daily login streak claimed! +${dailyPoints} pts 🎉`);
    
    // Celebration effect
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 }
    });
  };

  const logout = () => {
    window.dispatchEvent(new CustomEvent('logoutSuccess', { detail: { isLoggedIn: false } })); 
  }

  const handleSwitchView = () => {
    window.dispatchEvent(new CustomEvent('requestSwitchView', { detail: { requestedView: 'businessAndEvents' } }));
  }

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
        
        {/* Daily Reward Modal */}
        <AnimatePresence>
          {showDailyReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-800 rounded-xl p-8 max-w-md border-2 border-yellow-500"
              >
                <h2 className="text-2xl font-bold text-center mb-4">Daily Login Reward! 🎁</h2>
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl">
                    🔥
                  </div>
                </div>
                <p className="text-center mb-6">
                  Welcome back to Community Hub! Claim your daily reward to keep your streak going!
                </p>
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-yellow-400">+25 points</span>
                </div>
                <button
                  onClick={claimDailyReward}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-lg font-bold text-lg shadow-lg transform transition hover:scale-105 active:scale-95"
                >
                  Claim Reward
                </button>
              </motion.div>
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

              {me?.role !== 'resident' && (
                <button 
                  onClick={() => handleSwitchView()}
                  className="w-full py-2 mt-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
                >
                  Business/Events View
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navbar */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 shadow-xl border-b border-gray-700 sticky top-0 z-30"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
              >
                Community Hub
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
                  onClick={() => setSelectedPage("CommunityPost")}
                >
                  <span className="mr-2">📝</span> Community Posts
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    selectedPage === "HelpRequest" 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPage("HelpRequest")}
                >
                  <span className="mr-2">🤝</span> Help Requests
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    selectedPage === "CommunityPost" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPage("BusinessDeals")}
                >
                  <span className="mr-2">🏷️</span> Business Deals
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    selectedPage === "CommunityPost" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPage("CommunityEvents")}
                >
                  <span className="mr-2">📅</span> Community Events
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

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 flex justify-around z-30">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-lg ${
              selectedPage === "CommunityPost" 
                ? "bg-blue-600 text-white" 
                : "text-gray-400"
            }`}
            onClick={() => setSelectedPage("CommunityPost")}
          >
            <span className="text-xl">📝</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-lg ${
              selectedPage === "HelpRequest" 
                ? "bg-purple-600 text-white" 
                : "text-gray-400"
            }`}
            onClick={() => setSelectedPage("HelpRequest")}
          >
            <span className="text-xl">🤝</span>
          </motion.button>
        </div>

        {/* Main Content with Animation */}
        <div className={`max-w-6xl mx-auto py-6 px-4 pb-24 transition-all duration-300 ${ isChatOpen ? "mr-80" : "" }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {selectedPage === "CommunityPost" ? (
                <CommunityPostList me={me} />
              ) : selectedPage === "HelpRequest" ? (
                <HelpRequestList me={me} />
              ) : selectedPage === "BusinessDeals" ? (
                <BusinessDeals me={me} />
              ) : selectedPage === "CommunityEvents" ? (
                <CommunityEvents me={me} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chat Box */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(prev => !prev)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
        >
          💬
        </motion.button>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="z-50"
            >
              <ChatBox me={me} onClose={() => setIsChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ApolloProvider>
  );
}

export default App;