import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormat } from '../hooks/useFormat';
import { babyApi, vaccinationApi, checkupApi, polioApi } from '../services/api';
import { Baby, VaccinationRecord, Checkup, PolioRecord } from '../types';
import Layout from '../components/layout/Layout';

const BabyDetail: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const { formatAge, formatDate } = useFormat();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [polioRecords, setPolioRecords] = useState<PolioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadData();
  }, [babyId]);

  async function loadData() {
    try {
      setLoading(true);
      const babyRes = await babyApi.getById(Number(babyId));
      setBaby(babyRes.data.baby);

      const vaccRes = await vaccinationApi.getAll(Number(babyId));
      setVaccinations(vaccRes.data.records || []);

      const checkRes = await checkupApi.getAll(Number(babyId));
      setCheckups(checkRes.data.records || []);

      const polioRes = await polioApi.getAll(Number(babyId));
      setPolioRecords(polioRes.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load baby details.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="subtext">Loading baby details…</p>
      </Layout>
    );
  }

  if (!baby) {
    return (
      <Layout>
        <div className="error">Baby not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="baby-detail-page">
        <div className="back-link">
          <button onClick={() => navigate('/')}>← Back to dashboard</button>
        </div>

        <section className="baby-detail-header">
          <div>
            <h1>{baby.name}</h1>
            <p className="subtext">{formatAge(baby.date_of_birth)}</p>
          </div>
          <div className="baby-info">
            {baby.gender && <p><strong>Gender:</strong> {baby.gender}</p>}
            {baby.blood_group && <p><strong>Blood Group:</strong> {baby.blood_group}</p>}
            {baby.birth_weight && <p><strong>Birth Weight:</strong> {baby.birth_weight} kg</p>}
            {baby.birth_length && <p><strong>Birth Length:</strong> {baby.birth_length} cm</p>}
          </div>
        </section>

        <nav className="tracking-nav">
          <button className="nav-link" onClick={() => navigate(`/growth/${babyId}`)}>
            Growth Monitoring
          </button>
          <button className="nav-link" onClick={() => navigate(`/nutrition/${babyId}`)}>
            Nutrition & Feeding
          </button>
          <button className="nav-link" onClick={() => navigate(`/development/${babyId}`)}>
            Development & Care
          </button>
          <button className="nav-link" onClick={() => navigate(`/health-records/${babyId}`)}>
            Health Records
          </button>
          <button className="nav-link" onClick={() => navigate(`/analytics/${babyId}`)}>
            Analytics
          </button>
        </nav>

        {error && <p className="error" role="alert">{error}</p>}

        <section className="care-section">
          <h2>Vaccinations</h2>
          {vaccinations.length > 0 ? (
            <div className="records-list">
              {vaccinations.map((v) => (
                <article key={v.id} className="record-item">
                  <div>
                    <h3>{v.vaccine_name}</h3>
                    <p>Dose {v.dose_number || '—'}</p>
                    <p className={`status status-${v.status}`}>{v.status}</p>
                    {v.administered_date && (
                      <p>Administered: {formatDate(v.administered_date)}</p>
                    )}
                    {v.scheduled_date && !v.administered_date && (
                      <p>Scheduled: {formatDate(v.scheduled_date)}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No vaccination records yet.</p>
          )}
        </section>

        <section className="care-section">
          <h2>Checkups</h2>
          {checkups.length > 0 ? (
            <div className="records-list">
              {checkups.map((c) => (
                <article key={c.id} className="record-item">
                  <div>
                    <h3>{c.reason || 'Checkup'}</h3>
                    {c.doctor_name && <p>Doctor: {c.doctor_name}</p>}
                    {c.clinic && <p>Clinic: {c.clinic}</p>}
                    <p>Appointment: {formatDate(c.appointment_date)}</p>
                    {c.follow_up_date && (
                      <p>Follow-up: {formatDate(c.follow_up_date)}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No checkup records yet.</p>
          )}
        </section>

        <section className="care-section">
          <h2>Polio Records</h2>
          {polioRecords.length > 0 ? (
            <div className="records-list">
              {polioRecords.map((p) => (
                <article key={p.id} className="record-item">
                  <div>
                    <h3>Polio Dose</h3>
                    <p>Date: {formatDate(p.dose_date)}</p>
                    {p.campaign && <p>Campaign: {p.campaign}</p>}
                    {p.location && <p>Location: {p.location}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No polio records yet.</p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default BabyDetail;
