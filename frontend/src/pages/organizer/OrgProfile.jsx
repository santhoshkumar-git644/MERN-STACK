import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import { Mail, Building2, Tag, ShieldAlert, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

const OrgProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingReset, setRequestingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setRequestingReset(true);
    setResetMessage('');
    setResetError('');
    try {
      const res = await api.post('/participants/request-password-reset', { reason });
      setResetMessage(res.data.message || 'Password reset requested successfully!');
      setReason('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setRequestingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      <PageHeader 
        title="Organizer Profile"
        description="Manage your club details, contact info, and security requests."
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-accent/20 opacity-50" />
              <CardContent className="p-8 pt-10 relative z-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-24 h-24 rounded-2xl bg-black/40 flex items-center justify-center border-2 border-background shadow-xl">
                    <Building2 className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">{profile?.name}</h2>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-widest">
                      Organizer
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/20 p-6 rounded-3xl border border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Mail className="w-4 h-4" /> Contact Email
                    </div>
                    <p className="text-lg text-slate-200 font-medium pl-6 break-all">{profile?.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Tag className="w-4 h-4" /> Category
                    </div>
                    <p className="text-lg text-slate-300 font-medium pl-6">{profile?.category || 'General Club'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-red-500/20 bg-red-950/10 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-red-500 to-orange-500" />
              <CardHeader className="px-6 py-6 border-b border-red-500/10">
                <CardTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" /> Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-red-400/80 mb-6">
                  Need to hand over the club account to the next batch? Request a password reset from the admin.
                </p>

                {resetMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resetMessage}</span>
                  </motion.div>
                )}
                
                {resetError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </motion.div>
                )}

                <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                  <div className="space-y-2.5">
                    <Label className="text-slate-300">Reason for reset</Label>
                    <textarea 
                      rows={3} 
                      placeholder="e.g., Transitioning club management to next batch..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 transition-colors hover:border-white/20 text-white resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full h-11 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all shadow-none" 
                    disabled={requestingReset}
                  >
                    {requestingReset ? 'Submitting...' : 'Submit Reset Request'}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-red-500/10 text-center">
                  <Link to="/change-password">
                    <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                      <Key className="w-4 h-4 mr-2" /> Change Password Normally
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrgProfile;
