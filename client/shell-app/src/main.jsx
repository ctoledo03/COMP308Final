// shell-app/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
import './index.css';

// Set up the Apollo Client
const httpLink = createHttpLink({
  uri: 'https://communityengagement-authmicroservice.onrender.com/graphql', 
  credentials: 'include', 
});

/*
// Set up the Apollo Client for the API gateway
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // ✅ Updated to use API Gateway
  credentials: 'include',
});
*/

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);

