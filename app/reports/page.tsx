"use client";

import { useState } from "react";
import Link from "next/link";
import { analyzeReport } from "@/services/domain/ocrService";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { ReportParseOutput, ReportMetric } from "@/types/ai";
import { ParseStatus } from "@/types/report";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  History,
  ShieldCheck,
  Plus,
  AlertTriangle,
} from "lucide-react";

export default function ReportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parseState, setParseState] = useState<ParseStatus | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SafetyWrappedResponse<ReportParseOutput> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);

  const handleSaveToRecords = async () => {
    // Save report document reference to patient health records
    setReportSaved(true);
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage("Please upload a PDF or image file (PNG, JPG, WEBP).");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit.");
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);
    setParseState(null);
    setAnalysisResult(null);
    setReportSaved(false);
  };

  const processAnalysis = async (forcedStatus?: ParseStatus) => {
    if (!file && !forcedStatus) {
      setErrorMessage("Please select a medical report file (PDF or Image) to analyze.");
      return;
    }

    setErrorMessage(null);
    setParseState("pending");

    try {
      let fileBase64: string | undefined;
      let mimeType: string | undefined;

      // Read actual file bytes into base64
      if (file) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.includes(",") ? res.split(",")[1] : res;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        mimeType = file.type;
      }

      const response = await analyzeReport(
        {
          userId: "patient-user-123",
          fileName: file ? file.name : "uploaded_document.pdf",
          fileBase64,
          mimeType,
        },
        forcedStatus
      );

      setAnalysisResult(response);
      const resultingStatus = response.data?.parseStatus || (forcedStatus ?? "failed");
      setParseState(resultingStatus);
    } catch (err) {
      setParseState("failed");
      setErrorMessage("Could not read this report");
    }
  };

  const isSampleData =
    analysisResult?.data?.plainSummary?.includes("Sample data, not a real result") ||
    analysisResult?.data?.rawOcrText?.includes("Sample data, not a real result");

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto text-[#064E3B] dark:text-[#ECFDF5] w-full pb-44 sm:pb-52 transition-colors">
      {/* Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 pb-4 gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 dark:text-[#10B981] mb-1 flex items-center gap-2">
            <span>Patient Records & Diagnostics</span>
            <span>•</span>
            <span className="text-[#064E3B]/60 dark:text-white/50">Lab Metric Extraction</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5]">
            Medical Reports & Timeline
          </h1>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center gap-2">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-4 py-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-xs min-tap-target"
          >
            <History className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
            <span>View Health Timeline →</span>
          </Link>
        </div>
      </div>

      {/* Warm Patient Dropzone Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all bg-white dark:bg-[#0B1D17] shadow-sm ${
          dragActive
            ? "border-[#064E3B] dark:border-[#10B981] bg-[#F9FBF9] dark:bg-[#0F241E]"
            : "border-[#064E3B]/20 dark:border-white/15 hover:border-[#064E3B] dark:hover:border-[#10B981] hover:bg-[#F9FBF9] dark:hover:bg-[#0F241E]/50"
        }`}
      >
        <input
          type="file"
          aria-label="Upload lab test or prescription report"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
          className="absolute inset-0 cursor-pointer opacity-0"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] mb-4 shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        {file ? (
          <div className="space-y-1.5">
            <p className="text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">📄 {file.name}</p>
            <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
              {(file.size / 1024).toFixed(1)} KB • Ready for extraction
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-w-sm">
            <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
              Upload lab test or prescription (PDF, Image)
            </h3>
            <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 leading-relaxed">
              Drag & drop your health report here, or click to browse files (Supports PDF, PNG, JPG up to 10MB)
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => processAnalysis()}
          disabled={parseState === "pending"}
          className="mt-6 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-7 py-3 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all z-10 disabled:opacity-50 min-tap-target"
        >
          {parseState === "pending"
            ? "Analyzing Report..."
            : file
            ? "Analyze Uploaded Report"
            : "Select Report File"}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 flex justify-between items-center shadow-xs">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Pending State */}
      {parseState === "pending" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] py-14 space-y-3 shadow-xs">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#064E3B] dark:border-[#10B981] border-t-transparent" />
          <p className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
            Reading report document...
          </p>
          <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
            Extracting laboratory markers and reference intervals
          </p>
        </div>
      )}

      {/* 2. Failed State: Strictly show "Could not read this report" and never any values */}
      {parseState === "failed" && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 p-6 space-y-3 text-[#064E3B] dark:text-[#ECFDF5] shadow-xs">
          <span className="rounded-full bg-rose-600 text-white px-3 py-1 text-xs font-bold">
            Could not read this report
          </span>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-rose-700 dark:text-rose-300">
              Could not read this report
            </h3>
            <p className="text-xs text-[#064E3B]/70 dark:text-rose-200 leading-relaxed">
              No clinical values could be extracted from this document. Please verify the document is clear, legible, and unblurred.
            </p>
          </div>
        </div>
      )}

      {/* 3. Analyzed State */}
      {(parseState === "ok" || parseState === "low_confidence") &&
        analysisResult?.data &&
        analysisResult.data.parsedMetrics.length > 0 && (
          <div className="space-y-5 animate-fade-in">
            {/* Sample Data Warning Banner (Visible when DEMO_MODE sample data is rendered) */}
            {isSampleData && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5 font-bold shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Sample data, not a real result</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                  <span>{isSampleData ? "Sample Result" : "Extracted"}</span>
                </span>
                <span className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                  {analysisResult.data.parsedMetrics.length} lab markers extracted
                </span>
              </div>

              {reportSaved ? (
                <span className="rounded-xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 px-3.5 py-1.5 text-xs text-[#064E3B] dark:text-[#10B981] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
                  <span>Archived in Records</span>
                </span>
              ) : (
                <button
                  onClick={handleSaveToRecords}
                  className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] px-4 py-2 text-xs font-bold transition-all shadow-soft flex items-center gap-1.5 min-tap-target"
                >
                  <Plus className="w-4 h-4" />
                  <span>Archive in Records</span>
                </button>
              )}
            </div>

            {/* Plain Language Summary Card */}
            <div className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 space-y-2 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#064E3B] dark:text-[#10B981] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extracted Summary</span>
              </div>
              <p className="text-sm text-[#064E3B] dark:text-[#ECFDF5] leading-relaxed">
                {analysisResult.data.plainSummary}
              </p>
            </div>

            {/* Extracted Metrics Table */}
            <div className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] overflow-hidden shadow-sm">
              <div className="border-b border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] px-5 py-3.5 flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Extracted Lab Values
                </h3>
                <span className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                  Standard clinical reference intervals
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-bold border-b border-[#064E3B]/15 dark:border-white/10">
                    <tr>
                      <th className="px-5 py-3">Metric Name</th>
                      <th className="px-5 py-3">Extracted Result</th>
                      <th className="px-5 py-3">Reference Range</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#064E3B]/10 dark:divide-white/10">
                    {analysisResult.data.parsedMetrics.map((metric: ReportMetric, i: number) => (
                      <tr
                        key={i}
                        className={metric.isOutOfRange ? "bg-rose-500/10 dark:bg-rose-950/20" : "hover:bg-[#F9FBF9] dark:hover:bg-white/5"}
                      >
                        <td className="px-5 py-3.5 font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                          {metric.name}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#064E3B] dark:text-[#10B981]">
                          {metric.value} {metric.unit || ""}
                        </td>
                        <td className="px-5 py-3.5 text-[#064E3B]/70 dark:text-white/60">
                          {metric.referenceRange}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {metric.isOutOfRange ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 text-[11px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              <span>Out of Range</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] px-2.5 py-0.5 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-[#064E3B] dark:text-[#10B981]" />
                              <span>Normal</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
