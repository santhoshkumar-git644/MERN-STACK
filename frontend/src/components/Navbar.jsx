import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../context/useAuth';
import { 
  Menu, X, LogOut, 
  LayoutDashboard, Compass, Building2, UserCircle, 
  CalendarDays, Settings, KeyRound
} from 'lucide-react';
import { Button } from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const participantLinks = [
    { path: '/participant', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/participant/events', label: 'Browse', icon: Compass },
    { path: '/participant/clubs', label: 'Clubs', icon: Building2 },
    { path: '/participant/profile', label: 'Profile', icon: UserCircle },
  ];

  const organizerLinks = [
    { path: '/organizer', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/organizer/events', label: 'My Events', icon: CalendarDays },
    { path: '/organizer/profile', label: 'Profile', icon: UserCircle },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: Settings },
    { path: '/admin/organizers', label: 'Manage Clubs', icon: Building2 },
    { path: '/admin/password-resets', label: 'Security', icon: KeyRound },
  ];

  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'organizer' ? organizerLinks :
    user ? participantLinks : [];

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-lg py-2' 
          : 'bg-background/40 backdrop-blur-md py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/participant') : '/'} className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-extrabold text-2xl leading-none tracking-tighter">F</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white hidden sm:block group-hover:text-primary transition-colors">Felicity</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-md">
                {links.map(link => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={`relative px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-200 z-10 ${
                        active ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {active && (
                        <motion.div 
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/10 rounded-full -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-4 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <div className="h-4 w-px bg-white/10"></div>
                <Link to="/signup">
                  <Button size="sm" className="rounded-full shadow-[0_0_15px_rgba(139,92,246,0.2)]">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white transition-colors" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 border-t border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-4 md:hidden"
          >
            {user ? (
              <div className="flex flex-col space-y-2">
                {links.map(link => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center rounded-xl border-white/10 h-12">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full justify-center rounded-xl h-12 shadow-[0_0_15px_rgba(139,92,246,0.2)]">Sign Up</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
