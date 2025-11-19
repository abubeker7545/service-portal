
import React, { useState } from 'react';
import { Search, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DevicesPage: React.FC = () => {
  const { devices, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDevices = devices.filter(d => 
    d.imei.includes(searchTerm) || 
    d.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Device Registry</h1>
          <p className="text-slate-500">Database of user registered devices.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search IMEI or Serial..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.length > 0 ? (
          filteredDevices.map(device => {
            const user = users.find(u => u.id === device.user_id);
            return (
              <div key={device.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start space-x-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
                  <Smartphone size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500 mb-1">IMEI</p>
                  <p className="text-lg font-mono font-bold text-slate-900 truncate mb-2">{device.imei}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-slate-400 block text-xs">Serial</span>
                      <span className="font-mono text-slate-700">{device.serial}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">User</span>
                      <span className="text-indigo-600">{user?.username || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-xs text-slate-500 italic">{device.note || 'No notes'}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-slate-500">
            No devices found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
