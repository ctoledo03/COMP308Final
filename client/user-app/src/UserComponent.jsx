import React, { useState } from 'react';

import { useMutation, gql } from '@apollo/client';

import { motion, AnimatePresence } from 'framer-motion';

import { FaUserAstronaut, FaKey, FaEnvelope, FaUserShield } from 'react-icons/fa';

const LOGIN_MUTATION = gql`

  mutation Login($username: String!, $password: String!) {

    login(username: $username, password: $password)

  }

`;

const REGISTER_MUTATION = gql`

  mutation Signup($username: String!, $email: String!, $password: String!, $role: UserRole!) {

    signup(username: $username, email: $email, password: $password, role: $role)

  }

`;

function UserComponent() {

  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('login');

  const [authError, setAuthError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');

  const [role, setRole] = useState('resident');

  const [login] = useMutation(LOGIN_MUTATION, {

    onCompleted: () => {

      window.dispatchEvent(new CustomEvent('loginSuccess', { detail: { isLoggedIn: true } }));

    },

    onError: (error) => setAuthError(error.message || 'Login failed'),

  });

  const [register] = useMutation(REGISTER_MUTATION, {

    onCompleted: () => {

      alert('Registration successful! Please log in.');

      setActiveTab('login');

    },

    onError: (error) => setAuthError(error.message || 'Registration failed'),

  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsSubmitting(true);

    setAuthError('');

    if (activeTab === 'login') {

      if (!username || !password) {

        setAuthError('Username and password are required.');

        setIsSubmitting(false);

        return;

      }

      await login({ variables: { username, password } });

    } else {

      if (!username || !password || !email) {

        setAuthError('Username, email and password are required.');

        setIsSubmitting(false);

        return;

      }

      await register({ variables: { username, email, password, role } });

    }

    setIsSubmitting(false);

  };

  return (
<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans">
<motion.div

        initial={{ opacity: 0, y: -40 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.6 }}

        className="w-full max-w-md p-8 bg-[#1c1c3a] rounded-2xl shadow-2xl border-4 border-purple-500/20 backdrop-blur-lg"
>

        {/* XP Bar */}
<div className="mb-4">
<div className="text-sm text-gray-300 mb-1">Level 1 Adventurer</div>
<div className="w-full bg-gray-700 rounded-full h-3">
<div className="bg-green-400 h-3 rounded-full w-2/5 animate-pulse"></div>
</div>
</div>

        {/* Tabs */}
<div className="flex justify-between mb-6">
<button

            onClick={() => setActiveTab('login')}

            className={`flex-1 py-2 text-lg font-bold rounded-l-full ${activeTab === 'login' ? 'bg-purple-700' : 'bg-gray-800 hover:bg-purple-900'} transition-all`}
>

            Login
</button>
<button

            onClick={() => setActiveTab('signup')}

            className={`flex-1 py-2 text-lg font-bold rounded-r-full ${activeTab === 'signup' ? 'bg-purple-700' : 'bg-gray-800 hover:bg-purple-900'} transition-all`}
>

            Sign Up
</button>
</div>

        {/* Form */}
<form onSubmit={handleSubmit}>
<AnimatePresence mode="wait">
<motion.div

              key={activeTab}

              initial={{ opacity: 0, x: 50 }}

              animate={{ opacity: 1, x: 0 }}

              exit={{ opacity: 0, x: -50 }}

              transition={{ duration: 0.3 }}
>

              {/* Username */}
<div className="mb-4">
<label className="text-sm font-medium flex items-center gap-2">
<FaUserAstronaut /> Username
</label>
<input

                  type="text"

                  value={username}

                  onChange={(e) => setUsername(e.target.value)}

                  placeholder="Player123"

                  className="w-full mt-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"

                />
</div>

              {/* Password */}
<div className="mb-4">
<label className="text-sm font-medium flex items-center gap-2">
<FaKey /> Password
</label>
<input

                  type="password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  placeholder="••••••••"

                  className="w-full mt-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"

                />
</div>

              {/* Email (Sign up only) */}

              {activeTab === 'signup' && (
<div className="mb-4">
<label className="text-sm font-medium flex items-center gap-2">
<FaEnvelope /> Email
</label>
<input

                    type="email"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                    placeholder="email@gamemail.com"

                    className="w-full mt-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"

                  />
</div>

              )}

              {/* Role (Sign up only) */}

              {activeTab === 'signup' && (
<div className="mb-4">
<label className="text-sm font-medium flex items-center gap-2">
<FaUserShield /> Choose Your Role
</label>
<select

                    value={role}

                    onChange={(e) => setRole(e.target.value)}

                    className="w-full mt-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
>
<option value="resident">Resident</option>
<option value="business_owner">Business Owner</option>
<option value="community_organizer">Community Organizer</option>
</select>
</div>

              )}

              {/* Error Message */}

              {authError && (
<div className="mb-4 text-red-400 text-sm font-medium">

                  {authError}
</div>

              )}

              {/* Submit */}
<button

                type="submit"

                disabled={isSubmitting}

                className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 transition rounded-lg text-white font-bold text-lg"
>

                {isSubmitting ? 'Loading...' : activeTab === 'login' ? 'Enter the Realm' : 'Join the Guild'}
</button>
</motion.div>
</AnimatePresence>
</form>
</motion.div>
</div>

  );

}

export default UserComponent; 