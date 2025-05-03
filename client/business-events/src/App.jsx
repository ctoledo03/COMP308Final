import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import './index.css';

import BusinessDashboard from "./components/BusinessComponents/BusinessDashboard";
import EventsDashboard from "./components/EventComponents/EventsDashboard";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "https://communityengagement-qdh2.onrender.com/graphql",
  cache: new InMemoryCache(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

const App = ({ me }) => {
  console.log(me)
  return (
    <ApolloProvider client={client}>
      {me?.role === 'business_owner' ? <BusinessDashboard me={me} /> : <EventsDashboard me={me} />}
    </ApolloProvider>
  );
};

export default App;


// Force redeploy