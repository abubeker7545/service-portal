import { User, Service, DeviceRecord, APIUsage, Payment } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', telegram_id: '123456789', username: 'neo_anders', registered: true, free_calls: 10, paid_calls: 50, created_at: '2023-10-15' },
  { id: 'u2', telegram_id: '987654321', username: 'trinity_dev', registered: true, free_calls: 5, paid_calls: 120, created_at: '2023-11-02' },
  { id: 'u3', telegram_id: '456123789', username: 'morpheus_admin', registered: true, free_calls: 0, paid_calls: 500, created_at: '2023-09-20' },
  { id: 'u4', telegram_id: '111222333', username: 'cypher_anon', registered: false, free_calls: 2, paid_calls: 0, created_at: '2024-01-10' },
  { id: 'u5', telegram_id: '444555666', username: 'switch_net', registered: true, free_calls: 15, paid_calls: 25, created_at: '2024-02-14' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', code: 'IMEI_CHK', name: 'IMEI Check Pro', description: 'Full detail IMEI lookup', api_url: 'https://api.check.com/v1', is_public: true, group: 'Unlock' },
  { id: 's2', code: 'ICLOUD_OFF', name: 'iCloud Removal', description: 'Premium removal service', api_url: 'https://api.unlock.com/icloud', is_public: false, group: 'Unlock' },
  { id: 's3', code: 'CARRIER_INFO', name: 'Carrier Info', description: 'Get carrier details', api_url: 'https://api.gsma.com/lookup', is_public: true, group: 'Info' },
];

export const MOCK_DEVICES: DeviceRecord[] = [
  { id: 'd1', user_id: 'u1', imei: '354811111111111', serial: 'F4GQH2', note: 'Personal iPhone', created_at: '2023-12-01' },
  { id: 'd2', user_id: 'u2', imei: '354822222222222', serial: 'HX9KL1', note: 'Test Device', created_at: '2023-12-05' },
  { id: 'd3', user_id: 'u1', imei: '354833333333333', serial: 'J8MN3P', note: 'iPad Pro', created_at: '2024-01-20' },
  { id: 'd4', user_id: 'u4', imei: '354844444444444', serial: 'K9LQ2R', note: 'Stolen?', created_at: '2024-02-01' },
];

export const MOCK_USAGE: APIUsage[] = [
  { id: 'log1', user_id: 'u1', service_id: 's1', imei: '354811111111111', success: true, cost: 1.50, created_at: '2024-03-01 10:00' },
  { id: 'log2', user_id: 'u1', service_id: 's3', imei: '354811111111111', success: true, cost: 0.50, created_at: '2024-03-01 10:05' },
  { id: 'log3', user_id: 'u2', service_id: 's2', imei: '354822222222222', success: false, cost: 0.00, created_at: '2024-03-02 14:30' },
  { id: 'log4', user_id: 'u3', service_id: 's1', imei: '990000888811111', success: true, cost: 1.50, created_at: '2024-03-03 09:15' },
  { id: 'log5', user_id: 'u2', service_id: 's3', imei: '354822222222222', success: true, cost: 0.50, created_at: '2024-03-03 11:20' },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', user_id: 'u1', amount: 50.00, method: 'Credit Card', note: 'Topup', created_at: '2023-12-01' },
  { id: 'p2', user_id: 'u2', amount: 100.00, method: 'Crypto', note: 'USDT Transfer', created_at: '2024-01-15' },
  { id: 'p3', user_id: 'u3', amount: 500.00, method: 'Bank Transfer', note: 'Invoice #992', created_at: '2024-02-20' },
  { id: 'p4', user_id: 'u1', amount: 25.00, method: 'PayPal', note: 'Small refill', created_at: '2024-03-05' },
];

export const DAILY_STATS_DATA = [
  { name: 'Mon', calls: 40, cost: 24.5 },
  { name: 'Tue', calls: 30, cost: 18.2 },
  { name: 'Wed', calls: 20, cost: 9.0 },
  { name: 'Thu', calls: 27, cost: 39.0 },
  { name: 'Fri', calls: 18, cost: 48.0 },
  { name: 'Sat', calls: 23, cost: 38.0 },
  { name: 'Sun', calls: 34, cost: 43.0 },
];