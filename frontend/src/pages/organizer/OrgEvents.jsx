import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Plus, SearchX, CalendarDays, Settings, Users, Eye, ArrowRight, Zap, ShoppingBag } from 'lucide-react';

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const res = await api.get('/events/organizer/my-events');
        if (active) setEvents(res.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-10 w-64 bg-card/50 rounded-lg mb-4 animate-pulse"></div>
        <div className="h-5 w-96 bg-card/30 rounded-md mb-12 animate-pulse"></div>
        
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-card/40 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      <PageHeader 
        title="My Events"
        description="Manage your club's active events and track participant registrations."
        actions={
          <Link to="/organizer/events/new">
            <Button className="rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </Link>
        }
      />

      {events.length === 0 ? (
        <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden text-center py-20">
          <EmptyState 
            icon={SearchX}
            title="No events yet"
            description="You haven't created any events. Start hosting to engage with participants."
            action={
              <Link to="/organizer/events/new">
                <Button className="rounded-xl mt-4">
                  <Plus className="w-4 h-4 mr-2" /> Create First Event
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4"
        >
          {events.map((event, idx) => {
            const isMerch = event.eventType === 'merchandise';
            const isOpen = new Date(event.registrationDeadline) > new Date() && event.currentRegistrations < event.registrationLimit;
            
            return (
              <motion.div variants={itemVariants} key={event._id}>
                <Card className="rounded-2xl border-white/5 bg-card/40 backdrop-blur-xl shadow-lg hover:bg-card/60 transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardContent className="p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start sm:items-center gap-5">
                      <div className={`hidden sm:flex h-14 w-14 rounded-2xl border items-center justify-center transition-colors shadow-inner ${
                        isMerch ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20' : 'bg-primary/10 border-primary/20 text-primary group-hover:bg-primary/20'
                      }`}>
                        {isMerch ? <ShoppingBag className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{event.eventName}</h3>
                          <Badge variant={isMerch ? "warning" : "default"} className="text-[10px] uppercase tracking-widest font-bold">
                            {isMerch ? 'Merchandise' : 'Standard Event'}
                          </Badge>
                          <Badge variant={isOpen ? "success" : "destructive"} className="text-[10px] uppercase tracking-widest font-bold">
                            {isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap font-medium">
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {new Date(event.eventStartDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {event.currentRegistrations} Participants</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {event.viewCount || 0} Views</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link 
                        to={`/organizer/events/${event._id}`} 
                        className="flex-1 sm:flex-none"
                      >
                        <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 hover:bg-white/10">
                          <Settings className="w-4 h-4 mr-2 text-slate-400" /> Edit
                        </Button>
                      </Link>
                      <Link 
                        to={`/organizer/events/${event._id}/participants`} 
                        className="flex-1 sm:flex-none"
                      >
                        <Button className="w-full h-11 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <Users className="w-4 h-4 mr-2" /> Attendees
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default OrgEvents;
