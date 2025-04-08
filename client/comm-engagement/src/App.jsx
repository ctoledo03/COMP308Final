import React, { useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import './index.css';

import CommunityPostList from "./components/CommunityPostList";
import HelpRequest from "./components/HelpRequest";
import ChatBox from "./components/ChatBox";

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
  const [selectedPage, setSelectedPage] = useState("CommunityPost");

  const logout = () => {
    window.dispatchEvent(new CustomEvent('logoutSuccess', { detail: { isLoggedIn: false } })); 
  }

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto items-center">
          {/* Navbar */}
          <div className="flex-grow flex justify-center items-center p-6">
            <nav className="bg-gray-800 p-4 w-[91%] shadow-lg rounded-lg">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Community Hub</h1>
                <div className="space-x-4">
                  <button
                    className={`px-4 py-2 rounded text-white ${selectedPage === "CommunityPost" ? "bg-blue-600" : "bg-gray-700"}`}
                    onClick={() => setSelectedPage("CommunityPost")}
                  >
                    Community Post
                  </button>

                  <button
                    className={`px-4 py-2 rounded text-white ${selectedPage === "HelpRequest" ? "bg-blue-600" : "bg-gray-700"}`}
                    onClick={() => setSelectedPage("HelpRequest")}>
                      Help Request
                  </button>

                  <button 
                    className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white" 
                    onClick={() => logout()}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-grow flex justify-center items-center p-6">
            {selectedPage === "CommunityPost" ? <CommunityPostList me={me} /> : <HelpRequest me={me} />}
          </div>

          <ChatBox />
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
