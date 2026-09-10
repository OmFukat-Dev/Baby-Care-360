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
                📊 Insights & Clinic Documents
              </span>
            </div>

            <h1 className="kido-page-hero-title">
              Analytics & Medical Reports
            </h1>

            <p className="kido-page-hero-desc">
              Track health metrics velocity, review developmental progress against WHO standards, and generate printable PDF clinical summaries for your pediatrician.
            </p>

            {/* Micro Stats Chips Row */}
            <div className="kido-page-hero-chips">
              <span className="kido-hero-chip">
                📈 Comprehensive Metrics
              </span>
              <span className="kido-hero-chip">
                💉 Immunization Curves
              </span>
              <span className="kido-hero-chip success">
                📄 {reports.length} Reports Archived
              </span>
            </div>
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/baby-analytics.jpg" alt="Baby clinical analytics and reports" />
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      <div className="analytics-page" style={{ margin: 0, padding: 0 }}>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="tabs" style={{ marginBottom: '2rem' }}>
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
          <section className="kido-glass-card p-6">
            <MetricsCard metrics={metrics} />
          </section>
        )}

        {activeTab === 'growth' && stats && (
          <section className="kido-glass-card p-6">
            <div className="analytics-controls mb-6">
              <label className="font-bold text-sm text-slate-700">
                Time Period:
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1">
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={180}>Last 180 days</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-6">
              <GrowthChart stats={stats} />
              <VaccinationProgress stats={stats} />
            </div>
          </section>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="kido-glass-card p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Generated Reports</h2>
              <ReportsList
                reports={reports}
                onDelete={deleteReport}
              />
            </div>
            <div className="kido-glass-card p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Generate New Report</h2>
              <ReportGenerator onSubmit={generateReport} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
