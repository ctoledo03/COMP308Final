import React, { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import './index.css';

import CommunityPostList from "./components/CommunityPostList";
import HelpRequestList from "./components/HelpRequestList";
import ChatBox from "./components/Chatbox";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "http://localhost:4002/graphql",
  cache: new InMemoryCache(),
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

const App = ({ me }) => {
  return (
    <ApolloProvider client={client}>
      <div>Business and events microservice is alive</div>
    </ApolloProvider>
  );
}

export default App;