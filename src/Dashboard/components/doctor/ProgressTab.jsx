import { useEffect, useState } from 'react';
import apiService from '../../../Services/api';
import { toast } from 'sonner';
import ProgressRecordForm from './ProgressRecordForm';
import { downloadCSV, openPrintView } from '../../../utils/progressExport';

const ProgressTab = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ patient_id: '', therapy_type: '', from: '', to: '', year: '' });
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadPatients = async () => {
    try {
      const res = await apiService.get('/appointments/patients/accessible');
      if (res?.data?.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecords = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiService.getProgressRecords({ ...filters, page, per_page: 10 });
      // backend returns pagination in data.data? align with previous patterns
      const payload = res.data?.data || res.data;
      const items = payload?.data || payload || [];
      setRecords(items);
      setPagination({
        current_page: payload?.current_page || 1,
        last_page: payload?.last_page || 1,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load progress records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    loadRecords();
  }, []);

  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (rec) => {
    setEditing(rec);
    setShowForm(true);
  };

  const onDelete = async (rec) => {
    if (!confirm('Delete this record?')) return;
    try {
      await apiService.deleteProgressRecord(rec.id);
      toast.success('Record deleted');
      loadRecords();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleSave = async (form) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = { 
        ...form,
        attending_therapist_id: form.attending_therapist_id || currentUser?.id || undefined,
      };
      if (editing?.id) {
        await apiService.updateProgressRecord(editing.id, payload);
        toast.success('Record updated');
      } else {
        await apiService.createProgressRecord(payload);
        toast.success('Record created');
      }
      setShowForm(false);
      setEditing(null);
      loadRecords();
    } catch (err) {
      if (err.errors) {
        const msg = Object.values(err.errors).flat().join('\n');
        toast.error(msg);
      } else {
        toast.error(err.message || 'Save failed');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadRecords(1);
  };

  const years = (() => {
    const y = new Date().getFullYear();
    return [y, y-1, y-2, y-3];
  })();

  const onYearChange = (e) => {
    const year = e.target.value;
    if (!year) {
      setFilters(prev => ({ ...prev, year: '', from: '', to: '' }));
      return;
    }
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    setFilters(prev => ({ ...prev, year, from, to }));
  };

  const exportCSV = () => {
    downloadCSV(records, 'patient-progress.csv');
  };

  const printView = () => {
    openPrintView(records, 'Patient Progress Record');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">Patient</label>
          <select name="patient_id" value={filters.patient_id} onChange={handleFilterChange} className="mt-1 border rounded px-3 py-2 bg-white dark:bg-gray-700 w-full">
            <option value="">All</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">From</label>
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className="mt-1 border rounded px-3 py-2 bg-white dark:bg-gray-700 w-full" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">To</label>
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className="mt-1 border rounded px-3 py-2 bg-white dark:bg-gray-700 w-full" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">Year (quick)</label>
          <select name="year" value={filters.year} onChange={onYearChange} className="mt-1 border rounded px-3 py-2 bg-white dark:bg-gray-700 w-full">
            <option value="">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">Therapy</label>
          <input type="text" name="therapy_type" value={filters.therapy_type} onChange={handleFilterChange} className="mt-1 border rounded px-3 py-2 bg-white dark:bg-gray-700 w-full" placeholder="Physical, Occupational..." />
        </div>
        <div className="flex items-end">
          <button onClick={applyFilters} className="w-full h-10 px-4 bg-gray-200 dark:bg-gray-700 rounded">Filter</button>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <button onClick={exportCSV} className="h-10 px-4 bg-emerald-600 text-white rounded">Export CSV</button>
        <button onClick={printView} className="h-10 px-4 bg-gray-800 text-white rounded">Print</button>
        <button onClick={onCreate} className="h-10 px-4 bg-blue-600 text-white rounded">New Record</button>
      </div>
      {/* Mobile: card list */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="p-4 text-center bg-white dark:bg-gray-800 rounded-lg shadow">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600 bg-white dark:bg-gray-800 rounded-lg shadow">{error}</div>
        ) : records.length === 0 ? (
          <div className="p-4 text-center bg-white dark:bg-gray-800 rounded-lg shadow">No records found</div>
        ) : (
          records.map(rec => (
            <div key={rec.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">{rec.session_date}</div>
                  <div className="font-semibold">{rec.patient?.first_name} {rec.patient?.last_name}</div>
                  <div className="text-sm text-gray-600">{rec.therapy_type}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(rec)} className="px-3 py-1 border rounded text-sm">Edit</button>
                  <button onClick={() => onDelete(rec)} className="px-3 py-1 border rounded text-sm text-red-600">Del</button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-gray-500">Therapist:</span> {rec.therapist ? `${rec.therapist.first_name} ${rec.therapist.last_name}` : '-'}</div>
                {rec.goals_set && <div><span className="text-gray-500">Goals:</span> {rec.goals_set}</div>}
                {rec.activities_done && <div><span className="text-gray-500">Activities:</span> {rec.activities_done}</div>}
                {rec.evaluation_summary && <div><span className="text-gray-500">Evaluation:</span> {rec.evaluation_summary}</div>}
                {rec.behavior_mood && <div><span className="text-gray-500">Mood:</span> {rec.behavior_mood}</div>}
                {rec.recommendation && <div><span className="text-gray-500">Recommendation:</span> {rec.recommendation}</div>}
                <div><span className="text-gray-500">Next Appt:</span> {rec.next_appointment_date || '-'}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3">Session Date</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Type of Therapy</th>
              <th className="p-3">Attending Therapist</th>
              <th className="p-3">Goals Set This Session</th>
              <th className="p-3">Activities / Treatment Done</th>
              <th className="p-3">Evaluation / Progress Summary</th>
              <th className="p-3">Patient Behavior / Mood</th>
              <th className="p-3">Recommendation</th>
              <th className="p-3">Next Appointment</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan="11">Loading...</td></tr>
            ) : error ? (
              <tr><td className="p-4 text-red-500" colSpan="11">{error}</td></tr>
            ) : records.length === 0 ? (
              <tr><td className="p-4" colSpan="11">No records found</td></tr>
            ) : (
              records.map(rec => (
                <tr key={rec.id} className="border-t border-gray-200 dark:border-gray-700 align-top">
                  <td className="p-3 whitespace-nowrap">{rec.session_date}</td>
                  <td className="p-3">{rec.patient?.first_name} {rec.patient?.last_name}</td>
                  <td className="p-3">{rec.therapy_type}</td>
                  <td className="p-3">{rec.therapist ? `${rec.therapist.first_name} ${rec.therapist.last_name}` : '-'}</td>
                  <td className="p-3 max-w-xs">{rec.goals_set}</td>
                  <td className="p-3 max-w-xs">{rec.activities_done}</td>
                  <td className="p-3 max-w-xs">{rec.evaluation_summary}</td>
                  <td className="p-3 max-w-xs">{rec.behavior_mood}</td>
                  <td className="p-3 max-w-xs">{rec.recommendation}</td>
                  <td className="p-3 whitespace-nowrap">{rec.next_appointment_date || '-'}</td>
                  <td className="p-3 whitespace-nowrap space-x-2">
                    <button onClick={() => onEdit(rec)} className="px-2 py-1 rounded border">Edit</button>
                    <button onClick={() => onDelete(rec)} className="px-2 py-1 rounded border text-red-600">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProgressRecordForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          initialData={editing || { session_date: new Date().toISOString().slice(0,10), patient_id: filters.patient_id }}
          patients={patients}
        />
      )}
    </div>
  );
};

export default ProgressTab;
