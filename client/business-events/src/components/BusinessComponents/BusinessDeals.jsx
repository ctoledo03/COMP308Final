import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';

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

const BusinessDeals = ({ me }) => {
  const { data: listingsData, loading: listingsLoading } = useQuery(GET_MY_LISTINGS);
  const [getDeals, { data: dealsData, refetch }] = useLazyQuery(GET_MY_DEALS);

  const [createDeal] = useMutation(CREATE_DEAL, {
    onCompleted: () => {
      alert('Deal created!');
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

  useEffect(() => {
    console.log("Deals data:", dealsData);
  }, [dealsData]);

  if (listingsLoading) return <p className="text-white">Loading...</p>;

  const listings = listingsData?.myBusinessListings || [];
  const deals = dealsData?.myBusinessDeals || [];

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Business Deals</h1>

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
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition"
          >
            Create Deal
          </button>
        </form>
      )}

      {deals.length > 0 && (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h2 className="text-xl font-bold">{deal.listing.businessName}: {deal.title}</h2>
              <p>{deal.details}</p>
              <p>{deal.discountPercentage}% off</p>
              <p className="text-sm text-gray-400">
                {new Date(parseInt(deal.startDate)).toLocaleDateString()} to{' '}
                {new Date(parseInt(deal.endDate)).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessDeals;
