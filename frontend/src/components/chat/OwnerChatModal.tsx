import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowLeft,
  Send,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Product, Order, OrderMessage, User } from '../../types';
import { orderService } from '../../services/orderService';
import { getChatSocket } from '../../services/chatSocket';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// ─── Types & Interfaces ────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isSender: boolean; // true if current user
}

export interface OwnerProfile {
  _id?: string;
  name: string;
  email?: string;
  collegeName?: string;
  phone?: string;
  avatar?: string;
}

export interface OwnerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  owner?: OwnerProfile | null;
  order?: Order | null;
  rentalDays?: number;
  totalPrice?: number;
  onStatusChange?: (order: Order) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`;

export const OwnerChatModal: React.FC<OwnerChatModalProps> = ({
  isOpen,
  onClose,
  product: directProduct,
  owner: directOwner,
  order: propOrder,
  rentalDays: directDays = 1,
  totalPrice: directTotal = 0,
  onStatusChange,
}) => {
  const { user: currentUser, token, firebaseToken } = useAuth();
  const { success, error } = useToast();

  const [activeOrder, setActiveOrder] = useState<Order | null>(propOrder || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNearBottomRef = useRef<boolean>(true);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80;
    const isNear = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isNearBottomRef.current = isNear;
  };

  // Lock body scroll and adapt to mobile virtual keyboard / viewport changes
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleViewportChange = () => {
      if (isNearBottomRef.current) {
        scrollToBottom('auto');
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, [isOpen]);

  // Sync propOrder into activeOrder
  useEffect(() => {
    if (propOrder) {
      setActiveOrder(propOrder);
    }
  }, [propOrder]);

  // Determine Product and Other Party
  const product: Product | null =
    activeOrder?.items?.[0]?.product || directProduct || null;

  const isOwner =
    Boolean(currentUser && activeOrder && (
      (activeOrder.items?.[0]?.product?.owner && (activeOrder.items[0].product.owner as any)._id === currentUser._id) ||
      (activeOrder.items?.[0]?.product?.createdBy && (activeOrder.items[0].product.createdBy as any)._id === currentUser._id) ||
      (currentUser.role === 'admin' && activeOrder.user && (typeof activeOrder.user === 'object' ? activeOrder.user._id : activeOrder.user) !== currentUser._id)
    ));

  const otherUser = isOwner
    ? (typeof activeOrder?.user === 'object' ? activeOrder.user : null)
    : directOwner || (product?.owner as any) || (product?.createdBy as any) || null;

  const otherName =
    (isOwner ? (otherUser as User)?.name : (otherUser as OwnerProfile)?.name) ||
    (isOwner ? 'Customer / Renter' : 'Item Owner');

  const otherInitials = otherName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const productName = product?.name || 'Rental Item';
  const productImage =
    product?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';

  const orderDays = activeOrder?.items?.[0]?.quantity || directDays;
  const orderTotal = activeOrder?.finalPrice || activeOrder?.totalPrice || directTotal || (product?.price ? product.price * orderDays : 0);

  // Sync messages from activeOrder or fallback
  useEffect(() => {
    if (!isOpen) return;

    if (activeOrder && activeOrder.messages && activeOrder.messages.length > 0) {
      const formatted: ChatMessage[] = activeOrder.messages.map((m, idx) => {
        const senderId = typeof m.sender === 'object' ? (m.sender as any)._id : m.sender;
        const isCurrentSender = String(senderId) === String(currentUser?._id);
        const timeStr = m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return {
          id: m._id || `msg-${idx}`,
          senderId: String(senderId),
          senderName: isCurrentSender ? 'You' : (m.senderName || otherName),
          text: m.text,
          timestamp: timeStr,
          isSender: isCurrentSender,
        };
      });
      setMessages(formatted);
    } else if (product && (!activeOrder || !activeOrder.messages || activeOrder.messages.length === 0)) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        {
          id: 'initial-inquiry',
          senderId: currentUser?._id || 'user',
          senderName: 'You',
          text: `Hi ${otherName}! I'm interested in renting your "${productName}" for ${orderDays} day${
            orderDays > 1 ? 's' : ''
          }. Is this item available?`,
          timestamp: timeStr,
          isSender: true,
        },
      ]);
    }

    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom('auto');
    }, 100);
  }, [isOpen, activeOrder, currentUser, otherName, productName, orderDays, product]);

  useEffect(() => {
    const activeToken = firebaseToken || token;
    if (!isOpen || !activeOrder?._id || !activeToken) return;

    const socket = getChatSocket(activeToken);
    const handleNewMessage = (message: OrderMessage & { order?: string }) => {
      if (message.order && String(message.order) !== String(activeOrder._id)) return;

      const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
      const isCurrentSender = String(senderId) === String(currentUser?._id);

      setMessages((prev) => {
        if (message._id && prev.some((item) => item.id === message._id)) {
          return prev;
        }

        return [
          ...prev,
          {
            id: message._id || `msg-${Date.now()}`,
            senderId: String(senderId),
            senderName: isCurrentSender ? 'You' : (message.senderName || otherName),
            text: message.text,
            timestamp: message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            isSender: isCurrentSender,
          }
        ];
      });

      if (isCurrentSender || isNearBottomRef.current) {
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    };

    const joinRoom = () => socket.emit('joinConversation', activeOrder._id);
    socket.on('newMessage', handleNewMessage);
    socket.on('connect', joinRoom);
    joinRoom();

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('connect', joinRoom);
    };
  }, [isOpen, activeOrder?._id, firebaseToken, token, currentUser?._id, otherName]);

  if (!isOpen) return null;

  // Handle message send
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom('smooth'), 50);

    if (activeOrder?._id) {
      try {
        setSending(true);
        const activeToken = firebaseToken || token;
        const socket = activeToken ? getChatSocket(activeToken) : null;

        if (socket?.connected) {
          await new Promise<void>((resolve, reject) => {
            socket.emit('sendMessage', {
              conversationId: activeOrder._id,
              text,
            }, (result: { ok: boolean; error?: string }) => {
              if (result?.ok) resolve();
              else reject(new Error(result?.error || 'Failed to send message'));
            });
          });
        } else {
          const res = await orderService.addMessage(activeOrder._id, text);
          setActiveOrder(res.order);
          if (onStatusChange) onStatusChange(res.order);
        }
      } catch (err: any) {
        error(err.message || 'Failed to send message');
      } finally {
        setSending(false);
        setTimeout(() => {
          inputRef.current?.focus();
          scrollToBottom('smooth');
        }, 50);
      }
    }
  };

  // Owner Quick Action: Accept
  const handleAcceptRequest = async () => {
    if (!activeOrder?._id) return;
    try {
      setActionLoading(true);
      const res = await orderService.updateStatus(activeOrder._id, { status: 'accepted' });
      setActiveOrder(res.order);
      success('Rental request accepted! Chat unlocked.');
      if (onStatusChange) onStatusChange(res.order);
    } catch (err: any) {
      error(err.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  // Owner Quick Action: Decline
  const handleDeclineRequest = async () => {
    if (!activeOrder?._id) return;
    try {
      setActionLoading(true);
      const res = await orderService.updateStatus(activeOrder._id, { status: 'declined' });
      setActiveOrder(res.order);
      success('Rental request declined');
      if (onStatusChange) onStatusChange(res.order);
    } catch (err: any) {
      error(err.message || 'Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isPending = activeOrder?.status === 'pending';
  const isAccepted = activeOrder?.status === 'accepted' || activeOrder?.status === 'confirmed';
  const isDeclined = activeOrder?.status === 'declined' || activeOrder?.status === 'cancelled';

  return createPortal((
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overscroll-none"
      onClick={onClose}
    >
      {/* Compact Chat Modal Window */}
      <div
        className="w-full sm:max-w-[460px] h-[100dvh] sm:h-[540px] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200 overscroll-contain"
        style={{
          background: '#09090b',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Chat Header ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 flex-shrink-0"
          style={{
            background: '#121215',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backgroundImage: GRAIN_SVG,
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                {otherInitials || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#121215]" />
            </div>

            {/* Title / User info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white tracking-tight truncate leading-none">
                  {isOwner ? `Customer: ${otherName}` : `Owner: ${otherName}`}
                </h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[9px] font-semibold text-emerald-400">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                {activeOrder?.orderNumber || (activeOrder?._id ? `#${activeOrder._id.slice(-6).toUpperCase()}` : 'Direct Rental Inquiry')}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Pinned Product Banner ────────────────────────────────────── */}
        <div
          className="px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0"
          style={{
            background: '#101014',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={productImage}
              alt={productName}
              className="w-8 h-8 rounded-lg object-cover bg-zinc-900 border border-zinc-800 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-2 h-2 text-zinc-300" /> Rental Item
              </div>
              <p className="text-xs font-semibold text-white truncate" title={productName}>
                {productName}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs font-bold text-white font-mono">
              ₹{orderTotal.toFixed(0)}
            </div>
            <div className="text-[9px] text-zinc-400 font-mono">
              {orderDays} day{orderDays > 1 ? 's' : ''} rental
            </div>
          </div>
        </div>

        {/* ── Request Status Banner & Action Options ────────────────────── */}
        {activeOrder && (
          <div
            className={`px-3.5 sm:px-4 py-2 text-xs flex items-center justify-between gap-2 border-b flex-shrink-0 ${
              isAccepted
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                : isDeclined
                ? 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {isAccepted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-[11px] truncate">Request Accepted — Chat & coordinate pickup</span>
                </>
              ) : isDeclined ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold text-[11px] truncate">Request Declined</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className="font-semibold text-[11px] truncate">
                    {isOwner ? 'Pending Request from customer' : 'Waiting for owner acceptance'}
                  </span>
                </>
              )}
            </div>

            {/* If Owner & Status is Pending: Provide Accept & Decline Buttons */}
            {isOwner && isPending && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleAcceptRequest}
                  disabled={actionLoading}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  Accept
                </button>
                <button
                  onClick={handleDeclineRequest}
                  disabled={actionLoading}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-zinc-700 font-semibold text-[11px] transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3" />
                  Decline
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Messages Feed ───────────────────────────────────────────── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-2.5 overscroll-contain"
          style={{
            background: '#09090b',
            backgroundImage: `
              ${GRAIN_SVG},
              linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
            `,
            backgroundSize: 'auto, 24px 24px, 24px 24px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#27272a transparent',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSender ? 'items-end' : 'items-start'} gap-0.5 max-w-full`}
            >
              <div
                className="max-w-[85%] sm:max-w-[80%] px-3 py-2 text-[12px] leading-relaxed break-words"
                style={
                  msg.isSender
                    ? {
                        background: '#ffffff',
                        color: '#09090b',
                        fontWeight: 500,
                        borderRadius: '12px 12px 3px 12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        overflowWrap: 'anywhere',
                      }
                    : {
                        background: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f4f4f5',
                        borderRadius: '12px 12px 12px 3px',
                        overflowWrap: 'anywhere',
                      }
                }
              >
                {!msg.isSender && (
                  <p className="text-[10px] font-bold text-zinc-400 mb-0.5 font-mono">
                    {msg.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 px-1 text-[9px] text-zinc-500 font-mono">
                <span>{msg.timestamp}</span>
                {msg.isSender && <CheckCheck className="w-3 h-3 text-zinc-400" />}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ───────────────────────────────────────────────── */}
        <div
          className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2 flex-shrink-0"
          style={{
            background: '#121215',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDeclined}
            placeholder={
              isDeclined
                ? 'Request was declined.'
                : isPending && !isOwner
                ? 'Type to message owner while pending...'
                : `Type message to ${otherName}...`
            }
            className="flex-1 min-w-0 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-all disabled:opacity-50"
            style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
            }}
          />

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || sending || isDeclined}
            className="px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 rounded-xl"
            style={
              inputText.trim() && !isDeclined
                ? {
                    background: '#ffffff',
                    color: '#000000',
                    boxShadow: '0 2px 8px rgba(255,255,255,0.15)',
                  }
                : {
                    background: '#27272a',
                    color: '#71717a',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }
            }
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-xs">Send</span>
          </button>
        </div>
      </div>
    </div>
  ), document.body);
};
