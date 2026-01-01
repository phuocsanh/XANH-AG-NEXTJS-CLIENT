"use client"

import { useState, useEffect, useRef } from "react"
import { useChatStore } from "@/stores/chatStore"
import { useAppStore } from "@/stores"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, X, LogIn } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Lấy trạng thái đăng nhập từ app store
  const isLogin = useAppStore((state) => state.isLogin)

  const {
    isInitialized,
    initializeClient,
    activeConversationId,
    messages,
    sendMessage,
    sendTypingStatus,
    typingUsers,
  } = useChatStore()

  const conversationMessages = activeConversationId
    ? messages[activeConversationId] || []
    : []
  const typingUsersInConversation = activeConversationId
    ? typingUsers[activeConversationId] || []
    : []

  // Khởi tạo chat client khi dialog mở
  useEffect(() => {
    if (open) {
      if (isLogin && !isInitialized) {
        const token = localStorage.getItem("token")
        
        // Chỉ khởi tạo nếu có token
        if (token) {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
          const socketUrl =
            process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"

          initializeClient(apiUrl, socketUrl, token)
            .then(() => {
              // Nếu không có cuộc trò chuyện nào, tạo một cuộc trò chuyện mặc định với admin
              if (!activeConversationId) {
                // Trong thực tế, bạn sẽ cần lấy ID của admin từ API
                const adminId = "admin-user-id"
                useChatStore
                  .getState()
                  .createConversation("direct", null, [adminId])
                  .then((conversation) => {
                    useChatStore
                      .getState()
                      .setActiveConversation(conversation.conversationId)
                  })
                  .catch((error) => {
                    console.error("Failed to create default conversation:", error)
                  })
              }
            })
            .catch((error) => {
              console.error("Failed to initialize chat:", error)
            })
        }
      }
    }
  }, [open, isLogin, isInitialized, initializeClient, activeConversationId])

  // Cuộn xuống dưới khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationMessages, typingUsersInConversation])

  // Xử lý typing status
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      sendTypingStatus(true)
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        sendTypingStatus(false)
      }, 2000)
    } else {
      sendTypingStatus(false)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [isTyping, sendTypingStatus])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleSendMessage = () => {
    if (!message.trim() && files.length === 0) return

    if (files.length > 0) {
      // Xử lý gửi file (hình ảnh, video)
      // Trong thực tế, bạn sẽ cần upload files lên server trước
      // và nhận về URLs để gửi kèm tin nhắn
      console.log("Sending files:", files)

      // Giả lập gửi tin nhắn với file
      sendMessage(
        message,
        files.map((_, index) => `attachment-${index}`)
      )
    } else {
      // Gửi tin nhắn văn bản
      sendMessage(message)
    }

    // Reset form
    setMessage("")
    setFiles([])
    setIsTyping(false)

    // Focus lại vào textarea
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Xử lý chuyển hướng đến trang đăng nhập
  const handleLoginClick = () => {
    router.push("/login")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md h-[500px] flex flex-col p-0 gap-0'>
        <DialogHeader className='p-4 border-b'>
          <DialogTitle>Chat với GN Farm</DialogTitle>
        </DialogHeader>

        {!isLogin ? (
          // Hiển thị thông báo đăng nhập nếu chưa đăng nhập
          <div className='flex-1 flex flex-col items-center justify-center p-6 text-center'>
            <div className='mb-6'>
              <Avatar className='h-20 w-20 mx-auto mb-4'>
                <AvatarImage src='https://cdn-icons-png.flaticon.com/128/8044/8044419.png' />
                <AvatarFallback>GN</AvatarFallback>
              </Avatar>
              <h3 className='text-xl font-semibold mb-2'>
                Chào mừng đến với GN Farm
              </h3>
              <p className='text-muted-foreground mb-6'>
                Vui lòng đăng nhập để bắt đầu trò chuyện với chúng tôi
              </p>
              <Button onClick={handleLoginClick} className='gap-2'>
                <LogIn className='h-4 w-4' />
                Đăng nhập
              </Button>
            </div>
          </div>
        ) : (
          // Hiển thị chat nếu đã đăng nhập
          <>
            {/* Khu vực tin nhắn */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {conversationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2",
                    msg.sender === "current-user" ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={
                        msg.sender === "current-user"
                          ? "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                          : "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                      }
                    />
                    <AvatarFallback>
                      {msg.sender === "current-user" ? "U" : "A"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%]",
                      msg.sender === "current-user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}

                    {/* Hiển thị file đính kèm nếu có */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className='mt-2 space-y-2'>
                        {msg.attachments.map((attachment, i) => (
                          <div key={i} className='text-xs underline'>
                            Attachment: {attachment}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Hiển thị typing indicator */}
              {typingUsersInConversation.length > 0 && (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <div className='flex space-x-1'>
                    <span className='animate-bounce'>.</span>
                    <span className='animate-bounce delay-100'>.</span>
                    <span className='animate-bounce delay-200'>.</span>
                  </div>
                  <span>Đang nhập...</span>
                </div>
              )}

              {/* Điểm cuối để cuộn xuống */}
              <div ref={messagesEndRef} />
            </div>

            {/* Hiển thị file đã chọn */}
            {files.length > 0 && (
              <div className='px-4 py-2 border-t flex flex-wrap gap-2'>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-xs'
                  >
                    <span className='truncate max-w-[100px]'>{file.name}</span>
                    <button
                      type='button'
                      onClick={() => handleRemoveFile(index)}
                      className='text-muted-foreground hover:text-foreground'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Khu vực nhập tin nhắn */}
            <div className='p-4 border-t flex items-end gap-2'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileSelect}
                className='hidden'
                multiple
                accept='image/*,video/*'
              />

              <Button
                type='button'
                size='icon'
                variant='ghost'
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className='h-5 w-5' />
              </Button>

              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder='Nhập tin nhắn...'
                className='flex-1 min-h-[40px] max-h-[120px]'
                rows={1}
              />

              <Button
                type='button'
                size='icon'
                onClick={handleSendMessage}
                disabled={!message.trim() && files.length === 0}
              >
                <Send className='h-5 w-5' />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
