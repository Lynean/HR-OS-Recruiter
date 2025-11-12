import React, { useEffect, useState } from 'react';
import { reportAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await reportAPI.getDashboard();
      setStats(response.data);
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
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Candidates</h4>
              <div className="value">{stats.summary.totalCandidates}</div>
            </div>
            <div className="stat-card">
              <h4>Active Candidates</h4>
              <div className="value">{stats.summary.activeCandidates}</div>
            </div>
            <div className="stat-card">
              <h4>Active Job Descriptions</h4>
              <div className="value">{stats.summary.activeJDs}</div>
            </div>
            <div className="stat-card">
              <h4>Interviews This Month</h4>
              <div className="value">{stats.summary.interviewsThisMonth}</div>
            </div>
            <div className="stat-card">
              <h4>Offers This Month</h4>
              <div className="value">{stats.summary.offersThisMonth}</div>
            </div>
            <div className="stat-card">
              <h4>Onboarding in Progress</h4>
              <div className="value">{stats.summary.onboardingInProgress}</div>
            </div>
          </div>

          <div className="card">
            <h3>Recent Activities</h3>
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
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
