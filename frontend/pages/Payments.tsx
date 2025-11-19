
import React, { useState } from 'react';
import { Plus, DollarSign, Download } from 'lucide-react';
import { Payment } from '../types';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';

export const PaymentsPage: React.FC = () => {
  const { payments, users, addPayment } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Payment['method']>('Credit Card');
  const [note, setNote] = useState('');
  const [userId, setUserId] = useState(users.length > 0 ? users[0].id : '');

  const handleAddPayment = () => {
    if (!amount || !userId) return;

    const newPayment: Payment = {
      id: `p${Date.now()}`,
      user_id: userId,
      amount: parseFloat(amount),
      method: method,
      note: note,
      created_at: new Date().toISOString()
    };

    addPayment(newPayment);
    setIsModalOpen(false);
    setAmount('');
    setNote('');
    // Reset to first user if exists
    if (users.length > 0) setUserId(users[0].id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500">Track incoming revenue and transactions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Note</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const user = users.find(u => u.id === payment.user_id);
                return (
                  <tr key={payment.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{payment.id.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user?.username || 'Deleted User'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs">
                      {payment.note}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      +${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-400 hover:text-indigo-600">
                        <Download size={16} className="mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Payment"
      >
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
             <select 
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500"
               value={userId}
               onChange={e => setUserId(e.target.value)}
             >
               {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.telegram_id})</option>)}
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="number" 
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
            <select 
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500"
               value={method}
               onChange={e => setMethod(e.target.value as Payment['method'])}
             >
               <option value="Credit Card">Credit Card</option>
               <option value="PayPal">PayPal</option>
               <option value="Crypto">Crypto</option>
               <option value="Bank Transfer">Bank Transfer</option>
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
            <textarea 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddPayment}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Save Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
