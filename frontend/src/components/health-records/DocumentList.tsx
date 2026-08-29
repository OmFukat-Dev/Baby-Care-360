import React from 'react';
import { HealthDocument } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface DocumentListProps {
  documents: HealthDocument[];
  onDelete?: (id: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  const { formatDate } = useFormat();

  if (documents.length === 0) {
    return <p className="empty-state">No health documents uploaded yet.</p>;
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccination_certificate: 'Vaccination Certificate',
      prescription: 'Prescription',
      lab_report: 'Lab Report',
      doctor_report: 'Doctor Report',
      other: 'Other Document',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vaccination_certificate: '#d4edda',
      prescription: '#fff3cd',
      lab_report: '#d1ecf1',
      doctor_report: '#e7d4f5',
      other: '#f8f9fa',
    };
    return colors[type] || '#f8f9fa';
  };

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <article
          key={doc.id}
          className="record-item"
          style={{ backgroundColor: getTypeColor(doc.document_type) }}
        >
          <div>
            <h3>{doc.document_name}</h3>
            <p className="document-type">
              <strong>{getTypeLabel(doc.document_type)}</strong>
            </p>
            <p>
              <strong>Uploaded:</strong> {formatDate(doc.uploaded_date)}
            </p>
            {doc.related_record_type && (
              <p>
                <strong>Related to:</strong> {doc.related_record_type}
                {doc.related_record_id && ` (#${doc.related_record_id})`}
              </p>
            )}
            {doc.notes && <p>Notes: {doc.notes}</p>}
            <p className="document-path" title={doc.file_path}>
              📎 {doc.file_path.substring(Math.max(0, doc.file_path.length - 50))}
            </p>
          </div>
          {onDelete && (
            <div className="record-actions">
              <button
                className="remove-button"
                onClick={() => {
                  if (window.confirm('Delete this document?')) {
                    onDelete(doc.id);
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

export default DocumentList;
