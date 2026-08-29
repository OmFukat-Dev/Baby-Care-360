import React, { useState } from 'react';
import { HealthDocument } from '../../types';

interface DocumentUploadFormProps {
  onSubmit: (data: Partial<HealthDocument>) => Promise<void>;
  isLoading?: boolean;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [form, setForm] = useState({
    document_type: '',
    document_name: '',
    file_path: '',
    related_record_type: '',
    related_record_id: '',
    notes: '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        document_type: form.document_type as 'vaccination_certificate' | 'prescription' | 'lab_report' | 'doctor_report' | 'other',
        document_name: form.document_name,
        file_path: form.file_path,
        related_record_type: form.related_record_type || undefined,
        related_record_id: form.related_record_id ? parseInt(form.related_record_id) : undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      setForm({
        document_type: 'vaccination_certificate',
        document_name: '',
        file_path: '',
        related_record_type: '',
        related_record_id: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not upload document.');
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Document Type
        <select
          value={form.document_type}
          onChange={(e) => setForm({ ...form, document_type: e.target.value })}
          required
        >
          <option value="">Select document type</option>
          <option value="vaccination_certificate">Vaccination Certificate</option>
          <option value="prescription">Prescription</option>
          <option value="lab_report">Lab Report</option>
          <option value="doctor_report">Doctor Report</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Document Name/Title
        <input
          type="text"
          value={form.document_name}
          onChange={(e) => setForm({ ...form, document_name: e.target.value })}
          placeholder="e.g., Vaccination Certificate March 2026"
          required
        />
      </label>

      <label>
        File Path
        <input
          type="text"
          value={form.file_path}
          onChange={(e) => setForm({ ...form, file_path: e.target.value })}
          placeholder="Path or URL to the document file"
          required
        />
      </label>

      <label>
        Related Record Type (Optional)
        <select
          value={form.related_record_type}
          onChange={(e) => setForm({ ...form, related_record_type: e.target.value })}
        >
          <option value="">No specific record</option>
          <option value="vaccination">Vaccination</option>
          <option value="checkup">Checkup</option>
          <option value="medicine">Medicine</option>
          <option value="lab">Lab Test</option>
        </select>
      </label>

      <label>
        Related Record ID (Optional)
        <input
          type="number"
          value={form.related_record_id}
          onChange={(e) => setForm({ ...form, related_record_id: e.target.value })}
          placeholder="ID of the related health record"
        />
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any additional details about this document"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Uploading…' : 'Upload Document'}
      </button>
    </form>
  );
};

export default DocumentUploadForm;
