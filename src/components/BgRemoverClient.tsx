"use client";

import { useState } from "react";
import {
  Upload, Image as ImageIcon, Download, Trash2, AlertCircle,
  CheckCircle2, Sparkles, RefreshCw, Info, HelpCircle
} from "lucide-react";
import AdSlot from "@/components/AdSlot";

export default function BgRemoverClient() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith("image/")) {
        setErrorMsg("Please upload a valid image file (JPEG, PNG, or WEBP).");
        return;
      }
      setFile(selected);
      setOriginalUrl(URL.createObjectURL(selected));
      setResultUrl("");
      setErrorMsg("");
    }
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    setProcessing(true);
    setProgressText("Initializing AI engine...");
    setErrorMsg("");

    try {
      // Dynamically import the named export to avoid SSR loader issues
      const { removeBackground } = await import("@imgly/background-removal");

      const resultBlob = await removeBackground(file, {
        progress: (key, current, total) => {
          const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
          if (key.includes("fetch")) {
            setProgressText(`Loading AI Model assets: ${percentage}%`);
          } else if (key.includes("compute")) {
            setProgressText("Analyzing image foreground... (takes a few seconds)");
          } else {
            setProgressText("Removing background...");
          }
        }
      });

      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setProcessing(false);
    } catch (err) {
      console.error("AI Background Removal Error:", err);
      setErrorMsg("Failed to remove background. Ensure the image is clear and try again.");
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    a.download = `${originalName}-bg-removed.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalUrl("");
    setResultUrl("");
    setProcessing(false);
    setProgressText("");
    setErrorMsg("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {/* Title Header */}
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mb-2 flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="size-6 text-[#0ea5e9] animate-pulse" /> Free AI Background Remover
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
          Instantly make your image backgrounds transparent. Runs 100% locally in your browser sandbox. Your photos never leave your device (100% Private).
        </p>
      </header>

      {/* Top Banner Advertisement */}
      <AdSlot size="728x90" label="Background Remover Top Ad" />

      {/* Main Tool Grid Workspace */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start mt-6">
        
        {/* Left Side: Upload Zone / Previews */}
        <div className="space-y-6">
          
          {/* Upload Box */}
          {!file && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center relative hover:border-[#0ea5e9] transition-all group min-h-[300px]">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="size-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0ea5e9] mb-4 group-hover:scale-105 transition-transform duration-300">
                <Upload className="size-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Drag &amp; Drop Image Here
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supports PNG, JPEG, JPG, or WEBP formats.
              </p>
              <div className="px-4 py-2 bg-slate-50 border rounded-lg text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Processed Locally (Private &amp; Secure)
              </div>
            </div>
          )}

          {/* Previews Workspace */}
          {file && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Workspace</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-md">
                    File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  disabled={processing}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline font-semibold disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" /> Remove Image
                </button>
              </div>

              {/* Grid showing Before / After */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Original (Before) */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Original</span>
                  <div className="aspect-square bg-slate-50 rounded-2xl border overflow-hidden flex items-center justify-center p-2 relative">
                    <img
                      src={originalUrl}
                      alt="Original Input"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Result (After) */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Result</span>
                    {resultUrl && (
                      <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        Transparent
                      </span>
                    )}
                  </span>
                  
                  <div className="aspect-square rounded-2xl border overflow-hidden flex items-center justify-center p-2 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Background Removed Result"
                        className="max-w-full max-h-full object-contain rounded-lg animate-in fade-in zoom-in-95 duration-500"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-xs flex flex-col items-center gap-3 p-4">
                        {processing ? (
                          <div className="space-y-3 flex flex-col items-center">
                            <div className="size-8 border-3 border-sky-100 border-t-[#0ea5e9] rounded-full animate-spin" />
                            <p className="font-semibold text-slate-600 animate-pulse text-[11px]">
                              {progressText}
                            </p>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="size-10 text-slate-300" />
                            <p>Click "Remove Background" to start AI segmentation.</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons inside workspace */}
              {!resultUrl && !processing && (
                <button
                  onClick={handleRemoveBackground}
                  className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="size-4" /> Remove Background (Start AI)
                </button>
              )}
            </div>
          )}

          {/* Privacy Information Panel */}
          <div className="bg-slate-50 border rounded-3xl p-5 flex gap-4 text-xs text-slate-500 items-start">
            <Info className="size-5 text-[#0ea5e9] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-slate-700">100% Privacy Guaranteed</h5>
              <p className="leading-relaxed">
                Unlike online converters that transfer your files to distant clouds, this tool uses a localized model. Everything executes directly inside your browser cache. Perfect for sensitive documents, personal graphics, or private photos.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Options, Action Sidebar, Advertisements */}
        <aside className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-base pb-3 border-b">
            Tool Controls
          </h3>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Download Action (if result exists) */}
          {resultUrl ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">Background removed successfully! Ready to download as transparent PNG.</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="size-4" /> Download High-Res PNG
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3.5 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 bg-white"
              >
                <RefreshCw className="size-4" /> Start New Image
              </button>
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-xs text-slate-400">
              Upload an image first to activate downloading controls.
            </div>
          )}

          {/* Sidebar Advertisement */}
          <AdSlot size="300x250" label="Background Remover Sidebar Ad" />
        </aside>
      </div>

      {/* Bottom Leaderboard Advertisement */}
      <AdSlot size="728x90" label="Background Remover Bottom Ad" />
    </div>
  );
}
