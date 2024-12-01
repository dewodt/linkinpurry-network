import React from 'react';

interface ChatContextType {
  selectedOtherUserId: string | null;
  setOtherUserId: (chatId: string) => void;
  closeChat: () => void;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

// Create context with a default value
const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: ChatProviderProps) {
  const [selectedOtherUserId, setSelectedOtherUserId] = React.useState<string | null>(null);

  const setOtherUserId = (chatId: string) => {
    setSelectedOtherUserId(chatId);
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
