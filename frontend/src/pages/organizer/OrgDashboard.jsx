import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { CalendarDays, Users, Banknote, Plus, SearchX, ArrowRight, Settings } from 'lucide-react';

const OrgDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/organizer/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load org dashboard:', err);
      setData({ stats: { totalEvents: 0, totalParticipants: 0, totalRevenue: 0 }, recentEvents: [] });
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-10 w-64 bg-card/50 rounded-lg mb-4 animate-pulse"></div>
      <div className="h-5 w-96 bg-card/30 rounded-md mb-12 animate-pulse"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-card/40 rounded-2xl animate-pulse"></div>)}
      </div>
      
      <div className="h-72 bg-card/40 rounded-3xl animate-pulse"></div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <PageHeader 
        title="Organizer Dashboard"
        description="Track your metrics, manage participants, and configure your active club events."
        actions={
          <Link to="/organizer/events/new">
            <Button className="rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </Link>
        }
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <StatsCard title="Total Events" value={data.stats.totalEvents} icon={CalendarDays} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Total Participants" value={data.stats.totalParticipants} icon={Users} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Total Revenue" value={`₹${data.stats.totalRevenue}`} icon={Banknote} />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <div>
                <CardTitle className="text-xl font-bold text-white">Recent Events</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage and track your latest active events.</p>
              </div>
              {data.recentEvents?.length > 0 && (
                <Link to="/organizer/events" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {data.recentEvents?.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {data.recentEvents.map((event, idx) => {
                    const isOpen = new Date(event.registrationDeadline) > new Date() && event.currentRegistrations < event.registrationLimit;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        key={event._id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:px-8 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-white text-base group-hover:text-primary transition-colors">{event.eventName}</h3>
                              <Badge variant={isOpen ? "success" : "destructive"} className="text-[10px] h-5">
                                {isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(event.eventStartDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {event.currentRegistrations} / {event.registrationLimit || '∞'} enrolled</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center w-full sm:w-auto">
                          <Link 
                            to={`/organizer/events/${event._id}`} 
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95"
                          >
                            <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                            Manage
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12">
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
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrgDashboard;