import React from 'react';
import { useApp } from '../context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, CheckCircle, Clock, Activity } from 'lucide-react';
import { Role } from '../types';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend && <p className="text-xs text-green-600 mt-4 font-medium">{trend}</p>}
  </div>
);

export const Dashboard: React.FC = () => {
  const { jobs, invoices, currentUser } = useApp();

  // If technician, redirect (handled in Layout usually, but for safety)
  if (currentUser.role === Role.TECHNICIAN) {
     return (
       <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {currentUser.name.split(' ')[0]}</h1>
            <span className="text-sm text-slate-500">{new Date().toLocaleDateString()}</span>
         </div>
         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-blue-800 font-medium">You have {jobs.filter(j => j.techId === currentUser.id && j.status !== 'COMPLETED' && j.status !== 'PAID').length} active jobs today.</p>
         </div>
         <Link to="/schedule" className="block w-full bg-brand-600 text-white text-center py-4 rounded-xl font-bold text-lg shadow-md hover:bg-brand-700">
            View Today's Route
         </Link>
       </div>
     );
  }

  // Calculate Metrics
  const today = new Date().toISOString().split('T')[0];
  const todaysJobs = jobs.filter(j => j.date === today);
  const revenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'PAID').length;

  const data = [
    { name: 'Mon', amt: 2400 },
    { name: 'Tue', amt: 1398 },
    { name: 'Wed', amt: 9800 },
    { name: 'Thu', amt: 3908 },
    { name: 'Fri', amt: 4800 },
    { name: 'Sat', amt: 3800 },
    { name: 'Sun', amt: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
          <p className="text-slate-500">Overview of your business performance</p>
        </div>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition shadow-sm">
          + New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
          trend="+12% from last week"
        />
        <StatCard 
          title="Jobs Completed" 
          value={completedJobs} 
          icon={CheckCircle} 
          color="bg-blue-500"
          trend="+4 new today" 
        />
        <StatCard 
          title="Scheduled Today" 
          value={todaysJobs.length} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Active Techs" 
          value="2" 
          icon={Activity} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="amt" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Today's Activity</h2>
          <div className="space-y-4">
             {todaysJobs.length === 0 ? (
                 <p className="text-slate-400 text-sm">No jobs scheduled for today.</p>
             ) : (
                 todaysJobs.map(job => (
                     <div key={job.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                         <div className={`w-2 h-2 mt-2 rounded-full ${job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'}`} />
                         <div>
                             <p className="text-sm font-medium text-slate-900">{job.type} - {job.timeWindowStart}</p>
                             <p className="text-xs text-slate-500">Tech: {job.techId === 'u2' ? 'Sarah' : 'Dave'}</p>
                         </div>
                         <span className="ml-auto text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{job.status}</span>
                     </div>
                 ))
             )}
          </div>
          <Link to="/schedule" className="block mt-6 text-center text-sm text-brand-600 font-medium hover:underline">View Full Schedule</Link>
        </div>
      </div>
    </div>
  );
};
