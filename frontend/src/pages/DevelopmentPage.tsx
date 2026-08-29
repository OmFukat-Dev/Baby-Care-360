import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestoneApi, sleepApi, medicineApi } from '../services/api';
import { Milestone, SleepRecord, MedicineRecord } from '../types';
import Layout from '../components/layout/Layout';
import MilestoneForm from '../components/development/MilestoneForm';
import MilestoneList from '../components/development/MilestoneList';
import SleepForm from '../components/development/SleepForm';
import SleepLog from '../components/development/SleepLog';
import MedicineForm from '../components/development/MedicineForm';
import MedicineList from '../components/development/MedicineList';

type Tab = 'milestones' | 'sleep' | 'medicines';

const DevelopmentPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('milestones');

  // Milestone state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();

  // Sleep state
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [editingSleep, setEditingSleep] = useState<SleepRecord | undefined>();

  // Medicine state
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<MedicineRecord | undefined>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadAllData();
  }, [babyId]);

  async function loadAllData() {
    try {
      setLoading(true);
      const [milRes, sleepRes, medRes] = await Promise.all([
        milestoneApi.getAll(Number(babyId)),
        sleepApi.getAll(Number(babyId)),
        medicineApi.getAll(Number(babyId)),
      ]);

      setMilestones(milRes.data.records || []);
      setSleepRecords(sleepRes.data.records || []);
      setMedicines(medRes.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load development data.');
    } finally {
      setLoading(false);
    }
  }

  // Milestone handlers
  async function saveMilestone(data: Partial<Milestone>) {
    try {
      setError('');
      if (editingMilestone) {
        const response = await milestoneApi.update(Number(babyId), editingMilestone.id, data);
        setMilestones((current) =>
          current.map((m) => (m.id === editingMilestone.id ? response.data.record : m))
        );
        setEditingMilestone(undefined);
      } else {
        const response = await milestoneApi.create(Number(babyId), data);
        setMilestones((current) => [response.data.record, ...current]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save milestone.');
      throw err;
    }
  }

  async function deleteMilestone(id: number) {
    try {
      setError('');
      await milestoneApi.delete(Number(babyId), id);
      setMilestones((current) => current.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete milestone.');
    }
  }

  // Sleep handlers
  async function saveSleep(data: Partial<SleepRecord>) {
    try {
      setError('');
      if (editingSleep) {
        const response = await sleepApi.update(Number(babyId), editingSleep.id, data);
        setSleepRecords((current) =>
          current.map((r) => (r.id === editingSleep.id ? response.data.record : r))
        );
        setEditingSleep(undefined);
      } else {
        const response = await sleepApi.create(Number(babyId), data);
        setSleepRecords((current) => [response.data.record, ...current]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save sleep record.');
      throw err;
    }
  }

  async function deleteSleep(id: number) {
    try {
      setError('');
      await sleepApi.delete(Number(babyId), id);
      setSleepRecords((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete sleep record.');
    }
  }

  // Medicine handlers
  async function saveMedicine(data: Partial<MedicineRecord>) {
    try {
      setError('');
      if (editingMedicine) {
        const response = await medicineApi.update(Number(babyId), editingMedicine.id, data);
        setMedicines((current) =>
          current.map((m) => (m.id === editingMedicine.id ? response.data.record : m))
        );
        setEditingMedicine(undefined);
      } else {
        const response = await medicineApi.create(Number(babyId), data);
        setMedicines((current) => [response.data.record, ...current]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save medicine record.');
      throw err;
    }
  }

  async function deleteMedicine(id: number) {
    try {
      setError('');
      await medicineApi.delete(Number(babyId), id);
      setMedicines((current) => current.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete medicine record.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="subtext">Loading development data…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="development-page">
        <div className="back-link">
          <button onClick={() => navigate(`/baby/${babyId}`)}>← Back to baby profile</button>
        </div>
        <h1>Development & Daily Care</h1>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            Milestones
          </button>
          <button
            className={`tab-button ${activeTab === 'sleep' ? 'active' : ''}`}
            onClick={() => setActiveTab('sleep')}
          >
            Sleep Tracking
          </button>
          <button
            className={`tab-button ${activeTab === 'medicines' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicines')}
          >
            Medicines
          </button>
        </div>

        {activeTab === 'milestones' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-development.jpg" alt="Development milestones" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Developmental Milestones</h2>
              <MilestoneList
                milestones={milestones}
                onEdit={setEditingMilestone}
                onDelete={deleteMilestone}
              />
            </div>
            <section className="form-panel">
              <h2>{editingMilestone ? 'Edit Milestone' : 'Record Milestone'}</h2>
              <MilestoneForm
                milestone={editingMilestone}
                onSubmit={saveMilestone}
                onCancel={() => setEditingMilestone(undefined)}
              />
            </section>
          </section>
        )}

        {activeTab === 'sleep' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame-alt" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-sleeping.jpg" alt="Baby sleeping logs" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Sleep Records</h2>
              <SleepLog
                records={sleepRecords}
                onEdit={setEditingSleep}
                onDelete={deleteSleep}
              />
            </div>
            <section className="form-panel">
              <h2>{editingSleep ? 'Edit Sleep Record' : 'Log Sleep'}</h2>
              <SleepForm
                record={editingSleep}
                onSubmit={saveSleep}
                onCancel={() => setEditingSleep(undefined)}
              />
            </section>
          </section>
        )}

        {activeTab === 'medicines' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/hero-kid.jpg" alt="Medicines log illustration" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Medicines</h2>
              <MedicineList
                records={medicines}
                onEdit={setEditingMedicine}
                onDelete={deleteMedicine}
              />
            </div>
            <section className="form-panel">
              <h2>{editingMedicine ? 'Edit Medicine' : 'Record Medicine'}</h2>
              <MedicineForm
                record={editingMedicine}
                onSubmit={saveMedicine}
                onCancel={() => setEditingMedicine(undefined)}
              />
            </section>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default DevelopmentPage;
