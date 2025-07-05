"use client";

import JobForm from "@/_components/genericComponents/jobForm";

const AddJobPost = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20 animate-fade-in">
          <JobForm jobFormTitle="Post New Job" />
        </div>
      </div>
    </div>
  );
};

export default AddJobPost;
