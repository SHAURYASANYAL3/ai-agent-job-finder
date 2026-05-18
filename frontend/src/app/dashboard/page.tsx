"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import { BrutalCard, BrutalCardHeader, BrutalCardContent } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalBadge } from "@/components/ui/BrutalBadge";

type Recommendation = {
  job_id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  match_score: number;
  missing_skills: string[];
  matched_skills: string[];
  url: string;
  ai_advice: string;
};

export default function Dashboard() {
  const [jobs, setJobs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const savedAnalysis = localStorage.getItem("resume_analysis");
    if (savedAnalysis) {
      setAnalysis(JSON.parse(savedAnalysis));
    }
  }, []);

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const renderAdviceWithLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-neo-accent underline decoration-2 underline-offset-2 hover:bg-neo-accent hover:text-white transition-colors px-1"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  useEffect(() => {
    async function fetchJobs() {
      const savedAnalysis = localStorage.getItem("resume_analysis");
      if (!savedAnalysis) {
        setLoading(false);
        return;
      }
      
      const parsedProfile = JSON.parse(savedAnalysis);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/jobs/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: parsedProfile.industry,
            skills: parsedProfile.skills,
            yoe: parsedProfile.yoe,
            certifications: parsedProfile.certifications,
            scores: parsedProfile.scores
          })
        });
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-neo-bg bg-halftone py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header & Overall Score */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-black pb-8 bg-white p-8 shadow-[12px_12px_0px_0px_#000] relative">
          <BrutalBadge variant="primary" rotate="left" className="absolute -top-4 -left-4 text-xl">
            {analysis?.industry || "UNKNOWN INDUSTRY"}
          </BrutalBadge>
          
          <div className="mt-6 md:mt-0">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 text-stroke">
              Dashboard
            </h1>
            <p className="text-2xl font-bold bg-neo-secondary border-4 border-black inline-block px-4 py-2 rotate-1">
              Your brutal career insights.
            </p>
          </div>
          <div className="text-right mt-8 md:mt-0 border-4 border-black p-4 bg-neo-muted rotate-2 shadow-[6px_6px_0px_0px_#000]">
            <div className="text-lg font-bold uppercase mb-1">Overall ATS Score</div>
            <div className="text-6xl font-black leading-none">{analysis?.ats_score || 0}<span className="text-2xl">/100</span></div>
          </div>
        </header>

        {/* Detailed Breakdown Panel */}
        {analysis && (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <BrutalCard className="p-8">
              <h3 className="text-3xl font-black uppercase mb-6 bg-black text-white inline-block px-2">Applicant Profile</h3>
              <div className="space-y-4 font-bold text-lg">
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span>Name</span>
                  <span className="text-right text-neo-accent">{analysis.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span>Years of Experience</span>
                  <span className="text-right text-neo-accent">{analysis.yoe || 0} Years</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span>Top Skills Found</span>
                  <span className="text-right text-neo-accent">{analysis.skills?.length || 0} extracted</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span>Certifications</span>
                  <span className="text-right text-neo-accent">{analysis.certifications?.length || 0} found</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span>Major Projects</span>
                  <span className="text-right text-neo-accent">{analysis.projects?.length || 0} found</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-black uppercase mt-8 mb-4">Granular Scoring</h3>
              <div className="flex flex-wrap gap-2 text-sm font-bold">
                <span className="bg-neo-secondary px-3 py-1 border-2 border-black">Skill Strength: {analysis.scores?.skill_strength}%</span>
                <span className="bg-neo-secondary px-3 py-1 border-2 border-black">Experience Quality: {analysis.scores?.experience}%</span>
                <span className="bg-neo-secondary px-3 py-1 border-2 border-black">Project Relevance: {analysis.scores?.project_quality}%</span>
                <span className="bg-neo-secondary px-3 py-1 border-2 border-black">Certifications: {analysis.scores?.certification}%</span>
              </div>
            </BrutalCard>
            
            <BrutalCard className="p-8 bg-neo-accent text-white border-white">
              <h3 className="text-3xl font-black uppercase mb-6 bg-white text-black inline-block px-2 -rotate-1">How To Improve</h3>
              {analysis.suggestions?.length > 0 ? (
                <ul className="space-y-4 font-bold text-lg list-disc pl-5">
                  {analysis.suggestions.map((sug: string, i: number) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-bold text-xl">Your resume is flawless. Just apply!</p>
              )}
            </BrutalCard>
          </div>
        )}

        <h2 className="text-4xl font-black uppercase mb-10 flex items-center gap-4 bg-white border-4 border-black p-4 inline-flex shadow-[6px_6px_0px_0px_#000] -rotate-1">
          <Sparkles className="w-10 h-10 stroke-[3px] text-neo-accent" />
          Live Market Matches
        </h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-8 border-black border-t-neo-accent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Scraping Live Global Jobs...</h3>
          </div>
        ) : jobs.length === 0 ? (
           <BrutalCard className="p-12 text-center bg-neo-muted">
             <h3 className="text-3xl font-black uppercase mb-4">No Direct Matches Found</h3>
             <p className="text-xl font-bold">We scanned our live providers but couldn't find exact matches for your detected industry ({analysis?.industry}) based on the skills in your resume. Try expanding your resume content or check back tomorrow.</p>
           </BrutalCard>
        ) : (
          <div className="space-y-12">
            {jobs.map((job) => (
              <BrutalCard key={job.job_id} className="overflow-visible relative">
                <BrutalBadge 
                   variant={job.match_score >= 80 ? "primary" : job.match_score >= 60 ? "secondary" : "white"} 
                   rotate="right" 
                   className="absolute -top-6 -right-6 text-2xl py-2 px-4 z-10"
                >
                  {job.match_score}% MATCH
                </BrutalBadge>

                <div className="flex flex-col lg:flex-row">
                  {/* Left Column: Job Info */}
                  <div className="flex-1 p-8 lg:border-r-4 border-black">
                    <h3 className="text-4xl font-black uppercase tracking-tight mb-2">{job.title}</h3>
                    <div className="text-2xl font-bold text-neo-accent mb-6 uppercase">{job.company}</div>
                    
                    <div className="flex flex-wrap gap-4 text-lg font-bold uppercase mb-8">
                      <span className="bg-neo-bg border-4 border-black px-4 py-1 shadow-[4px_4px_0px_0px_#000]">{job.location}</span>
                      <span className="bg-white border-4 border-black px-4 py-1 shadow-[4px_4px_0px_0px_#000]">{job.salary}</span>
                    </div>

                    <div className="mb-8">
                      <div className="text-xl font-bold uppercase mb-3 bg-black text-white inline-block px-2 py-1 rotate-1">Matched Skills</div>
                      <div className="flex flex-wrap gap-3">
                        {job.matched_skills.map(s => (
                          <span key={s} className="flex items-center gap-2 text-base font-bold bg-[#A8E6CF] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                            <CheckCircle2 className="w-5 h-5 stroke-[3px]" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xl font-bold uppercase mb-3 bg-black text-white inline-block px-2 py-1 -rotate-1">Missing Skills</div>
                      <div className="flex flex-wrap gap-3">
                        {job.missing_skills.map(s => (
                          <span key={s} className="flex items-center gap-2 text-base font-bold bg-[#FF8B94] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                            <XCircle className="w-5 h-5 stroke-[3px]" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Guidance */}
                  <div className="flex-1 p-8 bg-neo-muted/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6 text-2xl font-black uppercase tracking-tight">
                        <BookOpen className="w-8 h-8 stroke-[3px]" />
                        How to get this job
                      </div>
                      <div className="font-bold text-lg whitespace-pre-wrap leading-relaxed bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] -rotate-1">
                        {renderAdviceWithLinks(job.ai_advice)}
                      </div>
                    </div>
                    
                    <div className="mt-10 flex flex-col sm:flex-row gap-6">
                      <BrutalButton 
                        variant="primary" 
                        className="flex-1 text-lg"
                        onClick={() => window.open(job.url, '_blank')}
                      >
                        Apply Now <ExternalLink className="w-5 h-5 ml-2 stroke-[3px]" />
                      </BrutalButton>
                      
                      <BrutalButton 
                        variant={savedJobs.includes(job.job_id) ? "secondary" : "white"} 
                        className="flex-1 text-lg"
                        onClick={() => toggleSaveJob(job.job_id)}
                      >
                        {savedJobs.includes(job.job_id) ? "Saved!" : "Save Job"}
                      </BrutalButton>
                    </div>
                  </div>
                </div>
              </BrutalCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
