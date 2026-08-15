import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Info, 
  Cpu, 
  Zap, 
  Calendar,
  Gift,
  ArrowRight,
  X
} from 'lucide-react';

const CATEGORY_STYLES: Record<string, string> = {
  ANNOUNCEMENTS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SYSTEM: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  UPDATE: 'bg-green-500/20 text-green-400 border-green-500/30',
  PROMOTION: 'bg-amber-500/15 text-amber-300 border-red-500/30'
};

const normalizeCategory = (category?: string) => {
  const value = (category || 'ANNOUNCEMENTS').toUpperCase();
  if (value === 'PROMOTIONS') return 'PROMOTION';
  if (value === 'UPDATES') return 'UPDATE';
  if (value === 'MAINTENANCE' || value === 'TECHNICAL') return 'SYSTEM';
  if (value === 'GENERAL' || value === 'REGULATORY') return 'ANNOUNCEMENTS';
  return value;
};

const getCategoryStyle = (category: string) => CATEGORY_STYLES[category] || CATEGORY_STYLES.ANNOUNCEMENTS;

export const NoticesPage = ({ portalData }: { portalData?: any }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const liveNewsItems = useMemo(() => (portalData?.news && portalData.news.length > 0)
    ? portalData.news.map((item: any, index: number) => {
        const category = normalizeCategory(item.category);
        return {
        id: index + 1,
        category,
        isNew: Boolean(item.isNew),
        date: item.date ? item.date.slice(0, 10) : '',
        title: item.title,
        desc: item.desc,
        content: item.content || item.desc || '',
        featuredImage: item.featuredImage,
        icon: category === 'PROMOTION' ? Gift : category === 'SYSTEM' ? Info : Cpu,
        iconBg: category === 'PROMOTION' ? 'bg-red-900/30 text-red-500' : category === 'SYSTEM' ? 'bg-white/5 text-gray-400' : category === 'UPDATE' ? 'bg-green-900/30 text-green-500' : 'bg-blue-900/30 text-blue-500'
      };
    })
    : [], [portalData?.news]);

  const filteredItems = liveNewsItems.filter((item: any) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || `${item.title} ${item.desc} ${item.content}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const selectedItem = selectedIndex === null ? null : filteredItems[selectedIndex];
  const hasPrevious = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < filteredItems.length - 1;

  const categories = ['ALL', 'ANNOUNCEMENTS', 'SYSTEM', 'UPDATE', 'PROMOTION'];

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedIndex(null);
      if (event.key === 'ArrowLeft' && hasPrevious) setSelectedIndex((value) => value === null ? value : value - 1);
      if (event.key === 'ArrowRight' && hasNext) setSelectedIndex((value) => value === null ? value : value + 1);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [hasNext, hasPrevious, selectedItem]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [activeCategory, query]);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-4"
        >
          <span className="text-[10px] font-black text-luxury-gold tracking-[0.6em] uppercase">NEWS & UPDATES</span>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">
            Official Announcements
          </h1>
          <div className="flex items-center justify-center">
             <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent rounded-full opacity-50"></div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-8">
          {/* Categories Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-2xl border border-white/5 space-y-8"
          >
            <div className="space-y-2">
               <h3 className="text-[11px] font-black text-white tracking-[0.4em] uppercase opacity-70">CATEGORIES</h3>
            </div>
            <div className="space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${
                    activeCategory === cat 
                      ? 'bg-luxury-gold text-black shadow-lg shadow-luxury-gold/20' 
                      : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                  <ChevronRight size={14} className={activeCategory === cat ? 'text-black' : 'text-gray-700'} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Search Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6"
          >
             <h3 className="text-[11px] font-black text-white tracking-[0.4em] uppercase opacity-70">SEARCH</h3>
             <div className="relative group">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-luxury-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search news..." 
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-14 py-4 text-[10px] text-white font-bold focus:outline-none focus:border-luxury-gold/30 transition-all placeholder:text-gray-800"
                />
             </div>
          </motion.div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {filteredItems.map((item: any, i: number) => (
            <motion.div 
               key={item.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               onClick={() => setSelectedIndex(i)}
               role="button"
               tabIndex={0}
               onKeyDown={(event) => {
                 if (event.key === 'Enter' || event.key === ' ') {
                   event.preventDefault();
                   setSelectedIndex(i);
                 }
               }}
               className="group glass-panel p-8 lg:p-10 rounded-2xl border border-white/5 hover:border-luxury-gold/20 transition-all relative overflow-hidden cursor-pointer focus:outline-none focus:border-luxury-gold/40"
            >
               <div className="flex items-center gap-8 lg:gap-12 relative z-10">
                  {/* Left Icon Container */}
                  <div className={`w-16 h-16 shrink-0 rounded-[1.5rem] flex items-center justify-center ${item.iconBg} group-hover:scale-110 transition-transform`}>
                     <item.icon size={28} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-4">
                     <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-4 py-1 rounded-full border text-[8px] font-black tracking-widest uppercase flex items-center gap-2 ${getCategoryStyle(item.category)}`}>
                           {item.category === 'PROMOTION' && <Zap size={10} />}
                           {item.category}
                        </span>
                        {item.isNew && (
                           <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-[8px] font-black tracking-widest uppercase">NEW</span>
                        )}
                        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold tracking-widest uppercase ml-auto lg:ml-0">
                           <Calendar size={12} /> {item.date}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <h2 className="text-xl lg:text-2xl font-black text-white group-hover:text-luxury-gold transition-colors tracking-tight">
                           {item.title}
                        </h2>
                        <p className="text-[10px] lg:text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-1">
                           {item.desc}
                        </p>
                     </div>
                  </div>

                  {/* Right Arrow Button */}
                  <div className="shrink-0 hidden sm:block">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-700 group-hover:bg-luxury-gold/10 group-hover:text-luxury-gold transition-all border border-transparent group-hover:border-luxury-gold/20">
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
          {filteredItems.length === 0 && (
            <div className="glass-panel p-10 rounded-2xl border border-white/5 text-center text-sm font-bold text-gray-500">
              No announcements found.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="notice-modal-title"
              className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08090d] shadow-2xl shadow-black/60"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close notice"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-luxury-gold/40 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="min-h-0 overflow-y-auto px-6 py-7 lg:px-9 lg:py-9">
                <div className="mb-6 flex flex-wrap items-center gap-3 pr-12">
                  <span className={`rounded-full border px-4 py-1 text-[9px] font-black uppercase tracking-widest ${getCategoryStyle(selectedItem.category)}`}>
                    {selectedItem.category}
                  </span>
                  {selectedItem.isNew && (
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-400">NEW</span>
                  )}
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <Calendar size={12} /> {selectedItem.date}
                  </span>
                </div>

                {selectedItem.featuredImage && (
                  <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <img src={selectedItem.featuredImage} alt="" className="max-h-72 w-full object-cover" />
                  </div>
                )}

                <h2 id="notice-modal-title" className="mb-5 text-2xl font-black leading-tight text-white lg:text-4xl">
                  {selectedItem.title}
                </h2>
                <div className="whitespace-pre-wrap text-sm font-medium leading-7 text-gray-300 lg:text-[15px]">
                  {selectedItem.content}
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-5 py-4">
                <button
                  type="button"
                  onClick={() => hasPrevious && setSelectedIndex((value) => value === null ? value : value - 1)}
                  disabled={!hasPrevious}
                  className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-luxury-gold/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => hasNext && setSelectedIndex((value) => value === null ? value : value + 1)}
                  disabled={!hasNext}
                  className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-luxury-gold/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
