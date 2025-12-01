
import React, { useState } from 'react';
import { User, ArrowRight, Hash, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const PortalLogin: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registeredId, setRegisteredId] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const id = parseInt(userId);
            if (isNaN(id)) {
                throw new Error('User ID must be a number');
            }
            const user = await api.getUser(id);
            if (user && user.user_id) {
                localStorage.setItem('portal_user_id', String(user.user_id));
                localStorage.setItem('portal_username', user.username || '');
                navigate('/portal');
            } else {
                setError('User not found');
            }
        } catch (err) {
            console.error(err);
            setError('Login failed. Please check your ID.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Generate a random 9-digit ID (100000000 to 999999999)
            const newId = Math.floor(100000000 + Math.random() * 900000000);

            // Create user via API (api.getUser creates if not exists)
            // We need to pass the username somehow. The current api.getUser only takes ID.
            // But the backend `api_get_user` accepts `username` query param.
            // I need to update api.ts or just call fetch directly here for registration to include username.

            // Let's call fetch directly to ensure username is passed
            const res = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'https://serviceapi.shegergsm.com'}/api/user/${newId}?username=${encodeURIComponent(username)}`);
            if (!res.ok) throw new Error('Registration failed');
            const data = await res.json();

            setRegisteredId(String(data.user_id));
            localStorage.setItem('portal_user_id', String(data.user_id));
            localStorage.setItem('portal_username', data.username || username);

            // Don't navigate immediately, let them see their ID
        } catch (err) {
            console.error(err);
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                            <span className="font-bold text-2xl text-white">P</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">User Portal</h1>
                        <p className="text-slate-500 mt-2">
                            {mode === 'login' ? 'Enter your User ID to access services' : 'Create a new account'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {registeredId ? (
                        <div className="bg-green-50 p-6 rounded-xl text-center mb-6 border border-green-100">
                            <div className="text-green-800 font-medium mb-2">Registration Successful!</div>
                            <div className="text-sm text-green-600 mb-4">Please save your User ID. You will need it to login.</div>
                            <div className="text-3xl font-mono font-bold text-indigo-600 tracking-wider mb-6 select-all bg-white py-2 rounded border border-indigo-100">
                                {registeredId}
                            </div>
                            <button
                                onClick={() => navigate('/portal')}
                                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
                            {mode === 'login' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="e.g. 123456789"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Choose a username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Login' : 'Register'} <ArrowRight size={18} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {!registeredId && (
                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            {mode === 'login' ? "Don't have an account?" : "Already have an ID?"}{' '}
                            <button
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    setError('');
                                }}
                                className="text-indigo-600 font-medium hover:underline focus:outline-none"
                            >
                                {mode === 'login' ? 'Register Now' : 'Login Here'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
