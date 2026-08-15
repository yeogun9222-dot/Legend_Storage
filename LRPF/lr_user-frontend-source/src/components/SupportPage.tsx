import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Mail, FileText, ChevronRight, HelpCircle, Search, X, Clock, CheckCircle2, Paperclip } from 'lucide-react';

type TicketPayload = {
  title: string;
  description: string;
  category: string;
  priority?: string;
  attachments?: string[];
};

type EmailInquiryPayload = {
  name: string;
  email: string;
  title: string;
  content: string;
  attachments?: string[];
};

const SUPPORT_CHANNELS = [
  { title: 'Open Support Ticket', desc: 'Blockchain-tracked requests', icon: FileText, color: 'text-red-400', category: 'GENERAL', priority: 'medium' },
  { title: 'Telegram Desk', desc: 'Route to live ops queue', icon: MessageCircle, color: 'text-blue-400', category: 'TELEGRAM', priority: 'high' },
  { title: 'Email Desk', desc: 'Secure document review queue', icon: Mail, color: 'text-luxury-gold', category: 'EMAIL', priority: 'medium' },
];

const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  category: 'Category',
  priority: 'Priority',
  name: 'Name',
  email: 'Email address',
  content: 'Content',
};

function getSupportErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item: any) => {
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : '';
        const label = FIELD_LABELS[field] || field || 'Input';
        if (item?.type === 'string_too_short' && item?.ctx?.min_length) {
          return `${label} must be at least ${item.ctx.min_length} characters.`;
        }
        if (item?.type === 'string_too_long' && item?.ctx?.max_length) {
          return `${label} must be ${item.ctx.max_length} characters or fewer.`;
        }
        if (item?.type === 'value_error' && item?.msg) {
          return `${label}: ${item.msg}`;
        }
        return item?.msg ? `${label}: ${item.msg}` : fallback;
      })
      .join(' ');
  }
  if (typeof detail === 'string') return detail;
  if (typeof err?.response?.data?.message === 'string') return err.response.data.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
}

export const SupportPage = ({
  portalData,
  onCreateTicket,
  onCreateEmailInquiry,
  onSetView,
  targetTicketId,
  onTargetTicketConsumed,
}: {
  portalData?: any;
  onCreateTicket?: (payload: TicketPayload) => Promise<{ ticketId?: string; status?: string }>;
  onCreateEmailInquiry?: (payload: EmailInquiryPayload) => Promise<{ ticketId?: string; status?: string; emailSent?: boolean }>;
  onSetView?: (view: string) => void;
  targetTicketId?: string | null;
  onTargetTicketConsumed?: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketForm, setTicketForm] = useState<TicketPayload>({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'medium',
    attachments: [],
  });
  const [emailForm, setEmailForm] = useState<EmailInquiryPayload>({
    name: '',
    email: '',
    title: '',
    content: '',
    attachments: [],
  });
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketError, setTicketError] = useState('');

  const faqItems = (portalData?.support?.faq && portalData.support.faq.length > 0)
    ? portalData.support.faq
    : [];

  const tickets = portalData?.support?.tickets || [];

  useEffect(() => {
    if (!targetTicketId) return;
    const found = tickets.find((ticket: any) => ticket.ticketId === targetTicketId);
    if (found) {
      setSelectedTicket(found);
      onTargetTicketConsumed?.();
    }
  }, [targetTicketId, tickets, onTargetTicketConsumed]);

  const filteredFaq = useMemo(
    () =>
      faqItems.filter((item: any) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cat.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [faqItems, searchQuery],
  );

  const readAttachment = (file?: File): Promise<string[]> => {
    if (!file) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('Attachment must be 2MB or smaller.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve([`${file.name}|${file.type || 'application/octet-stream'}|${reader.result}`]);
      reader.onerror = () => reject(new Error('Unable to read attachment.'));
      reader.readAsDataURL(file);
    });
  };

  const openTicketModal = () => {
    setTicketForm({
      title: '',
      description: '',
      category: 'GENERAL',
      priority: 'medium',
      attachments: [],
    });
    setTicketError('');
    setTicketMessage('');
    setIsTicketModalOpen(true);
  };

  const openEmailModal = () => {
    setEmailForm({ name: '', email: '', title: '', content: '', attachments: [] });
    setTicketError('');
    setTicketMessage('');
    setIsEmailModalOpen(true);
  };

  const handleChannelClick = (item: typeof SUPPORT_CHANNELS[number]) => {
    if (item.category === 'TELEGRAM') {
      window.open('https://t.me/+zFBN_zolchYzMTRl', '_blank', 'noopener,noreferrer');
      return;
    }
    if (item.category === 'EMAIL') {
      openEmailModal();
      return;
    }
    openTicketModal();
  };

  const handleSubmitTicket = async () => {
    if (!ticketForm.title.trim()) {
      setTicketError('Please enter a ticket title.');
      return;
    }
    if (ticketForm.title.trim().length < 4) {
      setTicketError('Title must be at least 4 characters.');
      return;
    }
    if (!ticketForm.description.trim()) {
      setTicketError('Please enter a detailed description.');
      return;
    }
    if (ticketForm.description.trim().length < 4) {
      setTicketError('Description must be at least 4 characters.');
      return;
    }

    try {
      const response = await onCreateTicket?.(ticketForm);
      setTicketMessage(`Ticket ${response?.ticketId || ''} was submitted successfully.`.trim());
      setTicketError('');
      setIsTicketModalOpen(false);
    } catch (err: any) {
      setTicketError(getSupportErrorMessage(err, 'Unable to create support ticket.'));
    }
  };

  const handleSubmitEmail = async () => {
    if (!emailForm.name.trim() || !emailForm.email.trim() || !emailForm.title.trim() || !emailForm.content.trim()) {
      setTicketError('Please complete all required email inquiry fields.');
      return;
    }
    if (emailForm.name.trim().length < 2) {
      setTicketError('Name must be at least 2 characters.');
      return;
    }
    if (emailForm.title.trim().length < 4) {
      setTicketError('Subject must be at least 4 characters.');
      return;
    }
    if (emailForm.content.trim().length < 4) {
      setTicketError('Message must be at least 4 characters.');
      return;
    }

    try {
      const response = await onCreateEmailInquiry?.(emailForm);
      setTicketMessage(`Email inquiry ${response?.ticketId || ''} was received. Our team will review it in the admin desk.`.trim());
      setTicketError('');
      setIsEmailModalOpen(false);
    } catch (err: any) {
      setTicketError(getSupportErrorMessage(err, 'Unable to submit email inquiry.'));
    }
  };

  const statusLabel = (status: string) => {
    const normalizedStatus = String(status || '').toUpperCase();
    if (normalizedStatus === 'PENDING') return 'In Review';
    if (normalizedStatus === 'REVIEWING') return 'In Progress';
    if (normalizedStatus === 'RESOLVED') return 'Resolved';
    if (normalizedStatus === 'ON_HOLD' || normalizedStatus === 'HOLD') return 'On Hold';
    return status;
  };

  const statusBadgeClass = (status: string) => {
    const normalizedStatus = String(status || '').toUpperCase();
    if (normalizedStatus === 'RESOLVED') return 'bg-green-500/20 text-green-300';
    if (normalizedStatus === 'REVIEWING') return 'bg-blue-500/20 text-blue-300';
    if (normalizedStatus === 'ON_HOLD' || normalizedStatus === 'HOLD') return 'bg-gray-500/20 text-gray-300';
    return 'bg-yellow-500/20 text-yellow-300';
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    return value.slice(0, 19).replace('T', ' ');
  };

  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-7xl font-serif font-black text-white">CONCIERGE <span className="gold-gradient-text">SUPPORT</span></h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">Operational support is connected to live ticket queues. Submit issues here and review recent case statuses on the same screen.</p>
      </div>

      {ticketMessage && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          {ticketMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUPPORT_CHANNELS.map((item, i) => (
          <motion.div
            key={item.title}
            role="button"
            tabIndex={0}
            onClick={() => handleChannelClick(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleChannelClick(item);
              }
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel cursor-pointer p-10 rounded-2xl text-center space-y-6 group hover:border-luxury-gold/50 transition-all focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
          >
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
              <item.icon size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="text-[10px] font-black tracking-widest text-luxury-gold uppercase group-hover:translate-x-2 transition-transform inline-flex items-center gap-2"
            >
              Connect Now <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        <div className="glass-panel flex min-h-[620px] flex-col rounded-2xl border-white/5 p-10 lg:h-[720px]">
          <div className="flex min-h-0 flex-1 flex-col space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-serif font-bold text-white">Frequently Asked <span className="italic text-luxury-gold">Intelligence</span></h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {filteredFaq.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-400">
                  No FAQ entries have been published yet.
                </div>
              )}
              {filteredFaq.map((item: any) => (
                <motion.div
                  key={`${item.q}-${item.cat}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-luxury-gold/30 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-300 block">{item.q}</span>
                      <span className="inline-block mt-2 text-[8px] font-black px-2 py-1 rounded-lg bg-luxury-gold/10 text-luxury-gold uppercase tracking-widest">{item.cat}</span>
                      {item.a && <p className="mt-3 text-xs text-gray-500 leading-relaxed">{item.a}</p>}
                    </div>
                    <HelpCircle className="text-gray-700 flex-shrink-0" size={18} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-black text-white italic">My Tickets</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live operational queue</p>
            </div>
            <button
              onClick={() => onSetView?.('usdt-fraud-report')}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300 transition-all hover:bg-red-500/20"
            >
              Fraud Report
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-400">
              No support tickets have been created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 6).map((ticket: any) => (
                <button
                  key={ticket.ticketId}
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-luxury-gold/30 hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{ticket.title}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-luxury-gold">{ticket.category}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusBadgeClass(ticket.status)}`}>
                      {statusLabel(ticket.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {formatDateTime(ticket.createdAt)}</span>
                    <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} /> {ticket.priority || 'medium'}</span>
                  </div>
                  {ticket.responses?.length > 0 && (
                    <div className="mt-4 space-y-2 rounded-xl border border-luxury-gold/10 bg-luxury-gold/5 p-3">
                      {ticket.responses.map((response: any, index: number) => (
                        <p key={`${ticket.ticketId}-response-${index}`} className="text-xs leading-relaxed text-gray-300">
                          <span className="font-bold text-luxury-gold">Support:</span> {response.content}
                        </p>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Ticket details"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-panel rounded-2xl border border-luxury-gold/20 p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-luxury-gold">{selectedTicket.category || '-'}</p>
                  <h3 className="text-2xl font-serif font-black text-white italic break-words">{selectedTicket.title}</h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white transition-colors" aria-label="Close ticket details">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Submitted</p>
                  <p className="mt-2 text-xs font-bold text-white">{formatDateTime(selectedTicket.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Priority</p>
                  <p className="mt-2 text-xs font-bold uppercase text-white">{selectedTicket.priority || 'medium'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Status</p>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusBadgeClass(selectedTicket.status)}`}>
                    {statusLabel(selectedTicket.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Inquiry Details</p>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-gray-300 custom-scrollbar whitespace-pre-wrap">
                  {selectedTicket.description || selectedTicket.content || 'No inquiry details are available.'}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Support Response</p>
                {selectedTicket.responses?.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto space-y-3 custom-scrollbar">
                    {selectedTicket.responses.map((response: any, index: number) => (
                      <div key={`${selectedTicket.ticketId}-detail-response-${index}`} className="rounded-2xl border border-luxury-gold/10 bg-luxury-gold/5 p-4">
                        <p className="text-xs leading-6 text-gray-300 whitespace-pre-wrap">
                          <span className="font-bold text-luxury-gold">Support:</span> {response.content || response.message || '-'}
                        </p>
                        {response.createdAt && (
                          <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-gray-600">{formatDateTime(response.createdAt)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-gray-400">
                    No support response has been posted yet.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTicketModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl glass-panel rounded-2xl border border-luxury-gold/20 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-black text-white italic">Create Support Ticket</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Operational queue submission</p>
                </div>
                <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {ticketError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {ticketError}
                </div>
              )}

              <input
                value={ticketForm.title}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ticket title"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              />
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="TELEGRAM">TELEGRAM</option>
                <option value="EMAIL">EMAIL</option>
                <option value="WITHDRAWAL">WITHDRAWAL</option>
                <option value="SECURITY">SECURITY</option>
              </select>
              <textarea
                value={ticketForm.description}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue in detail."
                className="h-40 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              />
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-4 text-sm text-gray-400 transition-all hover:border-luxury-gold/40">
                <span className="inline-flex items-center gap-2"><Paperclip size={16} /> Optional attachment</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">{ticketForm.attachments?.length ? 'Attached' : '2MB max'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    try {
                      const attachments = await readAttachment(e.target.files?.[0]);
                      setTicketForm((prev) => ({ ...prev, attachments }));
                      setTicketError('');
                    } catch (err: any) {
                      setTicketError(err.message);
                    }
                  }}
                />
              </label>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsTicketModalOpen(false)} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-gray-400 transition-all hover:text-white">
                  Cancel
                </button>
                <button onClick={handleSubmitTicket} className="rounded-xl bg-luxury-gold px-5 py-3 text-sm font-black text-black transition-all hover:brightness-110">
                  Submit Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEmailModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl glass-panel rounded-2xl border border-luxury-gold/20 p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-black text-white italic">Email Desk Inquiry</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin desk submission</p>
                </div>
                <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {ticketError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {ticketError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  value={emailForm.name}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
                />
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
                />
              </div>
              <input
                value={emailForm.title}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Subject"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              />
              <textarea
                value={emailForm.content}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Message"
                className="h-40 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              />
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-4 text-sm text-gray-400 transition-all hover:border-luxury-gold/40">
                <span className="inline-flex items-center gap-2"><Paperclip size={16} /> Optional attachment</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">{emailForm.attachments?.length ? 'Attached' : '2MB max'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    try {
                      const attachments = await readAttachment(e.target.files?.[0]);
                      setEmailForm((prev) => ({ ...prev, attachments }));
                      setTicketError('');
                    } catch (err: any) {
                      setTicketError(err.message);
                    }
                  }}
                />
              </label>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEmailModalOpen(false)} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-gray-400 transition-all hover:text-white">
                  Cancel
                </button>
                <button onClick={handleSubmitEmail} className="rounded-xl bg-luxury-gold px-5 py-3 text-sm font-black text-black transition-all hover:brightness-110">
                  Submit Inquiry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
