import { create } from 'zustand';
import { GNChatClient, Conversation, Message } from '@/lib/chat/chatClient';

interface ChatState {
  // Client instance
  client: GNChatClient | null;
  isInitialized: boolean;
  isConnecting: boolean;
  
  // Data
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  userStatuses: Record<string, 'online' | 'offline'>;
  typingUsers: Record<string, string[]>;
  
  // Actions
  initializeClient: (apiUrl: string, socketUrl: string, token: string) => Promise<void>;
  setActiveConversation: (conversationId: string) => void;
  sendMessage: (content: string, attachments?: string[]) => void;
  loadMessages: (conversationId: string, limit?: number, before?: string | null) => Promise<void>;
  markMessageAsRead: (messageId: string) => void;
  sendTypingStatus: (isTyping: boolean) => void;
  createConversation: (type: 'direct' | 'group', name: string | null, participants: string[]) => Promise<Conversation>;
  disconnect: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Client instance
  client: null,
  isInitialized: false,
  isConnecting: false,
  
  // Data
  conversations: [],
  activeConversationId: null,
  messages: {},
  userStatuses: {},
  typingUsers: {},
  
  // Actions
  initializeClient: async (apiUrl: string, socketUrl: string, token: string) => {
    set({ isConnecting: true });
    
    const client = new GNChatClient(apiUrl, socketUrl, token);
    
    // Set up event handlers
    client.on('onMessage', (message) => {
      set((state) => {
        const conversationMessages = state.messages[message.conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [message.conversationId]: [...conversationMessages, message]
          }
        };
      });
    });
    
    client.on('onMessageSent', (message) => {
      if (!message.conversationId || !message.messageId) return;
      
      set((state) => {
        const conversationMessages = state.messages[message.conversationId!] || [];
        return {
          messages: {
            ...state.messages,
            [message.conversationId!]: [...conversationMessages, message as Message]
          }
        };
      });
    });
    
    client.on('onUserStatus', (data) => {
      set((state) => ({
        userStatuses: {
          ...state.userStatuses,
          [data.userId]: data.status
        }
      }));
    });
    
    client.on('onUserTyping', (data) => {
      set((state) => {
        const typingUsersInConversation = state.typingUsers[data.conversationId] || [];
        
        if (data.isTyping && !typingUsersInConversation.includes(data.userId)) {
          return {
            typingUsers: {
              ...state.typingUsers,
              [data.conversationId]: [...typingUsersInConversation, data.userId]
            }
          };
        } else if (!data.isTyping) {
          return {
            typingUsers: {
              ...state.typingUsers,
              [data.conversationId]: typingUsersInConversation.filter(id => id !== data.userId)
            }
          };
        }
        
        return state;
      });
    });
    
    client.on('onError', (error) => {
      console.error('Chat client error:', error);
    });
    
    const success = await client.init();
    
    if (success) {
      set({
        client,
        isInitialized: true,
        isConnecting: false,
        conversations: client.conversations
      });
    } else {
      set({ isConnecting: false });
      throw new Error('Failed to initialize chat client');
    }
  },
  
  setActiveConversation: (conversationId) => {
    const { client, messages } = get();
    
    if (!client) return;
    
    client.joinConversation(conversationId);
    
    // If we don't have messages for this conversation yet, load them
    if (!messages[conversationId]) {
      get().loadMessages(conversationId);
    }
    
    set({ activeConversationId: conversationId });
  },
  
  sendMessage: (content, attachments = []) => {
    const { client } = get();
    if (!client) return;
    
    client.sendMessage(content, attachments);
  },
  
  loadMessages: async (conversationId, limit = 50, before = null) => {
    const { client } = get();
    if (!client) return;
    
    try {
      const messages = await client.loadMessages(conversationId, limit, before);
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages
        }
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  },
  
  markMessageAsRead: (messageId) => {
    const { client } = get();
    if (!client) return;
    
    client.markMessageAsRead(messageId);
  },
  
  sendTypingStatus: (isTyping) => {
    const { client } = get();
    if (!client) return;
    
    client.sendTypingStatus(isTyping);
  },
  
  createConversation: async (type, name, participants) => {
    const { client } = get();
    if (!client) throw new Error('Chat client not initialized');
    
    const conversation = await client.createConversation(type, name, participants);
    
    set((state) => ({
      conversations: [...state.conversations, conversation]
    }));
    
    return conversation;
  },
  
  disconnect: () => {
    const { client } = get();
    if (!client) return;
    
    client.disconnect();
    
    set({
      client: null,
      isInitialized: false,
      conversations: [],
      activeConversationId: null,
      messages: {},
      userStatuses: {},
      typingUsers: {}
    });
  }
}));
