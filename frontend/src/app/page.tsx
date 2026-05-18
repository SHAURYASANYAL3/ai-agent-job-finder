"use client";

import { useState } from "react";
import { Upload, Briefcase, TrendingUp, Sparkles, Code, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard, BrutalCardContent, BrutalCardHeader } from "@/components/ui/BrutalCard";
import { BrutalBadge } from "@/components/ui/BrutalBadge";

export default function Home() {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "extracting" | "detecting_industry" | "analyzing_skills" | "calculating_ats" | "matching" | "finalizing" | "done">("idle");
  const [parsedData, setParsedData] = useState<any>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploadState("uploading");
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/resume/upload?user_id=1", {
        method: "POST",
        body: formData,
      });
      
      setUploadState("extracting");
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setParsedData(data.parsed_data);
      
      // Save rich analysis to local storage for the dashboard
      localStorage.setItem("resume_analysis", JSON.stringify(data.parsed_data));
      
      // Simulate the deep processing stages for visual impact
      setTimeout(() => setUploadState("detecting_industry"), 600);
      setTimeout(() => setUploadState("analyzing_skills"), 1200);
      setTimeout(() => setUploadState("calculating_ats"), 1800);
      setTimeout(() => setUploadState("matching"), 2400);
      setTimeout(() => setUploadState("finalizing"), 3000);
      setTimeout(() => setUploadState("done"), 3600);
      
    } catch (error) {
      console.error("Error uploading resume:", error);
      setUploadState("idle");
      alert("Failed to process resume. Please ensure the backend is running.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] } });

  const getStatusText = () => {
    switch (uploadState) {
      case "uploading": return "Uploading securely...";
      case "extracting": return "Extracting raw text & semantics...";
      case "detecting_industry": return "Identifying Industry Domain...";
      case "analyzing_skills": return "Analyzing Skill Gaps & Weaknesses...";
      case "calculating_ats": return "Calculating ATS Compatibility Score...";
      case "matching": return "Cross-referencing Global Job Market...";
      case "finalizing": return "Generating Actionable Career Advice...";
      default: return "Upload Resume";
    }
  };

  return (
    <main className="min-h-screen bg-neo-bg bg-grid-pattern relative overflow-hidden flex flex-col">
      {/* Navbar */}
      <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neo-accent border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000] rotate-3">
              <Sparkles className="w-6 h-6 text-white stroke-[3px]" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">AI Career<br/>Agent</span>
          </div>
          <div className="hidden md:flex gap-8 text-lg font-bold uppercase items-center">
            <Link href="/dashboard" className="hover:text-neo-accent hover:underline decoration-4 underline-offset-4 transition-colors">Jobs</Link>
            <a href="#insights" className="hover:text-neo-secondary hover:underline decoration-4 underline-offset-4 transition-colors">Insights</a>
            <button 
              onClick={() => alert("🚨 Upload your resume first!\n\nOur AI needs to analyze your skills before giving you personalized learning recommendations and course links.")} 
              className="hover:text-neo-muted hover:underline decoration-4 underline-offset-4 transition-colors uppercase font-bold text-lg"
            >
              Learning
            </button>
          </div>
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <BrutalButton variant="white" size="sm">
              Dashboard
            </BrutalButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto w-full px-6 py-20 flex-grow relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Copy */}
        <div className="flex-1 text-center lg:text-left relative">
          <BrutalBadge variant="secondary" rotate="left" className="absolute -top-10 left-10 text-xl px-4 py-2">
            No More Rejections!
          </BrutalBadge>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
            <span className="text-stroke block">Hack Your</span>
            <span className="bg-neo-accent text-white px-2 mt-2 inline-block border-4 border-black shadow-[8px_8px_0px_0px_#000] rotate-1">Career Path</span>
          </h1>
          
          <p className="text-2xl font-bold mb-10 max-w-2xl bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            Upload your resume. Let our unapologetic AI tear it apart, find your perfect matching roles, and give you the raw truth on how to get hired.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
             <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-black bg-neo-muted flex items-center justify-center font-bold text-xl shadow-[4px_4px_0px_0px_#000] overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=C4B5FD`} alt="avatar" />
                  </div>
                ))}
             </div>
             <span className="font-bold text-lg">Join 10,000+ Hackers</span>
          </div>
        </div>

        {/* Right: Dropzone */}
        <div className="flex-1 w-full max-w-lg">
          {uploadState !== "done" ? (
            <div 
              {...getRootProps()} 
              className={`
                bg-white border-8 border-black p-12 text-center cursor-pointer transition-all duration-100 relative
                shadow-[16px_16px_0px_0px_#000]
                ${isDragActive ? "bg-neo-secondary -translate-y-2 shadow-[20px_20px_0px_0px_#000]" : "hover:-translate-y-1 hover:shadow-[20px_20px_0px_0px_#000]"}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="absolute -top-6 -right-6">
                 <BrutalBadge variant="primary" rotate="right" className="text-lg py-2">
                   DROP IT LIKE IT'S HOT
                 </BrutalBadge>
              </div>

              <div className="w-24 h-24 mx-auto bg-neo-muted border-4 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center mb-8 rotate-3">
                {uploadState !== "idle" ? (
                  <TrendingUp className="w-12 h-12 stroke-[3px] animate-bounce" />
                ) : (
                  <FileText className="w-12 h-12 stroke-[3px]" />
                )}
              </div>
              <h3 className="text-4xl font-black uppercase mb-4 leading-none">
                {getStatusText()}
              </h3>
              <p className="font-bold text-xl bg-neo-secondary border-2 border-black inline-block px-4 py-1 mt-4">
                {uploadState !== "idle" ? "Hold tight, hacking the mainframe." : "PDF or TXT"}
              </p>
            </div>
          ) : (
            <BrutalCard className="bg-neo-secondary p-10 text-center">
               <div className="w-24 h-24 mx-auto bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center mb-8 -rotate-3">
                 <CheckCircle2 className="w-12 h-12 stroke-[4px] text-neo-ink" />
               </div>
               <h3 className="text-4xl font-black uppercase mb-2">Analysis Done!</h3>
               <p className="font-bold text-lg mb-6 bg-white border-2 border-black p-2">Found {parsedData?.skills?.length || 0} skills.</p>
               
               <div className="flex flex-col gap-4">
                 <Link href="/dashboard" className="w-full">
                   <BrutalButton variant="primary" className="w-full text-xl h-16">
                     Show My Matches <ArrowRight className="ml-2 stroke-[3px]" />
                   </BrutalButton>
                 </Link>
                 <BrutalButton variant="white" className="w-full h-16" onClick={() => setUploadState("idle")}>
                   Upload Different Resume
                 </BrutalButton>
               </div>
            </BrutalCard>
          )}
        </div>
      </div>

      {/* Feature Cards Marquee / Grid */}
      <div id="insights" className="border-y-4 border-black bg-white overflow-hidden py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Briefcase, title: "Smart Matching", color: "bg-neo-accent" },
            { icon: Code, title: "Skill Gap Analysis", color: "bg-neo-secondary" },
            { icon: TrendingUp, title: "Interview Prep", color: "bg-neo-muted" }
          ].map((feature, i) => (
            <BrutalCard key={i} className="p-8">
              <div className={`w-16 h-16 ${feature.color} border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-6 -rotate-2`}>
                <feature.icon className="w-8 h-8 stroke-[3px]" />
              </div>
              <h4 className="text-3xl font-black uppercase mb-4 leading-tight">{feature.title}</h4>
              <p className="font-bold text-lg">We don't just match keywords. We analyze your true skill alignment with hardcore precision.</p>
            </BrutalCard>
          ))}
        </div>
      </div>
    </main>
  );
}
