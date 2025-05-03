import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import '../index.css';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import HelpRequest from './HelpRequest';

const GET_HELP_REQUESTS = gql`
  query HelpRequests {
    helpRequests {
      id
      author
      title
      description
      location
      isResolved
      volunteers
      createdAt
      updatedAt
    }
  }
`;

const ADD_HELP_REQUEST = gql`
  mutation AddHelpRequest($title: String!, $description: String!, $location: String) {
    addHelpRequest(title: $title, description: $description, location: $location) {
      id
      title
      description
      location
      createdAt
    }
  }
`;

const EDIT_HELP_REQUEST = gql`
  mutation EditHelpRequest($id: ID!, $title: String, $description: String, $location: String, $isResolved: Boolean) {
    editHelpRequest(id: $id, title: $title, description: $description, location: $location, isResolved: $isResolved)
  }
`;

const DELETE_HELP_REQUEST = gql`
  mutation DeleteHelpRequest($id: ID!) {
    deleteHelpRequest(id: $id)
  }
`;  

// User levels and titles
const HELPER_LEVELS = [
  { level: 1, points: 0, title: "Community Novice", icon: "🌱" },
  { level: 2, points: 50, title: "Good Samaritan", icon: "🤲" },
  { level: 3, points: 150, title: "Local Hero", icon: "🦸" },
  { level: 4, points: 300, title: "Community Champion", icon: "🏆" },
  { level: 5, points: 500, title: "Legendary Helper", icon: "⭐" },
];

// Achievements list
const ACHIEVEMENTS = [
  { id: "first_request", name: "First Step", description: "Create your first help request", icon: "🚶", points: 10 },
  { id: "first_volunteer", name: "Helping Hand", description: "Volunteer for your first request", icon: "🤝", points: 15 },
  { id: "resolved_request", name: "Problem Solver", description: "Resolve a help request", icon: "✅", points: 20 },
  { id: "detail_oriented", name: "Detail Oriented", description: "Create a detailed help request with location", icon: "📝", points: 10 },
  { id: "super_helper", name: "Super Helper", description: "Volunteer for 5 different requests", icon: "🦸", points: 50 },
];

// Main HelpRequest list component
const HelpRequestList = ({ me }) => {
    const { loading, error, data, refetch } = useQuery(GET_HELP_REQUESTS);
    console.log(error);
    console.log(data);
    
    // Gamification state
    const [userPoints, setUserPoints] = useState(() => {
        return parseInt(localStorage.getItem('help_points') || '0');
    });
    const [userAchievements, setUserAchievements] = useState(() => {
        return JSON.parse(localStorage.getItem('help_achievements') || '[]');
    });
    const [showReward, setShowReward] = useState(false);
    const [rewardText, setRewardText] = useState("");
    const [showAchievement, setShowAchievement] = useState(false);
    const [lastAchievement, setLastAchievement] = useState(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(null);
    
    // Get current user level based on points
    const getCurrentLevel = (points) => {
        for (let i = HELPER_LEVELS.length - 1; i >= 0; i--) {
            if (points >= HELPER_LEVELS[i].points) {
                return HELPER_LEVELS[i];
            }
        }
        return HELPER_LEVELS[0];
    };
    
    const userLevel = getCurrentLevel(userPoints);
    
    // Calculate progress to next level
    const getNextLevel = () => {
        const currentLevelIndex = HELPER_LEVELS.findIndex(l => l.level === userLevel.level);
        return HELPER_LEVELS[currentLevelIndex + 1] || userLevel;
    };
    
    const nextLevel = getNextLevel();
    const levelProgress = userLevel === nextLevel ? 100 : 
        ((userPoints - userLevel.points) / (nextLevel.points - userLevel.points)) * 100;
    
    // Mutations with rewards
    const [addRequest] = useMutation(ADD_HELP_REQUEST, { 
        onCompleted: (data) => {
            triggerReward("Help Request Posted! +20 pts");
            addPoints(20);
            refetch();
            
            // Check for achievements
            checkAchievement("first_request");
            
            // Check for detail-oriented achievement (has location)
            if (form.location && form.location.trim() !== '') {
                checkAchievement("detail_oriented");
            }
        } 
    });
    
    const [editRequest] = useMutation(EDIT_HELP_REQUEST, { 
        onCompleted: () => {
            triggerReward("Request Updated! +5 pts");
            addPoints(5);
            refetch();
            setEditingId(null);
            setForm({ title: '', description: '', location: '' });
        },
        onError: (error) => {
            alert(error.message);
            setEditingId(null);
            setForm({ title: '', description: '', location: '' });
        }
    });
    
    const [deleteRequest] = useMutation(DELETE_HELP_REQUEST, { 
        onCompleted: () => {
            triggerReward("Request Deleted");
            refetch();
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const [form, setForm] = useState({ title: '', description: '', location: '' });
    const [editingId, setEditingId] = useState(null);
    
    // Track volunteering count for achievements
    useEffect(() => {
        if (!data) return;
        
        const volunteeredCount = data.helpRequests.filter(request => 
            request.volunteers && request.volunteers.includes(me.id)
        ).length;
        
        if (volunteeredCount >= 1) {
            checkAchievement("first_volunteer");
        }
        
        if (volunteeredCount >= 5) {
            checkAchievement("super_helper");
        }
        
        const resolvedOwnRequests = data.helpRequests.filter(request => 
            request.author === me.id && request.isResolved
        ).length;
        
        if (resolvedOwnRequests >= 1) {
            checkAchievement("resolved_request");
        }
    }, [data, me.id]);
    
    // Save points to localStorage when they change
    useEffect(() => {
        localStorage.setItem('help_points', userPoints.toString());
        
        // Check for level up
        const newUserLevel = getCurrentLevel(userPoints);
        if (newUserLevel.level > userLevel.level) {
            setNewLevel(newUserLevel);
            setShowLevelUp(true);
            triggerConfetti();
            setTimeout(() => setShowLevelUp(false), 3000);
        }
    }, [userPoints]);
    
    // Save achievements to localStorage when they change
    useEffect(() => {
        localStorage.setItem('help_achievements', JSON.stringify(userAchievements));
    }, [userAchievements]);

    const addPoints = (points) => {
        setUserPoints(prev => prev + points);
    };

    const triggerReward = (text) => {
        setRewardText(text);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 2000);
    };
    
    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };
    
    const checkAchievement = (achievementId) => {
        if (userAchievements.includes(achievementId)) return;
        
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) {
            setUserAchievements(prev => [...prev, achievementId]);
            setLastAchievement(achievement);
            setShowAchievement(true);
            addPoints(achievement.points);
            setTimeout(() => setShowAchievement(false), 3000);
            triggerConfetti();
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await editRequest({
                    variables: {
                        id: editingId,
                        title: form.title,
                        description: form.description,
                        location: form.location
                    }
                });
            } else {
                await addRequest({
                    variables: form
                });
                setForm({ title: '', description: '', location: '' });
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const handleEdit = (request) => {
        setEditingId(request.id);
        setForm({
            title: request.title,
            description: request.description,
            location: request.location || ''
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteRequest({ variables: { id } });
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    };

    // Filter options for requests
    const [filter, setFilter] = useState('all');
    
    // Get filtered requests
    const getFilteredRequests = () => {
        if (!data?.helpRequests) return [];
        
        switch (filter) {
            case 'open':
                return data.helpRequests.filter(req => !req.isResolved);
            case 'resolved':
                return data.helpRequests.filter(req => req.isResolved);
            case 'mine':
                return data.helpRequests.filter(req => req.author === me.id);
            case 'volunteered':
                return data.helpRequests.filter(req => 
                    req.volunteers && req.volunteers.includes(me.id)
                );
            default:
                return data.helpRequests;
        }
    };

    const filteredRequests = getFilteredRequests();

    if (loading) return <p className="text-white">Loading...</p>;
    if (error) return <p className="text-white">Error loading help requests.</p>;

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg relative">
            {/* Level Up Animation */}
            <AnimatePresence>
                {showLevelUp && newLevel && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
                    >
                        <div className="bg-gray-800 border-4 border-yellow-500 rounded-lg p-8 text-center">
                            <h2 className="text-4xl text-yellow-400 font-bold mb-4">LEVEL UP!</h2>
                            <div className="text-6xl mb-4">{newLevel.icon}</div>
                            <p className="text-2xl text-white mb-2">You reached Level {newLevel.level}</p>
                            <p className="text-xl text-gray-300">{newLevel.title}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Achievement Unlocked Animation */}
            <AnimatePresence>
                {showAchievement && lastAchievement && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg shadow-lg z-50"
                    >
                        <h3 className="text-xl font-bold text-white mb-1">Achievement Unlocked!</h3>
                        <div className="flex items-center">
                            <div className="text-3xl mr-3">{lastAchievement.icon}</div>
                            <div>
                                <p className="font-bold text-white">{lastAchievement.name}</p>
                                <p className="text-sm text-gray-200">{lastAchievement.description}</p>
                                <p className="text-sm text-yellow-300 font-bold">+{lastAchievement.points} pts</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Point Reward Animation */}
            <AnimatePresence>
                {showReward && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-6 right-6 bg-yellow-500 text-black font-bold py-1 px-3 rounded-full z-10"
                    >
                        {rewardText}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* User Stats Bar */}
            <div className="bg-gray-700 p-4 rounded-lg mb-6 flex items-center">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {userLevel.icon}
                    </div>
                    <div className="ml-3">
                        <p className="text-white font-bold">{userLevel.title}</p>
                        <p className="text-sm text-gray-300">Level {userLevel.level}</p>
                    </div>
                </div>
                
                <div className="flex-1 mx-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{userPoints} pts</span>
                        <span>{nextLevel.points} pts</span>
                    </div>
                    <div className="w-full bg-gray-600 h-2 rounded-full">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${levelProgress}%` }}
                        />
                    </div>
                </div>
                
                <div className="text-yellow-400">
                    <span className="mr-1">🌟</span>
                    <span className="font-bold">{userPoints} pts</span>
                </div>
            </div>
            
            <div className="flex flex-wrap">
                {/* Main column */}
                <div className="w-full lg:w-2/3 lg:pr-6">
                    <h1 className="text-3xl font-bold text-center mb-6 text-white">Help Requests</h1>
                    
                    {/* Filter tabs */}
                    <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={() => setFilter('all')} 
                            className={`flex-1 py-2 px-4 rounded-md transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('open')} 
                            className={`flex-1 py-2 px-4 rounded-md transition ${filter === 'open' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            Open
                        </button>
                        <button 
                            onClick={() => setFilter('resolved')} 
                            className={`flex-1 py-2 px-4 rounded-md transition ${filter === 'resolved' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            Resolved
                        </button>
                        <button 
                            onClick={() => setFilter('mine')} 
                            className={`flex-1 py-2 px-4 rounded-md transition ${filter === 'mine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            My Requests
                        </button>
                        <button 
                            onClick={() => setFilter('volunteered')} 
                            className={`flex-1 py-2 px-4 rounded-md transition ${filter === 'volunteered' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            Volunteered
                        </button>
                    </div>

                    {/* List of Help Requests */}
                    <div className="space-y-4">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <HelpRequest
                                    key={request.id}
                                    request={request}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    refetch={refetch}
                                    currentUser={me.id}
                                    addRewardPoints={addPoints}
                                />
                            ))
                        ) : (
                            <div className="bg-gray-700 p-6 rounded-lg text-center text-gray-300">
                                No help requests found. {filter !== 'all' && "Try changing the filter or create a new request."}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Sidebar with form and achievements */}
                <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
                    {/* Form */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 space-y-4 bg-gray-700 p-6 rounded-lg shadow-md"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingId ? "Edit Request" : "Create New Request"}
                            {!editingId && <span className="text-sm text-green-400 ml-2">+20 pts</span>}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Title"
                                className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Description"
                                required
                                rows="4"
                                className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="relative">
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="Location (optional)"
                                    className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {!form.location && (
                                    <span className="absolute right-3 top-3 text-xs text-green-400">+10 pts bonus!</span>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition"
                            >
                                {editingId ? "Update Request" : "Submit Request"}
                            </motion.button>
                        </form>
                    </motion.div>
                    
                    {/* Achievements */}
                    <div className="bg-gray-700 rounded-lg p-6 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <span className="text-yellow-400 mr-2">🏆</span> Achievements
                        </h3>
                        
                        <div className="space-y-3">
                            {ACHIEVEMENTS.map(achievement => {
                                const isUnlocked = userAchievements.includes(achievement.id);
                                
                                return (
                                    <div 
                                        key={achievement.id} 
                                        className={`p-3 rounded-lg ${isUnlocked ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gray-800 opacity-75'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3 ${isUnlocked ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                                                {isUnlocked ? achievement.icon : '🔒'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{achievement.name}</p>
                                                <p className="text-xs text-gray-400">{achievement.description}</p>
                                            </div>
                                            <div className="text-yellow-400 text-sm font-bold">
                                                +{achievement.points}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Stats summary */}
                        <div className="mt-6 pt-4 border-t border-gray-600">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-800 p-2 rounded-lg">
                                    <div className="text-2xl text-blue-400">
                                        {data.helpRequests.filter(r => r.author === me.id).length}
                                    </div>
                                    <div className="text-xs text-gray-400">Requests Created</div>
                                </div>
                                <div className="bg-gray-800 p-2 rounded-lg">
                                    <div className="text-2xl text-green-400">
                                        {data.helpRequests.filter(r => r.volunteers && r.volunteers.includes(me.id)).length}
                                    </div>
                                    <div className="text-xs text-gray-400">Volunteered</div>
                                </div>
                                <div className="bg-gray-800 p-2 rounded-lg">
                                    <div className="text-2xl text-yellow-400">
                                        {data.helpRequests.filter(r => r.author === me.id && r.isResolved).length}
                                    </div>
                                    <div className="text-xs text-gray-400">Resolved</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpRequestList;