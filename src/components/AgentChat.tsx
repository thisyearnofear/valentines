"use client";

import { useState } from "react";
import { IoSend, IoRefresh } from "react-icons/io5";

const EXAMPLE_QUESTIONS = [
  "Treasury balance?",
  "Ownership stats?",
  "Total lub gifted?",
];

const WELCOME_MESSAGE = `Hi! I'm the lub-u treasury agent 💝 Ask me about:
• Treasury balance and stats
• Ownership distribution
• Project mechanics and details
• How to participate

I can't send treasury funds, but I'm here to help you understand our community experiment! ✨`;

export default function AgentChat() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "agent"; content: string }>
  >([
    {
      role: "agent",
      content: WELCOME_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error("Failed to parse response:", error);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (!data.response) {
        throw new Error("No response from agent");
      }

      setMessages((prev) => [
        ...prev,
        { role: "agent", content: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            error instanceof Error
              ? `Sorry, I encountered an error: ${error.message}`
              : "Sorry, I encountered an unexpected error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "agent",
        content: WELCOME_MESSAGE,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Treasury Agent</h2>
        <button
          onClick={clearChat}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full transition-colors"
          title="Clear chat"
        >
          <IoRefresh size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(question)}
                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about the treasury..."
            className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <IoSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
