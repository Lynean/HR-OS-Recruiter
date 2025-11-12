import React, { useEffect, useState } from 'react';
import { reportAPI, workflowAPI, kpiAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [workflowStats, setWorkflowStats] = useState<any>(null);
  const [kpiSummary, setKPISummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, workflowRes, kpiRes] = await Promise.all([
        reportAPI.getDashboard(),
        workflowAPI.getStatistics(),
        kpiAPI.getSummary()
      ]);

      setStats(dashboardRes.data);
      setWorkflowStats(workflowRes.data);
      setKPISummary(kpiRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your recruitment process</p>
      </div>

      {stats && (
        <>
          {/* Main Statistics */}
          <div className="card">
            <h3>Key Metrics</h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-card">
                <h4>Total Candidates</h4>
                <div className="value" style={{ color: '#3498db' }}>{stats.summary.totalCandidates}</div>
                <div className="label">All time</div>
              </div>
              <div className="stat-card">
                <h4>Active Candidates</h4>
                <div className="value" style={{ color: '#27ae60' }}>{stats.summary.activeCandidates}</div>
                <div className="label">Currently active</div>
              </div>
              <div className="stat-card">
                <h4>Active Job Descriptions</h4>
                <div className="value" style={{ color: '#f39c12' }}>{stats.summary.activeJDs}</div>
                <div className="label">Open positions</div>
              </div>
              <div className="stat-card">
                <h4>Interviews This Month</h4>
                <div className="value" style={{ color: '#9b59b6' }}>{stats.summary.interviewsThisMonth}</div>
                <div className="label">Scheduled + Completed</div>
              </div>
              <div className="stat-card">
                <h4>Offers This Month</h4>
                <div className="value" style={{ color: '#e67e22' }}>{stats.summary.offersThisMonth}</div>
                <div className="label">Sent this month</div>
              </div>
              <div className="stat-card">
                <h4>Onboarding in Progress</h4>
                <div className="value" style={{ color: '#16a085' }}>{stats.summary.onboardingInProgress}</div>
                <div className="label">New hires</div>
              </div>
            </div>
          </div>

          {/* Workflow Statistics */}
          {workflowStats && (
            <div className="card">
              <h3>Workflow Status</h3>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="stat-card">
                  <h4>Interviews</h4>
                  <div className="value" style={{ color: '#3498db' }}>{workflowStats.interviews.scheduled}</div>
                  <div className="label">Scheduled ({workflowStats.interviews.total} total)</div>
                </div>
                <div className="stat-card">
                  <h4>Offers</h4>
                  <div className="value" style={{ color: '#f39c12' }}>{workflowStats.offers.pending}</div>
                  <div className="label">Pending ({workflowStats.offers.accepted} accepted)</div>
                </div>
                <div className="stat-card">
                  <h4>Onboarding</h4>
                  <div className="value" style={{ color: '#27ae60' }}>{workflowStats.onboardings.active}</div>
                  <div className="label">Active ({workflowStats.onboardings.total} total)</div>
                </div>
                <div className="stat-card">
                  <h4>Training</h4>
                  <div className="value" style={{ color: '#9b59b6' }}>{workflowStats.trainings.active}</div>
                  <div className="label">In progress ({workflowStats.trainings.total} total)</div>
                </div>
                <div className="stat-card">
                  <h4>Client Assignments</h4>
                  <div className="value" style={{ color: '#e67e22' }}>{workflowStats.outsourcings.active}</div>
                  <div className="label">Active ({workflowStats.outsourcings.total} total)</div>
                </div>
              </div>
            </div>
          )}

          {/* KPI Summary */}
          {kpiSummary && (
            <div className="card">
              <h3>KPI Performance</h3>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="stat-card">
                  <h4>Total KPIs</h4>
                  <div className="value">{kpiSummary.total}</div>
                  <div className="label">All metrics</div>
                </div>
                <div className="stat-card">
                  <h4>In Progress</h4>
                  <div className="value" style={{ color: '#3498db' }}>{kpiSummary.inProgress}</div>
                  <div className="label">Active tracking</div>
                </div>
                <div className="stat-card">
                  <h4>Completed</h4>
                  <div className="value" style={{ color: '#27ae60' }}>{kpiSummary.completed}</div>
                  <div className="label">Achieved</div>
                </div>
                <div className="stat-card">
                  <h4>Overdue</h4>
                  <div className="value" style={{ color: '#e74c3c' }}>{kpiSummary.overdue}</div>
                  <div className="label">Past deadline</div>
                </div>
                <div className="stat-card">
                  <h4>Completion Rate</h4>
                  <div className="value">{kpiSummary.completionRate.toFixed(1)}%</div>
                  <div className="label">Success rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Status Distribution */}
          {stats.candidatesByStatus && stats.candidatesByStatus.length > 0 && (
            <div className="card">
              <h3>Candidates by Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {stats.candidatesByStatus.map((statusData: any, idx: number) => {
                  const percentage = (statusData.count / stats.summary.totalCandidates * 100) || 0;
                  return (
                    <div key={idx} style={{
                      padding: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{statusData.status}</strong>
                        <span>{statusData.count} candidates</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#ecf0f1',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#3498db'
                        }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <div className="card">
            <h3>Recent Activities</h3>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Candidate</th>
                    <th>User</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivities.map((activity: any) => (
                    <tr key={activity.id}>
                      <td>{activity.description}</td>
                      <td>
                        {activity.candidate
                          ? `${activity.candidate.firstName} ${activity.candidate.lastName}`
                          : 'N/A'}
                      </td>
                      <td>{activity.user.name}</td>
                      <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No recent activities to display.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
