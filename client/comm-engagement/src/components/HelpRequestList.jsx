import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import '../index.css';

import HelpRequest from './HelpRequest';

const GET_HELP_REQUESTS = gql`
  query HelpRequests {
    helpRequests {
      id
      author
      title
      description
      location
      isResolved
      volunteers
      createdAt
      updatedAt
    }
  }
`;

const ADD_HELP_REQUEST = gql`
  mutation AddHelpRequest($title: String!, $description: String!, $location: String) {
    addHelpRequest(title: $title, description: $description, location: $location) {
      id
      title
      description
      location
      createdAt
    }
  }
`;

const EDIT_HELP_REQUEST = gql`
  mutation EditHelpRequest($id: ID!, $title: String, $description: String, $location: String, $isResolved: Boolean) {
    editHelpRequest(id: $id, title: $title, description: $description, location: $location, isResolved: $isResolved)
  }
`;

const DELETE_HELP_REQUEST = gql`
  mutation DeleteHelpRequest($id: ID!) {
    deleteHelpRequest(id: $id)
  }
`;  

// Main HelpRequest list component
const HelpRequestList = ({ me }) => {
    const { loading, error, data, refetch } = useQuery(GET_HELP_REQUESTS);
    const [addRequest] = useMutation(ADD_HELP_REQUEST, { 
        onCompleted: () => {
            alert("Help Request Posted")
            refetch();
        } 
    });
    const [editRequest] = useMutation(EDIT_HELP_REQUEST, { 
        onCompleted: () => {
            alert("Post Editing Successful");
            refetch();
            setEditingId(null);
            setForm({ title: '', description: '', location: '' });
        },
        onError: (error) => {
            alert(error.message);
            setEditingId(null);
            setForm({ title: '', description: '', location: '' });
        }
    });
    const [deleteRequest] = useMutation(DELETE_HELP_REQUEST, { 
        onCompleted: () => {
            alert("Post Deleted Successfully");
            refetch();
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const [form, setForm] = useState({ title: '', description: '', location: '' });
    const [editingId, setEditingId] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await editRequest({
                    variables: {
                        id: editingId,
                        title: form.title,
                        description: form.description,
                        location: form.location
                    }
                });
            } else {
                await addRequest({
                    variables: form
                });
                setForm({ title: '', description: '', location: '' });
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const handleEdit = (request) => {
        setEditingId(request.id);
        setForm({
            title: request.title,
            description: request.description,
            location: request.location || ''
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteRequest({ variables: { id } });
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    };

    if (loading) return <p className="text-white">Loading...</p>;
    if (error) return <p className="text-white">Error loading help requests.</p>;

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-6 text-white">Help Requests</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location (optional)"
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                >
                    {editingId ? "Update Request" : "Submit Request"}
                </button>
            </form>

            {/* List of Help Requests */}
            <div className="space-y-4">
                {data.helpRequests.map((request) => (
                    <HelpRequest
                        key={request.id}
                        request={request}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        refetch={refetch}
                        currentUser={me.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default HelpRequestList;
