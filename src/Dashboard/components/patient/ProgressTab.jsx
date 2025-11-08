import { useEffect, useState } from 'react';
import apiService from '../../../Services/api';
import { downloadCSV, openPrintView } from '../../../utils/progressExport';

const PatientProgressTab = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      // patient sees own records; no filter needed
      const res = await apiService.getProgressRecords({ per_page: 20 });
      const payload = res.data?.data || res.data;
      setRecords(payload?.data || payload || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCSV = () => downloadCSV(records, 'my-progress.csv');
  const printView = () => openPrintView(records, 'My Patient Progress');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <button onClick={exportCSV} className="h-10 px-4 bg-emerald-600 text-white rounded">Export CSV</button>
        <button onClick={printView} className="h-10 px-4 bg-gray-800 text-white rounded">Print</button>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="p-4 text-center bg-white dark:bg-gray-800 rounded-lg shadow">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600 bg-white dark:bg-gray-800 rounded-lg shadow">{error}</div>
        ) : records.length === 0 ? (
          <div className="p-4 text-center bg-white dark:bg-gray-800 rounded-lg shadow">No records yet</div>
        ) : (
          records.map(rec => (
            <div key={rec.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">{rec.session_date}</div>
              <div className="font-semibold">{rec.therapy_type}</div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
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

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
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
              <tr><td className="p-4" colSpan="9">No records yet</td></tr>
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
  );
};

export default PatientProgressTab;
