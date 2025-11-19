
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Users, Activity, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DAILY_STATS_DATA } from '../constants';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const { users, usage, payments, services } = useApp();

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCalls = usage.length;
  
  const MetricCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend === 'up' ? (
          <span className="text-green-600 flex items-center font-medium">
            <ArrowUpRight size={16} className="mr-1" /> {subValue}
          </span>
        ) : (
          <span className="text-slate-400 flex items-center font-medium">
            {subValue}
          </span>
        )}
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of system performance and usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Users" 
          value={users.length} 
          subValue="+12%" 
          icon={Users} 
          trend="up" 
        />
        <MetricCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toFixed(2)}`} 
          subValue="+8.2%" 
          icon={CreditCard} 
          trend="up" 
        />
        <MetricCard 
          title="API Calls" 
          value={totalCalls} 
          subValue="98.5% Success" 
          icon={Activity} 
          trend="up" 
        />
        <MetricCard 
          title="Active Services" 
          value={services.length} 
          subValue="Stable" 
          icon={Activity} 
          trend="neutral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Daily API Usage</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_STATS_DATA}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="calls" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Payments</h3>
          <div className="space-y-4">
            {payments.slice(0, 4).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CreditCard size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">${payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{payment.method}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(payment.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {payments.length === 0 && (
               <p className="text-sm text-slate-500 text-center py-4">No payments yet.</p>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
            View All Payments
          </button>
        </div>
      </div>
    </div>
  );
};
