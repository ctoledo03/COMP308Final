import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css';

const VOLUNTEER_FOR_REQUEST = gql`
  mutation Volunteer($helpRequestId: ID!) {
    volunteer(helpRequestId: $helpRequestId)
  }
`;

const EDIT_HELP_REQUEST = gql`
  mutation EditHelpRequest($id: ID!, $title: String, $description: String, $location: String, $isResolved: Boolean) {
    editHelpRequest(id: $id, title: $title, description: $description, location: $location, isResolved: $isResolved)
  }
`;

// Calculate impact score based on help request
const calculateImpactScore = (request) => {
  // Base score
  let score = 10;
  
  // Add points for volunteers
  score += (request.volunteers?.length || 0) * 5;
  
  // Add points for description length (encourages detailed requests)
  score += Math.min(20, Math.floor(request.description.length / 20));
  
  // Bonus for providing location
  if (request.location && request.location.trim() !== '') {
    score += 5;
  }
  
  // Resolution status affects score
  if (request.isResolved) {
    score += 20; // Bonus for resolved issues
  }
  
  return score;
};

// Helper function to get karma badge based on score
const getKarmaBadge = (score) => {
  if (score >= 50) return { icon: '🔆', label: 'High Impact', color: 'text-yellow-400' };
  if (score >= 30) return { icon: '✨', label: 'Growing Impact', color: 'text-blue-400' };
  return { icon: '🌱', label: 'New Help Request', color: 'text-green-400' };
};

// Individual HelpRequest component
const HelpRequest = ({ request, onEdit, onDelete, currentUser, refetch, addRewardPoints }) => {
    const [isVolunteering, setIsVolunteering] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [rewardText, setRewardText] = useState('');
    const [volunteersExpanded, setVolunteersExpanded] = useState(false);
    
    // Animation state for activity effects
    const [pulseEffect, setPulseEffect] = useState(false);
    
    // Calculate karma/impact score
    const impactScore = calculateImpactScore(request);
    const karmaBadge = getKarmaBadge(impactScore);
    
    // Check if current user is already volunteering
    const isUserVolunteering = request.volunteers?.some(v => v === currentUser);
    
    // Calculate urgency based on creation date (more recent = more urgent)
    const requestDate = new Date(request.createdAt);
    const daysSinceCreation = Math.floor((new Date() - requestDate) / (1000 * 60 * 60 * 24));
    const urgency = Math.max(0, 5 - daysSinceCreation); // 5 to 0 scale, higher is more urgent
    
    const [volunteer] = useMutation(VOLUNTEER_FOR_REQUEST, {
        onCompleted: () => {
            refetch();
            triggerReward("You volunteered! +25 pts 🎉");
            addRewardPoints?.(25); // Add points to user's total if function exists
            setIsVolunteering(false);
        },
        onError: (error) => {
            alert(error.message);
            setIsVolunteering(false);
        }
    });

    const [toggleStatus] = useMutation(EDIT_HELP_REQUEST, {
        onCompleted: () => {
            refetch();
            if (!request.isResolved) {
                triggerReward("Request resolved! +30 pts 🏆");
                addRewardPoints?.(30);
                setPulseEffect(true);
            }
        },
        onError: (error) => {
            alert("You can only change the status of your own help requests! " + error);
        }
    });

    // Reset pulse effect after animation completes
    useEffect(() => {
        if (pulseEffect) {
            const timer = setTimeout(() => setPulseEffect(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [pulseEffect]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this help request?')) {
            onDelete(request.id);
        }
    };

    const triggerReward = (text) => {
        setRewardText(text);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 2000);
    };

    const handleVolunteer = async () => {
        setIsVolunteering(true);
        try {
            await volunteer({ variables: { helpRequestId: request.id } });
        } catch (error) {
            console.error('Error volunteering:', error);
        }
    };

    const handleStatusToggle = async () => {
        try {
            await toggleStatus({
                variables: {
                  id: request.id,
                  title: request.title,
                  description: request.description,
                  location: request.location,
                  isResolved: !request.isResolved
                }
            });
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <motion.div 
            className={`bg-gray-800 rounded-lg shadow-lg p-6 mb-4 text-white relative border-l-4 
                ${request.isResolved ? 'border-green-500' : urgency >= 4 ? 'border-red-500' : 'border-blue-500'}
                ${pulseEffect ? 'animate-pulse' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Karma Badge */}
            <div className={`absolute top-3 right-3 flex items-center ${karmaBadge.color} text-sm font-medium`}>
                <span className="mr-1">{karmaBadge.icon}</span>
                <span>{karmaBadge.label}</span>
                <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {impactScore} pts
                </span>
            </div>

            {/* Reward Animation */}
            <AnimatePresence>
                {showReward && (
                    <motion.div 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-full z-20 whitespace-nowrap"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                    >
                        {rewardText}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Urgency indicator */}
            {!request.isResolved && (
                <div className="mb-3 flex items-center">
                    <span className="text-sm font-medium mr-2">Urgency:</span>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <span 
                                key={i} 
                                className={`h-3 w-3 rounded-full mx-0.5 ${i < urgency ? 'bg-red-500' : 'bg-gray-600'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold mb-2 pr-24">{request.title}</h2>
            <h2 className="text-gray-300 mb-4">{request.description}</h2>
            
            {request.location && (
                <div className="flex items-center text-gray-300 mb-4">
                    <span className="mr-2">📍</span>
                    <p>{request.location}</p>
                </div>
            )}
            
            {/* Timeline/Age indicator */}
            <div className="mb-4">
                <p className="text-xs text-gray-400">
                    Posted {daysSinceCreation === 0 ? 'today' : `${daysSinceCreation} days ago`}
                </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col mb-2 mr-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStatusToggle}
                        className={`px-4 py-2 rounded font-medium ${
                            request.isResolved 
                                ? 'bg-gray-600 hover:bg-red-700 text-gray-200' 
                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                        } transition-all duration-300 flex items-center`}
                    >
                        <span className="mr-1">
                            {request.isResolved ? '✓ Resolved' : '⟳ Mark Resolved'}
                        </span>
                        {!request.isResolved && <span className="text-xs ml-1">+30 pts</span>}
                    </motion.button>
                    
                    {/* Volunteers section with expand/collapse */}
                    <div className="mt-3">
                        <button 
                            onClick={() => setVolunteersExpanded(!volunteersExpanded)}
                            className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                            <span className="mr-1">
                                {volunteersExpanded ? '▼' : '►'}
                            </span>
                            Volunteers: {request.volunteers?.length || 0}
                        </button>
                        
                        {volunteersExpanded && request.volunteers && request.volunteers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 pl-4 border-l border-gray-600"
                            >
                                {request.volunteers.map((volunteer, i) => (
                                    <div key={i} className="text-sm text-gray-300 py-1 flex items-center">
                                        <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">
                                            {volunteer.substring(0, 2).toUpperCase()}
                                        </span>
                                        {volunteer}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
                
                <div className="flex space-x-2">
                    {currentUser !== request.author && !request.isResolved && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleVolunteer}
                            disabled={isVolunteering || isUserVolunteering || request.isResolved}
                            className={`px-4 py-2 rounded font-medium flex items-center
                                ${isUserVolunteering 
                                    ? 'bg-blue-700 text-white cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                                } transition-all duration-300`}
                        >
                            {isVolunteering ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : isUserVolunteering ? (
                                <span className="flex items-center">
                                    <span className="mr-1">✓</span> Volunteered
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <span className="mr-1">🤝</span> Volunteer <span className="text-xs ml-1">+25 pts</span>
                                </span>
                            )}
                        </motion.button>
                    )}
                    
                    {currentUser === request.author && (
                        <div className="space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onEdit(request)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-transform"
                            >
                                Edit
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-transform"
                            >
                                Delete
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HelpRequest;