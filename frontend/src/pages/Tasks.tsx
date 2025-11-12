import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  priority: string;
  status: string;
  dueDate?: string;
  estimatedHours?: number;
  aiGenerated: boolean;
  subtasks?: Task[];
  candidate?: {
    firstName: string;
    lastName: string;
  };
  assignee?: {
    name: string;
  };
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  taskType: string;
  defaultPriority: string;
  estimatedHours: number;
  aiEnhanced: boolean;
  tags: string[];
  usageCount: number;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form state for creating new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    taskType: 'GENERAL',
    priority: 'MEDIUM',
    generateSubtasks: true,
    dueDate: ''
  });

  useEffect(() => {
    loadTasks();
    loadTemplates();
    loadStatistics();
  }, []);

  const loadTasks = async () => {
    try {
      // For demo, using a default user ID - should come from auth
      const response = await axios.get(`${API_URL}/tasks/user/system`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/templates/all`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/statistics/summary`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/tasks`, {
        ...newTask,
        createdBy: 'system', // Should come from auth
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined
      });

      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        taskType: 'GENERAL',
        priority: 'MEDIUM',
        generateSubtasks: true,
        dueDate: ''
      });
      loadTasks();
      loadStatistics();
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      await axios.post(`${API_URL}/tasks/templates/${templateId}/create-task`, {
        createdBy: 'system', // Should come from auth
        assignedTo: 'system'
      });

      setShowTemplateModal(false);
      loadTasks();
      loadStatistics();
      alert('Task created from template successfully!');
    } catch (error) {
      console.error('Error creating task from template:', error);
      alert('Failed to create task from template');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/tasks/${taskId}/status`, {
        status: newStatus,
        userId: 'system'
      });

      loadTasks();
      loadStatistics();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleGenerateSubtasks = async (taskId: string) => {
    try {
      const response = await axios.post(`${API_URL}/tasks/${taskId}/generate-subtasks`, {
        userId: 'system'
      });

      alert(`Generated ${response.data.count} subtasks using AI!`);
      loadTasks();
    } catch (error) {
      console.error('Error generating subtasks:', error);
      alert('Failed to generate subtasks');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return !task.parentTaskId; // Only show main tasks, not subtasks
  });

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      LOW: 'badge-info',
      MEDIUM: 'badge-warning',
      HIGH: 'badge-danger',
      URGENT: 'badge-danger'
    };
    return colors[priority] || 'badge-info';
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      TODO: 'badge-info',
      IN_PROGRESS: 'badge-warning',
      BLOCKED: 'badge-danger',
      REVIEW: 'badge-warning',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-secondary'
    };
    return colors[status] || 'badge-info';
  };

  return (
    <div>
      <div className="page-header">
        <h2>Task Management</h2>
        <p>AI-powered task breakdown and management for HR processes</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Tasks</h4>
            <div className="value">{statistics.total}</div>
          </div>
          <div className="stat-card">
            <h4>To Do</h4>
            <div className="value">{statistics.todo}</div>
          </div>
          <div className="stat-card">
            <h4>In Progress</h4>
            <div className="value">{statistics.inProgress}</div>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <div className="value">{statistics.completed}</div>
          </div>
          <div className="stat-card">
            <h4>Overdue</h4>
            <div className="value"style={{ color: statistics.overdue > 0 ? '#e74c3c' : '#27ae60' }}>
              {statistics.overdue}
            </div>
          </div>
          <div className="stat-card">
            <h4>Completion Rate</h4>
            <div className="value">{statistics.completionRate.toFixed(1)}%</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Task with AI Subtasks
        </button>
        <button className="btn btn-success" onClick={() => setShowTemplateModal(true)}>
          📋 Use Template
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ marginRight: '0.5rem' }}>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          <div>
            <label style={{ marginRight: '0.5rem' }}>Priority:</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        <h3>Tasks ({filteredTasks.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Subtasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr>
                  <td>
                    <strong>{task.title}</strong>
                    {task.aiGenerated && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>🤖 AI</span>
                    )}
                    {task.description && (
                      <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td>{task.taskType.replace('_', ' ')}</td>
                  <td>
                    <span className={`badge ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`badge ${getStatusColor(task.status)}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : 'No deadline'}
                  </td>
                  <td>
                    {task.subtasks && task.subtasks.length > 0 ? (
                      <span>
                        {task.subtasks.filter(st => st.status === 'COMPLETED').length} /{' '}
                        {task.subtasks.length}
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => handleGenerateSubtasks(task.id)}
                      >
                        🤖 Generate
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      {selectedTask?.id === task.id ? '▲' : '▼'} Details
                    </button>
                  </td>
                </tr>
                {selectedTask?.id === task.id && task.subtasks && task.subtasks.length > 0 && (
                  <tr>
                    <td colSpan={7} style={{ backgroundColor: '#f8f9fa' }}>
                      <div style={{ padding: '1rem' }}>
                        <h4>Subtasks:</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {task.subtasks.map((subtask) => (
                            <li
                              key={subtask.id}
                              style={{
                                padding: '0.5rem',
                                marginBottom: '0.5rem',
                                borderLeft: '3px solid #3498db'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={subtask.status === 'COMPLETED'}
                                onChange={(e) =>
                                  handleStatusChange(
                                    subtask.id,
                                    e.target.checked ? 'COMPLETED' : 'TODO'
                                  )
                                }
                                style={{ marginRight: '0.5rem' }}
                              />
                              <strong>{subtask.title}</strong>
                              {subtask.description && (
                                <div style={{ marginLeft: '1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                                  {subtask.description}
                                </div>
                              )}
                              {subtask.estimatedHours && (
                                <div style={{ marginLeft: '1.5rem', fontSize: '0.8rem', color: '#95a5a6' }}>
                                  Estimated: {subtask.estimatedHours}h
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Task Type *</label>
                <select
                  value={newTask.taskType}
                  onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                >
                  <option value="RECRUITMENT">Recruitment</option>
                  <option value="INTERVIEW_PREP">Interview Prep</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="TRAINING">Training</option>
                  <option value="CLIENT_DEPLOYMENT">Client Deployment</option>
                  <option value="KPI_REVIEW">KPI Review</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority *</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newTask.generateSubtasks}
                    onChange={(e) =>
                      setNewTask({ ...newTask, generateSubtasks: e.target.checked })
                    }
                  />
                  {' '}Generate subtasks using AI 🤖
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Task Template</h3>
            <p>Choose a pre-configured task template to get started quickly:</p>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCreateFromTemplate(template.id)}
                >
                  <h4>
                    {template.name}
                    {template.aiEnhanced && <span style={{ marginLeft: '0.5rem' }}>🤖</span>}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                    {template.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                    <span>Type: {template.taskType.replace('_', ' ')}</span>
                    {' • '}
                    <span>Priority: {template.defaultPriority}</span>
                    {' • '}
                    <span>Est. {template.estimatedHours}h</span>
                    {' • '}
                    <span>Used {template.usageCount} times</span>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ecf0f1',
                          borderRadius: '3px',
                          fontSize: '0.75rem',
                          marginRight: '0.5rem'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn" onClick={() => setShowTemplateModal(false)}>
              Close
            </button>
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

export default Tasks;
