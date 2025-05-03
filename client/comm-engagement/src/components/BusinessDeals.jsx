import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EXTERNAL_DEALS_QUERY = `
  query {
  businessDeals {
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
  }
}
`;

const ADD_COMMENT_MUTATION = `
  mutation AddCommentMutation($dealId: ID!, $text: String!, $username: String!) {
    addCommentToDeal(dealId: $dealId, text: $text, username: $username) {
      id
    }
  }
`;

const BusinessDeals = ({ me }) => {
  const [externalDeals, setExternalDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [visibleComments, setVisibleComments] = useState({});

  useEffect(() => {
    const fetchExternalDeals = async () => {
      try {
        const res = await fetch('https://communityengagement-qdh2.onrender.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: EXTERNAL_DEALS_QUERY }),
        });

        const { data, errors } = await res.json();

        if (errors) throw new Error(errors[0].message);

        if (data?.businessDeals) setExternalDeals(data.businessDeals);
      } catch (err) {
        console.error('Error fetching external deals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExternalDeals();
  }, []);

  const handleCommentChange = (dealId, value) => {
    setCommentInputs((prev) => ({ ...prev, [dealId]: value }));
  };

  const submitComment = async (dealId) => {
    const text = commentInputs[dealId]?.trim();
    const username = me.username;
  
    if (!text) return;
  
    try {
      const res = await fetch('https://communityengagement-qdh2.onrender.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ADD_COMMENT_MUTATION,
          variables: { dealId, text, username },
        }),
      });
  
      const { data, errors } = await res.json();
  
      if (errors) throw new Error(errors[0].message);
  
      // Clear input
      setCommentInputs((prev) => ({ ...prev, [dealId]: '' }));
  
      // Update local state to show the new comment immediately
      setExternalDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId
            ? {
                ...deal,
                comments: [
                  ...deal.comments,
                  {
                    text,
                    author: username,
                    createdAt: new Date().getTime().toString(), // or Date.now().toString()
                  },
                ],
              }
            : deal
        )
      );
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const handleKeyDown = (e, dealId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitComment(dealId);
    }
  };

  const toggleComments = (dealId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [dealId]: !prev[dealId],
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Business Deals</h2>

      {loading ? (
        <p>Loading deals...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : externalDeals.length === 0 ? (
        <p>No business deals available.</p>
      ) : (
        <div className="space-y-4">
          {externalDeals.map((deal) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600"
            >
              <h3 className="text-xl font-bold">
                {deal.listing.businessName}: {deal.title}
              </h3>
              <p>{deal.details}</p>
              <p>{deal.discountPercentage}% off</p>
              <p className="text-sm text-gray-400">
                {new Date(parseInt(deal.startDate)).toLocaleDateString()} to{' '}
                {new Date(parseInt(deal.endDate)).toLocaleDateString()}
              </p>

              {/* Comment Box */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[deal.id] || ''}
                  onChange={(e) => handleCommentChange(deal.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, deal.id)}
                  className="flex-1 px-3 py-1 rounded bg-gray-600 text-white placeholder-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => submitComment(deal.id)}
                  className="text-xl px-3 py-1 rounded bg-green-600 hover:bg-green-500 transition"
                >
                  &gt;
                </button>
              </div>

              {/* Toggle comments */}
            <button
                onClick={() => toggleComments(deal.id)}
                className="text-sm text-blue-400 hover:underline mt-2"
                >
                {visibleComments[deal.id] ? 'Hide Comments' : 'Open Comments'}
            </button>

                {/* Comments section */}
                {visibleComments[deal.id] && deal.comments && (
                <div className="mt-3 space-y-2 border-t border-gray-600 pt-2">
                    {deal.comments.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No comments yet.</p>
                    ) : (
                    deal.comments.map((comment, index) => (
                        <div key={index} className="text-sm bg-gray-600 p-2 rounded">
                        <p className="text-white">{comment.text}</p>
                        <p className="text-xs text-gray-300 mt-1">
                            – {comment.author} on {new Date(parseInt(comment.createdAt)).toLocaleDateString()}
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
