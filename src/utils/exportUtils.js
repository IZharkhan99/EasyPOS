// Export data as JSON
export const exportDataAsJSON = (data, filename = 'easypos-backup.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export data as CSV
export const exportDataAsCSV = (data, headers, filename = 'easypos-export.csv') => {
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value || '').replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Create full system backup
export const createFullBackup = (appData) => {
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      products: appData.products,
      orders: appData.orders,
      staff: appData.staff,
      returns: appData.returns,
      expenses: appData.expenses,
      payments: appData.payments,
      alerts: appData.alerts,
      customers: appData.customers,
    }
  };
  
  const filename = `easypos-full-backup-${new Date().toISOString().split('T')[0]}.json`;
  exportDataAsJSON(backup, filename);
  return filename;
};

// Import backup data
export const importBackupData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data.data || data);
      } catch (error) {
        reject(new Error('Invalid backup file: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Export specific module as CSV
export const exportModuleAsCSV = (moduleName, data, headers) => {
  const filename = `easypos-${moduleName}-${new Date().toISOString().split('T')[0]}.csv`;
  exportDataAsCSV(data, headers, filename);
};
