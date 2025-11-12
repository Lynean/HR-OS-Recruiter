import React, { useEffect, useState } from 'react';
import { workflowAPI, candidateAPI, jobDescriptionAPI } from '../services/api';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface JobDescription {
  id: string;
  title: string;
}

interface Statistics {
  interviews: { total: number; scheduled: number };
  offers: { total: number; pending: number; accepted: number };
  onboardings: { total: number; active: number };
  trainings: { total: number; active: number };
  outsourcings: { total: number; active: number };
}

const Workflow: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [activeTab, setActiveTab] = useState<string>('interview');
  const [loading, setLoading] = useState(false);

  // Interview form
  const [interviewForm, setInterviewForm] = useState({
    candidateId: '',
    jobDescriptionId: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'PHONE',
    location: '',
    meetingLink: ''
  });

  // Offer form
  const [offerForm, setOfferForm] = useState({
    candidateId: '',
    position: '',
    department: '',
    salary: '',
    startDate: '',
    employmentType: 'FULL_TIME',
    responseDeadline: ''
  });

  // Onboarding form
  const [onboardingForm, setOnboardingForm] = useState({
    candidateId: '',
    startDate: '',
    checklist: ''
  });

  // Training form
  const [trainingForm, setTrainingForm] = useState({
    candidateId: '',
    trainingName: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Outsourcing form
  const [outsourcingForm, setOutsourcingForm] = useState({
    candidateId: '',
    clientName: '',
    clientLocation: '',
    projectName: '',
    role: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
    contactPerson: '',
    contactEmail: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [candidatesRes, jdRes, statsRes] = await Promise.all([
        candidateAPI.getAll({ status: 'INTERVIEWED,OFFERED,ACCEPTED,ONBOARDING,TRAINING,ACTIVE' }),
        jobDescriptionAPI.getAll({ status: 'ACTIVE' }),
        workflowAPI.getStatistics()
      ]);

      setCandidates(candidatesRes.data.candidates || []);
      setJobDescriptions(jdRes.data.jobDescriptions || []);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const interviewDateTime = new Date(`${interviewForm.interviewDate}T${interviewForm.interviewTime}`);

      await workflowAPI.scheduleInterview({
        candidateId: interviewForm.candidateId,
        jobDescriptionId: interviewForm.jobDescriptionId,
        scheduledBy: 'system', // Should come from auth
        interviewDate: interviewDateTime,
        interviewType: interviewForm.interviewType,
        location: interviewForm.location || undefined,
        meetingLink: interviewForm.meetingLink || undefined
      });

      alert('Interview scheduled successfully! Invitation email sent.');
      resetInterviewForm();
      loadData();
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      alert(error.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workflowAPI.sendOffer({
        candidateId: offerForm.candidateId,
        position: offerForm.position,
        department: offerForm.department || undefined,
        salary: parseFloat(offerForm.salary),
        startDate: offerForm.startDate ? new Date(offerForm.startDate) : undefined,
        employmentType: offerForm.employmentType,
        recruiterName: 'HR Team', // Should come from auth
        responseDeadline: new Date(offerForm.responseDeadline)
      });

      alert('Offer sent successfully! Email sent to candidate.');
      resetOfferForm();
      loadData();
    } catch (error: any) {
      console.error('Error sending offer:', error);
      alert(error.response?.data?.error || 'Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const checklist = onboardingForm.checklist.split('\n').filter(Boolean);

      await workflowAPI.startOnboarding({
        candidateId: onboardingForm.candidateId,
        startDate: new Date(onboardingForm.startDate),
        checklist: { items: checklist },
        documents: { required: ['ID', 'Tax Forms', 'Bank Details'] }
      });

      alert('Onboarding started successfully! Welcome email sent.');
      resetOnboardingForm();
      loadData();
    } catch (error: any) {
      console.error('Error starting onboarding:', error);
      alert(error.response?.data?.error || 'Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workflowAPI.assignTraining({
        candidateId: trainingForm.candidateId,
        trainingName: trainingForm.trainingName,
        description: trainingForm.description || undefined,
        startDate: new Date(trainingForm.startDate),
        endDate: trainingForm.endDate ? new Date(trainingForm.endDate) : undefined
      });

      alert('Training assigned successfully! Email sent to candidate.');
      resetTrainingForm();
      loadData();
    } catch (error: any) {
      console.error('Error assigning training:', error);
      alert(error.response?.data?.error || 'Failed to assign training');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOutsourcing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workflowAPI.assignOutsourcing({
        candidateId: outsourcingForm.candidateId,
        clientName: outsourcingForm.clientName,
        clientLocation: outsourcingForm.clientLocation || undefined,
        projectName: outsourcingForm.projectName,
        role: outsourcingForm.role,
        startDate: new Date(outsourcingForm.startDate),
        endDate: outsourcingForm.endDate ? new Date(outsourcingForm.endDate) : undefined,
        responsibilities: outsourcingForm.responsibilities || undefined,
        contactPerson: outsourcingForm.contactPerson || undefined,
        contactEmail: outsourcingForm.contactEmail || undefined,
        recruiterName: 'HR Team' // Should come from auth
      });

      alert('Outsourcing assignment successful! Email sent to candidate.');
      resetOutsourcingForm();
      loadData();
    } catch (error: any) {
      console.error('Error assigning outsourcing:', error);
      alert(error.response?.data?.error || 'Failed to assign outsourcing');
    } finally {
      setLoading(false);
    }
  };

  const resetInterviewForm = () => {
    setInterviewForm({
      candidateId: '',
      jobDescriptionId: '',
      interviewDate: '',
      interviewTime: '',
      interviewType: 'PHONE',
      location: '',
      meetingLink: ''
    });
  };

  const resetOfferForm = () => {
    setOfferForm({
      candidateId: '',
      position: '',
      department: '',
      salary: '',
      startDate: '',
      employmentType: 'FULL_TIME',
      responseDeadline: ''
    });
  };

  const resetOnboardingForm = () => {
    setOnboardingForm({
      candidateId: '',
      startDate: '',
      checklist: ''
    });
  };

  const resetTrainingForm = () => {
    setTrainingForm({
      candidateId: '',
      trainingName: '',
      description: '',
      startDate: '',
      endDate: ''
    });
  };

  const resetOutsourcingForm = () => {
    setOutsourcingForm({
      candidateId: '',
      clientName: '',
      clientLocation: '',
      projectName: '',
      role: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
      contactPerson: '',
      contactEmail: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <h2>Workflow Management</h2>
        <p>Manage interview scheduling, offers, onboarding, training, and client assignments</p>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="card">
          <h3>Workflow Statistics</h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card">
              <h4>Interviews</h4>
              <div className="value">{statistics.interviews.scheduled}</div>
              <div className="label">Scheduled ({statistics.interviews.total} total)</div>
            </div>
            <div className="stat-card">
              <h4>Offers</h4>
              <div className="value">{statistics.offers.pending}</div>
              <div className="label">Pending ({statistics.offers.accepted} accepted)</div>
            </div>
            <div className="stat-card">
              <h4>Onboarding</h4>
              <div className="value">{statistics.onboardings.active}</div>
              <div className="label">Active ({statistics.onboardings.total} total)</div>
            </div>
            <div className="stat-card">
              <h4>Training</h4>
              <div className="value">{statistics.trainings.active}</div>
              <div className="label">Active ({statistics.trainings.total} total)</div>
            </div>
            <div className="stat-card">
              <h4>Outsourced</h4>
              <div className="value">{statistics.outsourcings.active}</div>
              <div className="label">Active ({statistics.outsourcings.total} total)</div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Tabs */}
      <div className="card">
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #ecf0f1', marginBottom: '1.5rem' }}>
          {[
            { id: 'interview', label: 'Schedule Interview' },
            { id: 'offer', label: 'Send Offer' },
            { id: 'onboarding', label: 'Start Onboarding' },
            { id: 'training', label: 'Assign Training' },
            { id: 'outsourcing', label: 'Client Assignment' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #3498db' : '3px solid transparent',
                color: activeTab === tab.id ? '#3498db' : '#7f8c8d',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interview Form */}
        {activeTab === 'interview' && (
          <form onSubmit={handleScheduleInterview}>
            <h3>Schedule Interview</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              Schedule an interview and send invitation email to candidate
            </p>

            <div className="form-group">
              <label>Candidate *</label>
              <select
                value={interviewForm.candidateId}
                onChange={(e) => setInterviewForm({ ...interviewForm, candidateId: e.target.value })}
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
              <label>Job Description *</label>
              <select
                value={interviewForm.jobDescriptionId}
                onChange={(e) => setInterviewForm({ ...interviewForm, jobDescriptionId: e.target.value })}
                required
              >
                <option value="">-- Select Job Description --</option>
                {jobDescriptions.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Interview Date *</label>
                <input
                  type="date"
                  value={interviewForm.interviewDate}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Interview Time *</label>
                <input
                  type="time"
                  value={interviewForm.interviewTime}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Interview Type *</label>
              <select
                value={interviewForm.interviewType}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value })}
                required
              >
                <option value="PHONE">Phone</option>
                <option value="VIDEO">Video</option>
                <option value="IN_PERSON">In Person</option>
                <option value="TECHNICAL">Technical</option>
                <option value="PANEL">Panel</option>
              </select>
            </div>

            {interviewForm.interviewType === 'IN_PERSON' && (
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={interviewForm.location}
                  onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                  placeholder="Office address or meeting room"
                />
              </div>
            )}

            {(interviewForm.interviewType === 'VIDEO' || interviewForm.interviewType === 'PHONE') && (
              <div className="form-group">
                <label>Meeting Link</label>
                <input
                  type="url"
                  value={interviewForm.meetingLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                  placeholder="Zoom, Teams, or phone number"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Interview & Send Invitation'}
            </button>
          </form>
        )}

        {/* Offer Form */}
        {activeTab === 'offer' && (
          <form onSubmit={handleSendOffer}>
            <h3>Send Offer Letter</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              Send offer letter to candidate via email
            </p>

            <div className="form-group">
              <label>Candidate *</label>
              <select
                value={offerForm.candidateId}
                onChange={(e) => setOfferForm({ ...offerForm, candidateId: e.target.value })}
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
              <label>Position *</label>
              <input
                type="text"
                value={offerForm.position}
                onChange={(e) => setOfferForm({ ...offerForm, position: e.target.value })}
                required
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={offerForm.department}
                  onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                  placeholder="e.g., Engineering"
                />
              </div>
              <div className="form-group">
                <label>Salary (Annual) *</label>
                <input
                  type="number"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                  required
                  placeholder="100000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Employment Type *</label>
                <select
                  value={offerForm.employmentType}
                  onChange={(e) => setOfferForm({ ...offerForm, employmentType: e.target.value })}
                  required
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={offerForm.startDate}
                  onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Response Deadline *</label>
              <input
                type="date"
                value={offerForm.responseDeadline}
                onChange={(e) => setOfferForm({ ...offerForm, responseDeadline: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Offer Letter'}
            </button>
          </form>
        )}

        {/* Onboarding Form */}
        {activeTab === 'onboarding' && (
          <form onSubmit={handleStartOnboarding}>
            <h3>Start Onboarding</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              Initiate onboarding process and send welcome email
            </p>

            <div className="form-group">
              <label>Candidate *</label>
              <select
                value={onboardingForm.candidateId}
                onChange={(e) => setOnboardingForm({ ...onboardingForm, candidateId: e.target.value })}
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
              <label>Start Date *</label>
              <input
                type="date"
                value={onboardingForm.startDate}
                onChange={(e) => setOnboardingForm({ ...onboardingForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Onboarding Checklist (one item per line)</label>
              <textarea
                value={onboardingForm.checklist}
                onChange={(e) => setOnboardingForm({ ...onboardingForm, checklist: e.target.value })}
                rows={8}
                placeholder={'Complete employment paperwork\nSet up workstation and equipment\nCreate system accounts\nSchedule orientation sessions\nAssign mentor\nComplete security training\nReview company policies\nSchedule first team meeting'}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Starting...' : 'Start Onboarding & Send Welcome Email'}
            </button>
          </form>
        )}

        {/* Training Form */}
        {activeTab === 'training' && (
          <form onSubmit={handleAssignTraining}>
            <h3>Assign Training</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              Assign training program to candidate
            </p>

            <div className="form-group">
              <label>Candidate *</label>
              <select
                value={trainingForm.candidateId}
                onChange={(e) => setTrainingForm({ ...trainingForm, candidateId: e.target.value })}
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
              <label>Training Name *</label>
              <input
                type="text"
                value={trainingForm.trainingName}
                onChange={(e) => setTrainingForm({ ...trainingForm, trainingName: e.target.value })}
                required
                placeholder="e.g., Advanced React Development"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={trainingForm.description}
                onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                rows={4}
                placeholder="Training objectives, topics covered, learning outcomes..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={trainingForm.startDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={trainingForm.endDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Training & Send Notification'}
            </button>
          </form>
        )}

        {/* Outsourcing Form */}
        {activeTab === 'outsourcing' && (
          <form onSubmit={handleAssignOutsourcing}>
            <h3>Client Site Assignment</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              Assign candidate to client site (outsourcing)
            </p>

            <div className="form-group">
              <label>Candidate *</label>
              <select
                value={outsourcingForm.candidateId}
                onChange={(e) => setOutsourcingForm({ ...outsourcingForm, candidateId: e.target.value })}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={outsourcingForm.clientName}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, clientName: e.target.value })}
                  required
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              <div className="form-group">
                <label>Client Location</label>
                <input
                  type="text"
                  value={outsourcingForm.clientLocation}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, clientLocation: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={outsourcingForm.projectName}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, projectName: e.target.value })}
                  required
                  placeholder="e.g., E-commerce Platform Redesign"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <input
                  type="text"
                  value={outsourcingForm.role}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, role: e.target.value })}
                  required
                  placeholder="e.g., Frontend Developer"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={outsourcingForm.startDate}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date (if known)</label>
                <input
                  type="date"
                  value={outsourcingForm.endDate}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Responsibilities</label>
              <textarea
                value={outsourcingForm.responsibilities}
                onChange={(e) => setOutsourcingForm({ ...outsourcingForm, responsibilities: e.target.value })}
                rows={4}
                placeholder="Key responsibilities and duties at client site..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={outsourcingForm.contactPerson}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, contactPerson: e.target.value })}
                  placeholder="Client contact name"
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={outsourcingForm.contactEmail}
                  onChange={(e) => setOutsourcingForm({ ...outsourcingForm, contactEmail: e.target.value })}
                  placeholder="client.contact@company.com"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign to Client & Send Notification'}
            </button>
          </form>
        )}
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
        <p style={{ fontSize: '0.875rem', margin: 0 }}>
          <strong>Note:</strong> All workflow actions automatically send email notifications to candidates using customizable templates.
          Ensure email templates are configured in the Templates section.
        </p>
      </div>
    </div>
  );
};

export default Workflow;
