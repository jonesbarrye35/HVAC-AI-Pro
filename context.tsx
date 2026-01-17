import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Job, JobStatus, Invoice, User, Role, AppContextType } from './types';
import { MOCK_USERS, MOCK_CUSTOMERS, MOCK_JOBS, MOCK_EQUIPMENT, MOCK_INVOICES } from './data';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Owner
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Derived state for pending uploads
  const pendingSyncCount = invoices.filter(i => i.isOffline).length;

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
        window.removeEventListener('online', handleStatusChange);
        window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Mock Sync Logic: When online and there are offline items, simulate a sync process
  useEffect(() => {
      if (isOnline && pendingSyncCount > 0) {
          console.log(`Syncing ${pendingSyncCount} items...`);
          const timer = setTimeout(() => {
              setInvoices(prev => prev.map(i => ({ ...i, isOffline: false })));
              console.log('Sync complete');
          }, 2000); // 2 second delay to simulate network request
          return () => clearTimeout(timer);
      }
  }, [isOnline, pendingSyncCount]);

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const addJob = (job: Job) => {
    setJobs(prev => [...prev, job]);
  };

  const createInvoice = (invoice: Invoice) => {
    // If offline, mark as offline draft
    const newInvoice = { 
        ...invoice, 
        isOffline: !isOnline,
        status: !isOnline ? 'DRAFT' as const : invoice.status 
    };
    setInvoices(prev => [...prev, newInvoice]);
    
    // Also update job status if needed
    updateJobStatus(invoice.jobId, JobStatus.INVOICED);
  };

  const updateInvoiceStatus = (invoiceId: string, status: 'PAID' | 'SENT') => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status } : i));
    if (status === 'PAID') {
        const inv = invoices.find(i => i.id === invoiceId);
        if (inv) updateJobStatus(inv.jobId, JobStatus.PAID);
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    users: MOCK_USERS,
    customers: MOCK_CUSTOMERS,
    equipment: MOCK_EQUIPMENT,
    jobs,
    invoices,
    updateJobStatus,
    addJob,
    createInvoice,
    updateInvoiceStatus,
    isOnline,
    pendingSyncCount
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
