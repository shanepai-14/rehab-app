export const buildCSV = (records = []) => {
  const headers = [
    'Session Date',
    'Patient Name',
    'Type of Therapy',
    'Attending Therapist',
    'Goals Set This Session',
    'Activities / Treatment Done',
    'Evaluation / Progress Summary',
    'Patient Behavior / Mood',
    'Recommendation',
    'Next Appointment'
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/\r?\n|\r/g, ' ');
    if (str.includes(',') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const rows = records.map(r => [
    r.session_date || '',
    r.patient ? `${r.patient.first_name || ''} ${r.patient.last_name || ''}`.trim() : '',
    r.therapy_type || '',
    r.therapist ? `${r.therapist.first_name || ''} ${r.therapist.last_name || ''}`.trim() : '',
    r.goals_set || '',
    r.activities_done || '',
    r.evaluation_summary || '',
    r.behavior_mood || '',
    r.recommendation || '',
    r.next_appointment_date || ''
  ].map(escape).join(','));

  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (records, filename = 'patient-progress.csv') => {
  const csv = buildCSV(records);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const openPrintView = (records, title = 'Patient Progress Record') => {
  const w = window.open('', '_blank');
  if (!w) return;
  const rows = records.map(r => `
    <tr>
      <td>${r.session_date || ''}</td>
      <td>${r.patient ? `${r.patient.first_name || ''} ${r.patient.last_name || ''}`.trim() : ''}</td>
      <td>${r.therapy_type || ''}</td>
      <td>${r.therapist ? `${r.therapist.first_name || ''} ${r.therapist.last_name || ''}`.trim() : ''}</td>
      <td>${(r.goals_set || '').replace(/</g,'&lt;')}</td>
      <td>${(r.activities_done || '').replace(/</g,'&lt;')}</td>
      <td>${(r.evaluation_summary || '').replace(/</g,'&lt;')}</td>
      <td>${(r.behavior_mood || '').replace(/</g,'&lt;')}</td>
      <td>${(r.recommendation || '').replace(/</g,'&lt;')}</td>
      <td>${r.next_appointment_date || ''}</td>
    </tr>
  `).join('');

  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; vertical-align: top; }
          thead { background: #f7fafc; }
          .meta { margin-bottom: 16px; color: #444; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="margin-bottom:12px;padding:8px 12px;">Print</button>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              <th>Session Date</th>
              <th>Patient Name</th>
              <th>Type of Therapy</th>
              <th>Attending Therapist</th>
              <th>Goals Set This Session</th>
              <th>Activities / Treatment Done</th>
              <th>Evaluation / Progress Summary</th>
              <th>Patient Behavior / Mood</th>
              <th>Recommendation</th>
              <th>Next Appointment</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `);
  w.document.close();
};

