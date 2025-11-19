
import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { User } from '../types';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';

export const UsersPage: React.FC = () => {
  const { users, devices, usage, payments, services, updateUser, deleteUser } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'devices' | 'usage' | 'payments'>('devices');

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegram_id.includes(searchTerm)
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setActiveTab('devices');
    setIsDetailOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ ...user });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedUser && editFormData) {
      updateUser({ ...selectedUser, ...editFormData } as User);
      setIsEditOpen(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  // Detail View Sub-components
  const UserDevices = ({ userId }: { userId: string }) => {
    const userDevices = devices.filter(d => d.user_id === userId);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-2">IMEI</th>
              <th className="px-4 py-2">Serial</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {userDevices.length > 0 ? userDevices.map(d => (
              <tr key={d.id} className="border-b">
                <td className="px-4 py-2 font-mono">{d.imei}</td>
                <td className="px-4 py-2 font-mono">{d.serial}</td>
                <td className="px-4 py-2 text-slate-500">{d.note}</td>
              </tr>
            )) : <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-500">No devices found</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  const UserUsage = ({ userId }: { userId: string }) => {
    const userUsage = usage.filter(u => u.user_id === userId);
    return (
      <div className="overflow-x-auto">
         <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">IMEI</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {userUsage.length > 0 ? userUsage.map(u => {
              const service = services.find(s => s.id === u.service_id);
              return (
                <tr key={u.id} className="border-b">
                  <td className="px-4 py-2">{service?.name || u.service_id}</td>
                  <td className="px-4 py-2 font-mono text-xs">{u.imei}</td>
                  <td className="px-4 py-2">${u.cost.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              );
            }) : <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">No usage history</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  const UserPayments = ({ userId }: { userId: string }) => {
    const userPayments = payments.filter(p => p.user_id === userId);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {userPayments.length > 0 ? userPayments.map(p => (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-2">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">{p.method}</td>
                <td className="px-4 py-2 font-medium text-green-600">+${p.amount.toFixed(2)}</td>
              </tr>
            )) : <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-500">No payments found</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500">Manage platform users and their history.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">User Info</th>
                <th className="px-6 py-3">Registered</th>
                <th className="px-6 py-3 text-center">Credits (Free/Paid)</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.username}</div>
                    <div className="text-xs text-slate-500">ID: {user.telegram_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.registered ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.registered ? 'Registered' : 'Guest'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-slate-900">{user.free_calls}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="font-medium text-indigo-600">{user.paid_calls}</span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`User: ${selectedUser?.username}`}
        maxWidth="max-w-3xl"
      >
        {selectedUser && (
          <div className="space-y-4">
             <div className="flex space-x-4 border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab('devices')}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'devices' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Devices
                </button>
                <button 
                  onClick={() => setActiveTab('usage')}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'usage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  API Usage
                </button>
                <button 
                  onClick={() => setActiveTab('payments')}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Payments
                </button>
             </div>
             <div className="min-h-[200px]">
               {activeTab === 'devices' && <UserDevices userId={selectedUser.id} />}
               {activeTab === 'usage' && <UserUsage userId={selectedUser.id} />}
               {activeTab === 'payments' && <UserPayments userId={selectedUser.id} />}
             </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit User: ${selectedUser?.username}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={editFormData.username || ''}
              onChange={e => setEditFormData({...editFormData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telegram ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={editFormData.telegram_id || ''}
              onChange={e => setEditFormData({...editFormData, telegram_id: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Free Calls</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={editFormData.free_calls || 0}
                onChange={e => setEditFormData({...editFormData, free_calls: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paid Calls</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={editFormData.paid_calls || 0}
                onChange={e => setEditFormData({...editFormData, paid_calls: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex items-center pt-2">
             <input 
                type="checkbox" 
                id="is_registered"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                checked={editFormData.registered || false}
                onChange={e => setEditFormData({...editFormData, registered: e.target.checked})}
              />
              <label htmlFor="is_registered" className="ml-2 block text-sm text-slate-900">
                Registered User
              </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-2">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
