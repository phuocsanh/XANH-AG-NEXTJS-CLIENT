'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/chat/chatClient';

interface ChatMessagesProps {
  conversationId: string;
}

export default function ChatMessages({ conversationId }: ChatMessagesProps) {
  const { messages, loadMessages, typingUsers } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const conversationMessages = messages[conversationId] || [];
  const typingUsersInConversation = typingUsers[conversationId] || [];
  
  // Load messages when conversation changes
  useEffect(() => {
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, typingUsersInConversation]);
  
  if (conversationMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      </div>
    );
  }
  
  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  
  conversationMessages.forEach(message => {
    const messageDate = new Date(message.createdAt).toLocaleDateString();
    
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({
        date: messageDate,
        messages: [message]
      });
    } else {
      groupedMessages[groupedMessages.length - 1]?.messages.push(message);
    }
  });
  
  return (
    <div className="space-y-6">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                {group.date}
              </span>
            </div>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            const isCurrentUser = message.sender === 'current-user-id'; // Replace with actual user ID
            const showAvatar = messageIndex === 0 || 
              group.messages[messageIndex - 1]?.sender !== message.sender;
            
            return (
              <div 
                key={message.messageId} 
                className={cn(
                  "flex items-start gap-2",
                  isCurrentUser && "flex-row-reverse"
                )}
              >
                {showAvatar ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={message.senderInfo?.avatar || 
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} 
                    />
                    <AvatarFallback>
                      {message.senderInfo?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8" />
                )}
                
                <div 
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[70%]",
                    isCurrentUser 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {showAvatar && !isCurrentUser && (
                    <p className="text-xs font-medium mb-1">
                      {message.senderInfo?.name || `User ${message.sender}`}
                    </p>
                  )}
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Typing indicator */}
      {typingUsersInConversation.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '600ms' }} />
          </div>
          <span>
            {typingUsersInConversation.length === 1 
              ? 'Someone is typing...' 
              : `${typingUsersInConversation.length} people are typing...`}
          </span>
        </div>
      )}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
