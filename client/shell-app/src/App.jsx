// shell-app/src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import './App.css';

const UserAuth = lazy(() => import('userAuth/App'));
const CommEngagementApp = lazy(() => import('commEngagement/App'));
const BusinessAndEventsApp = lazy(() => import('businessAndEvents/App'))

// GraphQL query to check the current user's authentication status
const CURRENT_USER_QUERY = gql`
  query me {
    me {
      id
      username
      role
    }
  }
`;

// GraphQL mutation for logout
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState(null)

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onError: (error) => {
      console.error("Error logging out:", error);
    }
  });

  // Use Apollo's useQuery hook to perform the authentication status check on app load
  const { loading, error, data, refetch } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setContent(<UserAuth />);
    }
  
    const handleLoginSuccess = async (event) => {
      setIsLoggedIn(event.detail.isLoggedIn);
      const { data: freshData } = await refetch();

      const user = freshData?.me; 

      if (user?.role === "resident") {
        setContent(<CommEngagementApp me={user} />);
      } else {
        setContent(<BusinessAndEventsApp me={user} />);
      }
    };
  
    const handleLogoutSuccess = (event) => {
      setIsLoggedIn(event.detail.isLoggedIn);
      logout();
      setContent(<UserAuth />);
    };

    const handleSwitchView = async (event) => {
      const requestedView = event.detail.requestedView

      if (requestedView == "community") {
        setContent(<CommEngagementApp me={data.me} />);
      }
      else if (requestedView == "businessAndEvents" && (data.me.role != 'resident')) {
        setContent(<BusinessAndEventsApp me={data.me} />);
      }
    }
  
    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);
    window.addEventListener('requestSwitchView', handleSwitchView);
  
    if (!loading && !error) {
      setIsLoggedIn(!!data.me);
  
      if (data?.me) {
        if (data.me.role === "resident") {
          setContent(<CommEngagementApp me={data.me} />);
        } else {
          setContent(<BusinessAndEventsApp me={data.me} />);
        }
      }
    }
  
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, [loading, error, data]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
         {!isLoggedIn ? <UserAuth /> : content}
      </Suspense>
    </div>
  );
}

export default App;

