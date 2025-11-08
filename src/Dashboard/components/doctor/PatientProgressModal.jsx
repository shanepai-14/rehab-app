import { useEffect, useState } from 'react';
import apiService from '../../../Services/api';
import { downloadCSV, openPrintView } from '../../../utils/progressExport';

const PatientProgressModal = ({ isOpen, onClose, patient }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!patient?.id) return;
      try {
        setLoading(true);
        const res = await apiService.getProgressRecords({ patient_id: patient.id, per_page: 100 });
        const payload = res.data?.data || res.data;
        setRecords(payload?.data || payload || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) load();
  }, [isOpen, patient]);

  if (!isOpen) return null;

  const name = `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim();

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Patient Progress — {name}</h2>
            <p className="text-sm text-gray-500">{patient?.contact_number}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadCSV(records, `${name}-progress.csv`)} className="px-3 py-2 bg-emerald-600 text-white rounded">Export CSV</button>
            <button onClick={() => openPrintView(records, `Patient Progress — ${name}`)} className="px-3 py-2 bg-gray-800 text-white rounded">Print</button>
            <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="p-3">Session Date</th>
                <th className="p-3">Type of Therapy</th>
                <th className="p-3">Attending Therapist</th>
                <th className="p-3">Goals Set</th>
                <th className="p-3">Activities Done</th>
                <th className="p-3">Evaluation / Summary</th>
                <th className="p-3">Behavior / Mood</th>
                <th className="p-3">Recommendation</th>
                <th className="p-3">Next Appointment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan="9">Loading...</td></tr>
              ) : error ? (
                <tr><td className="p-4 text-red-500" colSpan="9">{error}</td></tr>
              ) : records.length === 0 ? (
                <tr><td className="p-4" colSpan="9">No records</td></tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} className="border-t border-gray-200 dark:border-gray-700 align-top">
                    <td className="p-3 whitespace-nowrap">{rec.session_date}</td>
                    <td className="p-3">{rec.therapy_type}</td>
                    <td className="p-3">{rec.therapist ? `${rec.therapist.first_name} ${rec.therapist.last_name}` : '-'}</td>
                    <td className="p-3 max-w-xs">{rec.goals_set}</td>
                    <td className="p-3 max-w-xs">{rec.activities_done}</td>
                    <td className="p-3 max-w-xs">{rec.evaluation_summary}</td>
                    <td className="p-3 max-w-xs">{rec.behavior_mood}</td>
                    <td className="p-3 max-w-xs">{rec.recommendation}</td>
                    <td className="p-3 whitespace-nowrap">{rec.next_appointment_date || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientProgressModal;

