import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import '../index.css';

const GET_HELP_REQUESTS = gql`
  query HelpRequests {
    helpRequests {
      id
      author
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
  mutation AddHelpRequest($description: String!, $location: String) {
    addHelpRequest(description: $description, location: $location) {
      id
      description
      location
      createdAt
    }
  }
`;

const EDIT_HELP_REQUEST = gql`
  mutation EditHelpRequest($id: ID!, $description: String, $location: String, $isResolved: Boolean) {
    editHelpRequest(id: $id, description: $description, location: $location, isResolved: $isResolved)
  }
`;

const DELETE_HELP_REQUEST = gql`
  mutation DeleteHelpRequest($id: ID!) {
    deleteHelpRequest(id: $id)
  }
`;

const VOLUNTEER_FOR_REQUEST = gql`
  mutation Volunteer($helpRequestId: ID!) {
    volunteer(helpRequestId: $helpRequestId)
  }
`;

// Individual HelpRequest component
const HelpRequestItem = ({ request, onEdit, onDelete, currentUser, refetch }) => {
    const [volunteer] = useMutation(VOLUNTEER_FOR_REQUEST, {
        onCompleted: () => {
            refetch();
            alert('Thank you for volunteering!');
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const [toggleStatus] = useMutation(EDIT_HELP_REQUEST, {
        onCompleted: () => refetch(),
        onError: (error) => {
            alert("You can only change the status of your own help requests!");
        }
    });

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this help request?')) {
            onDelete(request.id);
        }
    };

    const handleVolunteer = async () => {
        try {
            const result = await volunteer({ variables: { helpRequestId: request.id } });
            // Only show thank you message if mutation was successful
            if (result.data) {
                alert('Thank you for volunteering!');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleStatusToggle = async () => {
        try {
            await toggleStatus({
                variables: {
                    id: request.id,
                    isResolved: !request.isResolved
                }
            });
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4 text-white">
            <h2 className="text-xl font-bold mb-2">{request.description}</h2>
            {request.location && (
                <p className="text-gray-300 mb-2">Location: {request.location}</p>
            )}
            <div className="flex items-center justify-between">
                <div className="text-sm text-white-400">
                    <button
                        onClick={handleStatusToggle}
                        className={`px-3 py-1 rounded mr-4 ${
                            request.isResolved 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        Status: {request.isResolved ? 'Resolved' : 'Open'}
                    </button>
                    <span className="ml-4">Volunteers: {request.volunteers?.length || 0}</span>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={handleVolunteer}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        disabled={request.isResolved}
                    >
                        Volunteer
                    </button>
                    <button
                        onClick={() => onEdit(request)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main HelpRequest list component
const HelpRequest = () => {
    const { loading, error, data, refetch } = useQuery(GET_HELP_REQUESTS);
    const [addRequest] = useMutation(ADD_HELP_REQUEST, { 
        onCompleted: () => refetch() 
    });
    const [editRequest] = useMutation(EDIT_HELP_REQUEST, { 
        onCompleted: () => {
            refetch();
            setEditingId(null);
            setForm({ description: '', location: '' });
        },
        onError: (error) => {
            alert("You can only edit your own help requests!");
            setEditingId(null);
            setForm({ description: '', location: '' });
        }
    });
    const [deleteRequest] = useMutation(DELETE_HELP_REQUEST, { 
        onCompleted: () => refetch(),
        onError: (error) => {
            alert("You can only delete your own help requests!");
        }
    });

    const [form, setForm] = useState({ description: '', location: '' });
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
                        description: form.description,
                        location: form.location
                    }
                });
            } else {
                await addRequest({
                    variables: form
                });
                setForm({ description: '', location: '' });
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const handleEdit = (request) => {
        setEditingId(request.id);
        setForm({
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
                    <HelpRequestItem
                        key={request.id}
                        request={request}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        refetch={refetch}
                    />
                ))}
            </div>
        </div>
    );
};

export default HelpRequest;
