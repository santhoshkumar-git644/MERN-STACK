import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { ArrowLeft, Printer, AlertCircle, Calendar, MapPin, User, Ticket } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const ViewTicket = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/registrations/ticket/${ticketId}`);
        setTicket(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading your ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex flex-col items-center max-w-sm text-center">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm font-medium">{error}</p>
          <Link to="/participant" className="mt-6 text-sm underline hover:text-white transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Dynamic Glow */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 25 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center print:bg-white print:border-none print:shadow-none print:text-black">
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent print:hidden" />
          
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner print:hidden">
            <Ticket className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-6 print:text-black">Event Pass</h2>
          
          <div className="w-full bg-black/20 border border-white/5 p-5 rounded-2xl mb-8 text-center print:bg-gray-100 print:border-gray-300">
            <h3 className="text-lg font-bold text-white mb-1 print:text-black">{ticket.event?.eventName}</h3>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider print:text-gray-600">
              <Calendar className="w-3.5 h-3.5" /> 
              {new Date(ticket.event?.eventStartDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)] print:shadow-none relative">
            <img src={ticket.qrCode} alt="Ticket QR Code" className="w-48 h-48 sm:w-56 sm:h-56" />
            {!ticket.isValid && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <span className="text-red-500 font-extrabold text-2xl rotate-[-15deg] border-4 border-red-500 px-4 py-1 rounded-lg">INVALID</span>
              </div>
            )}
          </div>

          <div className="w-full border-t border-dashed border-white/20 pt-6 space-y-4 text-sm text-slate-300 print:text-gray-800 print:border-gray-300">
            <div className="flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl print:bg-transparent print:p-0">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Ticket className="w-4 h-4" /> Ticket ID</span>
              <span className="font-mono font-bold text-white tracking-widest print:text-black">{ticket.ticketId}</span>
            </div>
            <div className="flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl print:bg-transparent print:p-0">
              <span className="text-slate-500 font-medium flex items-center gap-2"><User className="w-4 h-4" /> Attendee</span>
              <span className="font-semibold text-white truncate max-w-[150px] print:text-black">{ticket.participant?.firstName} {ticket.participant?.lastName}</span>
            </div>
            <div className="flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl print:bg-transparent print:p-0">
              <span className="text-slate-500 font-medium flex items-center gap-2">Status</span>
              <Badge variant={ticket.isValid ? "success" : "destructive"} className="uppercase font-bold tracking-wider text-[10px]">
                {ticket.isValid ? 'Valid Pass' : 'Used / Invalid'}
              </Badge>
            </div>
          </div>

          <div className="w-full mt-10 space-y-3 print:hidden">
            <Button 
              onClick={() => window.print()} 
              className="w-full h-12 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Ticket
            </Button>
            
            <Link to="/participant">
              <Button 
                variant="outline" 
                className="w-full h-12 text-base font-medium border-white/10 hover:bg-white/5 mt-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewTicket;
