import React from 'react';
import { useApp } from '../context';
import { Job, JobStatus, Role } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, ChevronRight } from 'lucide-react';

export const Schedule: React.FC = () => {
  const { jobs, users, currentUser, customers } = useApp();
  
  const isOwner = currentUser.role === Role.OWNER;
  const today = new Date().toISOString().split('T')[0];

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.SCHEDULED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case JobStatus.EN_ROUTE: return 'bg-orange-100 text-orange-700 border-orange-200';
      case JobStatus.ON_SITE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case JobStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case JobStatus.INVOICED: return 'bg-purple-100 text-purple-700 border-purple-200';
      case JobStatus.PAID: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const JobCard: React.FC<{ job: Job }> = ({ job }) => {
    const customer = customers.find(c => c.id === job.customerId);
    const tech = users.find(u => u.id === job.techId);

    return (
      <Link to={`/jobs/${job.id}`} className="block bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-3">
        <div className="flex justify-between items-start mb-2">
           <span className={`text-xs font-bold px-2 py-1 rounded border ${getStatusColor(job.status)}`}>
             {job.status.replace('_', ' ')}
           </span>
           <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
             <Clock size={12} /> {job.timeWindowStart} - {job.timeWindowEnd}
           </span>
        </div>
        <h3 className="font-bold text-slate-900">{customer?.name}</h3>
        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
          <MapPin size={14} />
          <span className="truncate">{customer?.address}</span>
        </div>
        <p className="text-sm text-slate-600 mt-2 line-clamp-1">{job.description}</p>
        {isOwner && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        <img src={tech?.avatar} alt={tech?.name} />
                    </div>
                    <span className="text-xs text-slate-600">{tech?.name}</span>
                </div>
            </div>
        )}
      </Link>
    );
  };

  if (!isOwner) {
      // Tech View: Simple List for Today
      const myJobs = jobs.filter(j => j.techId === currentUser.id).sort((a,b) => a.timeWindowStart.localeCompare(b.timeWindowStart));
      
      return (
          <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Today's Route</h1>
              {myJobs.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                      <p className="text-slate-500">No jobs assigned for today.</p>
                  </div>
              ) : (
                  myJobs.map(job => <JobCard key={job.id} job={job} />)
              )}
          </div>
      );
  }

  // Owner View: Columns per Tech
  const techs = users.filter(u => u.role === Role.TECHNICIAN);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dispatch Board</h1>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200">
           <span>{today}</span>
           <Clock size={16} />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[800px] h-full">
            {/* Unassigned Column (Simplified) */}
            <div className="w-72 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-xl border border-dashed border-slate-300">
                 <div className="p-3 border-b border-slate-200/50 bg-slate-100 rounded-t-xl font-semibold text-slate-600 text-center">
                    Unassigned
                 </div>
                 <div className="p-3">
                     <div className="bg-white p-4 rounded border border-slate-200 text-center text-slate-400 text-sm">
                         Drag jobs here (Demo)
                     </div>
                 </div>
            </div>

            {/* Tech Columns */}
            {techs.map(tech => {
                const techJobs = jobs.filter(j => j.techId === tech.id && j.date === today).sort((a,b) => a.timeWindowStart.localeCompare(b.timeWindowStart));
                return (
                    <div key={tech.id} className="w-80 flex-shrink-0 flex flex-col bg-slate-100 rounded-xl border border-slate-200">
                        <div className="p-3 border-b border-slate-200 bg-white rounded-t-xl flex items-center gap-3">
                            <img src={tech.avatar} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-slate-800">{tech.name}</span>
                            <span className="ml-auto bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{techJobs.length} Jobs</span>
                        </div>
                        <div className="p-3 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
                            {techJobs.map(job => <JobCard key={job.id} job={job} />)}
                            {techJobs.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm">No jobs today</div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};