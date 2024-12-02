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
  setOtherUserId: (chat: GetChatInboxResponseBody) => void;
  closeChat: () => void;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

// Create context with a default value
const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: ChatProviderProps) {
  const [selectedOtherUserId, setSelectedOtherUserId] = React.useState<SelectedChat | null>(null);

  const setOtherUserId = (chat: GetChatInboxResponseBody) => {
    setSelectedOtherUserId({
      otherUserId: chat.other_user_id,
      profileProfilePhoto: chat.other_user_profile_photo_path,
      username: chat.other_user_username,
      name: chat.other_user_full_name,
    });
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
