import React from 'react';

import { GetChatInboxResponseBody } from '@/types/api/chat';

interface SelectedChat {
  otherUserId: string;
  profileProfilePhoto: string;
  username: string;
  name: string;
}

interface ChatContextType {
  selectedOtherUser: SelectedChat | null;
  setOtherUser: (chat: SelectedChat) => void;
  closeChat: () => void;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

// Create context with a default value
const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: ChatProviderProps) {
  const [selectedOtherUser, setSelectedOtherUser] = React.useState<SelectedChat | null>(null);

  const setOtherUser = (chat: SelectedChat) => {
    setSelectedOtherUser(chat);
  };

  const closeChat = () => {
    setSelectedOtherUser(null);
  };

  const value = {
    selectedOtherUser,
    setOtherUser,
    closeChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = React.useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
}
