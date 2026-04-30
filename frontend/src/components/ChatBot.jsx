import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../api';

const INITIAL_SUGGESTIONS = ['How to search?', 'How to post an ad?', 'How to chat with seller?', 'Is it free?', 'Safety tips'];

// ── Component ────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi there! 👋 I'm **QuikrBot**, your AI-powered assistant!\n\nAsk me anything about how to use QuikrClone — search for products, post ads, contact sellers, manage your profile, and more!",
      suggestions: INITIAL_SUGGESTIONS,
      id: 1,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch top FAQs for suggestions
    api.get('/chatbot/faqs/')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          const topFaqs = res.data.data.filter(f => f.is_active).slice(0, 5).map(f => f.question);
          if (topFaqs.length > 0) {
            setFaqs(topFaqs);
            setMessages(prev => prev.map(m => m.id === 1 ? { ...m, suggestions: topFaqs } : m));
          }
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isTyping) return;

    const userMsgId = Date.now();
    setMessages(prev => [...prev, { from: 'user', text: userText, id: userMsgId }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/chatbot/ask/', { message: userText });
      const { answer } = res.data.data;
      setMessages(prev => [
        ...prev,
        {
          from: 'bot',
          text: answer,
          suggestions: faqs.length > 0 ? faqs : INITIAL_SUGGESTIONS,
          id: Date.now(),
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          from: 'bot',
          text: "I'm having trouble connecting right now. Please try again in a moment! 🔄",
          suggestions: faqs.length > 0 ? faqs : INITIAL_SUGGESTIONS,
          id: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
      if (!isOpen) setUnread(prev => prev + 1);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Backdrop Blur Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-[-1] animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '520px', maxHeight: 'calc(100vh - 110px)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm flex items-center gap-1.5">
                QuikrBot <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              </p>
              <p className="text-indigo-200 text-[11px] flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                AI-powered · RAG enabled
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 ${
                  msg.from === 'bot' ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gray-300'
                }`}>
                  {msg.from === 'bot'
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`flex flex-col gap-1.5 max-w-[78%] ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                  }`}>
                    {renderText(msg.text)}
                  </div>
                  {msg.from === 'bot' && msg.suggestions && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="text-[11px] font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mb-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                disabled={isTyping}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-1.5">
              Powered by QuikrBot AI · Groq LLaMA3 + RAG
            </p>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Toggle chatbot"
      >
        {isOpen
          ? <X className="w-6 h-6 text-white" />
          : <Bot className="w-7 h-7 text-white" />
        }
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20 group-hover:opacity-0 pointer-events-none" />
        )}
      </button>
    </div>
  );
}
