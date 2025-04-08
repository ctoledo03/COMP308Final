import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import '../index.css';

const VOLUNTEER_FOR_REQUEST = gql`
  mutation Volunteer($helpRequestId: ID!) {
    volunteer(helpRequestId: $helpRequestId)
  }
`;

const EDIT_HELP_REQUEST = gql`
  mutation EditHelpRequest($id: ID!, $title: String, $description: String, $location: String, $isResolved: Boolean) {
    editHelpRequest(id: $id, title: $title, description: $description, location: $location, isResolved: $isResolved)
  }
`;

// Individual HelpRequest component
const HelpRequest = ({ request, onEdit, onDelete, currentUser, refetch }) => {
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
            alert("You can only change the status of your own help requests! " + error);
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
                  title: request.title,
                  description: request.description,
                  location: request.location,
                  isResolved: !request.isResolved
                }
              });
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4 text-white">
            <h2 className="text-xl font-bold mb-2">{request.title}</h2>
            <h2 className="text-gray-300 mb-4">{request.description}</h2>
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
                    {currentUser !== request.author && (
                        <button
                            onClick={handleVolunteer}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                            disabled={request.isResolved}
                        >
                            Volunteer
                        </button>
                    )}
                    {currentUser == request.author && (
                        <div className="space-x-2">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpRequest