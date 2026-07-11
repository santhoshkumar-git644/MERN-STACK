import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { SearchX, CheckCircle, XCircle } from 'lucide-react';

const PasswordResets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/password-resets');
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadRequests = async () => {
      try {
        const res = await api.get('/admin/password-resets');
        if (active) setRequests(res.data);
      } catch (error) {
        console.error('Error fetching password reset requests:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRequests();

    return () => {
      active = false;
    };
  }, []);

  const handleAction = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    setProcessingId(id);
    try {
      const action = status === 'approved' ? 'approve' : 'reject';
      await api.put(`/admin/password-resets/${id}`, { action });
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-10 w-64 bg-card/50 rounded-lg mb-4 animate-pulse"></div>
      <div className="h-5 w-96 bg-card/30 rounded-md mb-12 animate-pulse"></div>
      <div className="h-96 bg-card/40 rounded-[2rem] animate-pulse"></div>
    </div>
  );

  const columns = [
    { 
      header: 'Club Name', 
      render: (req) => <span className="font-bold text-white">{req.organizer?.name || 'Unknown'}</span> 
    },
    { 
      header: 'Email', 
      render: (req) => <span className="text-muted-foreground">{req.organizer?.email || 'Unknown'}</span> 
    },
    { 
      header: 'Reason', 
      render: (req) => <span className="text-slate-300 max-w-[300px] truncate block" title={req.reason}>{req.reason}</span> 
    },
    { 
      header: 'Date Requested', 
      render: (req) => <span className="text-muted-foreground text-sm">{new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span> 
    },
    { 
      header: 'Status', 
      render: (req) => (
        <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'destructive' : 'outline'} className={`uppercase font-bold tracking-widest text-[10px] ${req.status === 'pending' ? 'text-yellow-400 border-yellow-400/30' : ''}`}>
          {req.status}
        </Badge>
      ) 
    },
    { 
      header: 'Actions', 
      render: (req) => (
        req.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => handleAction(req._id, 'approved')}
              disabled={processingId === req._id}
              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 transition-colors shadow-none"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve & Reset
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleAction(req._id, 'rejected')}
              disabled={processingId === req._id}
              className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-colors shadow-none"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs font-medium">No actions</span>
        )
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      <PageHeader 
        title="Security Requests"
        description="Review and manage password reset requests from club organizers."
      />

      <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-16 text-center">
            <SearchX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No security requests</h3>
            <p className="text-muted-foreground text-sm">There are currently no pending password reset requests.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={requests} />
        )}
      </Card>
    </div>
  );
};

export default PasswordResets;
