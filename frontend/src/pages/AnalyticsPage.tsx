import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { metricsApi, statisticsApi, reportApi } from '../services/api';
import { HealthMetrics, HealthStatistics, Report } from '../types';
import Layout from '../components/layout/Layout';
import MetricsCard from '../components/analytics/MetricsCard';
import GrowthChart from '../components/analytics/GrowthChart';
import VaccinationProgress from '../components/analytics/VaccinationProgress';
import ReportsList from '../components/analytics/ReportsList';
import ReportGenerator from '../components/analytics/ReportGenerator';

type Tab = 'overview' | 'growth' | 'reports';

const AnalyticsPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Metrics state
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [stats, setStats] = useState<HealthStatistics | null>(null);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(90);

  useEffect(() => {
    if (!babyId) return;
    loadAllData();
  }, [babyId, days]);

  async function loadAllData() {
    try {
      setLoading(true);
      const [metricsRes, statsRes, reportsRes] = await Promise.all([
        metricsApi.getCurrent(Number(babyId)),
        statisticsApi.getStats(Number(babyId), days),
        reportApi.getAll(Number(babyId)),
      ]);

      setMetrics(metricsRes.data.record || null);
      setStats(statsRes.data || null);
      setReports(reportsRes.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load analytics data.');
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(data: Partial<Report>) {
    try {
      setError('');
      const response = await reportApi.create(Number(babyId), data);
      setReports((current) => [response.data.record, ...current]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not generate report.');
      throw err;
    }
  }

  async function deleteReport(id: number) {
    try {
      setError('');
      await reportApi.delete(Number(babyId), id);
      setReports((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete report.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="subtext">Loading analytics…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="analytics-page">
        <div className="back-link">
          <button onClick={() => navigate(`/baby/${babyId}`)}>← Back to baby profile</button>
        </div>
        <div>
          <div>
            <h1>Analytics & Reports</h1>
            <p>Track health statistics, growth history, and export PDF summaries.</p>
          </div>
          <div className="page-illustration wobbly-frame">
            <img src="/baby-analytics.jpg" alt="Analytics illustration" />
          </div>
        </div>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'growth' ? 'active' : ''}`}
            onClick={() => setActiveTab('growth')}
          >
            Growth & Vaccinations
          </button>
          <button
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports ({reports.length})
          </button>
        </div>

        {activeTab === 'overview' && metrics && (
          <section>
            <MetricsCard metrics={metrics} />
          </section>
        )}

        {activeTab === 'growth' && stats && (
          <section>
            <div className="analytics-controls">
              <label>
                Time Period:
                <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={180}>Last 180 days</option>
                </select>
              </label>
            </div>

            <GrowthChart stats={stats} />
            <VaccinationProgress stats={stats} />
          </section>
        )}

        {activeTab === 'reports' && (
          <section className="two-column-layout">
            <div>
              <h2>Generated Reports</h2>
              <ReportsList
                reports={reports}
                onDelete={deleteReport}
              />
            </div>
            <section className="form-panel">
              <h2>Generate New Report</h2>
              <ReportGenerator onSubmit={generateReport} />
            </section>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
