import { useState, useCallback } from "react";
import { ChatMessage } from "@/components/ChatInterface";

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const useChatHistory = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "default",
      title: "Welcome Chat",
      messages: [
        {
          id: "1",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
          isNew: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  
  const [currentChatId, setCurrentChatId] = useState<string>("default");

  const currentChat = chatSessions.find(chat => chat.id === currentChatId);

  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: Date.now() + "-welcome",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
          isNew: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  }, []);

  const updateCurrentChat = useCallback((messages: ChatMessage[]) => {
    setChatSessions(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        // Generate title from first user message if still "New Chat"
        let title = chat.title;
        if (title === "New Chat" && messages.length > 1) {
          const firstUserMessage = messages.find(msg => msg.role === "user");
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
          }
        }
        
        return {
          ...chat,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  }, [currentChatId]);

  const switchToChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      
      // If we deleted the current chat, switch to the first available one
      if (chatId === currentChatId && filtered.length > 0) {
        setCurrentChatId(filtered[0].id);
      }
      
      return filtered;
    });
  }, [currentChatId]);

  return {
    chatSessions,
    currentChat,
    currentChatId,
    createNewChat,
    updateCurrentChat,
    switchToChat,
    deleteChat,
  };
};