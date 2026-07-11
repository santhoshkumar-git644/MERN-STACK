import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle2, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

const Signup = () => {
  const navigate = useNavigate();
  const { register: authRegister, user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { participantType: 'iiit' }
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (user && !isSuccess) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer" replace />;
    return <Navigate to="/participant" replace />;
  }

  const pwd = watch('password');
  const pType = watch('participantType');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await authRegister(data);
      setIsSuccess(true);
      setTimeout(() => navigate('/participant'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card/60 backdrop-blur-3xl border border-emerald-500/20 p-12 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.1)] relative z-10 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">Account Created!</h2>
          <p className="text-muted-foreground">Preparing your personalized dashboard...</p>
          <div className="mt-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Glowing Orbs */}
      <motion.div 
        animate={{ 
          x: [0, -30, 0], 
          y: [0, 50, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" 
      />
      <motion.div 
        animate={{ 
          x: [0, 40, 0], 
          y: [0, -40, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-card/60 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
            >
              <UserPlus className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Join Felicity</h1>
            <p className="text-muted-foreground text-sm">Create your account to explore and register for events</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="firstName" className="text-slate-300 ml-1">First Name</Label>
                <Input
                  id="firstName"
                  className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  {...register('firstName', { required: 'Required' })}
                />
                {errors.firstName && <p className="text-xs text-red-400 ml-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="lastName" className="text-slate-300 ml-1">Last Name</Label>
                <Input
                  id="lastName"
                  className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  {...register('lastName', { required: 'Required' })}
                />
                {errors.lastName && <p className="text-xs text-red-400 ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">I am a...</Label>
              <div className="flex gap-3">
                <label className="flex-1 relative">
                  <input type="radio" value="iiit" className="peer sr-only" {...register('participantType')} />
                  <div className="flex items-center justify-center py-3.5 px-4 rounded-xl border border-white/10 bg-black/20 text-slate-400 cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-hover:border-white/20">
                    <span className="text-sm font-semibold">IIIT Student</span>
                  </div>
                </label>
                <label className="flex-1 relative">
                  <input type="radio" value="non-iiit" className="peer sr-only" {...register('participantType')} />
                  <div className="flex items-center justify-center py-3.5 px-4 rounded-xl border border-white/10 bg-black/20 text-slate-400 cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-hover:border-white/20">
                    <span className="text-sm font-semibold">External Student</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-slate-300 ml-1">Email address</Label>
              <Input
                id="email"
                type="email"
                className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary/50"
                {...register('email', { 
                  required: 'Required',
                  validate: (val) => {
                    if (pType === 'iiit') {
                      const validDomains = ['@students.iiit.ac.in', '@iiit.ac.in', '@research.iiit.ac.in'];
                      return validDomains.some(d => val.endsWith(d)) || 'Must use an IIIT email address';
                    }
                    return true;
                  }
                })}
              />
              {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-slate-300 ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="h-12 bg-black/20 border-white/10 pr-10 focus-visible:ring-primary/50"
                    {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="confirmPassword" className="text-slate-300 ml-1">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="h-12 bg-black/20 border-white/10 pr-10 focus-visible:ring-primary/50"
                    {...register('confirmPassword', { 
                      required: 'Required',
                      validate: val => val === pwd || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] mt-8" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-medium hover:text-primary transition-colors inline-flex items-center gap-1 group">
                Log in
                <motion.span className="inline-block" initial={{ x: 0 }} whileHover={{ x: 4 }}>
                  <ArrowRight className="w-3 h-3" />
                </motion.span>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;