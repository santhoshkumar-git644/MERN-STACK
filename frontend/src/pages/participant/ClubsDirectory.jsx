import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Building2, Check, Plus, AlertCircle } from 'lucide-react';

const ClubsDirectory = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followedClubs, setFollowedClubs] = useState([]);
  const [updatingFollow, setUpdatingFollow] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [clubsRes, profileRes] = await Promise.all([
          api.get('/participants/organizers'),
          api.get('/participants/profile')
        ]);

        if (!active) return;

        setClubs(clubsRes.data);
        const followedIds = (profileRes.data.followedClubs || []).map(c => typeof c === 'object' ? c._id : c);
        setFollowedClubs(followedIds);
      } catch (err) {
        console.error(err);
        if (active) setError('Failed to load clubs. Please try again later.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleToggleFollow = async (clubId) => {
    if (updatingFollow) return;
    setUpdatingFollow(clubId);
    
    try {
      const isFollowing = followedClubs.includes(clubId);
      const newFollowedList = isFollowing 
        ? followedClubs.filter(id => id !== clubId)
        : [...followedClubs, clubId];
      
      await api.put('/participants/profile', {
        followedClubs: newFollowedList
      });
      
      setFollowedClubs(newFollowedList);
    } catch (err) {
      console.error("Failed to update follow status", err);
    } finally {
      setUpdatingFollow(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-12 w-64 bg-card/50 rounded-lg mb-4 animate-pulse"></div>
        <div className="h-6 w-96 bg-card/30 rounded-md mb-12 animate-pulse"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 bg-card/40 rounded-3xl animate-pulse"></div>)}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 relative">
      <PageHeader 
        title="Clubs Directory"
        description="Discover and follow student organizations to stay updated on their latest events."
      />

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 max-w-2xl">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20 bg-card/20 backdrop-blur-sm border border-white/5 rounded-3xl">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Clubs Found</h3>
          <p className="text-muted-foreground text-sm">There are no student organizations registered yet.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {clubs.map(club => {
            const isFollowing = followedClubs.includes(club._id);
            const isUpdating = updatingFollow === club._id;
            
            return (
              <motion.div variants={itemVariants} key={club._id} layoutId={`club-${club._id}`}>
                <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all duration-300 h-full flex flex-col group overflow-hidden relative">
                  {/* Glowing background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-8 flex flex-col items-center text-center h-full relative z-10">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden mb-6 shadow-xl relative group-hover:scale-105 transition-transform duration-500">
                      {club.clubLogoUrl ? (
                        <img 
                          src={club.clubLogoUrl.startsWith('http') ? club.clubLogoUrl : `http://localhost:5000${club.clubLogoUrl}`} 
                          alt={club.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-10 h-10 text-slate-500" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{club.name}</h3>
                    <p className="text-sm text-muted-foreground mb-8 line-clamp-1 break-all w-full">{club.email}</p>
                    
                    <div className="mt-auto w-full">
                      <Button 
                        variant={isFollowing ? "outline" : "default"}
                        className={`w-full rounded-xl h-11 transition-all ${
                          isFollowing 
                            ? 'border-primary/50 text-primary hover:bg-primary/10' 
                            : 'shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]'
                        }`}
                        onClick={() => handleToggleFollow(club._id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isFollowing ? (
                          <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Following</span>
                        ) : (
                          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Follow Club</span>
                        )}
                      </Button>
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

export default ClubsDirectory;
