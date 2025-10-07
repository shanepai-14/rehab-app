// src/Dashboard/components/doctor/ChatTab.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Search, Loader2, MessageSquare } from 'lucide-react';
import apiService from '../../../Services/api';
import { toast } from 'sonner';
import moment from 'moment';
import pusherService from '../../../Services/pusher';

const ChatTab = ({ user }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat list
  const loadChatList = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/chat/users');
      if (response.data.success) {
        setChatList(response.data.data);
      }
    } catch (error) {
      console.error('Error loading chat list:', error);
      toast.error('Failed to load chat list');
    } finally {
      setLoading(false);
    }
  };

  // Load messages with selected user
  const loadMessages = async (userId) => {
    try {
      const response = await apiService.get(`/chat/messages/${userId}`);
      if (response.data.success) {
        setMessages(response.data.data.messages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Update chat list without full reload
  const updateChatListItem = useCallback((senderId, receiverId, messageText, timestamp) => {
    setChatList(prev => {
      // Find the chat to update (could be sender or receiver)
      const chatUserId = senderId === user.id ? receiverId : senderId;
      const isMine = senderId === user.id;
      
      const updatedList = prev.map(chat => {
        if (chat.id === chatUserId) {
          return {
            ...chat,
            last_message: {
              message: messageText,
              created_at: timestamp,
              is_mine: isMine
            },
            unread_count: isMine ? chat.unread_count : chat.unread_count + 1
          };
        }
        return chat;
      });

      // Sort by last message time
      return updatedList.sort((a, b) => {
        const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at) : new Date(0);
        const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at) : new Date(0);
        return timeB - timeA;
      });
    });
  }, [user.id]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistically add message to UI
    const optimisticMessage = {
      id: tempId,
      message: messageText,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      is_mine: true,
      is_read: false,
      created_at: new Date().toISOString(),
      formatted_time: moment().format('g:i A'),
      sender_name: `${user.first_name} ${user.last_name}`
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setTimeout(scrollToBottom, 100);

    try {
      setSending(true);
      const response = await apiService.post('/chat/send', {
        receiver_id: selectedUser.id,
        message: messageText
      });

      if (response.data.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? response.data.data : msg
        ));
        
        // Update chat list
        updateChatListItem(user.id, selectedUser.id, messageText, new Date());
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Handle incoming messages from Pusher
  const handleIncomingMessage = useCallback((event) => {
    console.log('💬 Chat tab received message:', event);
    
    // Check if message is relevant to current conversation
    const isRelevantMessage = selectedUser && (
      (event.sender_id === selectedUser.id && event.receiver_contact_number === user.contact_number) ||
      (event.receiver_id === selectedUser.id && event.sender_contact_number === user.contact_number)
    );
    
    if (isRelevantMessage) {
      const newMsg = {
        id: event.id,
        message: event.message,
        sender_id: event.sender_id,
        receiver_id: event.receiver_id,
        is_mine: event.sender_contact_number === user.contact_number,
        is_read: event.is_read,
        created_at: event.created_at,
        formatted_time: moment(event.created_at).format('g:i A'),
        sender_name: event.sender_name
      };
      
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.some(m => m.id === event.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
      
      setTimeout(scrollToBottom, 100);
    }

    // Update chat list item only (don't reload entire list)
    updateChatListItem(event.sender_id, event.receiver_id, event.message, event.created_at);
  }, [selectedUser, user, updateChatListItem]);

  // Setup Pusher listener using contact_number
  useEffect(() => {
    loadChatList();

    if (!user || !user.contact_number) return;

    // Subscribe to user's channel based on contact_number
    const channelName = `user.${user.contact_number}`;
    
    console.log(`💬 ChatTab subscribing to: ${channelName}`);

    pusherService.subscribeToPublicChannel(channelName, {
      'message.sent': handleIncomingMessage
    });

    return () => {
      console.log('🧹 ChatTab unsubscribing from chat channel');
      pusherService.unsubscribe(channelName);
    };
  }, [user, handleIncomingMessage]);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      
      // Mark messages as read when opening chat
      apiService.patch(`/chat/read/${selectedUser.id}`).catch(console.error);
      
      // Reset unread count for this user in the list
      setChatList(prev => prev.map(chat => 
        chat.id === selectedUser.id ? { ...chat, unread_count: 0 } : chat
      ));
    }
  }, [selectedUser]);

  // Filter chat list
  const filteredChatList = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[calc(100vh-180px)] flex">
        {/* Chat List Sidebar */}
        <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatList.length > 0 ? (
              filteredChatList.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedUser(chat)}
                  className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                    selectedUser?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {chat.first_name?.charAt(0)}{chat.last_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {chat.name}
                        </h3>
                        {chat.last_message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chat.last_message.is_mine ? 'You: ' : ''}
                            {chat.last_message.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {chat.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1 flex-shrink-0">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No patients found
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  District {selectedUser.district}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.is_mine
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.is_mine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {message.formatted_time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Select a patient to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;