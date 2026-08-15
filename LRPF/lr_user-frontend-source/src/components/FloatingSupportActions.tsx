import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Headphones, Send, X as XIcon } from 'lucide-react';
import apiService from '../services/api';

export function FloatingSupportActions({
  isLoggedIn,
  onRequireLogin,
  openRequestKey = 0,
}: {
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  openRequestKey?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [thread, setThread] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const loadThread = async () => {
    setIsLoading(true);
    try {
      const nextThread = await apiService.getChatThread();
      setThread(nextThread);
      setMessages(nextThread.messages || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !isLoggedIn) return undefined;
    loadThread();
    const timer = window.setInterval(loadThread, 5000);
    return () => window.clearInterval(timer);
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    if (!openRequestKey) return;
    openChat();
  }, [openRequestKey]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      const messageList = messageListRef.current;
      if (!messageList) return;
      messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
    });
  }, [isOpen, messages.length]);

  const openChat = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setIsOpen(true);
  };

  const sendMessage = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue('');
    const sent = await apiService.sendChatMessage(content);
    setMessages((prev) => [...prev, sent]);
    await loadThread();
  };

  return (
    <>
      <div className="fixed bottom-[calc(6rem_+_env(safe-area-inset-bottom))] right-4 z-[220] flex flex-col gap-4 lg:bottom-8 lg:right-8">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-500 to-rose-400 text-white shadow-[0_8px_20px_rgba(220,38,38,0.5)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.6)]"
          onClick={openChat}
          title="Customer Support"
        >
          <Headphones size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-400 text-white shadow-[0_8px_20px_rgba(249,115,22,0.5)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(249,115,22,0.6)]"
          onClick={() => window.open('https://t.me/+wsImWF057bA4ZTg9', '_blank', 'noopener,noreferrer')}
          title="Telegram Community"
        >
          <Send size={24} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[210] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed top-[200px] bottom-[calc(6rem_+_env(safe-area-inset-bottom))] right-4 z-[230] flex w-[340px] max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-luxury-gold/30 bg-gradient-to-br from-[#1a0505] to-[#0a0a0a] shadow-[0_20px_60px_rgba(0,0,0,0.8)] lg:bottom-24 lg:right-8"
            >
              <div className="flex items-center justify-between border-b border-luxury-gold/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-luxury-gold/20">
                    <Headphones size={20} className="text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Customer Support</h3>
                    <p className="text-xs text-gray-400">{thread?.id ? `Room ${thread.id.slice(0, 8)}` : 'Live desk'}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-2 transition-colors hover:bg-white/10">
                  <XIcon size={18} className="text-gray-400" />
                </button>
              </div>

              <div ref={messageListRef} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
                {isLoading && messages.length === 0 && <p className="text-sm text-gray-500">Loading chat...</p>}
                {!isLoading && messages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-gray-400">
                    Send a message to start a support chat.
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[240px] rounded-lg px-4 py-3 text-sm ${msg.senderType === 'user' ? 'bg-gradient-to-r from-luxury-gold to-yellow-400 font-semibold text-black' : 'border border-white/10 bg-white/10 text-gray-300'}`}>
                      <p>{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${msg.senderType === 'user' ? 'text-black/50' : 'text-gray-500'}`}>{msg.senderName}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-luxury-gold/20 p-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 transition-colors focus:border-luxury-gold/50 focus:outline-none"
                />
                <button onClick={sendMessage} className="rounded-lg bg-gradient-to-r from-luxury-gold to-yellow-400 px-4 py-2 font-black text-black transition-all hover:shadow-lg">
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
