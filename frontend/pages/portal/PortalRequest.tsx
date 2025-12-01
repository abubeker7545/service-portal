
import React, { useState, useEffect } from 'react';
import { Search, Smartphone, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Service } from '../../types';

export const PortalRequest: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [imei, setImei] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await api.getServices();
                setServices(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !imei) return;

        setSubmitting(true);
        setError('');
        setResult(null);

        const userId = localStorage.getItem('portal_user_id');
        if (!userId) {
            setError('User not logged in');
            setSubmitting(false);
            return;
        }

        try {
            const res = await api.lookup(userId, selectedService.code, imei);
            if (res.error || (typeof res === 'string' && res.includes('Error'))) {
                setError(res.error || res);
            } else {
                setResult(res);
            }
        } catch (err: any) {
            setError(err.message || 'Request failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group services
    const groupedServices = filteredServices.reduce((acc, service) => {
        if (!acc[service.group]) acc[service.group] = [];
        acc[service.group].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    if (loading) return <div className="p-8 text-center">Loading services...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Service Request</h1>
                <p className="text-slate-500">Select a service and enter your device details</p>
            </div>

            {!selectedService ? (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-8">
                        {Object.entries(groupedServices).map(([group, groupServices]: [string, Service[]]) => (
                            <div key={group}>
                                <h2 className="text-lg font-bold text-slate-800 mb-3">{group}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupServices.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service)}
                                            className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
                                        >
                                            <div className="font-medium text-slate-900 group-hover:text-indigo-600">{service.name}</div>
                                            <div className="text-sm text-slate-500 mt-1">{service.description || 'No description'}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => { setSelectedService(null); setResult(null); setError(''); setImei(''); }}
                        className="text-slate-500 hover:text-slate-900 mb-4 flex items-center"
                    >
                        ← Back to Services
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">{selectedService.name}</h2>
                            <p className="text-slate-500">{selectedService.group}</p>
                        </div>

                        <div className="p-6">
                            {result ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 p-4 rounded-lg flex items-start space-x-3">
                                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h3 className="font-medium text-green-900">Request Successful</h3>
                                            <div className="mt-2 text-green-800 whitespace-pre-wrap font-mono text-sm">
                                                {JSON.stringify(result, null, 2)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setResult(null); setImei(''); }}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Submit Another Request
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center space-x-2">
                                            <XCircle size={20} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">IMEI / Serial Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="Enter 15-digit IMEI"
                                                value={imei}
                                                onChange={(e) => setImei(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Make sure to enter the correct IMEI/Serial. Charges may apply.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {submitting ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Submit Request <ArrowRight size={18} className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
