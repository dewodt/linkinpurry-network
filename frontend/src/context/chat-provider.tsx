import React from 'react';

import { GetChatInboxResponseBody } from '@/types/api/chat';

interface SelectedChat {
  otherUserId: string;
  profileProfilePhoto: string;
  username: string;
  name: string;
}

interface ChatContextType {
  selectedOtherUserId: SelectedChat | null;
  setOtherUserId: (chat: SelectedChat) => void;
  closeChat: () => void;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

// Create context with a default value
const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: ChatProviderProps) {
  const [selectedOtherUserId, setSelectedOtherUserId] = React.useState<SelectedChat | null>(null);

  const setOtherUserId = (chat: SelectedChat) => {
    setSelectedOtherUserId(chat);
  };

  const closeChat = () => {
    setSelectedOtherUserId(null);
  };

  const value = {
    selectedOtherUserId,
    setOtherUserId,
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
