import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { JobStatus, Role, PaymentMethod } from '../types';
import { Phone, MapPin, Navigation, MessageSquare, Camera, CreditCard, CheckCircle, FileText, ChevronLeft, Plus, Trash2, WifiOff, CloudUpload } from 'lucide-react';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, customers, equipment, updateJobStatus, currentUser, invoices, createInvoice, updateInvoiceStatus, isOnline } = useApp();
  
  const job = jobs.find(j => j.id === id);
  const customer = customers.find(c => c.id === job?.customerId);
  const jobEquipment = equipment.filter(e => e.customerId === customer?.id);
  const existingInvoice = invoices.find(i => i.jobId === job?.id);

  const [activeTab, setActiveTab] = useState<'INFO' | 'EQUIPMENT' | 'INVOICE'>('INFO');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [estimateItems, setEstimateItems] = useState<{name: string, price: number, qty: number}[]>([
      { name: 'Service Call Fee', price: 89, qty: 1 }
  ]);

  if (!job || !customer) return <div>Job not found</div>;

  const isTech = currentUser.role === Role.TECHNICIAN;

  const handleStatusChange = (newStatus: JobStatus) => {
    updateJobStatus(job.id, newStatus);
  };

  const handleAddItem = () => {
    setEstimateItems([...estimateItems, { name: 'New Item', price: 0, qty: 1 }]);
  };

  const handleCreateInvoice = () => {
    const subtotal = estimateItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    createInvoice({
        id: `inv-${Date.now()}`,
        jobId: job.id,
        items: estimateItems.map((i, idx) => ({ id: `${idx}`, name: i.name, quantity: i.qty, unitPrice: i.price, total: i.price * i.qty })),
        subtotal,
        tax,
        total,
        status: isOnline ? 'SENT' : 'DRAFT' 
    });
    setActiveTab('INVOICE');
  };

  const handlePayment = (method: PaymentMethod) => {
    if (existingInvoice) {
        updateInvoiceStatus(existingInvoice.id, 'PAID');
        setShowPaymentModal(false);
    }
  };

  const StatusButton = ({ status, label, currentStatus, onClick }: any) => {
      const isActive = currentStatus === status;
      const isPast = [JobStatus.COMPLETED, JobStatus.INVOICED, JobStatus.PAID].includes(currentStatus) && status !== currentStatus;
      
      return (
          <button 
            onClick={onClick}
            disabled={isPast}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors border-2
                ${isActive ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300'}
                ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
              {label}
          </button>
      )
  }

  // Helper to determine payment button state
  const isPaymentDisabled = !existingInvoice || existingInvoice.isOffline || !isOnline;
  
  const getPaymentButtonContent = () => {
      if (existingInvoice?.isOffline) {
          return <><WifiOff size={18} /> Sync Draft to Pay</>;
      }
      if (!isOnline) {
          return <><WifiOff size={18} /> Offline - Cannot Pay</>;
      }
      return <><CreditCard size={20} /> Collect Payment</>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                <ChevronLeft size={24} className="text-slate-600"/>
            </button>
            <h1 className="text-xl font-bold text-slate-900">Job #{job.id}</h1>
            <span className="ml-auto text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-700">{job.status}</span>
        </div>

        {/* Offline Banner in Job context */}
        {!isOnline && (
            <div className="bg-slate-800 text-white text-sm p-3 rounded-lg flex items-center gap-2 shadow-sm">
                <WifiOff size={16} className="text-slate-400"/>
                <span>Offline Mode: Changes saved to device.</span>
            </div>
        )}

        {/* Status Stepper (Tech Only) */}
        {isTech && job.status !== JobStatus.PAID && (
            <div className="flex gap-2 overflow-x-auto pb-2">
                <StatusButton status={JobStatus.EN_ROUTE} label="En Route" currentStatus={job.status} onClick={() => handleStatusChange(JobStatus.EN_ROUTE)} />
                <StatusButton status={JobStatus.ON_SITE} label="On Site" currentStatus={job.status} onClick={() => handleStatusChange(JobStatus.ON_SITE)} />
                <StatusButton status={JobStatus.COMPLETED} label="Complete" currentStatus={job.status} onClick={() => handleStatusChange(JobStatus.COMPLETED)} />
            </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
                {['INFO', 'EQUIPMENT', 'INVOICE'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="p-6 min-h-[400px]">
                {activeTab === 'INFO' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Customer</h3>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{customer.name}</p>
                                    <p className="text-slate-600 flex items-center gap-1 mt-1">
                                        <MapPin size={16} /> {customer.address}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <a href={`tel:${customer.phone}`} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"><Phone size={20} /></a>
                                    <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"><MessageSquare size={20} /></button>
                                </div>
                            </div>
                            <button className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50">
                                <Navigation size={18} /> Navigate to Location
                            </button>
                        </div>

                        <div>
                             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Job Details</h3>
                             <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-slate-800 font-medium mb-1">{job.type}</p>
                                <p className="text-slate-600 text-sm">{job.description}</p>
                                {job.notes && <p className="text-slate-500 text-sm mt-2 italic">"{job.notes}"</p>}
                             </div>
                        </div>

                        {customer.notes && (
                            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex gap-3">
                                <div className="text-yellow-600 mt-0.5"><FileText size={18}/></div>
                                <p className="text-sm text-yellow-800"><span className="font-bold">Note:</span> {customer.notes}</p>
                            </div>
                        )}
                        
                        {isTech && (
                             <button className="w-full py-3 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2">
                                 <Camera size={18} /> Take Photos
                             </button>
                        )}
                    </div>
                )}

                {activeTab === 'EQUIPMENT' && (
                    <div className="space-y-4">
                        {jobEquipment.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No equipment on file.</p>
                        ) : (
                            jobEquipment.map(eq => (
                                <div key={eq.id} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-slate-900">{eq.brand} {eq.type}</h4>
                                        <span className="text-xs text-slate-400">Inst: {eq.installDate}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">Model: {eq.model}</p>
                                    <p className="text-sm text-slate-600">Serial: {eq.serial}</p>
                                    <div className="mt-3 flex gap-2">
                                        <button className="text-xs bg-slate-100 px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700">View History</button>
                                    </div>
                                </div>
                            ))
                        )}
                        {isTech && <button className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50">+ Add Equipment</button>}
                    </div>
                )}

                {activeTab === 'INVOICE' && (
                    <div className="space-y-6">
                        {!existingInvoice ? (
                            <>
                                <div className="space-y-3">
                                    {estimateItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input 
                                                className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm" 
                                                value={item.name} 
                                                onChange={(e) => {
                                                    const newItems = [...estimateItems];
                                                    newItems[idx].name = e.target.value;
                                                    setEstimateItems(newItems);
                                                }}
                                            />
                                            <input 
                                                type="number"
                                                className="w-20 border border-slate-300 rounded px-3 py-2 text-sm" 
                                                value={item.price} 
                                                onChange={(e) => {
                                                    const newItems = [...estimateItems];
                                                    newItems[idx].price = Number(e.target.value);
                                                    setEstimateItems(newItems);
                                                }}
                                            />
                                            <button 
                                                onClick={() => setEstimateItems(estimateItems.filter((_, i) => i !== idx))}
                                                className="p-2 text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddItem} className="text-sm text-brand-600 flex items-center gap-1 font-medium"><Plus size={16}/> Add Line Item</button>
                                </div>

                                <div className="border-t border-slate-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span>${estimateItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tax (8%)</span>
                                        <span>${(estimateItems.reduce((acc, i) => acc + (i.price * i.qty), 0) * 0.08).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2">
                                        <span>Total</span>
                                        <span>${(estimateItems.reduce((acc, i) => acc + (i.price * i.qty), 0) * 1.08).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCreateInvoice}
                                    className={`w-full text-white py-3 rounded-lg font-bold shadow-md mt-4 flex items-center justify-center gap-2
                                        ${isOnline ? 'bg-brand-600 hover:bg-brand-700' : 'bg-orange-600 hover:bg-orange-700'}
                                    `}
                                >
                                    {isOnline ? 'Review & Create Invoice' : <><WifiOff size={18}/> Save Draft (Offline)</>}
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${existingInvoice.isOffline ? 'bg-orange-50 text-orange-800' : 'bg-green-50 text-green-800'}`}>
                                    {existingInvoice.isOffline ? <CloudUpload size={32} /> : <CheckCircle size={32} />}
                                    <span className="font-bold text-lg">{existingInvoice.isOffline ? 'Draft Saved Locally' : 'Invoice Created'}</span>
                                    <span className="text-2xl font-bold">${existingInvoice.total.toFixed(2)}</span>
                                    {existingInvoice.isOffline && <span className="text-xs">Will sync when online</span>}
                                </div>

                                {existingInvoice.status === 'PAID' ? (
                                    <div className="bg-slate-100 p-4 rounded text-slate-500 font-medium">
                                        PAID via {existingInvoice.paymentMethod}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowPaymentModal(true)}
                                        disabled={isPaymentDisabled}
                                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors
                                            ${isPaymentDisabled 
                                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'}
                                        `}
                                    >
                                        {getPaymentButtonContent()}
                                    </button>
                                )}
                                <div className="flex gap-2">
                                    <button disabled={existingInvoice.isOffline} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 disabled:opacity-50">Email</button>
                                    <button disabled={existingInvoice.isOffline} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 disabled:opacity-50">SMS Link</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Payment Modal (Mock Stripe) */}
        {showPaymentModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold">Collect Payment</h2>
                    <p className="text-slate-500">Total Due: <span className="text-slate-900 font-bold">${existingInvoice?.total.toFixed(2)}</span></p>
                    
                    <div className="space-y-3 mt-4">
                         <div className="border p-3 rounded flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                             <div className="w-4 h-4 rounded-full border border-slate-400 bg-brand-600"></div>
                             <span>Credit Card (Stripe)</span>
                             <div className="ml-auto flex gap-1">
                                 <div className="w-8 h-5 bg-slate-200 rounded"></div>
                                 <div className="w-8 h-5 bg-slate-200 rounded"></div>
                             </div>
                         </div>
                         <input placeholder="Card Number" className="w-full border p-3 rounded" disabled value="4242 4242 4242 4242" />
                         <div className="flex gap-3">
                             <input placeholder="MM/YY" className="w-1/2 border p-3 rounded" disabled value="12/25" />
                             <input placeholder="CVC" className="w-1/2 border p-3 rounded" disabled value="123" />
                         </div>
                    </div>

                    <button 
                        onClick={() => handlePayment(PaymentMethod.CARD)}
                        className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 mt-2"
                    >
                        Pay ${existingInvoice?.total.toFixed(2)}
                    </button>
                    <button onClick={() => setShowPaymentModal(false)} className="w-full py-2 text-slate-500">Cancel</button>
                </div>
            </div>
        )}
    </div>
  );
};