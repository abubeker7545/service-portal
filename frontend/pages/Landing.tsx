
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, ArrowRight, Globe, Lock } from 'lucide-react';

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
                {/* Header */}
                <header className="py-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Globe size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">ServicePortal</span>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#" className="text-slate-300 hover:text-white transition-colors">Features</a>
                        <a href="#" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
                        <a href="#" className="text-slate-300 hover:text-white transition-colors">Contact</a>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-4">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            <span className="text-sm text-slate-300">System Operational</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Premium IMEI Services <br />
                            <span className="text-indigo-500">Simplified.</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            The ultimate platform for device unlocking, checking, and management.
                            Secure, fast, and reliable services for everyone.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                            {/* User Portal Card */}
                            <button
                                onClick={() => navigate('/portal/login')}
                                className="group relative w-full sm:w-72 p-1 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 hover:from-indigo-500 hover:to-purple-600 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative h-full bg-slate-900 rounded-xl p-6 flex flex-col items-center text-center border border-slate-700/50 group-hover:border-transparent transition-colors">
                                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                                        <Smartphone size={28} className="text-indigo-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">User Portal</h3>
                                    <p className="text-sm text-slate-400 mb-6">Access services, track requests, and manage your devices.</p>
                                    <div className="mt-auto flex items-center text-indigo-400 font-medium group-hover:text-white">
                                        Enter Portal <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>

                            {/* Admin Console Card */}
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="group relative w-full sm:w-72 p-1 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-500 transition-all duration-300"
                            >
                                <div className="relative h-full bg-slate-900 rounded-xl p-6 flex flex-col items-center text-center border border-slate-700/50 group-hover:border-transparent transition-colors">
                                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                                        <Shield size={28} className="text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Admin Console</h3>
                                    <p className="text-sm text-slate-400 mb-6">Manage users, configure services, and monitor system.</p>
                                    <div className="mt-auto flex items-center text-slate-400 font-medium group-hover:text-white">
                                        Admin Login <Lock size={16} className="ml-2" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-6 border-t border-slate-800/50 text-center text-slate-500 text-sm">
                    <p>© 2024 ServicePortal. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};
