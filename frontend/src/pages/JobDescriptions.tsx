import React, { useEffect, useState } from 'react';
import { jobDescriptionAPI } from '../services/api';

interface JobDescription {
  id: string;
  title: string;
  department?: string;
  location?: string;
  employmentType: string;
  description: string;
  requirements: string;
  responsibilities: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience?: number;
  maxExperience?: number;
  salaryRange?: string;
  status: string;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
  _count?: {
    matches: number;
  };
}

const JobDescriptions: React.FC = () => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJD, setEditingJD] = useState<JobDescription | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'FULL_TIME',
    description: '',
    requirements: '',
    responsibilities: '',
    requiredSkills: '',
    preferredSkills: '',
    minExperience: '',
    maxExperience: '',
    salaryRange: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadJobDescriptions();
  }, []);

  const loadJobDescriptions = async () => {
    try {
      const response = await jobDescriptionAPI.getAll();
      setJobDescriptions(response.data.jobDescriptions);
    } catch (error) {
      console.error('Error loading job descriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minExperience: formData.minExperience ? parseFloat(formData.minExperience) : undefined,
        maxExperience: formData.maxExperience ? parseFloat(formData.maxExperience) : undefined,
        createdBy: 'system' // Should come from auth
      };

      if (editingJD) {
        await jobDescriptionAPI.update(editingJD.id, data);
        alert('Job description updated successfully!');
      } else {
        await jobDescriptionAPI.create(data);
        alert('Job description created successfully!');
      }

      setShowCreateModal(false);
      setEditingJD(null);
      resetForm();
      loadJobDescriptions();
    } catch (error: any) {
      console.error('Error saving job description:', error);
      alert(error.response?.data?.error || 'Failed to save job description');
    }
  };

  const handleEdit = (jd: JobDescription) => {
    setEditingJD(jd);
    setFormData({
      title: jd.title,
      department: jd.department || '',
      location: jd.location || '',
      employmentType: jd.employmentType,
      description: jd.description,
      requirements: jd.requirements,
      responsibilities: jd.responsibilities,
      requiredSkills: jd.requiredSkills.join(', '),
      preferredSkills: jd.preferredSkills.join(', '),
      minExperience: jd.minExperience?.toString() || '',
      maxExperience: jd.maxExperience?.toString() || '',
      salaryRange: jd.salaryRange || '',
      status: jd.status
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job description?')) {
      return;
    }

    try {
      await jobDescriptionAPI.delete(id);
      alert('Job description deleted successfully!');
      loadJobDescriptions();
    } catch (error) {
      console.error('Error deleting job description:', error);
      alert('Failed to delete job description');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      employmentType: 'FULL_TIME',
      description: '',
      requirements: '',
      responsibilities: '',
      requiredSkills: '',
      preferredSkills: '',
      minExperience: '',
      maxExperience: '',
      salaryRange: '',
      status: 'ACTIVE'
    });
  };

  const filteredJDs = jobDescriptions.filter(jd =>
    filterStatus === 'all' || jd.status === filterStatus
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Job Descriptions</h2>
        <p>Manage job postings and requirements</p>
      </div>

      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingJD(null);
            resetForm();
            setShowCreateModal(true);
          }}
        >
          + Create New Job Description
        </button>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3>All Job Descriptions ({filteredJDs.length})</h3>
        {filteredJDs.length === 0 ? (
          <p>No job descriptions found. Create your first one!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Type</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Matches</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJDs.map((jd) => (
                <tr key={jd.id}>
                  <td>
                    <strong>{jd.title}</strong>
                    <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                      {jd.requiredSkills.slice(0, 3).join(', ')}
                    </div>
                  </td>
                  <td>{jd.department || 'N/A'}</td>
                  <td>{jd.location || 'N/A'}</td>
                  <td>{jd.employmentType.replace('_', ' ')}</td>
                  <td>
                    {jd.minExperience || 0}-{jd.maxExperience || '∞'} years
                  </td>
                  <td>
                    <span className={`badge badge-${getStatusColor(jd.status)}`}>
                      {jd.status}
                    </span>
                  </td>
                  <td>{jd._count?.matches || 0} candidates</td>
                  <td>
                    <button
                      onClick={() => handleEdit(jd)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(jd.id)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h3>{editingJD ? 'Edit Job Description' : 'Create New Job Description'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Engineering"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Remote, San Francisco"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Employment Type *</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    required
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Brief description of the role and company"
                />
              </div>

              <div className="form-group">
                <label>Requirements *</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  rows={4}
                  placeholder="Required qualifications, education, certifications, etc."
                />
              </div>

              <div className="form-group">
                <label>Responsibilities *</label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  required
                  rows={4}
                  placeholder="Key responsibilities and duties"
                />
              </div>

              <div className="form-group">
                <label>Required Skills * (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  required
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>

              <div className="form-group">
                <label>Preferred Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.preferredSkills}
                  onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                  placeholder="e.g., TypeScript, AWS, Docker"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Min Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.minExperience}
                    onChange={(e) => setFormData({ ...formData, minExperience: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Max Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.maxExperience}
                    onChange={(e) => setFormData({ ...formData, maxExperience: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="$100k - $150k"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingJD ? 'Update Job Description' : 'Create Job Description'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJD(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
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
    ACTIVE: 'success',
    DRAFT: 'warning',
    CLOSED: 'danger',
    ON_HOLD: 'info'
  };
  return colors[status] || 'info';
};

export default JobDescriptions;
