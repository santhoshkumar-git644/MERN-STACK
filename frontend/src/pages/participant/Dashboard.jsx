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
import { Ticket, Calendar, CheckCircle, SearchX, ArrowRight, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/participants/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load dashboard:', err);
      setData({ stats: { totalRegistrations: 0, upcomingEvents: 0, attendedEvents: 0 }, recentRegistrations: [] });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <PageHeader 
        title="Dashboard"
        description="Welcome back! Here's an overview of your events."
        actions={
          <Link to="/participant/events">
            <Button className="rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              Browse Events <ArrowRight className="w-4 h-4 ml-2" />
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
            <StatsCard title="Total Registrations" value={data.stats.totalRegistrations} icon={Ticket} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Upcoming Events" value={data.stats.upcomingEvents} icon={Calendar} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Events Attended" value={data.stats.attendedEvents} icon={CheckCircle} />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <div>
                <CardTitle className="text-xl font-bold text-white">Recent Registrations</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Your latest tickets and upcoming events.</p>
              </div>
              {data.recentRegistrations?.length > 0 && (
                <Link to="/participant/events" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {data.recentRegistrations?.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {data.recentRegistrations.map((reg, idx) => {
                    const isAttended = reg.isCheckedIn;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        key={reg._id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:px-8 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-white text-base group-hover:text-primary transition-colors">{reg.event?.eventName}</h3>
                              <Badge variant={isAttended ? "success" : "default"} className="text-[10px] h-5">
                                {isAttended ? 'Attended' : 'Registered'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(reg.event?.eventStartDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center w-full sm:w-auto">
                          <Link 
                            to={`/ticket/${reg.ticket?.ticketId}`} 
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95"
                          >
                            <ExternalLink className="w-4 h-4 mr-2 text-muted-foreground" />
                            View Ticket
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
                    title="No registrations yet"
                    description="You haven't registered for any events. Discover what's happening around you."
                    action={
                      <Link to="/participant/events">
                        <Button className="rounded-xl mt-4">Explore Events</Button>
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

export default Dashboard;