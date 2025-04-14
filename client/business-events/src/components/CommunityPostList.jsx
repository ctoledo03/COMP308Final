import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import CommunityPost from './CommunityPost';
import confetti from 'canvas-confetti';

const GET_COMMUNITY_POSTS = gql`
  query CommunityPosts {
    communityPosts {
      id
      author
      title
      content
      category
      createdAt
      updatedAt
    }
  }
`;

const ADD_COMMUNITY_POST = gql`
  mutation AddCommunityPost($title: String!, $content: String!, $category: String!) {
    addCommunityPost(title: $title, content: $content, category: $category) {
      id
      title
      content
      category
      createdAt
    }
  }
`;

const EDIT_COMMUNITY_POST = gql`
  mutation EditCommunityPost($id: ID!, $title: String, $content: String, $category: String) {
    editCommunityPost(id: $id, title: $title, content: $content, category: $category)
  }
`;

const DELETE_COMMUNITY_POST = gql`
  mutation DeleteCommunityPost($id: ID!) {
    deleteCommunityPost(id: $id)
  }
`;

// User levels and required XP
const levels = [
  { level: 1, xp: 0, title: "Newcomer" },
  { level: 2, xp: 50, title: "Contributor" },
  { level: 3, xp: 150, title: "Regular" },
  { level: 4, xp: 300, title: "Trusted" },
  { level: 5, xp: 500, title: "Expert" },
];

// Get level info based on XP
const getLevelInfo = (xp) => {
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || currentLevel;
      break;
    }
  }
  
  const progress = nextLevel === currentLevel ? 100 : 
    ((xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100;
    
  return { ...currentLevel, progress, nextLevelXp: nextLevel.xp };
};

const CommunityPostList = ({ me }) => {
  const { loading, error, data, refetch } = useQuery(GET_COMMUNITY_POSTS);
  const [addPost] = useMutation(ADD_COMMUNITY_POST, { 
    onCompleted: () => {
      showReward("Post Created! +20 XP");
      addXp(20);
      refetch();
    } 
  });

  const [editPost] = useMutation(EDIT_COMMUNITY_POST, { 
    onCompleted: () => {
      showReward("Post Updated! +5 XP");
      addXp(5);
      refetch();
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const [deletePost] = useMutation(DELETE_COMMUNITY_POST, { 
    onCompleted: () => {
      showReward("Post Deleted");
      refetch();
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  // Form state
  const [form, setForm] = useState({ title: '', content: '', category: 'news' });
  const [editingId, setEditingId] = useState(null);
  
  // Gamification state
  const [userXp, setUserXp] = useState(() => {
    return parseInt(localStorage.getItem('community_xp') || '0');
  });
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [achievements, setAchievements] = useState(() => {
    return JSON.parse(localStorage.getItem('achievements') || '[]');
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Current level info based on XP
  const levelInfo = getLevelInfo(userXp);
  
  // Update localStorage when XP changes
  useEffect(() => {
    localStorage.setItem('community_xp', userXp.toString());
    
    // Check for level up
    const newLevelInfo = getLevelInfo(userXp);
    if (newLevelInfo.level > levelInfo.level) {
      setShowLevelUp(true);
      triggerConfetti();
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [userXp]);

  // Save achievements to localStorage
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  const addXp = (points) => {
    setUserXp(prev => prev + points);
  };

  const showReward = (text) => {
    setRewardText(text);
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 3000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const unlockAchievement = (id, title, description, xpBonus = 10) => {
    if (!achievements.some(a => a.id === id)) {
      const newAchievement = { id, title, description, date: new Date() };
      setAchievements(prev => [...prev, newAchievement]);
      showReward(`Achievement Unlocked: ${title} +${xpBonus}XP`);
      addXp(xpBonus);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await editPost({
          variables: {
            id: editingId,
            title: form.title,
            content: form.content,
            category: form.category
          }
        });
        setEditingId(null);
      } else {
        await addPost({
          variables: form
        });
        
        // Check for achievements
        if (data?.communityPosts) {
          const userPosts = data.communityPosts.filter(post => post.author === me.id);
          if (userPosts.length === 0) {
            unlockAchievement("first_post", "First Post", "Create your first community post");
          }
          if (userPosts.length === 4) {
            unlockAchievement("frequent_poster", "Frequent Poster", "Create 5 community posts");
          }
        }
      }
      setForm({ title: '', content: '', category: 'news' });
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content, category: post.category });
  };

  const handleDelete = async (id) => {
    await deletePost({ variables: { id } });
  };

  // Calculate post quality score for leaderboard (simplified)
  const getPostScore = (post) => {
    const ageInHours = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60);
    const recencyBonus = Math.max(0, 24 - ageInHours) / 24;
    return (post.likes || 0) * 10 + (post.comments?.length || 0) * 15 + recencyBonus * 5;
  };

  // Sort posts by score for leaderboard
  const getTopPosts = () => {
    if (!data?.communityPosts) return [];
    return [...data.communityPosts]
      .map(post => ({ ...post, score: getPostScore(post) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-white">Error loading posts.</p>;

  const topPosts = getTopPosts();

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg relative">
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-800 border-4 border-yellow-500 rounded-lg p-8 text-center animate-bounce">
            <h2 className="text-4xl text-yellow-400 font-bold mb-4">LEVEL UP!</h2>
            <p className="text-2xl text-white mb-2">You reached Level {levelInfo.level}</p>
            <p className="text-xl text-gray-300">{levelInfo.title}</p>
          </div>
        </div>
      )}

      {/* XP Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-full animate-bounce z-50 shadow-lg">
          {rewardText}
        </div>
      )}

      {/* User Level Display */}
      <div className="flex items-center justify-between mb-6 bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
            {levelInfo.level}
          </div>
          <div>
            <h3 className="text-white font-bold">{me?.name || "Community Member"}</h3>
            <p className="text-gray-300 text-sm">{levelInfo.title}</p>
          </div>
        </div>
        
        <div className="flex-1 mx-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{userXp} XP</span>
            <span>{levelInfo.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-gray-600 h-2 rounded-full">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
        
        <div className="text-yellow-400">
          <span className="mr-1">✨</span>
          <span className="font-bold">{userXp} XP</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[300px]">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">Community Posts</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">
              {editingId ? "Edit Post" : "Create New Post"} 
              {!editingId && <span className="text-sm text-green-400 ml-2">+20 XP</span>}
            </h3>
            
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              required
              className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Content"
              required
              rows="4"
              className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="news">News</option>
              <option value="discussion">Discussion</option>
              <option value="question">Question</option>
              <option value="event">Event</option>
            </select>
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {editingId ? "Update Post" : "Create Post"}
            </button>
          </form>

          {/* List of Posts */}
          <div className="space-y-4">
            {data.communityPosts.map((post) => (
              <CommunityPost
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUser={me.id}
              />
            ))}
          </div>
        </div>

        {/* Sidebar with Leaderboard and Achievements */}
        <div className="w-80">
          {/* Top Posts Leaderboard */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-yellow-400 mr-2">🏆</span> Top Posts
            </h3>
            
            {topPosts.map((post, index) => (
              <div key={post.id} className="flex items-center mb-3 bg-gray-800 p-2 rounded">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2
                  ${index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-black' : 
                    'bg-yellow-700 text-white'}
                `}>
                  {index + 1}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-white font-medium truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">{post.author}</p>
                </div>
                <div className="text-xs px-2 py-1 bg-blue-900 rounded text-blue-200">
                  {Math.floor(post.score)} pts
                </div>
              </div>
            ))}
          </div>
          
          {/* Achievements */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-yellow-400 mr-2">🏅</span> Achievements
            </h3>
            
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="bg-gray-800 p-2 rounded flex items-center">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-xl mr-3">
                      {achievement.id === "first_post" ? "📝" : 
                       achievement.id === "frequent_poster" ? "✍️" : "🎯"}
                    </div>
                    <div>
                      <p className="text-white font-medium">{achievement.title}</p>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Complete actions to earn achievements!</p>
            )}
            
            {/* Locked Achievements */}
            {achievements.length < 5 && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-gray-400 text-xs mb-2">Locked Achievements:</p>
                <div className="opacity-50">
                  {!achievements.some(a => a.id === "first_post") && (
                    <div className="bg-gray-800 p-2 rounded flex items-center mb-2">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xl mr-3">
                        ?
                      </div>
                      <p className="text-white">Make your first post</p>
                    </div>
                  )}
                  {!achievements.some(a => a.id === "frequent_poster") && (
                    <div className="bg-gray-800 p-2 rounded flex items-center">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xl mr-3">
                        ?
                      </div>
                      <p className="text-white">Create 5 community posts</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostList;