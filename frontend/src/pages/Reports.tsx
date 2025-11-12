import React, { useEffect, useState } from 'react';
import { reportAPI, jobDescriptionAPI } from '../services/api';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>({});
  const [jobDescriptions, setJobDescriptions] = useState<any[]>([]);
  const [selectedJD, setSelectedJD] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jdRes] = await Promise.all([
        jobDescriptionAPI.getAll({ status: 'ACTIVE' })
      ]);

      setJobDescriptions(jdRes.data.jobDescriptions || []);

      // Load all report data
      try {
        const [funnelRes, timeRes, sourceRes, interviewRes] = await Promise.all([
          reportAPI.getFunnel(),
          reportAPI.getTimeToHire(),
          reportAPI.getSourceEffectiveness(),
          reportAPI.getInterviewStats('month')
        ]);

        setReportData({
          funnel: funnelRes.data,
          timeToHire: timeRes.data,
          sourceEffectiveness: sourceRes.data,
          interviewStats: interviewRes.data
        });
      } catch (error) {
        console.error('Error loading report data:', error);
        // Set empty data if reports fail
        setReportData({
          funnel: { stages: [], conversionRates: {} },
          timeToHire: {},
          sourceEffectiveness: { sources: [] },
          interviewStats: {}
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reports...</div>;

  const { funnel, timeToHire, sourceEffectiveness, interviewStats } = reportData;

  return (
    <div>
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p>Comprehensive recruitment analytics and insights</p>
      </div>

      {/* Recruitment Funnel */}
      <div className="card">
        <h3>Recruitment Funnel</h3>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          Visualize candidate progression through recruitment stages
        </p>
        {funnel?.stages && funnel.stages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {funnel.stages.map((stage: any, index: number) => {
              const maxCount = funnel.stages[0]?.count || 1;
              const percentage = (stage.count / maxCount) * 100;
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{stage.stage}</span>
                    <span>{stage.count} candidates</span>
                  </div>
                  <div style={{ width: '100%', height: '40px', backgroundColor: '#ecf0f1', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: `hsl(${200 - index * 20}, 70%, 50%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {stage.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No funnel data available yet. Add candidates to see recruitment progression.</p>
        )}
      </div>

      {/* Time to Hire */}
      <div className="card">
        <h3>Time-to-Hire Analysis</h3>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          Average time from application to hire
        </p>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card">
            <h4>Average Time to Hire</h4>
            <div className="value" style={{ color: '#3498db' }}>
              {timeToHire?.avgDays?.toFixed(0) || 0} days
            </div>
          </div>
          <div className="stat-card">
            <h4>Application to Interview</h4>
            <div className="value" style={{ color: '#27ae60' }}>
              {timeToHire?.avgApplicationToInterview?.toFixed(0) || 0} days
            </div>
          </div>
          <div className="stat-card">
            <h4>Interview to Offer</h4>
            <div className="value" style={{ color: '#f39c12' }}>
              {timeToHire?.avgInterviewToOffer?.toFixed(0) || 0} days
            </div>
          </div>
          <div className="stat-card">
            <h4>Offer to Acceptance</h4>
            <div className="value" style={{ color: '#9b59b6' }}>
              {timeToHire?.avgOfferToAcceptance?.toFixed(0) || 0} days
            </div>
          </div>
        </div>
      </div>

      {/* Interview Statistics */}
      <div className="card">
        <h3>Interview Statistics</h3>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          Interview completion rates and metrics
        </p>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="stat-card">
            <h4>Total Interviews</h4>
            <div className="value">{interviewStats?.total || 0}</div>
            <div className="label">This month</div>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <div className="value" style={{ color: '#27ae60' }}>{interviewStats?.completed || 0}</div>
          </div>
          <div className="stat-card">
            <h4>Scheduled</h4>
            <div className="value" style={{ color: '#3498db' }}>{interviewStats?.scheduled || 0}</div>
          </div>
          <div className="stat-card">
            <h4>Cancelled</h4>
            <div className="value" style={{ color: '#e74c3c' }}>{interviewStats?.cancelled || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
