import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import FormBuilder from '../../components/FormBuilder';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Trash2, Save, CalendarDays, Settings, Users, PenTool, LayoutGrid } from 'lucide-react';

const ManageEvent = () => {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { eventType: 'normal', eligibility: 'all' }
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customForm, setCustomForm] = useState([]);
  const eventType = watch('eventType');
  const eligibility = watch('eligibility');
  const isTeamEvent = watch('isTeamEvent');

  useEffect(() => {
    if (!isNew) {
      api.get(`/events/${id}`).then(res => {
        const event = res.data;
        event.eventStartDate = new Date(event.eventStartDate).toISOString().slice(0, 16);
        event.eventEndDate = new Date(event.eventEndDate).toISOString().slice(0, 16);
        event.registrationDeadline = new Date(event.registrationDeadline).toISOString().slice(0, 16);
        event.tags = event.tags?.join(', ');
        reset(event);
        setCustomForm(event.customForm || []);
        setLoading(false);
      }).catch(() => {
        setError('Failed to load event');
        setLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        customForm
      };

      if (isNew) {
        await api.post('/events', payload);
      } else {
        await api.put(`/events/${id}`, payload);
      }
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-10 w-48 bg-card/50 rounded-lg mb-8 animate-pulse"></div>
        <div className="h-[600px] bg-card/40 rounded-[2rem] animate-pulse"></div>
      </div>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <Button 
        variant="ghost" 
        onClick={() => navigate('/organizer/events')} 
        className="mb-8 hover:bg-white/5 hover:text-white text-muted-foreground transition-colors h-10 px-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Events
      </Button>

      <PageHeader 
        title={isNew ? 'Create New Event' : 'Edit Event Details'}
        description={isNew ? 'Setup a new event for your club.' : 'Update information, schedule, and custom fields.'}
        actions={
          !isNew && (
            <Button 
              variant="destructive"
              onClick={handleDelete} 
              className="rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all shadow-none h-11"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          )
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <span>{error}</span>
          </motion.div>
        )}

        <motion.div variants={sectionVariants} initial="hidden" animate="show">
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2.5">
                <Label className="text-slate-300 ml-1">Event Name <span className="text-red-400">*</span></Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Felicity Hackathon 2026" 
                  className="h-12 bg-black/40 border-white/10 focus-visible:ring-primary/50 text-base"
                  {...register('eventName', { required: true })} 
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-slate-300 ml-1">Description <span className="text-red-400">*</span></Label>
                <textarea 
                  rows="5" 
                  placeholder="Provide details about the event schedule, guidelines, and prizes..." 
                  className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors hover:border-white/20 text-white min-h-[150px]"
                  {...register('eventDescription', { required: true })} 
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-slate-300 ml-1">Tags (comma separated)</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. coding, tech, design" 
                  className="h-12 bg-black/40 border-white/10 focus-visible:ring-primary/50"
                  {...register('tags')} 
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-accent" /> Schedule & Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">Start Date & Time <span className="text-red-400">*</span></Label>
                  <Input 
                    type="datetime-local" 
                    className="h-12 bg-black/40 border-white/10 focus-visible:ring-accent/50 css-date-icon-white"
                    {...register('eventStartDate', { required: true })} 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">End Date & Time <span className="text-red-400">*</span></Label>
                  <Input 
                    type="datetime-local" 
                    className="h-12 bg-black/40 border-white/10 focus-visible:ring-accent/50 css-date-icon-white"
                    {...register('eventEndDate', { required: true })} 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">Registration Deadline <span className="text-red-400">*</span></Label>
                  <Input 
                    type="datetime-local" 
                    className="h-12 bg-black/40 border-white/10 focus-visible:ring-accent/50 css-date-icon-white"
                    {...register('registrationDeadline', { required: true })} 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">Eligible Participants <span className="text-red-400">*</span></Label>
                  <Select
                    value={eligibility}
                    onChange={(val) => setValue('eligibility', val)}
                    options={[
                      { value: 'all', label: 'Open for everyone' },
                      { value: 'iiit-only', label: 'IIIT students only' },
                      { value: 'non-iiit-only', label: 'External participants only' }
                    ]}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">Event Type <span className="text-red-400">*</span></Label>
                  <Select
                    value={eventType}
                    onChange={(val) => setValue('eventType', val)}
                    options={[
                      { value: 'normal', label: 'Standard event' },
                      { value: 'merchandise', label: 'Merchandise purchase' }
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> Pricing & Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">Registration Fee (₹)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0 (Free)" 
                    className="h-12 bg-black/40 border-white/10 focus-visible:ring-emerald-400/50" 
                    {...register('registrationFee')} 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 ml-1">Max Registration Limit</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Unlimited slots" 
                    className="h-12 bg-black/40 border-white/10 focus-visible:ring-emerald-400/50" 
                    {...register('registrationLimit')} 
                  />
                </div>

                {eventType === 'normal' && (
                  <div className="col-span-1 md:col-span-2 bg-black/20 border border-white/5 p-6 rounded-2xl mt-2 space-y-5">
                    <label className="flex items-center gap-3 text-white font-medium cursor-pointer select-none group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded bg-black/40 border border-white/20 group-hover:border-primary transition-colors">
                        <input 
                          type="checkbox" 
                          className="opacity-0 absolute inset-0 cursor-pointer"
                          {...register('isTeamEvent')} 
                        />
                        {isTeamEvent && <div className="w-3 h-3 bg-primary rounded-sm" />}
                      </div>
                      Enable Team Registration
                    </label>
                    
                    {isTeamEvent && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">Min Team Size</Label>
                          <Input type="number" min="1" className="h-11 bg-black/40 border-white/10" {...register('minTeamSize')} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">Max Team Size</Label>
                          <Input type="number" min="1" className="h-11 bg-black/40 border-white/10" {...register('maxTeamSize')} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20 p-6 sm:px-8">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-purple-400" /> Custom Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm text-muted-foreground mb-6">Ask participants additional questions during registration (e.g., T-Shirt Size, GitHub Profile).</p>
              <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
                <FormBuilder formFields={customForm} setFormFields={setCustomForm} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.4 }} className="pt-6 pb-12">
          <Button 
            type="submit" 
            disabled={saving} 
            className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
          >
            {saving ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isNew ? 'Create Event' : 'Save Event Details'}
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default ManageEvent;
