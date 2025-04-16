import React, { useEffect, useState } from 'react';

const CommunityEvents = () => {
  const [externalEvents, setExternalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:4003/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                communityEvents {
                  id
                  title
                  description
                  location
                  date
                }
              }
            `,
          }),
        });

        const result = await res.json();
        console.log(result)
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        setExternalEvents(result.data.communityEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching external events:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-3xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Community Events</h2>

      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      <ul className="space-y-4">
        {externalEvents.map((event) => (
          <li key={event.id} className="p-4 bg-gray-700 rounded shadow">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p>{event.description}</p>
            <p className="text-sm text-gray-400">{event.location}</p>
            <p className="text-sm text-gray-500">
              {new Date(parseInt(event.date)).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityEvents;
