import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { fetchTasks, fetchSavedTasks, toggleSaveTask } from '../api/tasks';

// ── Job type pill badge ──
const Pill = ({ label, color }) => {
  const colors = {
    blue:  'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    gray:  'bg-gray-100 text-gray-500',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {label}
    </span>
  );
};

// ── Single job card ──
const JobCard = ({ task, isSaved, onSave, featured }) => (
  <div className={`bg-white rounded-xl border shadow-sm p-4 transition-all
    ${featured ? 'border-l-4 border-l-blue-400 border-gray-100' : 'border-gray-100 hover:border-blue-300'}`}>

    {/* Top row: title + budget */}
    <div className="flex items-start justify-between mb-2 gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[#0a1628]">{task.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Posted {new Date(task.created_at).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm font-semibold text-[#0a1628] whitespace-nowrap">
        ${parseFloat(task.budget).toFixed(0)}
        {task.job_type === 'hourly' ? '/hr' : ''}
      </p>
    </div>

    {/* Pills row */}
    <div className="flex flex-wrap gap-1.5 mb-2">
      <Pill label={task.job_type === 'fixed' ? 'Fixed price' : 'Hourly'} color="blue" />
      <Pill label={task.experience}   color="green" />
      <Pill label={task.data_type}    color="gray" />
      <Pill label={task.project_length.replace(/_/g, ' ')} color="amber" />
    </div>

    {/* Description — truncated */}
    <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
      {task.description}
    </p>

    {/* Skills tags */}
    {task.skills_list?.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-3">
        {task.skills_list.map((skill, i) => (
          <span key={i} className="text-[10px] bg-gray-50 border border-gray-100
            text-gray-500 px-2 py-0.5 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    )}

    {/* Footer: hours + action buttons */}
    <div className="flex items-center justify-between">
      <p className="text-[11px] text-gray-400">
        {task.hours_per_week ? `${task.hours_per_week} hrs/week` : 'Flexible hours'}
      </p>
      <div className="flex gap-2">
        {/* Save / Unsave toggle */}
        <button
          onClick={() => onSave(task.id)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition
            ${isSaved
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          {isSaved ? '♥ Saved' : '♡ Save'}
        </button>
        {/* View job — placeholder for detail page */}
        <button className="text-xs px-3 py-1.5 rounded-lg bg-[#0a1628]
          text-white font-medium hover:bg-[#1e3a5f] transition">
          View Job
        </button>
      </div>
    </div>
  </div>
);

export default function FindJobs() {
  // All tasks from the API
  const [tasks, setTasks] = useState([]);

  // IDs of tasks the user has saved
  const [savedIds, setSavedIds] = useState(new Set());

  // Active tab: recommended | saved | recent
  const [activeTab, setActiveTab] = useState('recommended');

  // Search input value
  const [search, setSearch] = useState('');

  // Filter values
  const [filters, setFilters] = useState({
    category: '',
    data_type: '',
    job_type: '',
    experience: '',
    project_length: '',
    max_budget: '',
  });

  const [loading, setLoading] = useState(true);

  // Load tasks and saved tasks on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [taskData, savedData] = await Promise.all([
          fetchTasks(),
          fetchSavedTasks(),
        ]);
        setTasks(taskData);
        // Store saved task IDs in a Set for O(1) lookup
        setSavedIds(new Set(savedData.map(t => t.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Re-fetch tasks whenever search or filters change
  useEffect(() => {
    const loadFiltered = async () => {
      try {
        const params = { ...filters };
        if (search) params.search = search;
        // Remove empty filter values
        Object.keys(params).forEach(k => !params[k] && delete params[k]);
        const data = await fetchTasks(params);
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };
    // Debounce — wait 400ms after user stops typing before fetching
    const timer = setTimeout(loadFiltered, 400);
    return () => clearTimeout(timer);
  }, [search, filters]);

  // Toggle save on a task and update local state
  const handleSave = async (taskId) => {
    try {
      const result = await toggleSaveTask(taskId);
      setSavedIds(prev => {
        const next = new Set(prev);
        result.saved ? next.add(taskId) : next.delete(taskId);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Update a single filter value
  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Determine which tasks to show based on active tab
  const displayedTasks = activeTab === 'saved'
    ? tasks.filter(t => savedIds.has(t.id))
    : tasks;

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Search bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4" stroke="#9ca3af" strokeWidth="1.3"/>
              <path d="M10 10l3 3" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs by title, skill, or keyword..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button className="bg-[#0a1628] text-white text-xs font-medium px-4 py-2
            rounded-lg hover:bg-[#1e3a5f] transition whitespace-nowrap">
            + New Alert
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 px-6 flex gap-1">
          {['recommended', 'saved', 'recent', 'best match'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-4 py-3 capitalize border-b-2 transition
                ${activeTab === tab
                  ? 'border-[#0a1628] text-[#0a1628] font-medium'
                  : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
              {tab === 'saved' && savedIds.size > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-600 text-[9px]
                  font-medium px-1.5 py-0.5 rounded-full">
                  {savedIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Filters panel */}
          <div className="w-44 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-[#0a1628] mb-3">Filters</p>

            {/* Category */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Category</p>
              {[['', 'All'], ['labeling', 'Data Labeling'], ['transcription', 'Transcription'],
                ['verification', 'Verification'], ['annotation', 'Annotation']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-xs text-gray-600 py-0.5 cursor-pointer">
                  <input type="radio" name="category" value={val}
                    checked={filters.category === val}
                    onChange={() => handleFilter('category', val)}
                    className="accent-[#0a1628]" />
                  {label}
                </label>
              ))}
            </div>

            {/* Data type */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Data Type</p>
              {['image', 'text', 'audio', 'video', 'tabular'].map(type => (
                <label key={type} className="flex items-center gap-2 text-xs text-gray-600 py-0.5 cursor-pointer capitalize">
                  <input type="checkbox"
                    checked={filters.data_type === type}
                    onChange={() => handleFilter('data_type', filters.data_type === type ? '' : type)}
                    className="accent-[#0a1628]" />
                  {type}
                </label>
              ))}
            </div>

            {/* Job type */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Job Type</p>
              {[['', 'All'], ['fixed', 'Fixed Price'], ['hourly', 'Hourly']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-xs text-gray-600 py-0.5 cursor-pointer">
                  <input type="radio" name="job_type" value={val}
                    checked={filters.job_type === val}
                    onChange={() => handleFilter('job_type', val)}
                    className="accent-[#0a1628]" />
                  {label}
                </label>
              ))}
            </div>

            {/* Experience */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Experience</p>
              {['entry', 'intermediate', 'expert'].map(level => (
                <label key={level} className="flex items-center gap-2 text-xs text-gray-600 py-0.5 cursor-pointer capitalize">
                  <input type="checkbox"
                    checked={filters.experience === level}
                    onChange={() => handleFilter('experience', filters.experience === level ? '' : level)}
                    className="accent-[#0a1628]" />
                  {level}
                </label>
              ))}
            </div>

            {/* Budget */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Max Budget</p>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>$10</span><span>${filters.max_budget || 500}</span>
              </div>
              <input type="range" min="10" max="500" step="10"
                value={filters.max_budget || 500}
                onChange={e => handleFilter('max_budget', e.target.value)}
                className="w-full accent-[#0a1628]" />
            </div>

            {/* Reset */}
            <button
              onClick={() => setFilters({ category: '', data_type: '', job_type: '', experience: '', project_length: '', max_budget: '' })}
              className="w-full text-xs text-gray-400 border border-gray-200 py-1.5
                rounded-lg hover:bg-gray-50 transition mt-1">
              Reset Filters
            </button>
          </div>

          {/* Jobs list */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs text-gray-400 mb-3">
              {loading ? 'Loading...' : `Showing ${displayedTasks.length} jobs`}
            </p>
            <div className="flex flex-col gap-3">
              {displayedTasks.map((task, i) => (
                <JobCard
                  key={task.id}
                  task={task}
                  isSaved={savedIds.has(task.id)}
                  onSave={handleSave}
                  featured={i === 0} // First result gets a featured highlight
                />
              ))}
              {!loading && displayedTasks.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-sm">No jobs found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}