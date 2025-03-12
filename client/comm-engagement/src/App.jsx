import React, { useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import './index.css';

import CommunityPost from "./components/CommunityPost";
import HelpRequest from "./components/HelpRequest";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "http://localhost:4002/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

function App() {
  const [selectedPage, setSelectedPage] = useState("CommunityPost");

  return (
    <ApolloProvider client={client}>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {/* Navbar */}
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Community Hub</h1>
            <div className="space-x-4">
              <button
                className={`px-4 py-2 rounded ${
                  selectedPage === "CommunityPost" ? "bg-blue-600" : "bg-gray-700"
                }`}
                onClick={() => setSelectedPage("CommunityPost")}
              >
                Community Post
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  selectedPage === "HelpRequest" ? "bg-blue-600" : "bg-gray-700"
                }`}
                onClick={() => setSelectedPage("HelpRequest")}
              >
                Help Request
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-grow flex justify-center items-center p-6">
          {selectedPage === "CommunityPost" ? <CommunityPost /> : <HelpRequest />}
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
