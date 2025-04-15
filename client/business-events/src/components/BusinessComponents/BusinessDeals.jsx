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
      createdAt
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

const BusinessDeals = ({ me, addPoints }) => {
  const { data: listingsData, loading: listingsLoading } = useQuery(GET_MY_LISTINGS);
  const [getDeals, { data: dealsData, refetch }] = useLazyQuery(GET_MY_DEALS);

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
              <h2 className="text-xl font-bold">{deal.listing.businessName}: {deal.title}</h2>
              <p>{deal.details}</p>
              <p>{deal.discountPercentage}% off</p>
              <p className="text-sm text-gray-400">
                {new Date(parseInt(deal.startDate)).toLocaleDateString()} to{' '}
                {new Date(parseInt(deal.endDate)).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessDeals;