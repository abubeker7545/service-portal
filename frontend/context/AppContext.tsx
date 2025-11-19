
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Service, DeviceRecord, APIUsage, Payment } from '../types';
import api from '../services/api';

interface AppContextType {
  users: User[];
  services: Service[];
  devices: DeviceRecord[];
  usage: APIUsage[];
  payments: Payment[];
  isAuthenticated: boolean;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addPayment: (payment: Payment) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data state
  // start with empty arrays; we'll load real data from the backend
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [usage, setUsage] = useState<APIUsage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Check for persisted session on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('admin_nexus_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    // Fetch initial data from backend (services, users, devices, usage, payments)
    (async () => {
      try {
        const [svcs, usrs, devs, usg, pays] = await Promise.all([
          api.getServices().catch((e) => { console.error('svc err', e); return [] as Service[] }),
          api.getUsers().catch((e) => { console.error('users err', e); return [] as User[] }),
          api.getDevices().catch((e) => { console.error('devices err', e); return [] as DeviceRecord[] }),
          api.getUsages().catch((e) => { console.error('usage err', e); return [] as any[] }),
          api.getPayments().catch((e) => { console.error('payments err', e); return [] as Payment[] })
        ]);
  if (svcs && svcs.length) setServices(svcs.map(s => ({ ...s, id: String((s as any).id) })));
  if (usrs && usrs.length) setUsers(usrs.map(u => ({ ...u, id: String((u as any).id), telegram_id: String((u as any).telegram_id) })));
  if (devs && devs.length) setDevices(devs.map(d => ({ ...d, id: String((d as any).id), user_id: String((d as any).user_id) })));
  if (usg && usg.length) setUsage((usg as any[]).map(u => ({ ...u, id: String((u as any).id), user_id: String((u as any).user_id), service_id: String((u as any).service_id) })) as APIUsage[]);
  if (pays && pays.length) setPayments(pays.map(p => ({ ...p, id: String((p as any).id), user_id: p.user_id ? String((p as any).user_id) : p.user_id })));
      } catch (e) {
        console.error('Failed to fetch initial data', e);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    // Use centralized API service for admin login to keep calls consistent
    if (!password) return false;
    try {
      const ok = await api.adminLogin(password);
      if (ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_nexus_auth', 'true');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login via api.adminLogin failed', e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.adminLogout();
    } catch (e) {
      console.error('Logout via api.adminLogout failed', e);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('admin_nexus_auth');
  };

  const addUser = (user: User) => {
    // Creating users via the API is not currently implemented on backend.
    // For now, add locally and log a warning. If you want real-user create support,
    // we can add POST /api/users on the backend and call it from here.
    console.warn('addUser: user creation via API is not implemented; adding locally');
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    const id: any = (updatedUser as any).id;
    api.updateUser(id, updatedUser as Partial<User>)
      .then(() => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u)))
      .catch((err) => {
        console.error('Failed to update user', err);
        // fallback to local update
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      });
  };

  const deleteUser = (id: string) => {
    const anyId: any = id;
    api.deleteUser(anyId)
      .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
      .catch((err) => {
        console.error('Failed to delete user', err);
        // fallback: remove locally
        setUsers(prev => prev.filter(u => u.id !== id));
      });
  };

  // addService will attempt to persist to backend, then update local state.
  const addService = (service: Service) => {
    // fire-and-forget to preserve synchronous signature used in UI code
    api.addService(service as Partial<Service>)
      .then((created) => {
        setServices(prev => [...prev, created]);
      })
      .catch((err) => {
        console.error('Failed to add service to backend', err);
        // fallback to local update so UI still reflects the change
        setServices(prev => [...prev, service]);
      });
  };
  
  const updateService = (updatedService: Service) => {
    const id: any = (updatedService as any).id;
    // call backend and update state
    api.updateService(id, updatedService as Partial<Service>)
      .then((res) => {
        const svc = (res && (res as any).service) ? (res as any).service as Service : updatedService;
        setServices(prev => prev.map(s => s.id === svc.id ? svc : s));
      })
      .catch((err) => {
        console.error('Failed to update service', err);
        // optimistic local update
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
      });
  };

  const deleteService = (id: string) => {
    const anyId: any = id;
    api.deleteService(anyId)
      .then(() => setServices(prev => prev.filter(s => s.id !== id)))
      .catch((err) => {
        console.error('Failed to delete service', err);
        // fallback: remove locally
        setServices(prev => prev.filter(s => s.id !== id));
      });
  };

  const addPayment = (payment: Payment) => {
    // persist payment to backend then update local list
    api.createPayment(payment as Partial<Payment>)
      .then((res) => {
        const created = res && (res as any).payment ? (res as any).payment as Payment : payment;
        setPayments(prev => [created, ...prev]);
      })
      .catch((err) => {
        console.error('Failed to create payment', err);
        setPayments(prev => [payment, ...prev]);
      });
  };

  return (
    <AppContext.Provider value={{
      users,
      services,
      devices,
      usage,
      payments,
      isAuthenticated,
      addUser,
      updateUser,
      deleteUser,
      addService,
      updateService,
      deleteService,
      addPayment,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
