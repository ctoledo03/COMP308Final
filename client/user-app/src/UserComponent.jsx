import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

function UserComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [login] = useMutation(LOGIN_MUTATION, {
    onCompleted: () => {
      console.log('✅ Login successful, reloading page...');

      // Dispatch custom event upon successful login
      window.dispatchEvent(new CustomEvent('loginSuccess', { detail: { isLoggedIn: true } }));
    },
    onError: (error) => setAuthError(error.message || 'Login failed'),
  });

  const [register] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      alert('Registration successful! Please log in.');
      setActiveTab('login'); // Switch to login view
    },
    onError: (error) => setAuthError(error.message || 'Registration failed'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    if (!username || !password) {
      setAuthError('Username and password are required.');
      setIsSubmitting(false);
      return;
    }

    if (activeTab === 'login') {
      await login({ variables: { username, password } });
    } else {
      await register({ variables: { username, password } });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        {/* Tab Navigation */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-lg font-medium">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-medium">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {authError && <div className="text-red-500 mb-4">{authError}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600"
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <div className="spinner-border spinner-border-sm text-white" role="status">Authenticating...</div>
              </div>
            ) : (
              activeTab === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserComponent;
