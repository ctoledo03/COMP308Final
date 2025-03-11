import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, gql } from '@apollo/client';
import './App.css';

const UserAuth = lazy(() => import('userAuth/App'));
const CommEngagementApp = lazy(() => import('commEngagement/App'));

// GraphQL query to check the current user's authentication status
const CURRENT_USER_QUERY = gql`
  query me {
    me {
      username
    }
  }
`;

function App() {
  // Check for token in localStorage initially
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Apollo useQuery for authentication check
  const { loading, error, data } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // Listen for the loginSuccess event
    const handleLoginSuccess = (event) => {
      setIsLoggedIn(event.detail.isLoggedIn);
      console.log('✅ Received loginSuccess event in ShellApp:', event.detail.isLoggedIn);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);

    // Update state if the query succeeds
    if (!loading && !error && data?.me) {
      setIsLoggedIn(true);
      localStorage.setItem('token', 'some-placeholder-token'); // Ensure token stays
    } else if (!loading && error) {
      setIsLoggedIn(false);
      localStorage.removeItem('token'); // Remove invalid token
    }

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [loading, error, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        {!isLoggedIn ? <UserAuth /> : <CommEngagementApp />}
        <h1>Shell App</h1>
      </Suspense>
    </div>
  );
}

export default App;
