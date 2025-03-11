// product-app/src/App.jsx
import './App.css';
import CommunityPost from './CommunityPost';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Set up your ApolloClient
const client = new ApolloClient({
  uri: 'http://localhost:4002/graphql', // Set this to your actual GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: 'include'
});
//
/*
// Set up your ApolloClient for the API gateway
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Set this to your actual GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: 'include'
});
*/

function App() {

  return (
    <div className='App'>
      <ApolloProvider client={client}>
        <CommunityPost />
      </ApolloProvider>
    </div>
  );
}

export default App;

