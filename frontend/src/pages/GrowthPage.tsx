import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { growthApi } from '../services/api';
import { GrowthMeasurement } from '../types';
import Layout from '../components/layout/Layout';
import GrowthChart from '../components/growth/GrowthChart';
import GrowthForm from '../components/growth/GrowthForm';

const GrowthPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [editingMeasurement, setEditingMeasurement] = useState<GrowthMeasurement | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadMeasurements();
  }, [babyId]);

  async function loadMeasurements() {
    try {
      setLoading(true);
      const response = await growthApi.getAll(Number(babyId));
      setMeasurements(response.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load growth measurements.');
    } finally {
      setLoading(false);
    }
  }

  async function saveMeasurement(data: Partial<GrowthMeasurement>) {
    try {
      setError('');
      if (editingMeasurement) {
        const response = await growthApi.update(Number(babyId), editingMeasurement.id, data);
        setMeasurements((current) =>
          current.map((m) =>
            m.id === editingMeasurement.id ? response.data.record : m
          )
        );
        setEditingMeasurement(undefined);
      } else {
        const response = await growthApi.create(Number(babyId), data);
        setMeasurements((current) => [...current, response.data.record]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save measurement.');
      throw err;
    }
  }

  async function deleteMeasurement(id: number) {
    try {
      setError('');
      await growthApi.delete(Number(babyId), id);
      setMeasurements((current) => current.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete measurement.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="subtext">Loading growth data…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="growth-page">
        <div className="back-link">
          <button onClick={() => navigate(`/baby/${babyId}`)}>← Back to baby profile</button>
        </div>
        <h1>Growth Monitoring</h1>
        {error && <p className="error" role="alert">{error}</p>}

        <section className="two-column-layout">
          <div>
            <div className="page-illustration wobbly-frame" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
              <img src="/baby-growth.jpg" alt="Baby Growth tracking illustration" style={{ width: '100%', borderRadius: 'inherit' }} />
            </div>
            <h2>Growth Trends</h2>
            <GrowthChart measurements={measurements} />
          </div>

          <section className="form-panel">
            <h2>{editingMeasurement ? 'Edit Measurement' : 'Record Measurement'}</h2>
            <GrowthForm
              measurement={editingMeasurement}
              onSubmit={saveMeasurement}
              onCancel={() => setEditingMeasurement(undefined)}
            />
          </section>
        </section>

        {measurements.length > 0 && (
          <section className="measurements-list">
            <h2>All Measurements</h2>
            <div className="records-list">
              {measurements
                .sort(
                  (a, b) =>
                    new Date(b.measurement_date).getTime() -
                    new Date(a.measurement_date).getTime()
                )
                .map((m) => (
                  <article key={m.id} className="record-item">
                    <div>
                      <p className="record-date">{m.measurement_date}</p>
                      {m.weight && <p>Weight: {m.weight} kg</p>}
                      {m.height && <p>Height: {m.height} cm</p>}
                      {m.length && <p>Length: {m.length} cm</p>}
                      {m.head_circumference && (
                        <p>Head Circumference: {m.head_circumference} cm</p>
                      )}
                      {m.notes && <p>Notes: {m.notes}</p>}
                    </div>
                    <div className="record-actions">
                      <button
                        className="edit-button"
                        onClick={() => setEditingMeasurement(m)}
                      >
                        Edit
                      </button>
                      <button
                        className="remove-button"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Delete this measurement? This cannot be undone.'
                            )
                          ) {
                            deleteMeasurement(m.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default GrowthPage;
