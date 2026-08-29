import React from 'react';
import { Report } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface ReportsListProps {
  reports: Report[];
  onDelete?: (id: number) => void;
}

const ReportsList: React.FC<ReportsListProps> = ({ reports, onDelete }) => {
  const { formatDate } = useFormat();

  if (reports.length === 0) {
    return <p className="empty-state">No reports generated yet.</p>;
  }

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      monthly_summary: 'Monthly Summary',
      growth_report: 'Growth Report',
      vaccination_status: 'Vaccination Status',
      health_overview: 'Health Overview',
    };
    return labels[type] || type;
  };

  const getReportTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      monthly_summary: '📋',
      growth_report: '📈',
      vaccination_status: '💉',
      health_overview: '🏥',
    };
    return icons[type] || '📄';
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      monthly_summary: '#e7d4f5',
      growth_report: '#fff3cd',
      vaccination_status: '#d4edda',
      health_overview: '#d1ecf1',
    };
    return colors[type] || '#f8f9fa';
  };

  return (
    <div className="reports-list">
      {reports.map((report) => (
        <article
          key={report.id}
          className="report-item"
          style={{ backgroundColor: getReportTypeColor(report.report_type) }}
        >
          <div className="report-header">
            <h3>{getReportTypeIcon(report.report_type)} {report.title}</h3>
            <p className="report-type">{getReportTypeLabel(report.report_type)}</p>
          </div>

          <div className="report-content">
            <p className="report-period">
              📅 {formatDate(report.report_period_start)} to {formatDate(report.report_period_end)}
            </p>

            {report.summary && <p className="report-summary">{report.summary}</p>}

            {report.key_findings && report.key_findings.length > 0 && (
              <div className="report-findings">
                <strong>Key Findings:</strong>
                <ul>
                  {report.key_findings.map((finding, idx) => (
                    <li key={idx}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendations && report.recommendations.length > 0 && (
              <div className="report-recommendations">
                <strong>Recommendations:</strong>
                <ul>
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="report-generated">
              Generated: {formatDate(report.generated_at)}
            </p>
          </div>

          {onDelete && (
            <div className="report-actions">
              {report.pdf_url && (
                <a href={report.pdf_url} target="_blank" rel="noopener noreferrer" className="download-button">
                  📥 Download PDF
                </a>
              )}
              <button
                className="remove-button"
                onClick={() => {
                  if (window.confirm('Delete this report?')) {
                    onDelete(report.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default ReportsList;
