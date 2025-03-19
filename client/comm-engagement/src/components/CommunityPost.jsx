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

// This is the presentation component
const CommunityPost = ({ post, onEdit, onDelete, currentUser }) => {
	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this post?')) {
			onDelete(post.id);
		}
	};

	return (
		<div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4 text-white">
			<h2 className="text-2xl font-bold mb-2">{post.title}</h2>
			<p className="text-gray-300 mb-4">{post.content}</p>
			<div className="flex items-center justify-between">
				<span className="text-sm text-gray-400">Category: {post.category}</span>
				{currentUser !== post.author && (
					<div className="space-x-2">
						<button
						onClick={() => onEdit(post)}
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
	);
};

export default CommunityPost;
