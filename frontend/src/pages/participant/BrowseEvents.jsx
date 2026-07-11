import { useState, useEffect } from 'react';
import api from '../../utils/api';
import EventCard from '../../components/EventCard';
import { Search, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ eventType: '', eligibility: '', followedClubs: false });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: 1, limit: 12 });
        if (search) params.append('search', search);
        if (filters.eventType) params.append('eventType', filters.eventType);
        if (filters.eligibility) params.append('eligibility', filters.eligibility);
        if (filters.followedClubs) params.append('followedClubs', 'true');

        const { data } = await api.get(`/events?${params}`);
        if (!active) return;

        setEvents(data.events);
        setPagination({ page: data.page, pages: data.pages, total: data.total });
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      void loadEvents();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [search, filters]);

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.eligibility) params.append('eligibility', filters.eligibility);
      if (filters.followedClubs) params.append('followedClubs', 'true');

      const { data } = await api.get(`/events?${params}`);
      setEvents(data.events);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/events/trending').then(res => setTrending(res.data));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-background" />
        {/* Animated background gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Discover the best campus events</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-sm"
          >
            Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">More.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Explore, register, and attend the most exciting workshops, hackathons, and cultural fests happening around you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative flex items-center bg-card border border-white/10 rounded-full p-2 shadow-2xl">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <input
                  type="text"
                  placeholder="Search for an event..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-muted-foreground focus:ring-0"
                />
                <Button className="rounded-full px-8 shadow-lg font-semibold">
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Trending Section */}
        {trending.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-white tracking-tight">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trending.slice(0, 3).map((event, i) => (
                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={event._id} 
                  className="group relative bg-card/50 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-2xl p-5 flex items-center gap-5 cursor-pointer overflow-hidden transition-colors"
                  onClick={() => window.location.href = `/#/events/${event._id}`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xl text-primary/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {i + 1}
                  </div>
                  <div className="truncate flex-1">
                    <h3 className="text-white font-semibold text-base truncate group-hover:text-primary transition-colors">{event.eventName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{event.organizer?.name || 'Felicity'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white tracking-tight">All Events</h2>
          
          <div className="flex flex-wrap items-center gap-4">
            <select 
              value={filters.eventType} 
              onChange={e => setFilters(f => ({ ...f, eventType: e.target.value }))}
              className="bg-card/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">All Types</option>
              <option value="normal">Standard</option>
              <option value="merchandise">Merchandise</option>
            </select>

            <select 
              value={filters.eligibility} 
              onChange={e => setFilters(f => ({ ...f, eligibility: e.target.value }))}
              className="bg-card/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">All Eligibility</option>
              <option value="iiit-only">IIIT Only</option>
              <option value="non-iiit-only">Non-IIIT Only</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-300 font-medium cursor-pointer ml-2 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filters.followedClubs}
                onChange={e => setFilters(f => ({ ...f, followedClubs: e.target.checked }))}
                className="w-4 h-4 rounded border-white/10 text-primary focus:ring-primary focus:ring-offset-background bg-card"
              />
              Followed Clubs
            </label>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>{!loading && `${pagination.total} events found`}</span>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[380px] bg-card/40 border border-white/5 rounded-2xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map(event => (
              <motion.div key={event._id} variants={itemVariants}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 px-4 bg-card/30 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl mt-8"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any events matching your current filters. Try adjusting your search criteria.
            </p>
            <Button 
              variant="outline" 
              className="mt-8"
              onClick={() => { setSearch(''); setFilters({ eventType: '', eligibility: '', followedClubs: false }); }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {[...Array(pagination.pages)].map((_, i) => (
              <Button
                key={i}
                variant={pagination.page === i + 1 ? 'default' : 'outline'}
                size="icon"
                className="w-10 h-10 rounded-xl"
                onClick={() => fetchEvents(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BrowseEvents;
