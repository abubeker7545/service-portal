
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CreditCard, Smartphone, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export const PortalDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('portal_user_id');
        if (!userId) {
            navigate('/portal/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const userData = await api.getUser(parseInt(userId));
                setUser(userData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
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

            {/* Recent Activity Placeholder */}
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
                <div className="p-8 text-center text-slate-500">
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
};
