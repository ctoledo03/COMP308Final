import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_COMMUNITY_POSTS = gql`
	query CommunityPosts {
		communityPosts {
			id
			author
			title
			content
			category
			createdAt
			updatedAt
		}
	}
`;

const ADD_COMMUNITY_POST = gql`
	mutation AddCommunityPost($title: String!, $content: String!, $category: String!) {
		addCommunityPost(title: $title, content: $content, category: $category) {
			id
			title
			content
			category
			createdAt
		}
	}
`;

const EDIT_COMMUNITY_POST = gql`
	mutation EditCommunityPost($id: ID!, $title: String, $content: String, $category: String) {
		editCommunityPost(id: $id, title: $title, content: $content, category: $category)
	}
`;

const DELETE_COMMUNITY_POST = gql`
	mutation DeleteCommunityPost($id: ID!) {
		deleteCommunityPost(id: $id)
	}
`;

const CommunityPost = () => {
	const { loading, error, data, refetch } = useQuery(GET_COMMUNITY_POSTS);
	const [addPost] = useMutation(ADD_COMMUNITY_POST, { onCompleted: () => refetch() });
	const [editPost] = useMutation(EDIT_COMMUNITY_POST, { onCompleted: () => refetch() });
	const [deletePost] = useMutation(DELETE_COMMUNITY_POST, { onCompleted: () => refetch() });

	const [form, setForm] = useState({ title: '', content: '', category: 'news' });
	const [editingId, setEditingId] = useState(null);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (editingId) {
			await editPost({ variables: { id: editingId, ...form } });
			setEditingId(null);
		} else {
			await addPost({ variables: form });
		}
		setForm({ title: '', content: '', category: 'news' });
	};

	const handleEdit = (post) => {
		setEditingId(post.id);
		setForm({ title: post.title, content: post.content, category: post.category });
	};

	const handleDelete = async (id) => {
		await deletePost({ variables: { id } });
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading posts.</p>;

	return (
		<div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
			<h1 className="text-3xl font-bold text-center mb-6">Community Posts</h1>

			{/* Form */}
			<form onSubmit={handleSubmit} className="mb-6 space-y-4">
				<input
					type="text"
					name="title"
					value={form.title}
					onChange={handleChange}
					placeholder="Title"
					required
					className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<textarea
					name="content"
					value={form.content}
					onChange={handleChange}
					placeholder="Content"
					required
					className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					name="category"
					value={form.category}
					onChange={handleChange}
					className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="news">News</option>
					<option value="discussion">Discussion</option>
				</select>
				<button
					type="submit"
					className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
				>
					{editingId ? "Update" : "Post"}
				</button>
			</form>

			{/* List of Posts */}
			<ul className="space-y-4">
				{data.communityPosts.map((post) => (
					<li key={post.id} className="p-4 bg-gray-700 rounded-lg shadow-md">
						<h2 className="text-xl font-bold">{post.title}</h2>
						<p className="text-gray-300">{post.content}</p>
						<p className="text-sm text-gray-400 mt-2">Category: {post.category}</p>

						<div className="mt-4 space-x-3">
							<button
								onClick={() => handleEdit(post)}
								className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition"
							>
								Edit
							</button>
							<button
								onClick={() => handleDelete(post.id)}
								className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
							>
								Delete
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default CommunityPost;
