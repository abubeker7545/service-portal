
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UsagePage: React.FC = () => {
  const { usage, users, services } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Usage</h1>
        <p className="text-slate-500">Monitor API calls, success rates, and costs.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
             <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-600 focus:outline-none">
               <option>All Services</option>
               {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
             <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-600 focus:outline-none">
               <option>All Status</option>
               <option>Success</option>
               <option>Failed</option>
             </select>
          </div>
          <div className="text-sm text-slate-500">
            Showing last {usage.length} calls
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">IMEI</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((usageItem) => {
                const user = users.find(u => u.id === usageItem.user_id);
                const service = services.find(s => s.id === usageItem.service_id);
                return (
                  <tr key={usageItem.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(usageItem.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                        {service?.code || usageItem.service_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {usageItem.imei}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {usageItem.success ? (
                        <div className="flex items-center justify-center text-green-600">
                          <CheckCircle size={16} className="mr-1" /> Success
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-red-600">
                          <XCircle size={16} className="mr-1" /> Failed
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      ${usageItem.cost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="text-sm text-slate-500">Page 1 of 1</div>
            <div className="flex gap-1">
                <button className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-400 text-sm" disabled>Prev</button>
                <button className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 text-sm hover:bg-slate-50">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};
