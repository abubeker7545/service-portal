
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    User,
    Menu,
    X,
    LogOut,
    Search,
    Bell
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/portal', icon: LayoutDashboard },
    { label: 'New Request', path: '/portal/request', icon: PlusCircle },
    { label: 'History', path: '/portal/history', icon: History },
    // { label: 'Account', path: '/portal/account', icon: User },
];

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState('User');

    useEffect(() => {
        const storedUser = localStorage.getItem('portal_username');
        if (storedUser) setUsername(storedUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('portal_user_id');
        localStorage.removeItem('portal_username');
        navigate('/portal/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">User Portal</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-slate-800 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        // Exact match for root, startsWith for others if needed, but here paths are distinct
                        const isActive = location.pathname === item.path || (item.path !== '/portal' && location.pathname.startsWith(item.path));
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <div className="text-sm">
                                <p className="text-white font-medium truncate w-24">{username}</p>
                                <p className="text-xs">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden md:flex items-center relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 relative text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span> */}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};
