import React, { useState } from "react";
import { useLazyQuery, gql } from "@apollo/client";

const COMMUNITY_AI_QUERY = gql`
  query CommunityAIQuery($question: String!, $sessionId: String!) {
    communityAIQuery(question: $question, sessionId: $sessionId) {
      answer
      followUp
      question
      sessionId
    }
  }
`;

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! How can I help you today?",
      followUp: "What are people talking about?\nWhat do people need help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("temp-session-id"); // replace with real token if available

  const [fetchAIResponse, { loading }] = useLazyQuery(COMMUNITY_AI_QUERY, {
    fetchPolicy: "no-cache", // Don't cache responses for chat
    onCompleted: (data) => {
      const res = data.communityAIQuery;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          followUp: res.followUp,
        },
      ]);
      setSessionId(res.sessionId); // update sessionId if changed
    },
    onError: (err) => {
      console.error("AI Query failed:", err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong while talking to the AI.",
        },
      ]);
    },
  });

  const sendMessage = (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setInput("");

    // Fire the GraphQL query
    fetchAIResponse({
      variables: {
        question: messageText,
        sessionId,
      },
    });
  };

  const handleFollowUpClick = (question) => {
    sendMessage(question);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-[80%] bg-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-700 z-50">
      {/* Header */}
      <div className="bg-gray-700 text-white text-lg font-semibold px-4 py-2">
        Agentic AI Chat
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-1">
            <div
              className={`p-2 rounded-md text-sm max-w-[90%] break-words ${
                msg.role === "assistant"
                  ? "bg-blue-950 text-left text-white"
                  : "bg-blue-900 text-right text-white self-end"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "assistant" && msg.followUp && (
              <div className="flex flex-col gap-1 ml-2">
                {msg.followUp.split("\n").filter(q => q.trim() !== "").map((question, i) => (
                  <button
                    key={i}
                    className="text-xs text-blue-400 hover:underline text-left"
                    onClick={() => handleFollowUpClick(question.trim())}
                  >
                    ➤ {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">
            Agent is thinking...
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-700 flex bg-gray-800">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={() => sendMessage()}
          className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
