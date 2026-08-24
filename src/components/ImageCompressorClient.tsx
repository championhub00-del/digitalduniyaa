"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Sliders,
  ChevronRight,
  Info,
  Layers,
  Sparkles
} from "lucide-react";
import AdSlot from "@/components/AdSlot";

interface CompressedFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  compressedBlob: Blob | null;
  compressedSize: number;
  compressedUrl: string | null;
  compressedWidth: number;
  compressedHeight: number;
  quality: number;
  format: "original" | "image/jpeg" | "image/png" | "image/webp";
  maxWidth: number | null;
  maxHeight: number | null;
  status: "idle" | "compressing" | "done" | "error";
  errorMsg?: string;
}

interface ImageCompressorClientProps {
  adsenseId?: string;
}

export default function ImageCompressorClient({ adsenseId }: ImageCompressorClientProps) {
  const [items, setItems] = useState<CompressedFileItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  // Global compression settings
  const [globalQuality, setGlobalQuality] = useState<number>(80);
  const [globalFormat, setGlobalFormat] = useState<"original" | "image/jpeg" | "image/png" | "image/webp">("original");
  const [globalMaxWidth, setGlobalMaxWidth] = useState<string>("");
  const [globalMaxHeight, setGlobalMaxHeight] = useState<string>("");
  
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50); // Split slider position (0-100)
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
    };
  }, [items]);

  const activeItem = items.find((item) => item.id === activeItemId) || items[0] || null;

  // Format bytes to readable size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Helper: Compress a single image
  const compressSingleImage = (
    item: CompressedFileItem,
    options: {
      quality: number;
      format: "original" | "image/jpeg" | "image/png" | "image/webp";
      maxWidth: number | null;
      maxHeight: number | null;
    }
  ): Promise<Partial<CompressedFileItem>> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;
            
            // Apply resizing constraints
            if (options.maxWidth && width > options.maxWidth) {
              height = Math.round((height * options.maxWidth) / width);
              width = options.maxWidth;
            }
            if (options.maxHeight && height > options.maxHeight) {
              width = Math.round((width * options.maxHeight) / height);
              height = options.maxHeight;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve({ status: "error", errorMsg: "Canvas support unavailable" });
              return;
            }

            // Target mime type selection
            let mimeType = item.file.type;
            if (options.format !== "original") {
              mimeType = options.format;
            }

            // Fill canvas with white if converting transparency to JPEG
            if (mimeType === "image/jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0, width, height);

            const q = options.quality / 100;
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // Revoke previous url if any
                  if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
                  
                  const url = URL.createObjectURL(blob);
                  resolve({
                    compressedBlob: blob,
                    compressedSize: blob.size,
                    compressedUrl: url,
                    compressedWidth: width,
                    compressedHeight: height,
                    status: "done",
                    quality: options.quality,
                    format: options.format,
                    maxWidth: options.maxWidth,
                    maxHeight: options.maxHeight
                  });
                } else {
                  resolve({ status: "error", errorMsg: "Blob generation failed" });
                }
              },
              mimeType,
              q
            );
          } catch (err: any) {
            resolve({ status: "error", errorMsg: err.message || "Compression error" });
          }
        };
        img.onerror = () => resolve({ status: "error", errorMsg: "Failed to parse image data" });
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve({ status: "error", errorMsg: "Failed to read file" });
      reader.readAsDataURL(item.file);
    });
  };

  // Add files to list
  const handleFiles = (fileList: FileList) => {
    const newItems: CompressedFileItem[] = [];

    Array.from(fileList).forEach((file) => {
      // Check if file is image
      if (!file.type.startsWith("image/")) return;

      const id = Math.random().toString(36).substring(2, 9);
      const originalUrl = URL.createObjectURL(file);
      
      const newItem: CompressedFileItem = {
        id,
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalUrl,
        compressedBlob: null,
        compressedSize: 0,
        compressedUrl: null,
        compressedWidth: 0,
        compressedHeight: 0,
        quality: globalQuality,
        format: globalFormat,
        maxWidth: globalMaxWidth ? parseInt(globalMaxWidth) : null,
        maxHeight: globalMaxHeight ? parseInt(globalMaxHeight) : null,
        status: "idle"
      };
      
      newItems.push(newItem);

      // Extract original dimensions in background
      const img = new Image();
      img.onload = () => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, originalWidth: img.width, originalHeight: img.height }
              : item
          )
        );
      };
      img.src = originalUrl;
    });

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      if (!activeItemId) {
        setActiveItemId(newItems[0].id);
      }
    }
  };

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // File input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Delete item
  const deleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) {
      if (target.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (activeItemId === id) {
      const remaining = items.filter((item) => item.id !== id);
      setActiveItemId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Clear all items
  const clearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setActiveItemId(null);
  };

  // Run compression for a single item in list
  const runCompression = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "compressing" } : item))
    );

    const result = await compressSingleImage(target, {
      quality: target.quality,
      format: target.format,
      maxWidth: target.maxWidth,
      maxHeight: target.maxHeight
    });

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...result } : item))
    );
  };

  // Compress all items
  const compressAll = async () => {
    if (items.length === 0) return;
    setIsProcessingAll(true);

    const promises = items.map(async (item) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "compressing" } : i))
      );

      const result = await compressSingleImage(item, {
        quality: item.quality,
        format: item.format,
        maxWidth: item.maxWidth,
        maxHeight: item.maxHeight
      });

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...result } : i))
      );
    });

    await Promise.all(promises);
    setIsProcessingAll(false);
  };

  // Handle setting updates for active item
  const updateActiveItemSetting = (key: string, value: any) => {
    if (!activeItemId) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === activeItemId) {
          const updated = { ...item, [key]: value, status: "idle" as const };
          return updated;
        }
        return item;
      })
    );
  };

  // Apply global configurations to all items
  const applyGlobals = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        quality: globalQuality,
        format: globalFormat,
        maxWidth: globalMaxWidth ? parseInt(globalMaxWidth) : null,
        maxHeight: globalMaxHeight ? parseInt(globalMaxHeight) : null,
        status: "idle"
      }))
    );
  };

  // Handle split-screen slider interaction
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleDownload = (item: CompressedFileItem) => {
    if (!item.compressedUrl) return;
    
    // Determine file extension
    let ext = item.file.name.split(".").pop();
    if (item.format !== "original") {
      ext = item.format.split("/")[1].replace("jpeg", "jpg");
    }

    const baseName = item.file.name.substring(0, item.file.name.lastIndexOf("."));
    const downloadName = `${baseName}_compressed.${ext}`;

    const link = document.createElement("a");
    link.href = item.compressedUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all completed items
  const downloadAll = () => {
    items.forEach((item) => {
      if (item.status === "done" && item.compressedUrl) {
        handleDownload(item);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Upper AdSlot */}
      <AdSlot size="728x90" label="Compressor Header Ad" adsenseId={adsenseId} />

      {/* Main Compressor Workspace */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload & File management */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Drag & Drop File Input */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-[#0ea5e9] bg-[#e0f2fe]/40 scale-[0.99]"
                : "border-slate-200 bg-white hover:border-[#0ea5e9] hover:bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              multiple
              accept="image/*"
              className="hidden"
            />
            
            <div className="size-16 mx-auto bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-2xl flex items-center justify-center mb-5 transition-transform">
              <Upload className="size-8" />
            </div>
            
            <h3 className="text-[#0f172a] font-bold text-lg mb-1">
              Drag &amp; Drop your images here
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Supports JPEG, PNG, WebP, and SVG. Upload multiple files at once.
            </p>
            <button
              type="button"
              className="px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-bold hover:bg-[#0284c7] transition-all shadow-md"
            >
              Browse Files
            </button>
          </div>

          {/* Files List Section */}
          {items.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-bold text-[#0f172a] text-base flex items-center gap-2">
                  <span>Uploaded Files</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
                    {items.length}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={compressAll}
                    disabled={isProcessingAll}
                    className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white text-xs font-bold rounded-xl hover:from-[#0284c7] hover:to-[#0369a1] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isProcessingAll ? <RefreshCw className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                    Compress All
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-2 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Clear All"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Individual File Items */}
              <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const isActive = item.id === activeItemId;
                  const savingPercent =
                    item.status === "done" && item.originalSize > item.compressedSize
                      ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
                      : 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemId(item.id)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 gap-4 mb-2 ${
                        isActive
                          ? "bg-[#e0f2fe]/40 border border-[#bae6fd]"
                          : "border border-transparent hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                          <img
                            src={item.originalUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Name and sizes */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#0f172a] truncate max-w-[200px] sm:max-w-[320px]">
                            {item.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-400 mt-1">
                            <span>{formatBytes(item.originalSize)}</span>
                            {item.originalWidth > 0 && (
                              <span>• {item.originalWidth}x{item.originalHeight} px</span>
                            )}
                            {item.status === "done" && (
                              <>
                                <ChevronRight className="size-3 text-slate-300" />
                                <span className="font-bold text-[#0ea5e9]">
                                  {formatBytes(item.compressedSize)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compression actions and savings */}
                      <div className="flex items-center justify-end gap-3 shrink-0 ml-auto sm:ml-0">
                        {item.status === "done" && savingPercent > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">
                            -{savingPercent}%
                          </span>
                        )}

                        {item.status === "compressing" ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#0ea5e9] font-semibold bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 animate-pulse">
                            <RefreshCw className="size-3.5 animate-spin" />
                            Processing
                          </div>
                        ) : item.status === "done" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item);
                              }}
                              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm"
                              title="Download compressed image"
                            >
                              <Download className="size-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                runCompression(item.id);
                              }}
                              className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                              title="Re-compress"
                            >
                              <RefreshCw className="size-3.5" />
                            </button>
                          </div>
                        ) : item.status === "error" ? (
                          <span
                            className="text-xs text-red-500 flex items-center gap-1"
                            title={item.errorMsg}
                          >
                            <AlertCircle className="size-3.5" /> Error
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              runCompression(item.id);
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#0ea5e9] hover:text-white text-[#1e293b] font-bold text-xs rounded-xl transition-all"
                          >
                            Compress
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Batch action bar */}
              {items.some((i) => i.status === "done") && (
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 border border-slate-100">
                  <div className="text-xs text-slate-500">
                    🎉 Download is ready for your compressed images.
                  </div>
                  <button
                    onClick={downloadAll}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="size-4" /> Download All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Configuration & Preview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Global / Batch config settings */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="size-4 text-[#0ea5e9]" />
              <span>Compression Settings</span>
            </h3>
            
            {/* Format selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Output Format
              </label>
              <select
                value={activeItem ? activeItem.format : globalFormat}
                onChange={(e) => {
                  const val = e.target.value as any;
                  if (activeItem) {
                    updateActiveItemSetting("format", val);
                  } else {
                    setGlobalFormat(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 border-2 border-slate-100 hover:border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-all bg-white font-medium text-slate-700"
              >
                <option value="original">Keep Original Format</option>
                <option value="image/webp">Convert to WebP (Recommended)</option>
                <option value="image/jpeg">Convert to JPEG (Lossy)</option>
                <option value="image/png">Convert to PNG (Lossless)</option>
              </select>
            </div>

            {/* Quality Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider">
                  Quality
                </span>
                <span className="font-extrabold text-[#0ea5e9] bg-[#e0f2fe] px-2 py-0.5 rounded-md">
                  {activeItem ? activeItem.quality : globalQuality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={activeItem ? activeItem.quality : globalQuality}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (activeItem) {
                    updateActiveItemSetting("quality", val);
                  } else {
                    setGlobalQuality(val);
                  }
                }}
                className="w-full accent-[#0ea5e9] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Lower quality yields smaller file size, higher quality maintains clarity.
              </p>
            </div>

            {/* Resizing dimensions */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1920"
                  value={activeItem ? (activeItem.maxWidth || "") : globalMaxWidth}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeItem) {
                      updateActiveItemSetting("maxWidth", val ? parseInt(val) : null);
                    } else {
                      setGlobalMaxWidth(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-all bg-white font-medium text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1080"
                  value={activeItem ? (activeItem.maxHeight || "") : globalMaxHeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeItem) {
                      updateActiveItemSetting("maxHeight", val ? parseInt(val) : null);
                    } else {
                      setGlobalMaxHeight(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-all bg-white font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Individual trigger vs batch sync */}
            {activeItemId ? (
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => runCompression(activeItemId)}
                  className="w-full py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="size-3.5" /> Apply &amp; Compress
                </button>
              </div>
            ) : items.length > 0 ? (
              <button
                onClick={applyGlobals}
                className="w-full py-2.5 border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Sliders className="size-3.5" /> Apply settings to all
              </button>
            ) : null}
          </div>

          {/* Interactive Split Compare Preview (for selected item) */}
          {activeItem && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-[#0f172a] text-sm flex items-center gap-1.5">
                <Layers className="size-4 text-[#0ea5e9]" />
                <span>Interactive Split Preview</span>
              </h4>
              
              <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 p-2.5 rounded-xl flex items-start gap-2 border border-slate-100">
                <Info className="size-4 text-[#0ea5e9] shrink-0 mt-0.5" />
                <span>
                  Drag the slider handle to compare original (left) vs compressed (right) visual quality.
                </span>
              </div>

              {/* Split Slider container */}
              <div
                ref={sliderContainerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 select-none border border-slate-200 cursor-ew-resize"
              >
                {/* Before: Original (Base layer) */}
                <img
                  src={activeItem.originalUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain p-1"
                  draggable={false}
                />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md pointer-events-none z-10 uppercase tracking-wider">
                  Original
                </span>

                {/* After: Compressed (Top clip layer) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                  }}
                >
                  <img
                    src={activeItem.compressedUrl || activeItem.originalUrl}
                    alt="Compressed"
                    className="absolute inset-0 w-full h-full object-contain p-1"
                    style={{ width: "100%", height: "100%" }}
                    draggable={false}
                  />
                  <span className="absolute bottom-2 right-2 bg-[#0ea5e9]/95 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md pointer-events-none z-10 uppercase tracking-wider">
                    Compressed
                  </span>
                </div>

                {/* Center Divider handle */}
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 bg-[#0ea5e9] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
                    ↔
                  </div>
                </div>
              </div>

              {/* Compression Ratio Stats */}
              {activeItem.status === "done" && (
                <div className="grid grid-cols-2 gap-3.5 pt-1 text-center">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Compressed Width
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {activeItem.compressedWidth} px
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Compressed Height
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {activeItem.compressedHeight} px
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lower AdSlot */}
      <AdSlot size="728x90" label="Compressor Footer Ad" adsenseId={adsenseId} />

      {/* Guide / EEAT Information for the Compressor tool */}
      <section className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 mt-10">
        <h3 className="font-extrabold text-xl text-[#0f172a] mb-4 flex items-center gap-2">
          ⚡ Why Compress Your Images?
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-600 leading-relaxed">
          <div className="bg-white border border-slate-200/50 p-5 rounded-2xl">
            <h4 className="font-bold text-[#0f172a] mb-2 flex items-center gap-1.5">
              🚀 Boost SEO Ranking
            </h4>
            <p className="text-xs">
              Page load speed is a direct Google Core Web Vitals ranking factor. Compressing images by up to 80% improves load times, decreasing your site bounce rates.
            </p>
          </div>
          <div className="bg-white border border-slate-200/50 p-5 rounded-2xl">
            <h4 className="font-bold text-[#0f172a] mb-2 flex items-center gap-1.5">
              📦 Reduce Server Bandwidth
            </h4>
            <p className="text-xs">
              Smaller image files reduce hosting bandwidth and improve the experience for mobile visitors on slower cellular networks like 3G/4G in Pakistan.
            </p>
          </div>
          <div className="bg-white border border-slate-200/50 p-5 rounded-2xl">
            <h4 className="font-bold text-[#0f172a] mb-2 flex items-center gap-1.5">
              🔒 100% Client-Side Privacy
            </h4>
            <p className="text-xs">
              Your images are processed entirely inside your browser using HTML5 Canvas. They are never sent to external servers, protecting your privacy completely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
