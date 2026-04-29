import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  MessageCircle, Send, ArrowLeft, Loader2, Check, CheckCheck, User
} from 'lucide-react';

export default function Chat() {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('room');

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(initialRoomId ? parseInt(initialRoomId) : null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    fetchRooms();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      setupWebSocket(activeRoomId);
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [activeRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/chat/rooms/');
      if (res.data.success) {
        setRooms(res.data.data);
        if (!activeRoomId && res.data.data.length > 0 && !initialRoomId) {
          setActiveRoomId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
        // Mark room as read locally
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unread_count: 0 } : r));
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const setupWebSocket = (roomId) => {
    if (ws.current) {
      ws.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//127.0.0.1:8000/api/v1/chat/ws/${roomId}?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
      
      // Update room last message
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, last_message: msg.content, last_message_at: msg.created_at };
        }
        return r;
      }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)));
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    ws.current.send(newMessage);
    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  if (!isLoggedIn) return null;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-6 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-6xl mx-auto h-[80vh] flex bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
        
        {/* Sidebar - Room List */}
        <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" /> Messages
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No messages yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-3 ${
                      activeRoomId === room.id ? 'bg-indigo-50/50 relative' : ''
                    }`}
                  >
                    {activeRoomId === room.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                    )}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      {room.other_user_avatar ? (
                        <img src={room.other_user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                          {room.other_user_name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 truncate pr-2">{room.other_user_name}</span>
                        {room.last_message_at && (
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(room.last_message_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium truncate max-w-[140px]">
                          {room.ad_title}
                        </span>
                        {room.unread_count > 0 && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {room.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {room.last_message || 'Start chatting...'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
          {activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
                <button 
                  onClick={() => setActiveRoomId(null)}
                  className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    {activeRoom.other_user_avatar ? (
                      <img src={activeRoom.other_user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                        {activeRoom.other_user_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{activeRoom.other_user_name}</h3>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Regarding: {activeRoom.ad_title}
                    </p>
                  </div>
                </div>
                {activeRoom.ad_image && (
                  <img src={activeRoom.ad_image} alt="Ad" className="w-12 h-12 rounded-lg object-cover border border-gray-200 hidden sm:block" />
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-br-sm' 
                              : 'bg-white border border-gray-100 shadow-sm text-gray-900 rounded-bl-sm'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                              <span className="text-[10px]">
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              {isMe && (
                                msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-md"
                  >
                    <Send className="w-5 h-5 -ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="font-medium text-lg text-gray-500">Select a chat to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
