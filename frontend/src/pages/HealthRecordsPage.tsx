import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi, reminderApi, timelineApi } from '../services/api';
import { HealthDocument, Reminder, TimelineEvent } from '../types';
import Layout from '../components/layout/Layout';
import DocumentUploadForm from '../components/health-records/DocumentUploadForm';
import DocumentList from '../components/health-records/DocumentList';
import ReminderForm from '../components/health-records/ReminderForm';
import ReminderList from '../components/health-records/ReminderList';
import TimelineView from '../components/health-records/TimelineView';

type Tab = 'documents' | 'reminders' | 'timeline';

const HealthRecordsPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('timeline');

  // Document state
  const [documents, setDocuments] = useState<HealthDocument[]>([]);

  // Reminder state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>();

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadAllData();
  }, [babyId]);

  async function loadAllData() {
    try {
      setLoading(true);
      const [docRes, remRes, timeRes] = await Promise.all([
        documentApi.getAll(Number(babyId)),
        reminderApi.getAll(Number(babyId)),
        timelineApi.getTimeline(Number(babyId)),
      ]);

      setDocuments(docRes.data.records || []);
      setReminders(remRes.data.records || []);
      setTimelineEvents(timeRes.data.events || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load health records.');
    } finally {
      setLoading(false);
    }
  }

  // Document handlers
  async function saveDocument(data: Partial<HealthDocument>) {
    try {
      setError('');
      const response = await documentApi.create(Number(babyId), data);
      setDocuments((current) => [response.data.record, ...current]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save document.');
      throw err;
    }
  }

  async function deleteDocument(id: number) {
    try {
      setError('');
      await documentApi.delete(Number(babyId), id);
      setDocuments((current) => current.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete document.');
    }
  }

  // Reminder handlers
  async function saveReminder(data: Partial<Reminder>) {
    try {
      setError('');
      if (editingReminder) {
        const response = await reminderApi.update(Number(babyId), editingReminder.id, data);
        setReminders((current) =>
          current.map((r) => (r.id === editingReminder.id ? response.data.record : r))
        );
        setEditingReminder(undefined);
      } else {
        const response = await reminderApi.create(Number(babyId), data);
        setReminders((current) => [response.data.record, ...current]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save reminder.');
      throw err;
    }
  }

  async function deleteReminder(id: number) {
    try {
      setError('');
      await reminderApi.delete(Number(babyId), id);
      setReminders((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete reminder.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="subtext">Loading health records…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner Section with Floating Shapes & Cloud Transition */}
      <section className="kido-page-hero">
        <div className="kido-floating-shapes">
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
        </div>

        <div className="kido-page-hero-inner">
          <div className="kido-page-hero-content">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <button 
                onClick={() => navigate(babyId ? `/baby/${babyId}` : '/')} 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold transition-all cursor-pointer border border-white/30 shadow-sm"
              >
                <span>← Baby Profile</span>
              </button>
              <span className="kido-hero-badge">
                🛡️ Health Records & Timeline
              </span>
            </div>

            <h1 className="kido-page-hero-title">
              Preventive Care & Health Timeline
            </h1>

            <p className="kido-page-hero-desc">
              Explore your child's chronological health milestone events, scheduled medicine/vaccine alerts, and archived pediatric documents.
            </p>

            {/* Micro Stats Chips Row */}
            <div className="kido-page-hero-chips">
              <span className="kido-hero-chip">
                📅 {timelineEvents.length} Timeline Events
              </span>
              <span className="kido-hero-chip">
                ⏰ {reminders.filter((r) => r.status === 'pending').length} Pending Reminders
              </span>
              <span className="kido-hero-chip success">
                📁 {documents.length} Health Documents
              </span>
            </div>
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/baby-preventive.jpg" alt="Preventive health timeline" />
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      <div className="health-records-page" style={{ margin: 0, padding: 0 }}>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <button
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline ({timelineEvents.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            Reminders ({reminders.filter((r) => r.status === 'pending').length})
          </button>
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents ({documents.length})
          </button>
        </div>

        {activeTab === 'timeline' && (
          <div className="kido-glass-card p-6 animate-fade-in">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Comprehensive Health Timeline</h2>
              <p className="text-xs text-slate-400 mt-1">Chronological record feed combining vaccine schedules, pediatric checkups, and growth logs.</p>
            </div>
            <TimelineView events={timelineEvents} />
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="kido-glass-card p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Active Reminders</h2>
              <ReminderList
                reminders={reminders}
                onEdit={setEditingReminder}
                onDelete={deleteReminder}
              />
            </div>
            <div className="kido-glass-card p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>{editingReminder ? 'Edit Reminder' : 'Create Reminder'}</h2>
              <ReminderForm
                record={editingReminder}
                onSubmit={saveReminder}
                onCancel={() => setEditingReminder(undefined)}
              />
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="kido-glass-card p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Health Documents</h2>
              <DocumentList
                documents={documents}
                onDelete={deleteDocument}
              />
            </div>
            <div className="kido-glass-card p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Upload Medical Document</h2>
              <DocumentUploadForm onSubmit={saveDocument} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HealthRecordsPage;
