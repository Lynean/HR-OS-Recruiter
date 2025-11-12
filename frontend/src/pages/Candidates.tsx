import React, { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    cvFile: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await candidateAPI.getAll();
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, cvFile: file });
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.cvFile) {
      alert('Please select a CV file');
      return;
    }

    if (!uploadForm.firstName || !uploadForm.lastName || !uploadForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('cv', uploadForm.cvFile);
    formData.append('firstName', uploadForm.firstName);
    formData.append('lastName', uploadForm.lastName);
    formData.append('email', uploadForm.email);
    if (uploadForm.phone) formData.append('phone', uploadForm.phone);
    if (uploadForm.location) formData.append('location', uploadForm.location);

    try {
      await candidateAPI.upload(formData);
      loadCandidates();
      setShowUploadModal(false);
      setUploadForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        cvFile: null
      });
      alert('CV uploaded and processed successfully!');
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to upload CV';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Candidates</h2>
        <p>Manage candidate profiles and CVs</p>
      </div>

      <div className="card">
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          + Upload New CV
        </button>
      </div>

      <div className="card">
        <h3>All Candidates ({candidates.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.firstName} {candidate.lastName}</td>
                <td>{candidate.email}</td>
                <td>{candidate.experience || 0} years</td>
                <td>{candidate.skills.slice(0, 3).join(', ')}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </td>
                <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Candidate CV</h3>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={uploadForm.firstName}
                  onChange={(e) => setUploadForm({ ...uploadForm, firstName: e.target.value })}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={uploadForm.lastName}
                  onChange={(e) => setUploadForm({ ...uploadForm, lastName: e.target.value })}
                  required
                  placeholder="Enter last name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={uploadForm.email}
                  onChange={(e) => setUploadForm({ ...uploadForm, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={uploadForm.phone}
                  onChange={(e) => setUploadForm({ ...uploadForm, phone: e.target.value })}
                  placeholder="Enter phone number (optional)"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={uploadForm.location}
                  onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                  placeholder="Enter location (optional)"
                />
              </div>
              <div className="form-group">
                <label>CV File * (PDF, DOC, DOCX, TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  required
                />
                {uploadForm.cvFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#27ae60' }}>
                    Selected: {uploadForm.cvFile.name}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload & Process CV'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                <strong>Note:</strong> The CV will be automatically parsed using AI to extract skills, experience, and education.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

const getStatusColor = (status: string) => {
  const colors: any = {
    NEW: 'info',
    SCREENING: 'warning',
    INTERVIEWED: 'warning',
    OFFERED: 'info',
    ACCEPTED: 'success',
    ACTIVE: 'success',
    REJECTED: 'danger',
  };
  return colors[status] || 'info';
};

export default Candidates;
