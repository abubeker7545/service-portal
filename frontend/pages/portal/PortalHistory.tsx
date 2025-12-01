
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { APIUsage } from '../../types';

export const PortalHistory: React.FC = () => {
    const [usages, setUsages] = useState<APIUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('portal_user_id');
        if (!userId) return;

        const fetchHistory = async () => {
            try {
                const data = await api.getUserUsages(parseInt(userId));
                setUsages(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading history...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Request History</h1>
                <p className="text-slate-500">View your past service requests and results</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold text-slate-700">Service</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">IMEI</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Cost</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                usages.map((usage) => (
                                    <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{usage.service_id}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">{usage.imei}</td>
                                        <td className="px-6 py-4">
                                            {usage.success ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} className="mr-1" /> Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle size={12} className="mr-1" /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {usage.cost > 0 ? `$${usage.cost.toFixed(2)}` : 'Free'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-1.5 text-slate-400" />
                                                {usage.created_at ? new Date(usage.created_at).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
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
