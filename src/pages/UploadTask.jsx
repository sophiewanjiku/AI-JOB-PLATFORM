import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { uploadTask } from '../api/tasks';

export default function UploadTask() {
  // All form field values in one state object
  const [form, setForm] = useState({
    title:                '',
    description:          '',
    category:             'labeling',
    data_type:            'image',
    job_type:             'fixed',
    experience:           'entry',
    project_length:       '1_4_weeks',
    budget:               '',
    hours_per_week:       '',
    instructions:         '',
    is_published:         true,
    allow_multiple:       false,
    require_verification: true,
  });

  // Skills are managed as a separate array
  const [skills, setSkills] = useState([]);

  // Current value of the skill input field
  const [skillInput, setSkillInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Update any form field by name
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      // Use checked for toggles, value for everything else
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Add a skill tag when user presses Enter
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills(prev => [...prev, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  // Remove a skill tag by clicking ×
  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send form data + skills array to Django
      await uploadTask({ ...form, skills });
      setSuccess('Task published successfully!');

      // Reset the form after successful submission
      setForm({
        title: '', description: '', category: 'labeling', data_type: 'image',
        job_type: 'fixed', experience: 'entry', project_length: '1_4_weeks',
        budget: '', hours_per_week: '', instructions: '',
        is_published: true, allow_multiple: false, require_verification: true,
      });
      setSkills([]);
    } catch (err) {
      console.error(err);
      setError('Failed to publish task. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable label + input wrapper
  const Field = ({ label, required, hint, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );

  // Reusable select dropdown
  const Select = ({ name, value, options }) => (
    <select name={name} value={value} onChange={handleChange}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0a1628]
        focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
      {options.map(([val, label]) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  );

  // Toggle switch component
  const Toggle = ({ name, checked, label, sub }) => (
    <div className="flex items-center justify-between py-3
      border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm text-[#0a1628]">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked}
          onChange={handleChange} className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-200 peer-checked:bg-[#0a1628]
          rounded-full transition-colors after:content-[''] after:absolute
          after:top-0.5 after:left-0.5 after:bg-white after:rounded-full
          after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
      </label>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4
          flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-[#0a1628]">Upload New Task</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill in the details below to publish a task to the marketplace
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button"
              onClick={() => setForm(prev => ({ ...prev, is_published: false }))}
              className="text-xs text-gray-500 border border-gray-200 px-4 py-2
                rounded-lg hover:bg-gray-50 transition">
              Save Draft
            </button>
            <button form="upload-form" type="submit" disabled={loading}
              className="text-xs font-medium bg-[#0a1628] text-white px-4 py-2
                rounded-lg hover:bg-[#1e3a5f] transition disabled:opacity-50">
              {loading ? 'Publishing...' : 'Publish Task'}
            </button>
          </div>
        </div>

        {/* Scrollable form area */}
        <form id="upload-form" onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {/* Success / error messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700
              rounded-lg p-3 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
              rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* ── Basic Information ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-4 pb-3
              border-b border-gray-50">
              Basic Information
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Task Title" required>
                <input name="title" value={form.title} onChange={handleChange} required
                  placeholder="e.g. Image Classification — Medical Dataset Batch 5"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" required>
                  <Select name="category" value={form.category} options={[
                    ['labeling', 'Data Labeling'],
                    ['transcription', 'Transcription'],
                    ['verification', 'Verification'],
                    ['review', 'Dataset Review'],
                    ['annotation', 'Annotation'],
                  ]} />
                </Field>
                <Field label="Data Type" required>
                  <Select name="data_type" value={form.data_type} options={[
                    ['image', 'Image'], ['text', 'Text'], ['audio', 'Audio'],
                    ['video', 'Video'], ['tabular', 'Tabular'],
                  ]} />
                </Field>
              </div>
              <Field label="Description" required>
                <textarea name="description" value={form.description}
                  onChange={handleChange} required rows={4}
                  placeholder="Describe the task in detail. Include what workers need to do, required tools, and what a successful submission looks like..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                    resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </Field>
            </div>
          </div>

          {/* ── Compensation & Scope ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-4 pb-3
              border-b border-gray-50">
              Compensation & Scope
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Job Type" required>
                <Select name="job_type" value={form.job_type} options={[
                  ['fixed', 'Fixed Price'], ['hourly', 'Hourly'],
                ]} />
              </Field>
              <Field label="Budget (USD)" required>
                <input name="budget" value={form.budget} onChange={handleChange}
                  required type="number" min="1" placeholder="e.g. 250"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </Field>
              <Field label="Hours per Week" hint="Leave blank for flexible">
                <input name="hours_per_week" value={form.hours_per_week}
                  onChange={handleChange} type="number" min="1" placeholder="e.g. 10"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Project Length" required>
                <Select name="project_length" value={form.project_length} options={[
                  ['less_1_week', 'Less than 1 week'],
                  ['1_4_weeks', '1 to 4 weeks'],
                  ['1_3_months', '1 to 3 months'],
                  ['3_plus_months', '3+ months'],
                ]} />
              </Field>
              <Field label="Experience Level" required>
                <Select name="experience" value={form.experience} options={[
                  ['entry', 'Entry Level'],
                  ['intermediate', 'Intermediate'],
                  ['expert', 'Expert'],
                ]} />
              </Field>
            </div>
          </div>

          {/* ── Requirements & Tags ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-4 pb-3
              border-b border-gray-50">
              Requirements & Tags
            </h2>
            <Field label="Required Skills" hint="Press Enter to add each skill">
              {/* Tag input area */}
              <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200
                rounded-lg min-h-[42px] items-center focus-within:ring-2
                focus-within:ring-blue-400">
                {skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 bg-blue-50
                    text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-blue-700 text-sm leading-none">
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={skills.length === 0 ? 'Add skill and press Enter...' : ''}
                  className="flex-1 text-sm outline-none min-w-[120px] bg-transparent" />
              </div>
            </Field>
            <div className="mt-4">
              <Field label="Special Instructions">
                <textarea name="instructions" value={form.instructions}
                  onChange={handleChange} rows={3}
                  placeholder="Any additional notes, quality requirements, or instructions for workers..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                    resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </Field>
            </div>
          </div>

          {/* ── Visibility & Settings ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-2 pb-3
              border-b border-gray-50">
              Visibility & Settings
            </h2>
            <Toggle name="is_published"         checked={form.is_published}
              onChange={handleChange}
              label="Publish immediately"
              sub="Task goes live as soon as you submit" />
            <Toggle name="allow_multiple"        checked={form.allow_multiple}
              onChange={handleChange}
              label="Allow multiple submissions"
              sub="Workers can submit more than once" />
            <Toggle name="require_verification"  checked={form.require_verification}
              onChange={handleChange}
              label="Require worker verification"
              sub="Only verified accounts can apply" />
          </div>

        </form>
      </div>
    </div>
  );
}