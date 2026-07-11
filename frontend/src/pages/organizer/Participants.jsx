import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import QRScanner from '../../components/QRScanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Download, QrCode, Users, CheckCircle, XCircle, SearchX } from 'lucide-react';

const Participants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/registrations/event/${id}`)
    ]).then(([eventRes, regRes]) => {
      setEvent(eventRes.data);
      setRegistrations(regRes.data);
      setLoading(false);
    });
  }, [id]);

  const handleScan = async (ticketId) => {
    try {
      const res = await api.post('/registrations/attendance', { ticketId });
      setRegistrations(regs => regs.map(r => 
        r.participant._id === res.data.participant._id 
          ? { ...r, attendanceMarked: true, attendanceTimestamp: res.data.timestamp }
          : r
      ));
      alert(`Attendance marked successfully for ${res.data.participant.firstName}`);
    } catch {
      alert('Invalid or already used ticket');
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await api.get(`/registrations/event/${id}/attendance-csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event?.eventName}-attendance.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      console.error('Failed to download CSV');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-10 w-48 bg-card/50 rounded-lg mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-card/40 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="h-96 bg-card/40 rounded-[2rem] animate-pulse"></div>
      </div>
    );
  }

  const presentCount = registrations.filter(r => r.attendanceMarked).length;
  const absentCount = registrations.length - presentCount;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-24">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <Button 
        variant="ghost" 
        onClick={() => navigate('/organizer/events')} 
        className="mb-8 hover:bg-white/5 hover:text-white text-muted-foreground transition-colors h-10 px-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
      </Button>

      <PageHeader 
        title="Event Attendees"
        description={`Manage registrations and attendance for ${event?.eventName}`}
        actions={
          <>
            <Button 
              variant="outline"
              onClick={downloadCSV}
              className="rounded-xl border-white/10 hover:bg-white/5 h-11"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button 
              onClick={() => setShowScanner(!showScanner)}
              className="rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] h-11"
            >
              <QrCode className="w-4 h-4 mr-2" /> {showScanner ? 'Close Scanner' : 'Scan Ticket QR'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Registered</div>
            <div className="text-4xl font-extrabold text-white">{registrations.length}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 text-emerald-500">Checked In (Present)</div>
            <div className="text-4xl font-extrabold text-white">{presentCount}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 text-red-500">Yet to Arrive (Absent)</div>
            <div className="text-4xl font-extrabold text-white">{absentCount}</div>
          </CardContent>
        </Card>
      </div>

      {showScanner && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Card className="rounded-[2rem] border-primary/20 bg-primary/5 backdrop-blur-2xl shadow-2xl overflow-hidden p-8 flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-6">Scan Participant Ticket</h3>
            <div className="w-full max-w-md rounded-2xl overflow-hidden border-4 border-black/40 shadow-inner bg-black">
              <QRScanner onScanSuccess={handleScan} />
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-black/20 p-6 sm:px-8">
          <CardTitle className="text-xl font-bold text-white">Participants List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {registrations.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No registrations yet</h3>
              <p className="text-muted-foreground text-sm">When participants register, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {registrations.map((reg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * Math.min(idx, 10) }} // limit delay for many items
                  key={reg._id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:px-8 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 shadow-inner">
                      {reg.participant.firstName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white text-base">
                        {reg.participant.firstName} {reg.participant.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">{reg.participant.email}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                          {reg.participant.participantType === 'iiit' ? 'IIIT' : 'External'}
                        </Badge>
                        <Badge variant={reg.status === 'confirmed' ? "success" : "warning"} className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                          {reg.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-2 pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                    <Badge variant={reg.attendanceMarked ? "success" : "destructive"} className="text-xs px-3 py-1 uppercase tracking-widest font-bold">
                      {reg.attendanceMarked ? 'Present' : 'Absent'}
                    </Badge>
                    {reg.attendanceTimestamp && (
                      <span className="text-xs text-slate-500 font-mono font-medium">
                        {new Date(reg.attendanceTimestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Participants;
