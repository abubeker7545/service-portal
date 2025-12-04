
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CreditCard, Smartphone, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { APIUsage } from '../../types';

export const PortalDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<APIUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('portal_user_id');
        if (!userId) {
            navigate('/portal/login');
            return;
        }

        const fetchData = async () => {
            try {
                const id = parseInt(userId);
                const [userData, usagesData] = await Promise.all([
                    api.getUser(id),
                    api.getUserUsages(id)
                ]);
                setUser(userData);
                if (Array.isArray(usagesData)) {
                    setRecentActivity(usagesData.slice(0, 5));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">User not found. Please login again.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {user.username}</p>
                </div>
                <button
                    onClick={() => navigate('/portal/request')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                    New Request <ArrowRight size={16} className="ml-2" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Free Calls</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{user.free_calls}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Paid Calls</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{user.paid_calls}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Smartphone size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">User ID</h3>
                    <p className="text-xl font-mono font-bold text-slate-900 mt-1">{user.user_id}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="font-bold text-slate-900">Recent Activity</h2>
                    <button
                        onClick={() => navigate('/portal/history')}
                        className="text-indigo-600 text-sm font-medium hover:underline"
                    >
                        View All
                    </button>
                </div>

                {recentActivity.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No recent activity to show.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Service</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">IMEI</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Status</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentActivity.map((usage) => (
                                    <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {usage.service_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">
                                            {usage.imei}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {usage.success ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} className="mr-1" /> Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle size={12} className="mr-1" /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-1.5 text-slate-400" />
                                                {usage.created_at ? new Date(usage.created_at).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
