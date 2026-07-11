import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, CalendarDays, Building2, CheckCircle, FileSearch, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/stats');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setData({ totalParticipants: 0, totalOrganizers: 0, totalEvents: 0, pendingResets: 0 });
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-10 w-64 bg-card/50 rounded-lg mb-4 animate-pulse"></div>
      <div className="h-5 w-96 bg-card/30 rounded-md mb-12 animate-pulse"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-card/40 rounded-2xl animate-pulse"></div>)}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      <PageHeader 
        title="Admin Command Center"
        description="Global platform overview, club management, and security approvals."
        actions={
          <div className="flex gap-3">
            <Link to="/admin/organizers">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 h-11">
                <Building2 className="w-4 h-4 mr-2" /> Manage Clubs
              </Button>
            </Link>
            <Link to="/admin/password-resets">
              <Button className="rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] h-11 relative">
                <ShieldCheck className="w-4 h-4 mr-2" /> Security
                {data.pendingResets > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[9px] font-bold text-white">
                      {data.pendingResets}
                    </span>
                  </span>
                )}
              </Button>
            </Link>
          </div>
        }
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <StatsCard title="Total Participants" value={data.totalParticipants} icon={Users} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Registered Clubs" value={data.totalOrganizers} icon={Building2} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Total Events" value={data.totalEvents} icon={CalendarDays} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard title="Pending Resets" value={data.pendingResets} icon={FileSearch} />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <div>
                <CardTitle className="text-xl font-bold text-white">System Status Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Real-time health of the Felicity platform.</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.pendingResets === 0 ? (
                <div className="p-16">
                  <EmptyState 
                    icon={CheckCircle}
                    title="System Operating Normally"
                    description="All clubs and participants are active. There are no pending security requests requiring your attention."
                  />
                </div>
              ) : (
                <div className="p-16">
                  <EmptyState 
                    icon={FileSearch}
                    title="Action Required"
                    description={`There are ${data.pendingResets} pending password reset requests from club organizers.`}
                    action={
                      <Link to="/admin/password-resets">
                        <Button className="rounded-xl mt-4">
                          Review Requests <ArrowRight className="w-4 h-4 ml-2" />
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

export default AdminDashboard;