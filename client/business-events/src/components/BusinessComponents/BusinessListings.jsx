import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';

const GET_BUSINESS_LISTINGS = gql`
  query {
    myBusinessListings {
      id
      businessName
      description
      location
      phone
      email
      createdAt
    }
  }
`;

const CREATE_BUSINESS_LISTING  = gql`
  mutation CreateBusinessListing ($businessName: String!, $description: String, $location: String, $phone: String, $email: String) {
           createBusinessListing(businessName: $businessName, description: $description, location: $location, phone: $phone, email: $email) 
    {
        businessName
        description
        email
        location
    }
  }
`;

const BusinessListings = ({ me }) => {
    const { loading, error, data, refetch } = useQuery(GET_BUSINESS_LISTINGS);
    const [addListing] = useMutation(CREATE_BUSINESS_LISTING, {
      onCompleted: () => {
        alert("Business listing created!");
        refetch();
      }
    });
    
    const [form, setForm] = useState({
      businessName: '',
      description: '',
      location: '',
      phone: '',
      email: ''
    });
    
    const handleChange = (e) => {
      setForm({
        ...form,
        [e.target.name]: e.target.value
      });
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      await addListing({
        variables: form
      });
      setForm({
        businessName: '',
        description: '',
        location: '',
        phone: '',
        email: ''
      });
    };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-white">Error loading listings.</p>;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">My Business Listings</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {Object.keys(form).map((key) => (
          <input key={key} type="text" name={key} value={form[key]} onChange={handleChange} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        ))}
        <button type="submit" className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">Create Listing</button>
      </form>
      <div className="space-y-4">
        {data.myBusinessListings.map((l) => (
          <div key={l.id} className="p-4 bg-gray-700 rounded-lg text-white border border-gray-600">
            <h2 className="text-2xl font-bold mb-2">{l.businessName}</h2>
            <p className="text-gray-300 mb-4">{l.title}</p>
            <p className="text-gray-300 mb-4">{l.description}</p>
            <p className="text-gray-300 mb-4">{l.location}</p>
            <p className="text-gray-300 mb-4">{l.phone}</p>
            <p className="text-gray-300 mb-4">{l.email}</p>
            <p className="text-sm text-gray-400">Created: {new Date(parseInt(l.createdAt)).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessListings;
