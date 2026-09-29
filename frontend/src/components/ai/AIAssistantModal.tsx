import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Trash2,
  Bot,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Tag,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { aiService, SmartSearchResultItem } from '../../services/aiService';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  isSmartSearch?: boolean;
  results?: SmartSearchResultItem[];
  detailedProduct?: Product;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NORMAL_STARTER_PROMPTS = [
  'How does RentPe work?',
  'How do I list an item?',
  'How do I rent an item?',
  'How do rental requests work?',
];

const SMART_SEARCH_STARTER_PROMPTS = [
  'I need an ESP32, Raspberry Pi and breadboard',
  'Need a DSLR camera and tripod for shoot',
  'Looking for scientific calculator & engineering books',
  'Need a laptop stand and mechanical keyboard',
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`;

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
      const data = await aiService.chat(messageText, isSmartSearch);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isSmartSearch: Boolean(data.isSmartSearch),
        results: data.results,
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

  const handleGetDetails = (product: Product) => {
    const detailMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Here are the details for ${product.name}:`,
      timestamp: new Date(),
      detailedProduct: product,
    };
    setMessages((prev) => [...prev, detailMessage]);
  };

  const handleViewListing = (productId: string) => {
    onClose();
    navigate(`/products/${productId}`);
  };

  const handleRequestRental = async (product: Product) => {
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Add to cart failed:', error);
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
        content: isSmartSearch
          ? 'Smart Search is active. Tell me what project you are building or which items you need!'
          : 'Hi! How can I help you with RentPe today?',
        timestamp: new Date(),
      },
    ]);
  };

  const starterPrompts = isSmartSearch ? SMART_SEARCH_STARTER_PROMPTS : NORMAL_STARTER_PROMPTS;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-end justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-[80vh] sm:h-[540px] flex flex-col rounded-t-2xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
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
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          className="flex-1 overflow-y-auto p-3 space-y-3.5"
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
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}>
                <div className={`flex gap-2 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        flexShrink: 0,
                        background: '#1c1c1c',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Bot className="w-3 h-3 text-zinc-300" />
                    </div>
                  )}

                  <div
                    className="max-w-[88%] text-xs leading-relaxed px-3.5 py-2.5 space-y-2"
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
                            background: '#141414',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#e4e4e7',
                            borderRadius: '12px 12px 12px 3px',
                          }
                    }
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* ── Smart Search Results Rendering ── */}
                    {msg.results && msg.results.length > 0 && (
                      <div className="space-y-3 pt-1">
                        {msg.results.map((resultGroup, idx) => (
                          <div key={idx} className="space-y-1.5">
                            {/* Requirement Header */}
                            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 pb-1 border-b border-zinc-800">
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-cyan-400" />
                                {resultGroup.requirement}
                              </span>
                              {resultGroup.found ? (
                                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Found
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                                  <AlertCircle className="w-3 h-3" /> Not currently available
                                </span>
                              )}
                            </div>

                            {/* Matching Products Cards */}
                            {resultGroup.found && resultGroup.products.length > 0 ? (
                              <div className="grid grid-cols-1 gap-2">
                                {resultGroup.products.map((product) => {
                                  const imgUrl =
                                    product.images && product.images.length > 0
                                      ? product.images[0].url
                                      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

                                  return (
                                    <div
                                      key={product._id}
                                      className="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-colors text-zinc-200"
                                    >
                                      <div className="flex items-start gap-2.5">
                                        <img
                                          src={imgUrl}
                                          alt={product.name}
                                          className="w-12 h-12 rounded object-cover flex-shrink-0 bg-zinc-800 border border-zinc-800"
                                        />
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs font-semibold text-white leading-tight truncate">
                                            {product.name}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-emerald-400">
                                              ₹{product.pricePerDay || product.price}/day
                                            </span>
                                            <span
                                              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                                product.isAvailable
                                                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                                                  : 'bg-zinc-800 text-zinc-400'
                                              }`}
                                            >
                                              {product.isAvailable ? 'Available' : 'Rented'}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" />
                                            {product.location || 'On Campus'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Get Details Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleGetDetails(product)}
                                        className="w-full py-1.5 px-2.5 rounded text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <span>Get Details</span>
                                        <ArrowRight className="w-3 h-3 text-zinc-400" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800/60 text-[11px] text-zinc-500 italic">
                                No active listings currently available for this requirement.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Product Details Card (Inside Chat) ── */}
                    {msg.detailedProduct && (
                      <div className="mt-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2.5 text-zinc-200">
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              msg.detailedProduct.images && msg.detailedProduct.images.length > 0
                                ? msg.detailedProduct.images[0].url
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
                            }
                            alt={msg.detailedProduct.name}
                            className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-zinc-800 border border-zinc-800"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {msg.detailedProduct.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-400">
                                ₹{msg.detailedProduct.pricePerDay || msg.detailedProduct.price}/day
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                  msg.detailedProduct.isAvailable
                                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {msg.detailedProduct.isAvailable ? 'Available' : 'Rented'}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 flex flex-wrap gap-x-2 gap-y-0.5">
                              <span>Condition: {msg.detailedProduct.condition || 'Good'}</span>
                              <span>•</span>
                              <span>Deposit: ₹{msg.detailedProduct.securityDeposit || 0}</span>
                              <span>•</span>
                              <span>{msg.detailedProduct.location || 'On Campus'}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-300 leading-relaxed pt-1 border-t border-zinc-800">
                          {msg.detailedProduct.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleViewListing(msg.detailedProduct!._id)}
                            className="py-1.5 px-2 rounded text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>View Listing</span>
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestRental(msg.detailedProduct!)}
                            className="py-1.5 px-2 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Request Rental</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        flexShrink: 0,
                        background: '#1c1c1c',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      <UserIcon className="w-3 h-3 text-zinc-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  flexShrink: 0,
                  background: '#1c1c1c',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
              {isSmartSearch ? 'Suggested Project Queries' : 'Suggested'}
            </p>
            <div className="flex flex-wrap gap-1">
              {starterPrompts.map((prompt) => (
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
                  <span className="truncate max-w-[280px]">{prompt}</span>
                  <ArrowRight className="w-2 h-2 text-zinc-600 flex-shrink-0" />
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

          {/* Smart Search Toggle Button */}
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
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
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
                  placeholder="Describe your project or what items you need..."
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
                placeholder="Ask anything about RentPe..."
                disabled={loading}
                className="flex-1 max-h-20 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none resize-none"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9,
                  padding: '8px 12px',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
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
              <Send
                className="w-3.5 h-3.5"
                style={{ color: input.trim() && !loading ? '#0a0a0a' : '#666' }}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

