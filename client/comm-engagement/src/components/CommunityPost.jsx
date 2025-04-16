import React, { useState } from 'react';

// This is the presentation component
const CommunityPost = ({ post, onEdit, onDelete, currentUser }) => {
    // Gamification state
    const [likes, setLikes] = useState(post.likes || Math.floor(Math.random() * 50));
    const [hasLiked, setHasLiked] = useState(false);
    const [showReaction, setShowReaction] = useState(false);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            onDelete(post.id);
        }
    };

    const handleLike = () => {
        if (!hasLiked) {
            setLikes(prev => prev + 1);
            setHasLiked(true);
            setShowReaction(true);
            setTimeout(() => setShowReaction(false), 1000);
        } else {
            setLikes(prev => prev - 1);
            setHasLiked(false);
        }
    };

    // Calculate engagement score
    const engagementScore = Math.min(100, Math.floor((likes * 5) + (post.comments?.length || 0) * 10));
    
    // Determine post quality badge based on engagement
    const getQualityBadge = () => {
        if (engagementScore >= 80) return { icon: '🔥', text: 'Trending', color: 'text-orange-400' };
        if (engagementScore >= 50) return { icon: '⭐', text: 'Popular', color: 'text-yellow-400' };
        if (engagementScore >= 30) return { icon: '👍', text: 'Quality', color: 'text-blue-400' };
        return null;
    };

    const badge = getQualityBadge();

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4 text-white border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 relative">
            {/* Quality Badge (if applicable) */}
            {badge && (
                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full ${badge.color} bg-gray-900 text-xs font-bold flex items-center`}>
                    <span className="mr-1">{badge.icon}</span> {badge.text}
                </div>
            )}

            {/* Post Content */}
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-300 mb-4">{post.content}</p>
            
            {/* Engagement Stats */}
            <div className="flex items-center mb-3 space-x-4">
                {/* Like Button */}
                <button 
                    onClick={handleLike} 
                    className={`flex items-center space-x-1 ${hasLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-400 transition-colors`}
                >
                    <span className="text-xl">{hasLiked ? '❤️' : '🤍'}</span>
                    <span>{likes}</span>
                </button>
                
                {/* Comment Count */}
                <div className="flex items-center space-x-1 text-gray-400">
                    <span className="text-xl">💬</span>
                    <span>{post.comments?.length || 0}</span>
                </div>
                
                {/* Engagement Score Bar */}
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                            engagementScore > 70 ? 'bg-green-500' : 
                            engagementScore > 40 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${engagementScore}%` }}
                    />
                </div>
            </div>
            
            {/* Animation for like */}
            {showReaction && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce">
                    ❤️
                </div>
            )}

            {post.aiSummary && (
                    <div className="text-sm text-gray-300 mt-2 italic">
                    <p><span className="font-bold text-white">Summary:</span> {post.aiSummary}</p>
                    </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Category: </span>
                    <span className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300">{post.category}</span>
                    {post.tags && post.tags.map(tag => (
                        <span key={tag} className="bg-blue-900 text-xs px-2 py-1 rounded-full text-blue-300">#{tag}</span>
                    ))}
                </div>
                
                {currentUser == post.author && (
                    <div className="space-x-2">
                        <button
                            onClick={() => onEdit(post)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded hover:scale-105 active:scale-95 transition-transform"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded hover:scale-105 active:scale-95 transition-transform"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                )}
            </div>
        

            {/* User contribution badge */}
            {post.author && (
                <div className="absolute top-6 right-6 flex items-center space-x-1">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        {post.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-400">{post.authorLevel && `Lvl ${post.authorLevel}`}</div>
                </div>
            )}
        </div>
    );
};

export default CommunityPost;