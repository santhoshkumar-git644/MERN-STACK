import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Target, Users, Info, Ticket, MessageCircle, Star, Clock, MapPin, IndianRupee, Heart, ThumbsUp, PartyPopper, Rocket, CalendarDays, Zap, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import useAuth from '../../context/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForum, setShowForum] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [isRegistered, setIsRegistered] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/events/${id}`).then(res => { setEvent(res.data); setLoading(false); });
    if (user?.role === 'participant') {
      api.get('/registrations/my').then(res => {
        const reg = res.data.find(r => r.event?._id === id);
        if (reg) { setIsRegistered(true); setTicket(reg.ticket); }
      });
    }
  }, [id, user]);

  useEffect(() => {
    if (!showForum) return;
    api.get(`/forum/${id}`).then(res => setMessages(res.data));

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('join-forum', id);
    socketRef.current.on('new-message', (msg) => setMessages(prev => [...prev, msg]));
    socketRef.current.on('message-deleted', (msgId) => {
      setMessages(prev => prev.filter(m => m._id !== msgId));
    });
    return () => socketRef.current?.disconnect();
  }, [id, showForum]);

  const handleRegister = async (formData) => {
    setRegistering(true);
    setError('');
    try {
      const res = await api.post('/registrations/register', { eventId: id, formResponses: formData });
      setSuccess('Registered successfully! Your ticket is ready.');
      setTicket(res.data.ticket);
      setIsRegistered(true);
      setEvent(prev => ({ ...prev, currentRegistrations: prev.currentRegistrations + 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    try {
      await api.post(`/forum/${id}`, { content: msgText });
      setMsgText('');
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (data) => {
    try {
      await api.post(`/feedback/${id}`, data);
      setSuccess('Thank you for your anonymous feedback!');
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Feedback submission failed');
    }
  };

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  if (!event) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-white mb-2">Event Not Found</h2>
      <p className="text-muted-foreground mb-6">The event you are looking for does not exist or has been removed.</p>
      <Button onClick={() => window.location.href = '/#/'}>Back to Events</Button>
    </div>
  );

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isFull = event.registrationLimit && event.currentRegistrations >= event.registrationLimit;
  const canRegister = user?.role === 'participant' && !isRegistered && !isDeadlinePassed && !isFull;

  const tabs = [
    { id: 'info', label: 'Details', icon: Info },
    { id: 'register', label: 'Registration', icon: Ticket },
    { id: 'forum', label: 'Discussion', icon: MessageCircle },
    { id: 'feedback', label: 'Feedback', icon: Star },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Dynamic Hero Banner */}
      <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-white/5">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
            
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge variant={event.eventType === 'merchandise' ? 'warning' : 'default'} className="bg-white/10 hover:bg-white/20 border-white/10 text-white backdrop-blur-md">
                    {event.eventType === 'merchandise' ? <><ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Merchandise</> : <><Zap className="w-3.5 h-3.5 mr-1.5" /> Event</>}
                  </Badge>
                  {event.isTeamEvent && (
                    <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/20">
                      <Users className="w-3.5 h-3.5 mr-1.5" /> Team Event
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-slate-300 border-white/10 bg-white/5 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> 
                    {event.eligibility === 'all' ? 'Open for all' : event.eligibility === 'iiit-only' ? 'IIIT Only' : 'Non-IIIT Only'}
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  {event.eventName}
                </h1>
                
                <p className="text-xl text-muted-foreground flex items-center gap-2 mb-8">
                  Hosted by <span className="text-white font-medium">{event.organizer?.name || 'Felicity'}</span>
                </p>

                <div className="flex flex-wrap gap-6 text-sm font-medium">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Date</p>
                      <p className="text-white">{new Date(event.eventStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Time</p>
                      <p className="text-white">{new Date(event.eventStartDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-white">Campus Grounds</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sticky Registration Summary Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full lg:w-[400px]"
            >
              <Card className="bg-card/80 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Registration Fee</p>
                      <p className="text-3xl font-bold text-white">
                        {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free'}
                      </p>
                    </div>
                    {event.registrationLimit && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Spots Left</p>
                        <p className="text-xl font-bold text-emerald-400">
                          {event.registrationLimit - event.currentRegistrations} / {event.registrationLimit}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {isRegistered ? (
                    <Button variant="outline" className="w-full h-12 text-base border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={() => setActiveTab('register')}>
                      View Your Ticket
                    </Button>
                  ) : isDeadlinePassed ? (
                    <Button variant="secondary" className="w-full h-12 text-base opacity-50 cursor-not-allowed" disabled>
                      Registration Closed
                    </Button>
                  ) : isFull ? (
                    <Button variant="secondary" className="w-full h-12 text-base opacity-50 cursor-not-allowed" disabled>
                      Event Full
                    </Button>
                  ) : canRegister ? (
                    <Button className="w-full h-12 text-base font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]" onClick={() => setActiveTab('register')}>
                      Register Now
                    </Button>
                  ) : !user ? (
                    <Button variant="secondary" className="w-full h-12 text-base" onClick={() => window.location.href = '/#/login'}>
                      Log In to Register
                    </Button>
                  ) : null}
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Animated Tabs */}
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none mb-8 border-b border-white/5 pb-px relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'forum') setShowForum(true); }}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-muted-foreground hover:text-slate-200'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* DETAILS TAB */}
              {activeTab === 'info' && (
                <div className="space-y-12">
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-6">About the Event</h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">
                        {event.eventDescription}
                      </p>
                    </div>
                  </section>
                  
                  {event.tags?.length > 0 && (
                    <section>
                      <h2 className="text-lg font-bold text-white mb-4">Tags</h2>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map(t => (
                          <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* REGISTRATION TAB */}
              {activeTab === 'register' && (
                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-lg">
                  {success && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                      <PartyPopper className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-300">Success!</p>
                        <p className="text-sm text-emerald-400/80 mt-1">{success}</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm font-medium text-red-400">{error}</p>
                    </div>
                  )}

                  {ticket && (
                    <div className="max-w-md mx-auto text-center relative">
                      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                      <div className="relative bg-[#ffffff] p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
                        <div className="mb-6">
                          <QRCodeSVG value={ticket.ticketId} size={220} level="H" includeMargin={true} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                        <p className="text-lg font-mono font-bold text-slate-800">{ticket.ticketId}</p>
                        <div className="w-full border-t-2 border-dashed border-slate-200 my-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{event.eventName}</h3>
                        <p className="text-slate-500 text-sm">{new Date(event.eventStartDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  )}

                  {isRegistered && !ticket && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-6">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">You're all set!</h3>
                      <p className="text-muted-foreground text-lg">You have already registered for this event.</p>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center py-12">
                      <h3 className="text-2xl font-bold text-white mb-4">Join the experience</h3>
                      <p className="text-muted-foreground mb-8">Sign in or create an account to secure your spot at {event.eventName}.</p>
                      <Button size="lg" onClick={() => window.location.href = '/#/login'}>Log In to Continue</Button>
                    </div>
                  )}

                  {canRegister && (
                    <form onSubmit={handleSubmit(handleRegister)} className="space-y-8">
                      <div className="border-b border-white/10 pb-6 mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Complete Registration</h3>
                        <p className="text-muted-foreground">Please provide any additional details required by the organizer.</p>
                      </div>
                      
                      {event.customForm?.length > 0 ? (
                        <div className="space-y-6">
                          {event.customForm.map(field => (
                            <div key={field.fieldName} className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-200">
                                {field.label} {field.required && <span className="text-red-400">*</span>}
                              </Label>
                              {field.fieldType === 'dropdown' ? (
                                <select 
                                  className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors hover:border-white/20 text-white appearance-none"
                                  {...register(field.fieldName, { required: field.required })}
                                >
                                  <option value="" className="bg-background">Select an option...</option>
                                  {field.options?.map(o => <option key={o} value={o} className="bg-background">{o}</option>)}
                                </select>
                              ) : field.fieldType === 'textarea' ? (
                                <textarea 
                                  className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors hover:border-white/20 text-white min-h-[120px]"
                                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                                  {...register(field.fieldName, { required: field.required })} 
                                />
                              ) : (
                                <Input 
                                  type={field.fieldType} 
                                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                                  className="h-12"
                                  {...register(field.fieldName, { required: field.required })} 
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-slate-300">
                          <p>No additional information is required. Click the button below to confirm your registration.</p>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full h-14 text-lg font-bold mt-8 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                        disabled={registering}
                      >
                        {registering ? 'Processing Registration...' : 'Confirm Registration'}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* DISCUSSION TAB */}
              {activeTab === 'forum' && (
                <div className="flex flex-col h-[600px] bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-white/10 bg-black/20">
                    <h3 className="text-lg font-bold text-white">Event Discussion</h3>
                    <p className="text-sm text-muted-foreground">Chat with organizers and other participants</p>
                  </div>
                  
                  {!user && (
                    <div className="p-4 bg-primary/10 border-b border-primary/20 text-primary-foreground text-sm text-center">
                      Please login and register to participate in the discussion.
                    </div>
                  )}
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p>No messages yet. Be the first to start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isOrganizer = msg.author?.role === 'organizer';
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg._id} 
                            className={`p-5 rounded-2xl border ${
                              msg.isAnnouncement ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                              msg.isPinned ? 'bg-primary/10 border-primary/30' :
                              'bg-white/5 border-white/5 hover:bg-white/10 transition-colors'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isOrganizer ? 'bg-primary text-white' : 'bg-white/10 text-slate-300'}`}>
                                {(msg.author?.firstName || msg.author?.name || 'U').charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-sm">{msg.author?.firstName || msg.author?.name}</span>
                                  {isOrganizer && <Badge variant="default" className="text-[9px] h-4 px-1.5 py-0 bg-primary/20 text-primary border-0">Organizer</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-200 text-sm ml-11">{msg.content}</p>
                            
                            <div className="flex items-center gap-2 mt-4 ml-11">
                              {[{id: 'like', icon: ThumbsUp}, {id: 'love', icon: Heart}, {id: 'party', icon: PartyPopper}, {id: 'rocket', icon: Rocket}].map(reaction => {
                                const count = msg.reactions?.filter(r => r.emoji === reaction.id).length || 0;
                                return (
                                  <button 
                                    key={reaction.id} 
                                    onClick={() => api.post(`/forum/message/${msg._id}/react`, { emoji: reaction.id })}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${count > 0 ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                                  >
                                    <reaction.icon className="w-3.5 h-3.5" /> 
                                    {count > 0 && <span className="font-medium">{count}</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {(isRegistered || user?.role === 'organizer') && (
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <form onSubmit={sendMessage} className="relative flex items-center">
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={msgText}
                          onChange={e => setMsgText(e.target.value)}
                          className="w-full pr-24 bg-white/5 border-white/10 h-12 rounded-xl"
                        />
                        <Button 
                          type="submit" 
                          size="sm"
                          className="absolute right-1.5 h-9 rounded-lg px-4"
                          disabled={!msgText.trim()}
                        >
                          Send
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* FEEDBACK TAB */}
              {activeTab === 'feedback' && (
                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-lg">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Share Your Experience</h3>
                    <p className="text-muted-foreground">Your feedback helps organizers improve future events. All feedback is completely anonymous.</p>
                  </div>

                  {success && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                      <PartyPopper className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-300">Thank you!</p>
                        <p className="text-sm text-emerald-400/80 mt-1">{success}</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm font-medium text-red-400">{error}</p>
                    </div>
                  )}
                  
                  {isRegistered ? (
                    <form onSubmit={handleSubmit(submitFeedback)} className="space-y-8 max-w-xl">
                      <div className="space-y-3">
                        <Label className="text-base text-white">How would you rate this event?</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(n => (
                            <label key={n} className="cursor-pointer group relative">
                              <input type="radio" className="peer absolute opacity-0 w-0 h-0" value={n} {...register('rating', { required: true })} />
                              <div className="p-3 rounded-xl border border-white/10 bg-white/5 peer-checked:bg-yellow-500/20 peer-checked:border-yellow-500/50 hover:bg-white/10 transition-all flex items-center justify-center">
                                <Star className="w-8 h-8 text-slate-600 peer-checked:text-yellow-500 peer-checked:fill-yellow-500 group-hover:text-yellow-500/50 transition-colors" />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base text-white">Additional Comments (Optional)</Label>
                        <textarea 
                          rows={4} 
                          placeholder="What did you love? What could be better?" 
                          {...register('comment')} 
                          className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors hover:border-white/20 text-white resize-none"
                        />
                      </div>

                      <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8">
                        Submit Feedback
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                      <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Feedback is locked</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">You must be registered for and attend this event before submitting feedback.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
