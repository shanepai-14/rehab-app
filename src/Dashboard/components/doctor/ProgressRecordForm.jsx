import { useState, useEffect } from 'react';

const ProgressRecordForm = ({ isOpen, onClose, onSave, initialData = {}, patients = [] }) => {
  const [form, setForm] = useState({
    session_date: '',
    patient_id: '',
    therapy_type: '',
    attending_therapist_id: '',
    goals_set: '',
    activities_done: '',
    evaluation_summary: '',
    behavior_mood: '',
    recommendation: '',
    next_appointment_date: '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        session_date: initialData.session_date || '',
        patient_id: initialData.patient_id || '',
        therapy_type: initialData.therapy_type || '',
        attending_therapist_id: initialData.attending_therapist_id || '',
        goals_set: initialData.goals_set || '',
        activities_done: initialData.activities_done || '',
        evaluation_summary: initialData.evaluation_summary || '',
        behavior_mood: initialData.behavior_mood || '',
        recommendation: initialData.recommendation || '',
        next_appointment_date: initialData.next_appointment_date || '',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData?.id ? 'Edit Progress Record' : 'New Progress Record'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Session Date</label>
            <input type="date" name="session_date" value={form.session_date} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Next Appointment</label>
            <input type="date" name="next_appointment_date" value={form.next_appointment_date} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Patient</label>
            <select name="patient_id" value={form.patient_id} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" required>
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Type of Therapy</label>
            <input type="text" name="therapy_type" value={form.therapy_type} onChange={handleChange} placeholder="Physical Therapy, Occupational Therapy, etc." className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" required />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">Goals Set This Session</label>
              <textarea name="goals_set" value={form.goals_set} onChange={handleChange} rows="3" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">Activities / Treatment Done</label>
              <textarea name="activities_done" value={form.activities_done} onChange={handleChange} rows="3" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">Evaluation / Progress Summary</label>
              <textarea name="evaluation_summary" value={form.evaluation_summary} onChange={handleChange} rows="3" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">Patient Behavior / Mood</label>
              <textarea name="behavior_mood" value={form.behavior_mood} onChange={handleChange} rows="3" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 dark:text-gray-300">Recommendation</label>
            <textarea name="recommendation" value={form.recommendation} onChange={handleChange} rows="2" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
          </div>

          <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressRecordForm;

