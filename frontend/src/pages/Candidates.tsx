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
    skills: [] as string[],
    experience: '',
    cvFile: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showParsedData, setShowParsedData] = useState(false);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadForm({ ...uploadForm, cvFile: file });

    // Automatically parse the CV when selected
    setParsing(true);
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await candidateAPI.parseCV(formData);
      const data = response.data.data;

      setParsedData(data);
      setShowParsedData(true);

      // Auto-fill form with parsed data
      setUploadForm({
        ...uploadForm,
        cvFile: file,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        experience: data.experience ? data.experience.toString() : ''
      });

      alert('CV parsed successfully! Review the auto-filled data below.');
    } catch (error: any) {
      console.error('Error parsing CV:', error);
      alert('Failed to parse CV automatically. You can still fill in the fields manually.');
    } finally {
      setParsing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.cvFile) {
      alert('Please select a CV file');
      return;
    }

    if (!uploadForm.firstName || !uploadForm.lastName || !uploadForm.email) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
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
    if (uploadForm.skills.length > 0) formData.append('skills', JSON.stringify(uploadForm.skills));
    if (uploadForm.experience) formData.append('experience', uploadForm.experience);

    try {
      const response = await candidateAPI.upload(formData);
      loadCandidates();
      setShowUploadModal(false);
      resetForm();
      alert(response.data.message || 'CV uploaded and processed successfully!');
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to upload CV';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setUploadForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      skills: [],
      experience: '',
      cvFile: null
    });
    setParsedData(null);
    setShowParsedData(false);
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !uploadForm.skills.includes(skill)) {
      setUploadForm({
        ...uploadForm,
        skills: [...uploadForm.skills, skill]
      });
    }
  };

  const handleSkillRemove = (skill: string) => {
    setUploadForm({
      ...uploadForm,
      skills: uploadForm.skills.filter(s => s !== skill)
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Candidates</h2>
        <p>Manage candidate profiles and CVs with AI-powered parsing</p>
      </div>

      <div className="card">
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          + Upload New CV (with AI Auto-Fill)
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
                <td>{candidate.skills.slice(0, 3).join(', ')}{candidate.skills.length > 3 && '...'}</td>
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
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h3>Upload Candidate CV with AI Auto-Fill</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              Upload a CV and our AI will automatically extract all information
            </p>

            <form onSubmit={handleUploadSubmit}>
              {/* File Upload */}
              <div className="form-group">
                <label>CV File * (PDF, DOC, DOCX, TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  required
                  disabled={parsing || uploading}
                />
                {uploadForm.cvFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#27ae60' }}>
                    Selected: {uploadForm.cvFile.name}
                  </div>
                )}
                {parsing && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#3498db' }}>
                    Parsing CV with AI... Please wait.
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={uploadForm.firstName}
                    onChange={(e) => setUploadForm({ ...uploadForm, firstName: e.target.value })}
                    required
                    placeholder="Auto-filled from CV"
                    disabled={parsing || uploading}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={uploadForm.lastName}
                    onChange={(e) => setUploadForm({ ...uploadForm, lastName: e.target.value })}
                    required
                    placeholder="Auto-filled from CV"
                    disabled={parsing || uploading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={uploadForm.email}
                  onChange={(e) => setUploadForm({ ...uploadForm, email: e.target.value })}
                  required
                  placeholder="Auto-filled from CV"
                  disabled={parsing || uploading}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={uploadForm.phone}
                    onChange={(e) => setUploadForm({ ...uploadForm, phone: e.target.value })}
                    placeholder="Auto-filled from CV"
                    disabled={parsing || uploading}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={uploadForm.location}
                    onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                    placeholder="Auto-filled from CV"
                    disabled={parsing || uploading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  value={uploadForm.experience}
                  onChange={(e) => setUploadForm({ ...uploadForm, experience: e.target.value })}
                  placeholder="Auto-filled from CV"
                  min="0"
                  step="0.5"
                  disabled={parsing || uploading}
                />
              </div>

              {/* Skills */}
              <div className="form-group">
                <label>Skills (Auto-extracted: {uploadForm.skills.length})</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {uploadForm.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '1.2rem'
                        }}
                        disabled={parsing || uploading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add more skills (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      handleSkillAdd(input.value.trim());
                      input.value = '';
                    }
                  }}
                  disabled={parsing || uploading}
                />
              </div>

              {/* Extracted Data Preview */}
              {showParsedData && parsedData && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <h4 style={{ marginTop: 0 }}>Additional Extracted Information (for reference)</h4>

                  {parsedData.education && JSON.parse(parsedData.education || '{}').education?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Education:</strong>
                      <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                        {JSON.parse(parsedData.education).education.map((edu: any, idx: number) => (
                          <li key={idx} style={{ fontSize: '0.875rem' }}>
                            {edu.degree} in {edu.field} - {edu.institution} ({edu.year})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedData.education && JSON.parse(parsedData.education || '{}').workHistory?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Work History:</strong>
                      <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                        {JSON.parse(parsedData.education).workHistory.map((work: any, idx: number) => (
                          <li key={idx} style={{ fontSize: '0.875rem' }}>
                            {work.title} at {work.company} ({work.duration})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedData.education && JSON.parse(parsedData.education || '{}').certifications?.length > 0 && (
                    <div>
                      <strong>Certifications:</strong>
                      <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                        {JSON.parse(parsedData.education).certifications.map((cert: any, idx: number) => (
                          <li key={idx} style={{ fontSize: '0.875rem' }}>
                            {cert.name} - {cert.issuer} ({cert.year})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || parsing}
                >
                  {uploading ? 'Uploading...' : 'Submit & Create Candidate'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  disabled={uploading || parsing}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                <strong>AI Auto-Fill:</strong> When you select a CV, our AI automatically extracts:
                Name, Email, Phone, Location, Skills, Experience, Education, Work History, and Certifications.
                Review and edit the data before submitting.
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
          max-width: 800px;
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
