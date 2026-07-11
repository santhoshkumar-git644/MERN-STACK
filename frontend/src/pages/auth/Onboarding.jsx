import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../context/useAuth';
import api from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Briefcase, Laptop, Palette, Megaphone, TerminalSquare, ArrowRight, ArrowLeft, Sparkles, User, CheckCircle2 } from 'lucide-react';

const INTERESTS = [
  { id: 'tech', label: 'Technology', icon: Laptop },
  { id: 'arts', label: 'Arts & Culture', icon: Palette },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'coding', label: 'Hackathons', icon: TerminalSquare }
];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    participantType: 'iiit',
    interests: []
  });

  const toggleInterest = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id) 
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await api.post('/auth/onboarding', formData);
      window.location.href = '/'; 
      window.location.hash = '#/participant';
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    })
  };

  const [direction, setDirection] = useState(1);
  const nextStep = () => { setDirection(1); setStep(2); };
  const prevStep = () => { setDirection(-1); setStep(1); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 25 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-card/60 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
              Welcome, {user?.firstName} <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-muted-foreground text-sm">Let's customize your Felicity experience.</p>
          </div>

          <div className="flex justify-center items-center gap-3 mb-10">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
              step >= 1 ? 'bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'border border-white/10 text-slate-500'
            }`}>1</div>
            <div className="w-16 h-1 rounded-full bg-white/5 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: step >= 2 ? '100%' : '0%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
              step >= 2 ? 'bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'border border-white/10 text-slate-500'
            }`}>2</div>
          </div>

          <div className="flex-grow relative">
            <AnimatePresence custom={direction} mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex flex-col h-full"
                >
                  <h3 className="text-xl font-bold text-white mb-6 text-center">Are you an internal student?</h3>
                  <div className="flex flex-col sm:flex-row gap-4 mb-auto">
                    <button
                      onClick={() => setFormData({...formData, participantType: 'iiit'})}
                      className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                        formData.participantType === 'iiit'
                          ? 'border-primary bg-primary/10 text-primary shadow-lg scale-[1.02]'
                          : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <User className="w-8 h-8" />
                      <span className="font-semibold">IIIT Student</span>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, participantType: 'external'})}
                      className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                        formData.participantType === 'external'
                          ? 'border-primary bg-primary/10 text-primary shadow-lg scale-[1.02]'
                          : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Briefcase className="w-8 h-8" />
                      <span className="font-semibold">External Student</span>
                    </button>
                  </div>
                  
                  <Button onClick={nextStep} size="lg" className="w-full h-12 mt-8">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex flex-col h-full"
                >
                  <h3 className="text-xl font-bold text-white mb-6 text-center">Select your interests</h3>
                  <div className="flex flex-wrap justify-center gap-3 mb-auto">
                    {INTERESTS.map(interest => {
                      const Icon = interest.icon;
                      const isSelected = formData.interests.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          onClick={() => toggleInterest(interest.id)}
                          className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-semibold transition-all ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-105' 
                              : 'bg-black/20 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {interest.label}
                          {isSelected && <CheckCircle2 className="w-4 h-4 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" onClick={prevStep} className="h-12 w-12 shrink-0 p-0 rounded-xl">
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={completeOnboarding} 
                      disabled={loading}
                      className="h-12 flex-1 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="flex items-center justify-center gap-2 font-bold text-base">Complete Setup <Sparkles className="w-4 h-4" /></span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;