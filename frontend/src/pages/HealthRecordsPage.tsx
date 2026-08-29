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
      <div className="health-records-page">
        <div className="back-link">
          <button onClick={() => navigate(`/baby/${babyId}`)}>← Back to baby profile</button>
        </div>
        <h1>Health Records & Timeline</h1>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
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
          <section>
            <h2>Health Timeline - All Events</h2>
            <TimelineView events={timelineEvents} />
          </section>
        )}

        {activeTab === 'reminders' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-preventive.jpg" alt="Pediatric doctor vaccination reminder" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Reminders</h2>
              <ReminderList
                reminders={reminders}
                onEdit={setEditingReminder}
                onDelete={deleteReminder}
              />
            </div>
            <section className="form-panel">
              <h2>{editingReminder ? 'Edit Reminder' : 'Create Reminder'}</h2>
              <ReminderForm
                record={editingReminder}
                onSubmit={saveReminder}
                onCancel={() => setEditingReminder(undefined)}
              />
            </section>
          </section>
        )}

        {activeTab === 'documents' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame-alt" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-preventive.jpg" alt="Medical health documents illustration" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Health Documents</h2>
              <DocumentList
                documents={documents}
                onDelete={deleteDocument}
              />
            </div>
            <section className="form-panel">
              <h2>Upload Document</h2>
              <DocumentUploadForm onSubmit={saveDocument} />
            </section>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default HealthRecordsPage;
