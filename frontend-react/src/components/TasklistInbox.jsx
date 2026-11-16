import React, { useEffect, useState } from 'react';
import { tasksApi } from '../api/client.js';
import Badge from './Badge.jsx';
import { TasklistIcon, RefreshIcon, CheckIcon } from './Icons.jsx';

export default function TasklistInbox({ onTaskCompleted }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [completing, setCompleting] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
      setError('');
    } catch {
      setError('Could not connect to task endpoint — verify backend service is active.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 6000);
    return () => clearInterval(interval);
  }, []);

  async function handleComplete(taskId) {
    setCompleting(taskId);
    setActionMsg('');
    try {
      await tasksApi.complete(taskId);
      setActionMsg(`Task #${taskId} successfully fulfilled in workflow audit log.`);
      await loadTasks();
      if (onTaskCompleted) onTaskCompleted();
    } catch (e) {
      setError('Failed to complete task: ' + e.message);
    } finally {
      setCompleting(null);
    }
  }

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    return t.status?.toLowerCase() === filter.toLowerCase();
  });

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
              <TasklistIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                Camunda 8 User Tasklist
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Operational Task Queue</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Assigned human workflow tasks for compliance officers, operations teams, and document verifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTasks}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing…' : 'Refresh Queue'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'pending', label: 'Pending Action', count: pendingCount },
            { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'COMPLETED').length }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filter === f.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-emerald-600 hover:text-emerald-900 text-sm font-bold">&times;</button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      {/* Task Cards List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-700">No {filter === 'all' ? '' : filter} tasks found in inbox.</p>
          <p className="text-xs text-slate-400 mt-1">
            Tasks will be assigned here when seller onboarding or product review workflows require human intervention.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const isPending = task.status === 'PENDING';
            return (
              <div
                key={task.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition ${
                  isPending ? 'border-orange-200/80 hover:border-orange-300 ring-1 ring-orange-50' : 'border-slate-100 opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 capitalize">
                        {String(task.taskType || 'Workflow Task').replace(/-/g, ' ')}
                      </span>
                      <Badge value={task.status || 'pending'} />
                      <span className="text-[10px] font-mono text-slate-400">Task #{task.id}</span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Entity Reference: <strong className="text-slate-800">{task.entityType} #{task.entityId}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Assignee: <strong className="text-slate-700">{task.assignee || 'operations-team'}</strong></span>
                      <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}</span>
                      {task.completedAt && (
                        <span>Completed: {new Date(task.completedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isPending ? (
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={completing === task.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-500 transition disabled:opacity-50"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>{completing === task.id ? 'Completing…' : 'Complete Task'}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 italic">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
