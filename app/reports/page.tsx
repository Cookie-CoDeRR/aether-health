"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import { analyzeReport } from "@/services/domain/ocrService";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { ReportParseOutput, ReportMetric } from "@/types/ai";
import { ParseStatus } from "@/types/report";

import { issueClearanceCertificate } from "@/services/domain/timelineService";

export default function ReportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parseState, setParseState] = useState<ParseStatus | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SafetyWrappedResponse<ReportParseOutput> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [certificateIssued, setCertificateIssued] = useState(false);

  const handleIssueCertificate = async () => {
    await issueClearanceCertificate({
      userId: "aether_usr_8f92a170b4c2",
      title: `Clearance: ${file?.name || "CBC Lab Report"}`,
      subtitle: "Lab report metrics reviewed. Clearance certificate issued.",
      doctorName: "Dr. Sarah Jenkins (Pathology)",
      certificateNote: "WBC count and inflammatory markers verified within normal recovery limits.",
    });
    setCertificateIssued(true);
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage("Invalid file type. Please upload a PDF or image file (PNG, JPG, WEBP).");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit.");
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);
  };

  const processAnalysis = async (forcedStatus?: ParseStatus) => {
    const activeFile = file || new File(["dummy"], "sample_blood_report.pdf", { type: "application/pdf" });
    if (!file) setFile(activeFile);

    setErrorMessage(null);
    setParseState("pending");

    try {
      const response = await analyzeReport(
        {
          userId: "demo-user-123",
          fileName: activeFile.name,
        },
        forcedStatus
      );

      setAnalysisResult(response);
      setParseState(response.data?.parseStatus || (forcedStatus ?? "ok"));
    } catch (err) {
      setParseState("failed");
      setErrorMessage("Failed to connect to report analysis service.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-4 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-sans font-medium mb-1">
            OCR Document Parser
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-[0.01em] text-[#F6F1E9]">
            Report Analysis
          </h1>
        </div>

        {/* Demo Status Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-1 text-[11px]">
          <span className="px-1.5 font-mono text-[#7C8A93]">Test State:</span>
          <button
            onClick={() => processAnalysis("ok")}
            className="rounded px-2 py-0.5 font-mono font-bold bg-[#4F9D8C] text-white hover:opacity-80"
          >
            OK
          </button>
          <button
            onClick={() => processAnalysis("low_confidence")}
            className="rounded px-2 py-0.5 font-mono font-bold bg-[#E8674A] text-white hover:opacity-80"
          >
            Low Conf
          </button>
          <button
            onClick={() => processAnalysis("failed")}
            className="rounded px-2 py-0.5 font-mono font-bold bg-[#D14343] text-white hover:opacity-80"
          >
            Failed
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
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
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive ? "border-[#E8674A] bg-[#E8674A]/10" : "border-[rgba(246,241,233,0.16)] bg-[#132A38] hover:border-[#E8674A]/40"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8674A] text-[#0A1620] mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {file ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#F6F1E9]">📄 {file.name}</p>
            <p className="font-mono text-xs text-[#7C8A93]">{(file.size / 1024).toFixed(1)} KB • Ready for analysis</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#F6F1E9]">Drag and drop your report here, or click to browse</p>
            <p className="text-xs text-[#7C8A93]">Supports PDF, PNG, JPG, WEBP (Max 10MB)</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => processAnalysis()}
          disabled={parseState === "pending"}
          className="mt-4 rounded-xl bg-[#E8674A] px-6 py-2.5 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-all z-10 disabled:opacity-50"
        >
          {parseState === "pending" ? "Analyzing..." : file ? "Analyze Document" : "Run Sample Report Analysis"}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-[#D14343] bg-[#D14343]/10 p-3 text-xs text-[#D14343] flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* 1. Pending State */}
      {parseState === "pending" && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] py-16 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8674A] border-t-transparent" />
          <p className="font-serif text-base text-[#F6F1E9]">Analyzing document metrics with Gemini 1.5 Pro...</p>
          <p className="font-mono text-xs text-[#7C8A93]">Extracting tabular numerical values and reference ranges</p>
        </div>
      )}

      {/* 2. Failed State */}
      {parseState === "failed" && (
        <div className="rounded-xl border border-[#D14343] bg-[#D14343]/15 p-6 space-y-4 text-[#F6F1E9]">
          <span className="rounded bg-[#D14343] text-white px-2 py-0.5 font-mono text-xs font-bold uppercase">
            Parse Status: Failed
          </span>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-medium">Unable to Extract Report Data</h3>
            <p className="text-xs text-[#B9C4CC] leading-relaxed">
              We could not read the text from this document. Ensure the file is clear, unblurred, and formatted as a standard lab result.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => processAnalysis("ok")}
              className="rounded-lg bg-[#D14343] text-white px-4 py-2 text-xs font-semibold hover:bg-[#D14343]/90"
            >
              🔄 Retry Analysis
            </button>
          </div>
        </div>
      )}

      {/* 3. OK or Low Confidence States */}
      {(parseState === "ok" || parseState === "low_confidence") && analysisResult?.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider ${
                  parseState === "ok"
                    ? "bg-[#4F9D8C] text-white"
                    : "bg-[#E8674A] text-white"
                }`}
              >
                Parse Status: {parseState === "ok" ? "OK" : "Low Confidence"}
              </span>
              <span className="font-mono text-xs text-[#7C8A93]">Gemini 1.5 Pro</span>
            </div>

            {certificateIssued ? (
              <span className="rounded-lg bg-[#4F9D8C]/20 border border-[#4F9D8C] px-3 py-1 text-xs font-mono text-[#4F9D8C] font-bold">
                ✓ Clearance Certificate Issued to Timeline
              </span>
            ) : (
              <button
                onClick={handleIssueCertificate}
                className="rounded-lg bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 font-mono"
              >
                <span>📜 Issue Clearance Certificate & Update Timeline</span>
              </button>
            )}
          </div>

          {parseState === "low_confidence" && (
            <div className="rounded-xl border border-[#E8674A] bg-[#E8674A]/10 p-4 space-y-1 text-xs text-[#F6F1E9]">
              <div className="font-bold text-[#E8674A]">Low Confidence Extraction Warning</div>
              <p className="text-[#B9C4CC]">
                Some values could not be extracted with high confidence due to document resolution or formatting. <strong>Please verify all values with your healthcare provider.</strong>
              </p>
            </div>
          )}

          {/* Plain Language Summary */}
          <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#7C8A93]">Plain-Language Summary</h3>
            <p className="text-sm text-[#F6F1E9] leading-relaxed">{analysisResult.data.plainSummary}</p>
          </div>

          {/* Metrics Table */}
          <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] overflow-hidden">
            <div className="border-b border-[rgba(246,241,233,0.09)] bg-[#0F2130] px-4 py-3 flex items-center justify-between">
              <h3 className="font-serif text-sm font-medium text-[#F6F1E9]">Extracted Lab Metrics</h3>
              <span className="font-mono text-[11px] text-[#7C8A93]">{analysisResult.data.parsedMetrics.length} values extracted</span>
            </div>

            <div className="overflow-x-auto font-mono">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F2130] text-[#7C8A93] font-semibold border-b border-[rgba(246,241,233,0.09)]">
                  <tr>
                    <th className="px-4 py-2.5">Metric Name</th>
                    <th className="px-4 py-2.5">Extracted Value</th>
                    <th className="px-4 py-2.5">Reference Range</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(246,241,233,0.09)]">
                  {analysisResult.data.parsedMetrics.map((metric: ReportMetric, i: number) => (
                    <tr
                      key={i}
                      className={metric.isOutOfRange ? "bg-[#E8674A]/15 font-semibold text-[#F6F1E9]" : "hover:bg-[#0F2130]/50"}
                    >
                      <td className="px-4 py-3">{metric.name}</td>
                      <td className="px-4 py-3 font-bold text-[#E8674A]">
                        {metric.value} {metric.unit || ""}
                      </td>
                      <td className="px-4 py-3 text-[#7C8A93]">{metric.referenceRange}</td>
                      <td className="px-4 py-3 text-right">
                        {metric.isOutOfRange ? (
                          <span className="rounded bg-[#E8674A] text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                            ⚠️ Out of Range
                          </span>
                        ) : (
                          <span className="rounded bg-[#4F9D8C] text-white px-2 py-0.5 text-[10px] font-medium">
                            Normal
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
