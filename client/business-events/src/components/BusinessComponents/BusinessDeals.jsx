import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const GET_MY_LISTINGS = gql`
  query {
    myBusinessListings {
      id
      businessName
    }
  }
`;

const GET_MY_DEALS = gql`
  query MyBusinessDeals($listingId: ID!) {
    myBusinessDeals(listingId: $listingId) {
      id
      title
      details
      discountPercentage
      startDate
      endDate
      listing {
        businessName
      }
      comments {
        text
        author
        createdAt
      }
      createdAt
      summary
      sentiment
    }
  }
`;

const CREATE_DEAL = gql`
  mutation CreateBusinessDeal(
    $listing: ID!
    $title: String!
    $details: String
    $discountPercentage: Float
    $startDate: String
    $endDate: String
  ) {
    createBusinessDeal(
      listing: $listing
      title: $title
      details: $details
      discountPercentage: $discountPercentage
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      title
    }
  }
`;

const BusinessDeals = ({ me, addPoints, userStats }) => {
  const { data: listingsData, loading: listingsLoading } = useQuery(GET_MY_LISTINGS);
  const [getDeals, { data: dealsData, refetch }] = useLazyQuery(GET_MY_DEALS);
  const [visibleComments, setVisibleComments] = useState({});

  const toggleComments = (dealId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [dealId]: !prev[dealId],
    }));
  };  

  const [createDeal] = useMutation(CREATE_DEAL, {
    onCompleted: () => {
      triggerReward("Deal created! +20 points 🎉");
      addPoints(20);
      if (selectedListingId) {
        getDeals({ variables: { listingId: selectedListingId } });
      }
    }
  });

  const [selectedListingId, setSelectedListingId] = useState('all');
  const [form, setForm] = useState({
    title: '',
    details: '',
    discountPercentage: '',
    startDate: '',
    endDate: ''
  });

  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDeal({
      variables: {
        ...form,
        listing: selectedListingId,
        discountPercentage: parseFloat(form.discountPercentage)
      }
    });
    setForm({
      title: '',
      details: '',
      discountPercentage: '',
      startDate: '',
      endDate: ''
    });
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

  const refetchDeals = async () => {
    if (selectedListingId) {
      await getDeals({ variables: { listingId: selectedListingId } });
    }
  };

  useEffect(() => {
    if (selectedListingId) {
      getDeals({ variables: { listingId: selectedListingId } });
    }
  }, [selectedListingId]);

  if (listingsLoading) return <p className="text-white">Loading...</p>;

  const listings = listingsData?.myBusinessListings || [];
  const deals = dealsData?.myBusinessDeals || [];

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg text-white">
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

      <h1 className="text-3xl font-bold text-center mb-6">Business Deals</h1>

      {/* Select Listing */}
      <select
        className="w-full mb-4 p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
        value={selectedListingId}
        onChange={(e) => setSelectedListingId(e.target.value)}
      >
        <option value="all">Select a Listing</option>
        {listings.map((listing) => (
          <option key={listing.id} value={listing.id}>
            {listing.businessName}
          </option>
        ))}
      </select>

      {/* Create Deal Form */}
      {selectedListingId && selectedListingId !== 'all' && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder="Details"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
          <input
            type="number"
            name="discountPercentage"
            value={form.discountPercentage}
            onChange={handleChange}
            placeholder="Discount (%)"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition"
          >
            Create Deal
          </motion.button>
        </form>
      )}

      {/* Display Deals */}
      {deals.length > 0 && (
        <div className="space-y-4">
          {deals.map((deal) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600"
            >
              <h2 className="text-xl font-bold">
                {deal.listing.businessName}: {deal.title}
              </h2>
              <p>{deal.details}</p>
              <p>{deal.discountPercentage}% off</p>
              <p className="text-sm text-gray-400">
                {new Date(parseInt(deal.startDate)).toLocaleDateString()} to{' '}
                {new Date(parseInt(deal.endDate)).toLocaleDateString()}
              </p>
            
              {/* Comments Toggle */}
              <button
                onClick={() => toggleComments(deal.id)}
                className="mt-2 text-sm text-blue-400 hover:underline"
              >
                {visibleComments[deal.id] ? 'Hide Comments' : 'View Comments'}
              </button>

              {/* AI Summary & Sentiment */}
              {deal.summary && deal.sentiment && (
                <div className="text-sm text-gray-300 mt-2 italic">
                  <p><span className="font-bold text-white">Summary:</span> {deal.summary}</p>
                  <p><span className="font-bold text-white">Sentiment:</span> {deal.sentiment}</p>
                </div>
              )}
                          
              {/* Comments List */}
              {visibleComments[deal.id] && (
                <div className="mt-3 space-y-2 border-t border-gray-600 pt-2">
                  {deal.comments.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No comments yet.</p>
                  ) : (
                    deal.comments.map((comment, index) => (
                      <div key={index} className="text-sm bg-gray-600 p-2 rounded">
                        <p className="text-white">{comment.text}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          - {comment.author} on{' '}
                          {new Date(parseInt(comment.createdAt)).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessDeals;