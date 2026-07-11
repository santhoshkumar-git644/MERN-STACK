import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import useAuth from '../../context/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Edit2, Lock, Camera, Mail, Hash, Heart, Shield, LogOut, Smartphone } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { user, logout, logoutFromAll } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const res = await api.get('/participants/profile');
        if (active) setProfile(res.data);
      } catch (err) {
        console.error(err);
        if (active) setError('Failed to load profile. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const profilePic = profile?.profilePictureUrl ? `http://localhost:5000${profile.profilePictureUrl}` : null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setUploading(true);
      const res = await api.post('/auth/upload-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile((current) => current ? { ...current, profilePictureUrl: res.data.fileUrl } : current);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
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

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex flex-col items-center max-w-md text-center">
          <Shield className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">Error Loading Profile</h3>
          <p className="text-sm">{error || 'Profile not found'}</p>
        </div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <PageHeader 
        title="My Profile"
        description="Manage your personal information, preferences, and account security."
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Details Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-accent/20 opacity-50" />
              <CardContent className="p-8 pt-12 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2rem] bg-black/40 flex items-center justify-center overflow-hidden border-4 border-background shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-500" />
                      )}
                      
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm">
                        <Camera className="w-8 h-8 text-white mb-2" />
                        <span className="text-xs font-semibold text-white uppercase tracking-wider">{uploading ? 'Uploading...' : 'Change'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                    <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl scale-110 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="text-center sm:text-left mt-2">
                    <h2 className="text-3xl font-extrabold text-white mb-2">{user.name || user.firstName + ' ' + user.lastName}</h2>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-widest font-bold">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-3xl border border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Mail className="w-4 h-4" /> Email Address
                    </div>
                    <p className="text-lg text-slate-200 font-medium pl-6">{user.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Hash className="w-4 h-4" /> Roll Number / ID
                    </div>
                    <p className="text-lg font-mono text-slate-300 tracking-wider pl-6">{profile.rollNumber || 'Not Provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-white">Interests & Activity</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Your personalized tags and club affiliations.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl border-white/10 hover:bg-white/5"
                  onClick={() => navigate('/onboarding')}
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Topics You Follow
                    </h4>
                    {profile.interests && profile.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map(interest => (
                          <Badge key={interest} variant="secondary" className="bg-primary/20 text-primary-300 border-primary/20 px-3 py-1.5 text-xs capitalize hover:bg-primary/30 transition-colors cursor-default">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm bg-black/20 p-4 rounded-xl border border-white/5">No interests selected yet.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Club Memberships
                    </h4>
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[120px]">
                      <p className="text-4xl font-black text-white drop-shadow-md mb-1">
                        {profile.followedClubs?.length || 0}
                      </p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clubs Followed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security / Actions Sidebar */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="px-6 py-6 border-b border-white/5">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" /> Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Keep your account secure by updating your password regularly.</p>
                <Link to="/change-password">
                  <Button variant="secondary" className="w-full h-12 rounded-xl justify-between group">
                    Change Password
                    <Lock className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-red-500/20 bg-red-950/10 backdrop-blur-xl shadow-xl overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-red-500/10">
                <CardTitle className="text-sm font-bold text-red-400 uppercase tracking-wider">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button 
                  variant="outline" 
                  onClick={logout}
                  className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 justify-between group text-slate-300"
                >
                  Sign Out
                  <LogOut className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={logoutFromAll}
                  className="w-full h-12 rounded-xl justify-between group bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all"
                >
                  Sign Out of All Devices
                  <Smartphone className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
