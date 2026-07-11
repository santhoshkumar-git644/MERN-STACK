import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Plus, X, Check, Building2, UserCircle, SearchX } from 'lucide-react';

const ManageOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { category: 'Tech Club' }
  });
  const categoryValue = watch('category');

  const fetchOrganizers = async () => {
    try {
      const res = await api.get('/admin/organizers');
      setOrganizers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadOrganizers = async () => {
      try {
        const res = await api.get('/admin/organizers');
        if (active) setOrganizers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadOrganizers();

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/organizers', data);
      setSuccessMsg(`Organizer created! Login: ${res.data.credentials.loginEmail} | Password: ${res.data.credentials.password}`);
      reset({ category: 'Tech Club' });
      fetchOrganizers();
      setShowAddForm(false);
    } catch {
      alert('Failed to create organizer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/organizers/${id}/toggle`);
      fetchOrganizers();
    } catch {
      alert('Failed to update status');
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
      render: (org) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            {org.clubLogoUrl ? (
              <img src={org.clubLogoUrl.startsWith('http') ? org.clubLogoUrl : `http://localhost:5000${org.clubLogoUrl}`} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <span className="font-bold text-white">{org.name}</span>
        </div>
      ) 
    },
    { 
      header: 'Category', 
      render: (org) => (
        <Badge variant="outline" className="bg-primary/5 text-primary-300 border-primary/20">
          {org.category}
        </Badge>
      ) 
    },
    { 
      header: 'Login Email', 
      accessorKey: 'email',
      render: (org) => <span className="text-muted-foreground">{org.email}</span>
    },
    { 
      header: 'Status', 
      render: (org) => (
        <Badge variant={org.isActive ? "success" : "destructive"} className="uppercase font-bold tracking-widest text-[10px]">
          {org.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ) 
    },
    { 
      header: 'Actions', 
      render: (org) => (
        <Button 
          variant={org.isActive ? "outline" : "default"}
          size="sm"
          onClick={() => toggleStatus(org._id)}
          className={org.isActive ? "border-white/10 hover:bg-white/5" : ""}
        >
          {org.isActive ? 'Disable Access' : 'Enable Access'}
        </Button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      <PageHeader 
        title="Manage Clubs & Organizers"
        description="Onboard new clubs and manage their platform access."
        actions={
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
            className={`rounded-xl h-11 ${!showAddForm ? 'shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-white/10'}`}
          >
            {showAddForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> Add Organizer</>}
          </Button>
        }
      />

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4"
          >
            <Check className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              <h3 className="text-emerald-400 font-bold text-lg">Account Created Successfully</h3>
              <p className="text-emerald-200/80 font-mono text-sm break-all bg-black/20 p-3 rounded-lg border border-emerald-500/10">
                {successMsg}
              </p>
              <p className="text-emerald-500 text-xs mt-2 font-medium">Please copy these credentials. They have also been emailed to you.</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-400 p-1">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-10 overflow-hidden"
          >
            <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Create New Organizer</h3>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label className="text-slate-300 ml-1">Club / Organizer Name <span className="text-red-400">*</span></Label>
                      <Input 
                        type="text" 
                        placeholder="e.g. Programming Club" 
                        className="h-12 bg-black/40 border-white/10"
                        {...register('name', { required: true })} 
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-slate-300 ml-1">Category <span className="text-red-400">*</span></Label>
                      <Select
                        value={categoryValue}
                        onChange={(val) => setValue('category', val)}
                        options={[
                          { value: 'Tech Club', label: 'Tech Club' },
                          { value: 'Cultural Club', label: 'Cultural Club' },
                          { value: 'Sports Council', label: 'Sports Council' },
                          { value: 'Fest Team', label: 'Fest Team' }
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label className="text-slate-300 ml-1">Contact Email (Public) <span className="text-red-400">*</span></Label>
                    <Input 
                      type="email" 
                      placeholder="club@college.edu" 
                      className="h-12 bg-black/40 border-white/10"
                      {...register('contactEmail', { required: true })} 
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label className="text-slate-300 ml-1">Description <span className="text-red-400">*</span></Label>
                    <textarea 
                      rows="3" 
                      placeholder="Brief description about the club..." 
                      className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors hover:border-white/20 text-white resize-none"
                      {...register('description', { required: true })} 
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto h-12 px-8 text-base shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
        {organizers.length === 0 ? (
          <div className="p-16 text-center">
            <SearchX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No organizers found</h3>
            <p className="text-muted-foreground text-sm">Create the first organizer to get started.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={organizers} />
        )}
      </Card>
    </div>
  );
};

export default ManageOrganizers;
