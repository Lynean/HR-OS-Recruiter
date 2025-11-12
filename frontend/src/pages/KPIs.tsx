import React, { useEffect, useState } from 'react';
import { kpiAPI, candidateAPI } from '../services/api';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface KPI {
  id: string;
  title: string;
  description?: string;
  metric: string;
  target: number;
  current: number;
  unit?: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  assigner?: {
    name: string;
    email: string;
  };
}

interface Summary {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
  notStarted: number;
  completionRate: number;
}

const KPIs: React.FC = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [createForm, setCreateForm] = useState({
    candidateId: '',
    title: '',
    description: '',
    metric: '',
    target: '',
    unit: '',
    startDate: '',
    endDate: ''
  });

  const [updateProgress, setUpdateProgress] = useState({
    current: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisRes, candidatesRes, summaryRes] = await Promise.all([
        kpiAPI.getAll(),
        candidateAPI.getAll(),
        kpiAPI.getSummary()
      ]);

      setKpis(kpisRes.data);
      setCandidates(candidatesRes.data.candidates || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await kpiAPI.create({
        candidateId: createForm.candidateId,
        assignedBy: 'system', // Should come from auth
        title: createForm.title,
        description: createForm.description || undefined,
        metric: createForm.metric,
        target: parseFloat(createForm.target),
        unit: createForm.unit || undefined,
        startDate: new Date(createForm.startDate),
        endDate: new Date(createForm.endDate)
      });

      alert('KPI created successfully!');
      setShowCreateModal(false);
      resetCreateForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating KPI:', error);
      alert(error.response?.data?.error || 'Failed to create KPI');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKPI) return;

    setLoading(true);

    try {
      await kpiAPI.updateProgress(
        selectedKPI.id,
        parseFloat(updateProgress.current),
        'system' // Should come from auth
      );

      alert('KPI progress updated successfully!');
      setShowUpdateModal(false);
      setSelectedKPI(null);
      setUpdateProgress({ current: '', notes: '' });
      loadData();
    } catch (error: any) {
      console.error('Error updating KPI:', error);
      alert(error.response?.data?.error || 'Failed to update KPI');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (kpi: KPI) => {
    setSelectedKPI(kpi);
    setUpdateProgress({
      current: kpi.current.toString(),
      notes: ''
    });
    setShowUpdateModal(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      candidateId: '',
      title: '',
      description: '',
      metric: '',
      target: '',
      unit: '',
      startDate: '',
      endDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      NOT_STARTED: 'info',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      OVERDUE: 'danger'
    };
    return colors[status] || 'info';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#27ae60';
    if (progress >= 75) return '#3498db';
    if (progress >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const filteredKPIs = kpis.filter(kpi =>
    filterStatus === 'all' || kpi.status === filterStatus
  );

  if (loading && kpis.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>KPI Management</h2>
        <p>Track and manage candidate performance metrics</p>
      </div>

      {/* Statistics Dashboard */}
      {summary && (
        <div className="card">
          <h3>KPI Overview</h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="stat-card">
              <h4>Total KPIs</h4>
              <div className="value">{summary.total}</div>
              <div className="label">All metrics</div>
            </div>
            <div className="stat-card">
              <h4>In Progress</h4>
              <div className="value" style={{ color: '#3498db' }}>{summary.inProgress}</div>
              <div className="label">Active tracking</div>
            </div>
            <div className="stat-card">
              <h4>Completed</h4>
              <div className="value" style={{ color: '#27ae60' }}>{summary.completed}</div>
              <div className="label">Achieved goals</div>
            </div>
            <div className="stat-card">
              <h4>Overdue</h4>
              <div className="value" style={{ color: '#e74c3c' }}>{summary.overdue}</div>
              <div className="label">Past deadline</div>
            </div>
            <div className="stat-card">
              <h4>Not Started</h4>
              <div className="value" style={{ color: '#7f8c8d' }}>{summary.notStarted}</div>
              <div className="label">Pending</div>
            </div>
            <div className="stat-card">
              <h4>Completion Rate</h4>
              <div className="value">{summary.completionRate.toFixed(1)}%</div>
              <div className="label">Overall success</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New KPI
        </button>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* KPI List */}
      <div className="card">
        <h3>All KPIs ({filteredKPIs.length})</h3>
        {filteredKPIs.length === 0 ? (
          <p>No KPIs found. Create your first KPI to track candidate performance!</p>
        ) : (
          <div>
            {filteredKPIs.map((kpi) => (
              <div
                key={kpi.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${getProgressColor(kpi.progress)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{kpi.title}</h4>
                    <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                      {kpi.candidate.firstName} {kpi.candidate.lastName} • {kpi.metric}
                    </div>
                    {kpi.description && (
                      <p style={{ fontSize: '0.875rem', margin: '0.5rem 0', color: '#555' }}>
                        {kpi.description}
                      </p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
                      {new Date(kpi.startDate).toLocaleDateString()} - {new Date(kpi.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '150px' }}>
                    <span className={`badge badge-${getStatusColor(kpi.status)}`}>
                      {kpi.status.replace('_', ' ')}
                    </span>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getProgressColor(kpi.progress), marginTop: '0.5rem' }}>
                      {kpi.progress.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                      {kpi.current} / {kpi.target} {kpi.unit || ''}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#ecf0f1',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(kpi.progress, 100)}%`,
                      backgroundColor: getProgressColor(kpi.progress),
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => openUpdateModal(kpi)}
                    style={{ fontSize: '0.875rem' }}
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create KPI Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>Create New KPI</h3>
            <form onSubmit={handleCreateKPI}>
              <div className="form-group">
                <label>Candidate *</label>
                <select
                  value={createForm.candidateId}
                  onChange={(e) => setCreateForm({ ...createForm, candidateId: e.target.value })}
                  required
                >
                  <option value="">-- Select Candidate --</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>KPI Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  required
                  placeholder="e.g., Complete Training Modules"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  placeholder="What is this KPI measuring?"
                />
              </div>

              <div className="form-group">
                <label>Metric Type *</label>
                <input
                  type="text"
                  value={createForm.metric}
                  onChange={(e) => setCreateForm({ ...createForm, metric: e.target.value })}
                  required
                  placeholder="e.g., Tasks Completed, Sales Made, Projects Delivered"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Target Value *</label>
                  <input
                    type="number"
                    value={createForm.target}
                    onChange={(e) => setCreateForm({ ...createForm, target: e.target.value })}
                    required
                    min="0"
                    step="0.1"
                    placeholder="100"
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={createForm.unit}
                    onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                    placeholder="tasks, %, hours"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create KPI'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && selectedKPI && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3>Update KPI Progress</h3>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{selectedKPI.title}</h4>
              <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                {selectedKPI.candidate.firstName} {selectedKPI.candidate.lastName} • Target: {selectedKPI.target} {selectedKPI.unit || ''}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                Current: {selectedKPI.current} ({selectedKPI.progress.toFixed(1)}%)
              </div>
            </div>

            <form onSubmit={handleUpdateProgress}>
              <div className="form-group">
                <label>Current Value *</label>
                <input
                  type="number"
                  value={updateProgress.current}
                  onChange={(e) => setUpdateProgress({ ...updateProgress, current: e.target.value })}
                  required
                  min="0"
                  step="0.1"
                  placeholder={`Current: ${selectedKPI.current}`}
                />
                <small style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                  Enter the new progress value (0 - {selectedKPI.target})
                </small>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={updateProgress.notes}
                  onChange={(e) => setUpdateProgress({ ...updateProgress, notes: e.target.value })}
                  rows={3}
                  placeholder="Add notes about this progress update..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Progress'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedKPI(null);
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

export default KPIs;
