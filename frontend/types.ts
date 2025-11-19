import React from 'react';

export interface DeviceRecord {
  id: string;
  user_id: string;
  imei: string;
  serial: string;
  note: string;
  created_at: string;
}

export interface APIUsage {
  id: string;
  user_id: string;
  service_id: string;
  imei: string;
  success: boolean;
  cost: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  method: 'Credit Card' | 'PayPal' | 'Crypto' | 'Bank Transfer';
  note: string;
  created_at: string;
}

export interface User {
  id: string;
  telegram_id: string;
  username: string;
  registered: boolean;
  free_calls: number;
  paid_calls: number;
  created_at: string;
  // In a real API these might be fetched separately, but for UI mocking we can keep them here or separate
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  api_url: string;
  api_key?: string;
  is_public: boolean;
  group: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}