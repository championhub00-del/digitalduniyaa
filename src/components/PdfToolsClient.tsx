"use client";

import { useState, useTransition } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import {
  FileText, Combine, Scissors, RotateCw, Type, Image as ImageIcon,
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle2, Trash2, ListOrdered
} from "lucide-react";

type ToolType = "merge" | "split" | "watermark" | "rotate" | "reorder" | "image-to-pdf" | null;

interface FileDetails {
  name: string;
  size: number;
  type: string;
}

export default function PdfToolsClient() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [reorderInput, setReorderInput] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkSize, setWatermarkSize] = useState(50);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);
  const [watermarkColor, setWatermarkColor] = useState("gray");
  const [rotateAngle, setRotateAngle] = useState(90);
  const [imageLayout, setImageLayout] = useState<"a4" | "original">("a4");
  
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [processingStep, setProcessingStep] = useState("");

  const resetState = () => {
    setFiles([]);
    setRangeInput("");
    setReorderInput("");
    setWatermarkText("CONFIDENTIAL");
    setWatermarkSize(50);
    setWatermarkOpacity(0.4);
    setWatermarkColor("gray");
    setRotateAngle(90);
    setImageLayout("a4");
    setErrorMsg("");
    setSuccessMsg("");
    setProcessingStep("");
  };

  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
    resetState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (activeTool !== "merge" && activeTool !== "image-to-pdf" && selectedFiles.length > 1) {
        setErrorMsg("This tool supports only one PDF file at a time.");
        setFiles([selectedFiles[0]]);
      } else {
        setErrorMsg("");
        setFiles((prev) => [...prev, ...selectedFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setErrorMsg("");
    }
  };

  const downloadBlob = (blob: Blob, defaultName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to parse watermarking color hex/text to rgb numbers
  const getColorRgb = (color: string): [number, number, number] => {
    switch (color) {
      case "red": return [0.9, 0.1, 0.1];
      case "blue": return [0.1, 0.1, 0.9];
      case "green": return [0.1, 0.8, 0.1];
      case "black": return [0, 0, 0];
      default: return [0.6, 0.6, 0.6]; // gray
    }
  };

  const processFiles = () => {
    if (files.length === 0) {
      setErrorMsg("Please upload at least one file to process.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    
    startTransition(async () => {
      try {
        if (activeTool === "merge") {
          setProcessingStep("Reading uploaded PDF files...");
          const mergedPdf = await PDFDocument.create();
          
          for (let i = 0; i < files.length; i++) {
            setProcessingStep(`Merging PDF ${i + 1} of ${files.length}...`);
            const arrayBuffer = await files[i].arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
          }
          
          setProcessingStep("Compiling output file...");
          const pdfBytes = await mergedPdf.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, "merged-digitalduniya.pdf");
          setSuccessMsg("PDF files merged successfully!");
        } 
        
        else if (activeTool === "split") {
          if (!rangeInput.trim()) {
            throw new Error("Please specify the page ranges (e.g. 1-3, 5).");
          }
          
          setProcessingStep("Loading PDF file...");
          const arrayBuffer = await files[0].arrayBuffer();
          const srcDoc = await PDFDocument.load(arrayBuffer);
          const newDoc = await PDFDocument.create();
          const maxPage = srcDoc.getPageCount();
          
          setProcessingStep("Extracting pages...");
          const pagesToCopy: number[] = [];
          const parts = rangeInput.split(",");
          for (let p of parts) {
            p = p.trim();
            if (p.includes("-")) {
              const [startStr, endStr] = p.split("-");
              const start = Math.max(1, parseInt(startStr) || 1);
              const end = Math.min(maxPage, parseInt(endStr) || maxPage);
              for (let i = start; i <= end; i++) {
                pagesToCopy.push(i - 1);
              }
            } else {
              const pageNum = parseInt(p);
              if (pageNum >= 1 && pageNum <= maxPage) {
                pagesToCopy.push(pageNum - 1);
              }
            }
          }
          
          if (pagesToCopy.length === 0) {
            throw new Error("Specified ranges do not match any pages in the PDF document.");
          }
          
          const copiedPages = await newDoc.copyPages(srcDoc, pagesToCopy);
          copiedPages.forEach((page) => newDoc.addPage(page));
          
          setProcessingStep("Saving new PDF...");
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, "split-pages.pdf");
          setSuccessMsg(`Pages (${rangeInput}) extracted successfully!`);
        }

        else if (activeTool === "watermark") {
          if (!watermarkText.trim()) {
            throw new Error("Watermark text cannot be empty.");
          }
          
          setProcessingStep("Loading PDF file...");
          const arrayBuffer = await files[0].arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          
          setProcessingStep("Drawing watermarks...");
          const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const pages = pdfDoc.getPages();
          const [r, g, bColor] = getColorRgb(watermarkColor);
          
          pages.forEach((page, idx) => {
            setProcessingStep(`Watermarking page ${idx + 1} of ${pages.length}...`);
            const { width, height } = page.getSize();
            
            // Draw diagonal watermark centered on page
            page.drawText(watermarkText, {
              x: width / 2 - (watermarkText.length * watermarkSize * 0.28),
              y: height / 2,
              size: watermarkSize,
              font: font,
              color: rgb(r, g, bColor),
              opacity: watermarkOpacity,
              rotate: degrees(45),
            });
          });
          
          setProcessingStep("Generating watermarked document...");
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, "watermarked-document.pdf");
          setSuccessMsg("Watermark applied successfully!");
        }

        else if (activeTool === "rotate") {
          setProcessingStep("Loading PDF file...");
          const arrayBuffer = await files[0].arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          
          setProcessingStep("Rotating pages...");
          pages.forEach((page) => {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotateAngle) % 360));
          });
          
          setProcessingStep("Saving rotated document...");
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, `rotated-${rotateAngle}-deg.pdf`);
          setSuccessMsg("All pages rotated successfully!");
        }

        else if (activeTool === "reorder") {
          if (!reorderInput.trim()) {
            throw new Error("Please specify the page order sequence (e.g. 3,1,2).");
          }
          
          setProcessingStep("Loading PDF file...");
          const arrayBuffer = await files[0].arrayBuffer();
          const srcDoc = await PDFDocument.load(arrayBuffer);
          const newDoc = await PDFDocument.create();
          const maxPage = srcDoc.getPageCount();
          
          setProcessingStep("Rearranging page sequence...");
          const pageIndices: number[] = [];
          const parts = reorderInput.split(",");
          for (const p of parts) {
            const idx = parseInt(p.trim());
            if (idx >= 1 && idx <= maxPage) {
              pageIndices.push(idx - 1);
            } else {
              throw new Error(`Page index ${p} is out of bounds (1 to ${maxPage}).`);
            }
          }
          
          if (pageIndices.length === 0) {
            throw new Error("Invalid page order array.");
          }
          
          const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
          copiedPages.forEach((page) => newDoc.addPage(page));
          
          setProcessingStep("Saving reordered document...");
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, "reordered-pages.pdf");
          setSuccessMsg("PDF pages reordered successfully!");
        }

        else if (activeTool === "image-to-pdf") {
          setProcessingStep("Creating PDF document...");
          const pdfDoc = await PDFDocument.create();
          
          for (let i = 0; i < files.length; i++) {
            setProcessingStep(`Embedding image ${i + 1} of ${files.length}...`);
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();
            let embeddedImage;
            
            if (file.type === "image/png") {
              embeddedImage = await pdfDoc.embedPng(arrayBuffer);
            } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
              embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
            } else {
              throw new Error(`Unsupported image format: ${file.name}. Only JPEG/PNG are supported.`);
            }
            
            const { width, height } = embeddedImage.scale(1.0);
            
            if (imageLayout === "a4") {
              const A4_WIDTH = 595;
              const A4_HEIGHT = 842;
              const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
              const ratio = Math.min(A4_WIDTH / width, A4_HEIGHT / height);
              const finalWidth = width * ratio;
              const finalHeight = height * ratio;
              const xOffset = (A4_WIDTH - finalWidth) / 2;
              const yOffset = (A4_HEIGHT - finalHeight) / 2;
              
              page.drawImage(embeddedImage, {
                x: xOffset,
                y: yOffset,
                width: finalWidth,
                height: finalHeight,
              });
            } else {
              const page = pdfDoc.addPage([width, height]);
              page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
            }
          }
          
          setProcessingStep("Compiling PDF file...");
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, "images-converted.pdf");
          setSuccessMsg("Images successfully compiled into PDF!");
        }
      } catch (err) {
        console.error("PDF Tools Error:", err);
        setErrorMsg((err as Error).message || "An unexpected error occurred during processing.");
      }
    });
  };

  const tools = [
    { id: "merge" as ToolType, name: "Merge PDF", desc: "Combine multiple PDF documents into a single file.", icon: Combine, color: "bg-sky-50 text-[#0ea5e9] border-sky-100" },
    { id: "split" as ToolType, name: "Split PDF", desc: "Extract specific page ranges into a separate PDF document.", icon: Scissors, color: "bg-rose-50 text-rose-600 border-rose-100" },
    { id: "watermark" as ToolType, name: "Watermark PDF", desc: "Add customizable text stamp diagonals on all pages.", icon: Type, color: "bg-amber-50 text-[#f59e0b] border-amber-100" },
    { id: "rotate" as ToolType, name: "Rotate PDF", desc: "Rotate pages 90, 180, or 270 degrees in bulk.", icon: RotateCw, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { id: "reorder" as ToolType, name: "Reorder Pages", desc: "Rearrange the sequence of pages within a PDF.", icon: ListOrdered, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { id: "image-to-pdf" as ToolType, name: "Images to PDF", desc: "Convert multiple PNG/JPG files to a single PDF.", icon: ImageIcon, color: "bg-violet-50 text-violet-600 border-violet-100" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {/* Title */}
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mb-2">
            Online PDF Utilities Hub
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
            Free premium PDF tools running 100% locally inside your browser sandbox. Privacy-first, zero uploads to external servers.
          </p>
        </div>
        {activeTool && (
          <button
            onClick={() => handleToolSelect(null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 text-sm transition-all"
          >
            <ArrowLeft className="size-4" /> Tools Menu
          </button>
        )}
      </header>

      {/* Main Grid: Selection Dashboard */}
      {!activeTool ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => handleToolSelect(t.id)}
              className="text-left bg-white border border-[var(--border)] rounded-3xl p-6 hover:shadow-md hover:border-[#0ea5e9] transition-all group flex flex-col justify-between min-h-[180px]"
            >
              <div>
                <div className={`size-12 rounded-2xl flex items-center justify-center border mb-4 transition-all group-hover:scale-105 ${t.color}`}>
                  <t.icon className="size-5" />
                </div>
                <h3 className="font-bold text-[#0f172a] text-lg mb-2 group-hover:text-[#0ea5e9] transition-colors">
                  {t.name}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{t.desc}</p>
              </div>
              <div className="text-[#0ea5e9] text-xs font-bold mt-4 inline-flex items-center gap-1 group-hover:underline">
                Open Utility →
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Workspace for Active Tool */
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* File Upload Zone / Document details */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative hover:border-[#0ea5e9] transition-colors group">
              <input
                type="file"
                multiple={activeTool === "merge" || activeTool === "image-to-pdf"}
                accept={activeTool === "image-to-pdf" ? "image/png, image/jpeg, image/jpg" : "application/pdf"}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="size-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0ea5e9] mb-4 group-hover:scale-105 transition-transform duration-300">
                <Upload className="size-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Drag &amp; Drop files here
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                or click to browse your local filesystem.
                {activeTool === "image-to-pdf" 
                  ? " Supports PNG and JPEG images." 
                  : " Supports PDF documents."}
              </p>
              <div className="px-4 py-2 bg-slate-50 border rounded-lg text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Processed Locally (Private)
              </div>
            </div>

            {/* List of uploaded files */}
            {files.length > 0 && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                  <h4 className="font-bold text-sm text-slate-800">
                    Uploaded Files ({files.length})
                  </h4>
                  <button onClick={resetState} className="text-xs text-red-500 hover:underline">
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-3 p-3 bg-slate-50 border rounded-xl text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="size-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                        <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tools Parameters Options / Action Button Sidebar */}
          <aside className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base pb-3 border-b">
              {tools.find((t) => t.id === activeTool)?.name} Settings
            </h3>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Render Contextual Parameter inputs based on active tool */}
            {activeTool === "split" && (
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider space-y-2">
                <span>Page Ranges to Extract *</span>
                <input
                  required
                  placeholder="e.g. 1-3, 5, 8"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white normal-case font-medium mt-1 text-slate-800"
                />
                <span className="block text-[10px] text-slate-400 lowercase leading-snug font-normal">
                  Use comma to separate numbers or ranges. e.g. "1-4, 6" extracts pages 1, 2, 3, 4, and 6.
                </span>
              </label>
            )}

            {activeTool === "reorder" && (
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider space-y-2">
                <span>Custom Page Sequence *</span>
                <input
                  required
                  placeholder="e.g. 3, 1, 2, 4"
                  value={reorderInput}
                  onChange={(e) => setReorderInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white normal-case font-medium mt-1 text-slate-800"
                />
                <span className="block text-[10px] text-slate-400 lowercase leading-snug font-normal">
                  Enter the exact sequence order of pages you want in the final PDF.
                </span>
              </label>
            )}

            {activeTool === "watermark" && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Watermark Stamp Text</span>
                  <input
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white font-medium mt-1 text-slate-800"
                  />
                </label>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Opacity</span>
                    <span className="text-[#0ea5e9]">{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={watermarkOpacity * 100}
                    onChange={(e) => setWatermarkOpacity(parseInt(e.target.value) / 100)}
                    className="w-full accent-[#0ea5e9] h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Font Size</span>
                    <input
                      type="number"
                      min="10"
                      max="150"
                      value={watermarkSize}
                      onChange={(e) => setWatermarkSize(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] mt-1 text-slate-800"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Color</span>
                    <select
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white mt-1 text-slate-800"
                    >
                      <option value="gray">Gray (Clean)</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="black">Black</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {activeTool === "rotate" && (
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Rotation Angle</span>
                <select
                  value={rotateAngle}
                  onChange={(e) => setRotateAngle(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white mt-1 text-slate-800 font-semibold"
                >
                  <option value="90">90° Clockwise</option>
                  <option value="180">180° Half Turn</option>
                  <option value="270">270° Counter-Clockwise</option>
                </select>
              </label>
            )}

            {activeTool === "image-to-pdf" && (
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Page Layout Size</span>
                <select
                  value={imageLayout}
                  onChange={(e) => setImageLayout(e.target.value as "a4" | "original")}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white mt-1 text-slate-800 font-semibold"
                >
                  <option value="a4">Standard A4 Size (Centering Image)</option>
                  <option value="original">Match Original Image Dimension</option>
                </select>
              </label>
            )}

            {/* Processing details spinner */}
            {isPending && (
              <div className="space-y-2 p-4 bg-sky-50 border border-sky-100 text-sky-700 rounded-2xl text-xs flex flex-col justify-center items-center">
                <div className="size-6 border-3 border-sky-200 border-t-[#0ea5e9] rounded-full animate-spin mb-1" />
                <span className="font-semibold">{processingStep}</span>
              </div>
            )}

            {/* Execute processing button */}
            <button
              onClick={processFiles}
              disabled={isPending || files.length === 0}
              className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Download className="size-4" /> Download Result PDF
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
