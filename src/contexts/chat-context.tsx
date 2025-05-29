"use client";

import type { ChatMessage } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  addMessages: (messages: ChatMessage[]) => void;
  clearChat: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);
  
  const addMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages((prevMessages) => [...prevMessages, ...newMessages]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, addMessages, clearChat, isLoading, setIsLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
