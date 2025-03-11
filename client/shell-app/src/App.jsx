// shell-app/src/App.jsx
// Add these imports at the top of your App.jsx in shell-app
import React, { lazy, Suspense } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import './App.css';

// Create an instance of ApolloClient
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Adjust this URI to your GraphQL server
  cache: new InMemoryCache(),
});

const UserAuthComponent = lazy(() => import('userAuth/App'));
// const CommunityEngagementComponent = lazy(() => import('commEngagement/CommunityComponent'));

function App() {
  return (
    <ApolloProvider client={client}> {/* Wrap your app or relevant parts with ApolloProvider */}
      <div className='App'>
        <header className='App-header'>
          <Suspense fallback={<div>Loading Components...</div>}>
            <UserAuthComponent />
            {/* <CommunityEngagementComponent /> */}
          </Suspense>
        </header>
      </div>
    </ApolloProvider>
  );
}

export default App;
