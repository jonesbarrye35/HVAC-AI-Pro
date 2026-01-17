export enum Role {
  OWNER = 'OWNER',
  TECHNICIAN = 'TECHNICIAN'
}

export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  EN_ROUTE = 'EN_ROUTE',
  ON_SITE = 'ON_SITE',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
  PAID = 'PAID'
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  ONLINE = 'ONLINE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  tags: string[];
  notes: string;
}

export interface Equipment {
  id: string;
  customerId: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  installDate: string;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  jobId: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID';
  paymentMethod?: PaymentMethod;
  isOffline?: boolean;
}

export interface Job {
  id: string;
  customerId: string;
  techId: string;
  date: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  type: 'REPAIR' | 'MAINTENANCE' | 'INSTALL';
  status: JobStatus;
  description: string;
  notes?: string;
  location: { lat: number; lng: number }; // Mock geolocation
}

export interface AppState {
  currentUser: User;
  users: User[];
  customers: Customer[];
  jobs: Job[];
  equipment: Equipment[];
  invoices: Invoice[];
}

export interface AppContextType extends AppState {
  setCurrentUser: (user: User) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  addJob: (job: Job) => void;
  createInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (invoiceId: string, status: 'PAID' | 'SENT') => void;
  isOnline: boolean;
  pendingSyncCount: number;
}
