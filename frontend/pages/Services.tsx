
import React, { useState } from 'react';
import { Plus, MoreVertical, Globe, Lock, Activity, DollarSign, BarChart2, Edit2, Trash2, X } from 'lucide-react';
import { Service } from '../types';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';

export const ServicesPage: React.FC = () => {
  const { services, usage, addService, updateService, deleteService } = useApp();
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({});
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenEdit = (service: Service) => {
    setIsEditMode(true);
    setFormData({ ...service });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
    setOpenMenuId(null);
  };

  const handleSave = () => {
    if (isEditMode && formData.id) {
      updateService(formData as Service);
    } else {
      const newService: Service = {
        id: `s${Date.now()}`,
        code: formData.code || '',
        name: formData.name || '',
        description: formData.description || '',
        api_url: formData.api_url || '',
        api_key: formData.api_key || undefined,
        is_public: formData.is_public || false,
        group: formData.group || 'General',
      };
      addService(newService);
    }
    setIsModalOpen(false);
    setFormData({});
  };

  return (
    <div className="space-y-6" onClick={() => setOpenMenuId(null)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-500">Configure API services and view performance stats.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenAdd(); }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const serviceUsage = usage.filter(u => u.service_id === service.id);
          const totalCalls = serviceUsage.length;
          const totalRevenue = serviceUsage.reduce((acc, curr) => acc + curr.cost, 0);
          const successCount = serviceUsage.filter(u => u.success).length;
          const successRate = totalCalls > 0 ? Math.round((successCount / totalCalls) * 100) : 0;

          return (
            <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${service.is_public ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {service.is_public ? <Globe size={20} /> : <Lock size={20} />}
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === service.id ? null : service.id); }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === service.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1">
                       <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(service); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                      >
                        <Edit2 size={14} className="mr-2"/> Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                         <Trash2 size={14} className="mr-2"/> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
              <p className="text-xs font-mono text-slate-500 mb-2">{service.code}</p>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10">{service.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{service.group}</span>
              </div>

              {/* Service config: API URL and API Key (masked) */}
              <div className="mt-2 mb-4 text-sm text-slate-500">
                <div className="truncate">
                  <span className="text-xs font-mono text-slate-400">API:</span>
                  <a href={service.api_url} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 truncate">{service.api_url}</a>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-xs font-mono text-slate-400">Key:</span>
                  <span className="ml-2 text-sm font-mono text-slate-700">{service.api_key ? (revealedKeyId === service.id ? service.api_key : '••••••••••') : '—'}</span>
                  {service.api_key && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setRevealedKeyId(revealedKeyId === service.id ? null : service.id); }}
                      className="ml-3 text-xs text-indigo-600 hover:underline"
                    >
                      {revealedKeyId === service.id ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>

              {/* API Usage Stats */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                 <div className="text-center border-r border-slate-100 last:border-0">
                    <div className="flex items-center justify-center text-slate-400 mb-1" title="Total Calls">
                       <Activity size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{totalCalls}</span>
                 </div>
                 <div className="text-center border-r border-slate-100 last:border-0">
                    <div className="flex items-center justify-center text-green-500 mb-1" title="Revenue">
                       <DollarSign size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">${totalRevenue.toFixed(0)}</span>
                 </div>
                 <div className="text-center">
                    <div className="flex items-center justify-center text-indigo-500 mb-1" title="Success Rate">
                       <BarChart2 size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{successRate}%</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Service" : "Add New Service"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.name || ''}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Code</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.code || ''}
              onChange={e => setFormData({...formData, code: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.group || ''}
              onChange={e => setFormData({...formData, group: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API URL</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.api_url || ''}
              onChange={e => setFormData({...formData, api_url: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API Key (optional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.api_key || ''}
              onChange={e => setFormData({...formData, api_key: e.target.value})}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="is_public"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              checked={formData.is_public || false}
              onChange={e => setFormData({...formData, is_public: e.target.checked})}
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-slate-900">
              Publicly Available
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              {isEditMode ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
