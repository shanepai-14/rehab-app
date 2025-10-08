// src/Dashboard/components/patient/ChatTab.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Search, Loader2, MessageSquare, Stethoscope } from 'lucide-react';
import apiService from '../../../Services/api';
import { toast } from 'sonner';
import moment from 'moment';


const ChatTab = ({ user , onMessagesRead }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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

  // Load chat list (doctors)
  const loadChatList = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/chat/users');
      if (response.data.success) {
        setChatList(response.data.data);
      }
    } catch (error) {
      console.error('Error loading chat list:', error);
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  // Load messages with selected doctor
  const loadMessages = async (doctorId) => {
    try {
      const response = await apiService.get(`/chat/messages/${doctorId}`);
      if (response.data.success) {
        setMessages(response.data.data.messages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedDoctor) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistically add message to UI
    const optimisticMessage = {
      id: tempId,
      message: messageText,
      sender_id: user.id,
      receiver_id: selectedDoctor.id,
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
        receiver_id: selectedDoctor.id,
        message: messageText
      });

      if (response.data.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? response.data.data : msg
        ));
        
        // Update chat list
        updateChatListItem(user.id, selectedDoctor.id, messageText, new Date());
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

  const updateChatListItem = useCallback((senderId, receiverId, messageText, timestamp) => {
  setChatList(prev => {
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

    return updatedList.sort((a, b) => {
      const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at) : new Date(0);
      const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at) : new Date(0);
      return timeB - timeA;
    });
  });
}, [user.id]);


  // Setup Pusher listener using contact_number
  useEffect(() => {
    loadChatList();
  }, [user]);

  // Load messages when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      loadMessages(selectedDoctor.id);

       apiService.patch(`/chat/read/${selectedDoctor.id}`)
        .then(() => {
          // Notify parent to refresh unread count
          if (onMessagesRead) {
            onMessagesRead(); 
          }
        })
        .catch(console.error);

              setChatList(prev => prev.map(chat => 
        chat.id === selectedDoctor.id ? { ...chat, unread_count: 0 } : chat
      ));

    }
  }, [selectedDoctor, onMessagesRead]);

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
        {/* Chat List Sidebar - Doctors */}
        <div className={`${selectedDoctor ? 'hidden md:flex' : 'flex'} md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Doctors
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search doctors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Doctors List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatList.length > 0 ? (
              filteredChatList.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                    selectedDoctor?.id === doctor.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold flex-shrink-0 relative">
                        {doctor.first_name?.charAt(0)}{doctor.last_name?.charAt(0)}
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                          <Stethoscope className="w-3 h-3 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          Dr. {doctor.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          District {doctor.district}
                        </p>
                        {doctor.last_message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {doctor.last_message.is_mine ? 'You: ' : ''}
                            {doctor.last_message.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {doctor.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1 flex-shrink-0">
                        {doctor.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Stethoscope className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No doctors available</p>
                <p className="text-sm mt-1">Doctors in your district will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        {selectedDoctor ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="md:hidden p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold relative">
                {selectedDoctor.first_name?.charAt(0)}{selectedDoctor.last_name?.charAt(0)}
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                  <Stethoscope className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Dr. {selectedDoctor.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  District {selectedDoctor.district}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        message.is_mine
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      {!message.is_mine && (
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                          Dr. {selectedDoctor.name}
                        </p>
                      )}
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
                    <p className="text-sm">Start the conversation with your doctor!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Your doctor will receive your message in real-time
              </p>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <Stethoscope className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Select a doctor to start chatting</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Connect with your healthcare provider
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;