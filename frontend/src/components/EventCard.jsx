import { Link } from 'react-router-dom';
import { ShoppingBag, Target, Users, Calendar, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';

const EventCard = ({ event }) => {
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isFull = event.registrationLimit && event.currentRegistrations >= event.registrationLimit;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Link to={`/events/${event._id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
        <Card className="h-full flex flex-col overflow-hidden relative group border-white/5 hover:border-primary/50 transition-colors bg-card/60 backdrop-blur-xl">
          {/* Subtle gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="p-6 pb-0 flex justify-between items-start z-10 relative">
            <div className="flex flex-wrap gap-2">
              <Badge variant={event.eventType === 'merchandise' ? 'warning' : 'default'} className="bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md">
                {event.eventType === 'merchandise' ? <><ShoppingBag className="w-3 h-3 mr-1" /> Merchandise</> : <><Target className="w-3 h-3 mr-1" /> Event</>}
              </Badge>
              {event.isTeamEvent && (
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/20">
                  <Users className="w-3 h-3 mr-1" /> Team
                </Badge>
              )}
            </div>
            
            {isDeadlinePassed ? (
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/20">Closed</Badge>
            ) : isFull ? (
              <Badge variant="warning" className="bg-amber-500/20 text-amber-400 border-amber-500/20">Full</Badge>
            ) : (
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">
                {event.registrationLimit ? `${event.registrationLimit - event.currentRegistrations} left` : 'Open'}
              </Badge>
            )}
          </div>

          <CardContent className="p-6 flex-grow flex flex-col z-10 relative">
            <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {event.eventName}
            </h3>
            <p className="text-sm font-medium text-primary/80 mb-4">
              by {event.organizer?.name || 'Felicity'}
            </p>
            
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow leading-relaxed">
              {event.eventDescription}
            </p>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center text-sm text-slate-300">
                <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                <span>{new Date(event.eventStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm text-slate-300">
                <Clock className="w-4 h-4 mr-3 text-slate-500" />
                <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-IN')}</span>
              </div>
              {event.registrationFee > 0 && (
                <div className="flex items-center text-sm text-slate-300 font-medium">
                  <IndianRupee className="w-4 h-4 mr-3 text-slate-500" />
                  <span>₹{event.registrationFee}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {event.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default EventCard;
