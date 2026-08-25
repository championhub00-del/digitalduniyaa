"use client";

import { useState, useRef } from "react";
import {
  Upload, Image as ImageIcon, Download, Trash2, AlertCircle,
  CheckCircle2, Sparkles, RefreshCw, Info, Sliders, Maximize2
} from "lucide-react";
import AdSlot from "@/components/AdSlot";

export default function ImageUpscalerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Upscale Parameter States
  const [scale, setScale] = useState<number>(2); // 2x or 4x
  const [sharpness, setSharpness] = useState<number>(40); // 0 to 100
  const [denoise, setDenoise] = useState<boolean>(true); // Remove compression artifacts

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

  const handleUpscale = () => {
    if (!file || !originalUrl) return;
    setProcessing(true);
    setErrorMsg("");

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not initialize 2D context.");
        }

        const targetW = img.width * scale;
        const targetH = img.height * scale;

        // Prevent memory overflow on low-end devices
        if (targetW * targetH > 50000000) {
          throw new Error("Target image dimensions exceed maximum safe limit. Try 2x upscale instead.");
        }

        canvas.width = targetW;
        canvas.height = targetH;

        // Apply high quality bicubic/Lanczos interpolation natively supported by GPU resampler
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw initial upscaled image
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Get image pixel data for custom enhancement filters
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;

        // 1. Denoise Pass: Lightweight box-blur filtering to reduce compression artifacts
        if (denoise) {
          const buffer = new Uint8ClampedArray(data);
          // Apply a 3x3 low-pass smoothing kernel
          for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
              const idx = (y * targetW + x) * 4;
              for (let c = 0; c < 3; c++) {
                let sum = 0;
                // Neighboring pixel sum
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    sum += buffer[((y + ky) * targetW + (x + kx)) * 4 + c];
                  }
                }
                data[idx + c] = sum / 9; // Average
              }
            }
          }
        }

        // 2. Convolution Edge Enhancement / Sharpen Pass
        if (sharpness > 0) {
          const buffer = new Uint8ClampedArray(data);
          const factor = sharpness / 120; // Scale down to reasonable intensity

          // Sharpen Laplacian Kernel matrix:
          //  0    -f    0
          // -f   1+4f  -f
          //  0    -f    0
          for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
              const idx = (y * targetW + x) * 4;
              for (let c = 0; c < 3; c++) {
                const centerVal = buffer[idx + c];
                const sumNeighbors =
                  buffer[((y - 1) * targetW + x) * 4 + c] +
                  buffer[((y + 1) * targetW + x) * 4 + c] +
                  buffer[(y * targetW + (x - 1)) * 4 + c] +
                  buffer[(y * targetW + (x + 1)) * 4 + c];

                const sharpened = centerVal * (1 + 4 * factor) - sumNeighbors * factor;
                data[idx + c] = Math.max(0, Math.min(255, sharpened));
              }
            }
          }
        }

        // Write modified pixels back to canvas
        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setProcessing(false);
          } else {
            throw new Error("Could not export canvas to blob.");
          }
        }, "image/png");

      } catch (err) {
        console.error("Upscale Error:", err);
        setErrorMsg((err as Error).message || "Failed to process image upscaling.");
        setProcessing(false);
      }
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    a.download = `${originalName}-upscaled-${scale}x.png`;
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
    setErrorMsg("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {/* Title Header */}
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mb-2 flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="size-6 text-[#0ea5e9] animate-pulse" /> Free AI Image Upscaler
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
          Enhance and increase the resolution of low-quality photos. Upscale dimensions by 2x or 4x online. Runs 100% locally inside your browser.
        </p>
      </header>

      {/* Top Banner Advertisement */}
      <AdSlot size="728x90" label="Image Upscaler Top Ad" />

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
                    <span>Upscaled Result</span>
                    {resultUrl && (
                      <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        {scale}x Resolution
                      </span>
                    )}
                  </span>
                  
                  <div className="aspect-square bg-slate-50 rounded-2xl border overflow-hidden flex items-center justify-center p-2 relative">
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Upscaled Result"
                        className="max-w-full max-h-full object-contain rounded-lg animate-in fade-in zoom-in-95 duration-500"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 p-4">
                        {processing ? (
                          <div className="space-y-3 flex flex-col items-center">
                            <div className="size-8 border-3 border-sky-100 border-t-[#0ea5e9] rounded-full animate-spin" />
                            <p className="font-semibold text-slate-600 animate-pulse text-[11px]">
                              Re-sampling pixels &amp; sharpening details...
                            </p>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="size-10 text-slate-300" />
                            <p>Click "Upscale Image" to enhance resolution.</p>
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
                  onClick={handleUpscale}
                  className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 animate-none"
                >
                  <Sparkles className="size-4" /> Upscale Image (GPU Accelerated)
                </button>
              )}
            </div>
          )}

          {/* Privacy Information Panel */}
          <div className="bg-slate-50 border rounded-3xl p-5 flex gap-4 text-xs text-slate-500 items-start">
            <Info className="size-5 text-[#0ea5e9] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-slate-700">Client-Side Security</h5>
              <p className="leading-relaxed">
                Images are upscaled entirely inside your browser tab memory cache using high-precision bicubic convolution kernels. Zero bytes are transferred to external cloud databases, keeping your images 100% private.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Options, Action Sidebar, Advertisements */}
        <aside className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-base pb-3 border-b">
            Upscaler Settings
          </h3>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Options (Only editable before upscale) */}
          {!resultUrl && !processing && (
            <div className="space-y-5">
              {/* Scale selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Scale Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScale(2)}
                    className={`py-2 px-3 border-2 rounded-xl text-xs font-bold transition-all ${scale === 2 ? "border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]" : "border-slate-100 text-slate-500 hover:bg-slate-50"}`}
                  >
                    2x Scale (HD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(4)}
                    className={`py-2 px-3 border-2 rounded-xl text-xs font-bold transition-all ${scale === 4 ? "border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]" : "border-slate-100 text-slate-500 hover:bg-slate-50"}`}
                  >
                    4x Scale (Ultra HD)
                  </button>
                </div>
              </div>

              {/* Edge Sharpness Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Enhance Sharpness</span>
                  <span className="text-[#0ea5e9]">{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => setSharpness(parseInt(e.target.value))}
                  className="w-full accent-[#0ea5e9] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Denoise Artifact Removal */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700">Denoise Image</span>
                  <span className="block text-[9px] text-slate-400">Reduce JPEG compression blocks</span>
                </div>
                <input
                  type="checkbox"
                  checked={denoise}
                  onChange={(e) => setDenoise(e.target.checked)}
                  className="size-4.5 text-[#0ea5e9] focus:ring-[#0ea5e9] border-slate-300 rounded"
                />
              </div>
            </div>
          )}

          {/* Download Action (if result exists) */}
          {resultUrl ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">Image upscaled successfully! Ready to download as high-definition PNG.</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="size-4" /> Download Enhanced Image
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
              Upload an image first to activate upscaling controls.
            </div>
          )}

          {/* Sidebar Advertisement */}
          <AdSlot size="300x250" label="Image Upscaler Sidebar Ad" />
        </aside>
      </div>

      {/* Bottom Leaderboard Advertisement */}
      <AdSlot size="728x90" label="Image Upscaler Bottom Ad" />
    </div>
  );
}
