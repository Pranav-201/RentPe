import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Trash2,
  Bot,
  User as UserIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_PROMPTS = [
  'How does RentPe work?',
  'How do I list an item?',
  'How do I rent an item?',
  'How do rental requests work?',
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`;

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! How can I help you with RentPe today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await aiService.chat(messageText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('RentPe Chatbot Error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process that request right now. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hi! How can I help you with RentPe today?',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-end justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm h-[75vh] sm:h-[500px] flex flex-col rounded-t-2xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0"
          style={{
            background: '#111111',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backgroundImage: GRAIN_SVG,
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight leading-none">
                RentPe AI
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Powered by Zingoo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Clear chat"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-3"
          style={{
            background: '#0a0a0a',
            backgroundImage: `
              ${GRAIN_SVG},
              linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
            `,
            backgroundSize: 'auto, 24px 24px, 24px 24px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#222 transparent',
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      background: '#1c1c1c',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Bot className="w-3 h-3 text-zinc-300" />
                  </div>
                )}

                <div
                  className="max-w-[80%] text-xs whitespace-pre-wrap leading-relaxed px-3 py-2"
                  style={
                    isUser
                      ? {
                        background: '#ffffff',
                        color: '#0a0a0a',
                        fontWeight: 500,
                        borderRadius: '12px 12px 3px 12px',
                      }
                      : msg.isError
                        ? {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,100,100,0.2)',
                          color: '#f87171',
                          borderRadius: '12px 12px 12px 3px',
                        }
                        : {
                          background: '#161616',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#d4d4d8',
                          borderRadius: '12px 12px 12px 3px',
                        }
                  }
                >
                  {msg.content}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      background: '#1c1c1c',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <UserIcon className="w-3 h-3 text-zinc-400" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div
                style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: '#1c1c1c',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 2,
                }}
                className="animate-pulse"
              >
                <Bot className="w-3 h-3 text-zinc-300" />
              </div>
              <div
                style={{
                  background: '#161616',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px 12px 12px 3px',
                  padding: '8px 12px',
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Starter Prompts ── */}
        {messages.length <= 2 && !loading && (
          <div
            className="px-3 py-2.5 flex-shrink-0"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: '#0a0a0a',
            }}
          >
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-semibold mb-1.5">
              Suggested
            </p>
            <div className="flex flex-wrap gap-1">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-200 transition-colors text-left"
                  style={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 7,
                  }}
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-2 h-2 text-zinc-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ── */}
        <div
          className="px-3 py-2.5 flex-shrink-0"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: '#111111',
            backgroundImage: GRAIN_SVG,
            backgroundBlendMode: 'overlay',
          }}
        >
          <style>{`
            .ai-input-gradient-container {
              position: relative;
              display: flex;
              flex: 1;
              border-radius: 10px;
              padding: 1.5px;
              background-image: linear-gradient(135deg, rgb(186, 66, 255) 25%, rgb(0, 225, 255) 100%);
              box-shadow: 0 0 14px rgba(186, 66, 255, 0.4), 0 0 14px rgba(0, 225, 255, 0.3);
            }
          `}</style>

          {/* Smart Search Button Option */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => {
                setIsSmartSearch((prev) => !prev);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all cursor-pointer"
              style={
                isSmartSearch
                  ? {
                    background: 'rgba(0, 225, 255, 0.12)',
                    border: '1px solid rgba(0, 225, 255, 0.4)',
                    color: '#67e8f9',
                    boxShadow: '0 0 10px rgba(0, 225, 255, 0.25)',
                  }
                  : {
                    background: '#161616',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#a1a1aa',
                  }
              }
            >
              <Sparkles className={`w-3 h-3 ${isSmartSearch ? 'text-cyan-300 animate-pulse' : 'text-zinc-400'}`} />
              <span>Smart Search</span>
              {isSmartSearch && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
            {/* {isSmartSearch && (
              <span className="text-[9px] text-zinc-500 font-mono">
                Smart Search Active
              </span>
            )} */}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-end gap-2"
          >
            {isSmartSearch ? (
              <div className="ai-input-gradient-container">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Smart search items, listings, questions..."
                  disabled={loading}
                  className="flex-1 max-h-20 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none"
                  style={{
                    background: '#0a0a0a',
                    borderRadius: 8.5,
                    padding: '8px 12px',
                    border: 'none',
                    width: '100%',
                  }}
                />
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 max-h-20 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none resize-none"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9,
                  padding: '8px 12px',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            )}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              title="Send"
              style={{
                padding: '8px',
                borderRadius: 9,
                background: input.trim() && !loading ? '#ffffff' : '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.08)',
                opacity: input.trim() && !loading ? 1 : 0.4,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !loading ? '#0a0a0a' : '#666' }} />
            </button>
          </form>
          <div className="flex items-center justify-between px-0.5 mt-1 text-[9px] text-zinc-700">


          </div>
        </div>
      </div>
    </div>
  );
};
