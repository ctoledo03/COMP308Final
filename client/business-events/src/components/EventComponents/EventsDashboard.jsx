import React, { useState } from 'react';
import { useQuery, useMutation, gql, ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const client = new ApolloClient({
  uri: "http://localhost:4003/graphql",
  cache: new InMemoryCache(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

const MY_COMMUNITY_EVENTS = gql`
  query {
    myCommunityEvents {
      id
      title
      description
      location
      date
    }
  }
`;

const CREATE_COMMUNITY_EVENT = gql`
  mutation CreateCommunityEvent(
    $title: String!
    $description: String
    $location: String
    $date: String!
  ) {
    createCommunityEvent(
      title: $title
      description: $description
      location: $location
      date: $date
    ) {
      id
      title
    }
  }
`;

const EventsDashboard = ({ me, addPoints }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
  });

  const { data, loading, error, refetch } = useQuery(MY_COMMUNITY_EVENTS);
  const [createEvent, { loading: creating }] = useMutation(CREATE_COMMUNITY_EVENT, {
    onCompleted: () => {
      triggerReward("Event created! +50 points 🎉");
      addPoints(50);
      setFormData({ title: '', description: '', location: '', date: '' });
      refetch();
    },
    onError: (err) => {
      console.error('Create event error:', err.message);
    }
  });

  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createEvent({ variables: formData });
  };

  const triggerReward = (text) => {
    setRewardText(text);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const logout = () => {
    window.dispatchEvent(new CustomEvent('logoutSuccess', { detail: { isLoggedIn: false } }));
  };

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Reward Animation */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-full shadow-lg z-50"
            >
              {rewardText}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto items-center">
          {/* Navbar */}
          <div className="flex-grow flex justify-center items-center p-6">
            <nav className="bg-gray-800 p-4 w-[91%] shadow-lg rounded-lg">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Event Hub</h1>
                <button
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-grow flex flex-col items-center p-6 space-y-8">
            {/* Create Event */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-gray-800 p-6 rounded-xl shadow text-white"
            >
              <h2 className="text-lg font-semibold mb-4">Create New Event</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4">
                <input
                  name="title"
                  placeholder="Event Title"
                  className="p-2 border border-gray-600 bg-gray-900 rounded text-white"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Event Description"
                  className="p-2 border border-gray-600 bg-gray-900 rounded text-white"
                  value={formData.description}
                  onChange={handleChange}
                />
                <input
                  name="location"
                  placeholder="Location"
                  className="p-2 border border-gray-600 bg-gray-900 rounded text-white"
                  value={formData.location}
                  onChange={handleChange}
                />
                <input
                  name="date"
                  type="date"
                  className="p-2 border border-gray-600 bg-gray-900 rounded text-white"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </motion.button>
              </form>
            </motion.section>

            {/* Event List */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="w-full bg-gray-800 p-6 rounded-xl shadow text-white"
            >
              <h2 className="text-lg font-semibold mb-4">My Events</h2>
              {loading ? (
                <p>Loading events...</p>
              ) : error ? (
                <p className="text-red-400">Error loading events.</p>
              ) : data.myCommunityEvents.length === 0 ? (
                <p>No events yet. Create one above!</p>
              ) : (
                <ul className="space-y-4">
                  {data.myCommunityEvents.map((event) => (
                    <motion.li
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-700 p-4 rounded bg-gray-900"
                    >
                      <h3 className="font-bold">{event.title}</h3>
                      <p>{event.description}</p>
                      <p className="text-sm text-gray-400">{event.location}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(parseInt(event.date)).toLocaleDateString()}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
};

export default EventsDashboard;