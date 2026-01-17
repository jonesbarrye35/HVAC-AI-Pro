import { JobStatus, Role, User, Customer, Job, Equipment, Invoice, PaymentMethod } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Mike (Owner)', email: 'mike@hvacpro.com', role: Role.OWNER, avatar: 'https://i.pravatar.cc/150?u=mike' },
  { id: 'u2', name: 'Sarah Tech', email: 'sarah@hvacpro.com', role: Role.TECHNICIAN, phone: '555-0123', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'u3', name: 'Dave Tech', email: 'dave@hvacpro.com', role: Role.TECHNICIAN, phone: '555-0124', avatar: 'https://i.pravatar.cc/150?u=dave' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { 
    id: 'c1', 
    name: 'Alice Johnson', 
    address: '123 Maple Ave', 
    city: 'Springfield', 
    phone: '555-0100', 
    email: 'alice@example.com', 
    tags: ['VIP', 'Maintenance Plan'], 
    notes: 'Gate code 1234. Dog is friendly.' 
  },
  { 
    id: 'c2', 
    name: 'Bob Smith', 
    address: '456 Oak St', 
    city: 'Springfield', 
    phone: '555-0101', 
    email: 'bob@example.com', 
    tags: ['Warranty'], 
    notes: 'Unit is in the attic.' 
  },
  { 
    id: 'c3', 
    name: 'Carol White', 
    address: '789 Pine Ln', 
    city: 'Shelbyville', 
    phone: '555-0102', 
    email: 'carol@example.com', 
    tags: [], 
    notes: '' 
  },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'e1', customerId: 'c1', type: 'AC Unit', brand: 'Trane', model: 'XR14', serial: 'T12345678', installDate: '2020-05-15' },
  { id: 'e2', customerId: 'c1', type: 'Furnace', brand: 'Trane', model: 'S9V2', serial: 'F98765432', installDate: '2020-05-15' },
  { id: 'e3', customerId: 'c2', type: 'Heat Pump', brand: 'Carrier', model: 'Infinity 18', serial: 'C11223344', installDate: '2022-11-10' },
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    customerId: 'c1',
    techId: 'u2',
    date: today,
    timeWindowStart: '08:00',
    timeWindowEnd: '10:00',
    type: 'MAINTENANCE',
    status: JobStatus.SCHEDULED,
    description: 'Spring AC Tune-up',
    location: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'j2',
    customerId: 'c2',
    techId: 'u2',
    date: today,
    timeWindowStart: '10:30',
    timeWindowEnd: '12:30',
    type: 'REPAIR',
    status: JobStatus.SCHEDULED,
    description: 'No cooling, odd noise',
    location: { lat: 37.7849, lng: -122.4094 }
  },
  {
    id: 'j3',
    customerId: 'c3',
    techId: 'u3',
    date: today,
    timeWindowStart: '09:00',
    timeWindowEnd: '13:00',
    type: 'INSTALL',
    status: JobStatus.COMPLETED,
    description: 'New Mini-split install',
    location: { lat: 37.7649, lng: -122.4294 }
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    jobId: 'j3',
    items: [
      { id: 'li1', name: 'Mini Split System', quantity: 1, unitPrice: 1200, total: 1200 },
      { id: 'li2', name: 'Installation Labor', quantity: 4, unitPrice: 100, total: 400 }
    ],
    subtotal: 1600,
    tax: 128,
    total: 1728,
    status: 'PAID',
    paymentMethod: PaymentMethod.CARD
  }
];