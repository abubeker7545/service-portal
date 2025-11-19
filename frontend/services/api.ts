/* Frontend API wrapper for calling Flask backend endpoints. */
import { Service, User, APIUsage, Payment, DeviceRecord } from '../types';

// Vite exposes env on import.meta.env; cast to any to avoid TS issues in this workspace.
// Default to the local Flask dev server if VITE_API_URL is not set.
const API_BASE = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://127.0.0.1:5000';

async function handleResponse(res: Response) {
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json.error || res.statusText || 'API error');
    return json;
  } catch (err) {
    // if text was not JSON but status OK, return raw text
    if (res.ok) return text || {};
    throw err;
  }
}

export async function getServices(): Promise<Service[]> {
  const res = await fetch(`${API_BASE}/api/services`);
  const data = await handleResponse(res);

  // Backend may return grouped object or flat array. Normalize to flat array of services.
  if (Array.isArray(data)) return data as Service[];

  // If grouped object, flatten
  if (typeof data === 'object' && data !== null) {
    const arr: Service[] = [];
    Object.values(data).forEach((group: any) => {
      if (Array.isArray(group)) arr.push(...group);
    });
    return arr;
  }

  return [];
}

export async function addService(payload: Partial<Service>): Promise<Service> {
  const res = await fetch(`${API_BASE}/api/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  // backend returns { message, service }
  return (data && data.service) ? data.service as Service : (payload as Service);
}

export async function updateService(id: number | string, payload: Partial<Service>): Promise<Service> {
  const res = await fetch(`${API_BASE}/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return (data && data.service) ? data.service as Service : (payload as Service);
}

export async function deleteService(id: number | string): Promise<{ message?: string }> {
  const res = await fetch(`${API_BASE}/api/services/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getServiceByCode(code: string): Promise<Service> {
  const res = await fetch(`${API_BASE}/api/services/code/${encodeURIComponent(code)}`);
  return handleResponse(res) as Promise<Service>;
}

export async function getStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/status`);
  return handleResponse(res);
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/users`);
  return handleResponse(res) as Promise<User[]>;
}

export async function getUserById(id: number | string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}`);
  return handleResponse(res) as Promise<User>;
}

export async function getUserUsages(user_id: number | string) {
  const res = await fetch(`${API_BASE}/api/users/${user_id}/usages`);
  return handleResponse(res);
}

export async function getUserPayments(user_id: number | string) {
  const res = await fetch(`${API_BASE}/api/users/${user_id}/payments`);
  return handleResponse(res) as Promise<Payment[]>;
}

export async function createDevice(payload: { user_id: number | string; imei: string; serial?: string; note?: string }) {
  const res = await fetch(`${API_BASE}/api/devices`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getDevices(): Promise<DeviceRecord[]> {
  const res = await fetch(`${API_BASE}/api/devices`);
  return handleResponse(res) as Promise<DeviceRecord[]>;
}

export async function updateDevice(id: number | string, payload: Partial<{ user_id: number | string; imei: string; serial: string; note: string }>) {
  const res = await fetch(`${API_BASE}/api/devices/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function deleteDevice(id: number | string) {
  const res = await fetch(`${API_BASE}/api/devices/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getUsages(): Promise<APIUsage[]> {
  const res = await fetch(`${API_BASE}/api/usages`);
  return handleResponse(res) as Promise<APIUsage[]>;
}

export async function createPayment(payload: Partial<Payment>) {
  const res = await fetch(`${API_BASE}/api/payments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function deletePayment(id: number | string) {
  const res = await fetch(`${API_BASE}/api/payments/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function updateUser(id: number | string, payload: Partial<User>) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function deleteUser(id: number | string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getUser(telegramId: number): Promise<{ user_id: number; free_calls: number; paid_calls: number; username: string | null }> {
  const res = await fetch(`${API_BASE}/api/user/${telegramId}`);
  return handleResponse(res);
}

export async function lookup(user_id: number | string, service: string, imei: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, service, imei }),
  });
  return handleResponse(res);
}

export async function getPayments(): Promise<Payment[]> {
  const res = await fetch(`${API_BASE}/api/payments`);
  return handleResponse(res) as Promise<Payment[]>;
}

// Admin auth helpers (use credentials to receive server session cookie)
export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password })
  });
  try {
    const data = await handleResponse(res);
    return !!(data && (data as any).success);
  } catch (e) {
    return false;
  }
}

export async function adminLogout(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    const data = await handleResponse(res);
    return !!(data && (data as any).success);
  } catch (e) {
    return false;
  }
}

export default {
  getServices,
  addService,
  updateService,
  deleteService,
  getServiceByCode,
  getStatus,
  getUsers,
  getDevices,
  getUserById,
  getUserUsages,
  getUserPayments,
  createDevice,
  updateDevice,
  deleteDevice,
  getUsages,
  getPayments,
  createPayment,
  deletePayment,
  updateUser,
  deleteUser,
  getUser,
  lookup
  ,adminLogin, adminLogout
};
