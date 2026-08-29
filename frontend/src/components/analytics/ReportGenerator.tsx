import React, { useState } from 'react';
import { Report } from '../../types';

interface ReportGeneratorProps {
  onSubmit: (data: Partial<Report>) => Promise<void>;
  isLoading?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [form, setForm] = useState({
    report_type: '',
    title: '',
    report_period_start: '',
    report_period_end: '',
    summary: '',
  });
  const [error, setError] = useState('');

  const getDefaultTitle = (type: string) => {
    const titles: Record<string, string> = {
      monthly_summary: 'Monthly Health Summary',
      growth_report: 'Growth Progress Report',
      vaccination_status: 'Vaccination Status Report',
      health_overview: 'Health Overview',
    };
    return titles[type] || 'Health Report';
  };

  const handleTypeChange = (type: string) => {
    setForm({
      ...form,
      report_type: type,
      title: getDefaultTitle(type),
    });
  };

  const getDefaultDates = () => {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      start: monthAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  };

  React.useEffect(() => {
    const dates = getDefaultDates();
    setForm((prev) => ({
      ...prev,
      report_period_start: prev.report_period_start || dates.start,
      report_period_end: prev.report_period_end || dates.end,
    }));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!form.report_type) {
      setError('Please select a report type');
      return;
    }

    try {
      const payload = {
        report_type: form.report_type as 'monthly_summary' | 'growth_report' | 'vaccination_status' | 'health_overview',
        title: form.title || getDefaultTitle(form.report_type),
        report_period_start: form.report_period_start,
        report_period_end: form.report_period_end,
        summary: form.summary || undefined,
      };
      await onSubmit(payload);
      setForm({
        report_type: '',
        title: '',
        report_period_start: getDefaultDates().start,
        report_period_end: getDefaultDates().end,
        summary: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not generate report.');
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Report Type
        <select
          value={form.report_type}
          onChange={(e) => handleTypeChange(e.target.value)}
          required
        >
          <option value="">Select a report type</option>
          <option value="monthly_summary">Monthly Health Summary</option>
          <option value="growth_report">Growth Progress Report</option>
          <option value="vaccination_status">Vaccination Status Report</option>
          <option value="health_overview">Health Overview</option>
        </select>
      </label>

      <label>
        Report Title
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Auto-filled based on report type"
        />
      </label>

      <div className="form-row">
        <label>
          Period Start Date
          <input
            type="date"
            value={form.report_period_start}
            onChange={(e) => setForm({ ...form, report_period_start: e.target.value })}
            required
          />
        </label>
        <label>
          Period End Date
          <input
            type="date"
            value={form.report_period_end}
            onChange={(e) => setForm({ ...form, report_period_end: e.target.value })}
            required
          />
        </label>
      </div>

      <label>
        Summary Notes (Optional)
        <textarea
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder="Add any additional notes or context for this report"
          rows={3}
        />
      </label>

      <div className="info-box">
        <p>
          <strong>ℹ️ Report Details:</strong>
          This report will analyze health data from{' '}
          <strong>{form.report_period_start || 'start date'}</strong> to{' '}
          <strong>{form.report_period_end || 'end date'}</strong> and include key findings
          and personalized recommendations.
        </p>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating…' : '📊 Generate Report'}
      </button>
    </form>
  );
};

export default ReportGenerator;
