"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import {
  FileText, Combine, Scissors, RotateCw, Type, Image as ImageIcon,
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle2, Trash2, ListOrdered
} from "lucide-react";

type ToolType = "merge" | "split" | "watermark" | "rotate" | "reorder" | "image-to-pdf" | "edit" | null;

interface FileDetails {
  name: string;
  size: number;
  type: string;
}

export interface TextBox {
  id: string;
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  color: string;
  bgColor: string;
  isBold: boolean;
}

/* Helper to parse hexadecimal colors to rgb scale (0-1) */
function parseHexColor(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return [r, g, b];
  } else if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return [1, 1, 1]; // fallback to white
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
  
  // PDF Text Editor States
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pdfInstance, setPdfInstance] = useState<any>(null);
  
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
    setTextBoxes([]);
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

  // Dynamically load PDF.js from cdnjs on mount/demand
  useEffect(() => {
    if (activeTool === "edit" && !pdfjsLoaded) {
      if ((window as any).pdfjsLib) {
        setPdfjsLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        setPdfjsLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, [activeTool, pdfjsLoaded]);

  // Render PDF using PDF.js when file is uploaded
  useEffect(() => {
    if (activeTool === "edit" && files.length > 0 && pdfjsLoaded) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const pdfjsLib = (window as any).pdfjsLib;
          const typedarray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          setPdfInstance(pdf);
          setPageCount(pdf.numPages);
          setTextBoxes([]);
        } catch (err) {
          console.error("PDF.js loading error:", err);
          setErrorMsg("Failed to render PDF page previews. Try another file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setPdfInstance(null);
      setPageCount(0);
      setTextBoxes([]);
    }
  }, [files, activeTool, pdfjsLoaded]);

  const handleAddTextBox = (pageIndex: number, x: number, y: number) => {
    const newBox: TextBox = {
      id: Math.random().toString(36).substring(2, 9),
      pageIndex,
      text: "Edit text here",
      x,
      y,
      w: 18, // 18% width
      h: 4.5, // 4.5% height
      fontSize: 16,
      color: "black",
      bgColor: "#ffffff", // default white mask to cover text underneath!
      isBold: false
    };
    setTextBoxes((prev) => [...prev, newBox]);
  };

  const handleUpdateTextBox = (id: string, updates: Partial<TextBox>) => {
    setTextBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const handleDeleteTextBox = (id: string) => {
    setTextBoxes((prev) => prev.filter((b) => b.id !== id));
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

        else if (activeTool === "edit") {
          if (files.length === 0) {
            throw new Error("Please upload a PDF file to edit.");
          }
          setProcessingStep("Loading original PDF document...");
          const arrayBuffer = await files[0].arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          
          setProcessingStep("Embedding standard fonts...");
          const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

          setProcessingStep("Applying interactive edits...");
          
          for (const box of textBoxes) {
            if (box.pageIndex >= pages.length) continue;
            const page = pages[box.pageIndex];
            const { width: pWidth, height: pHeight } = page.getSize();
            
            // Map percentages to PDF dimensions.
            const pdfWidth = (box.w / 100) * pWidth;
            const pdfHeight = (box.h / 100) * pHeight;
            const pdfX = (box.x / 100) * pWidth;
            const pdfY = (1 - ((box.y + box.h) / 100)) * pHeight;
            
            // Draw background rectangle mask to cover/white-out the old text under the box
            if (box.bgColor !== "transparent") {
              const [r, g, bColor] = parseHexColor(box.bgColor);
              page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: pdfWidth,
                height: pdfHeight,
                color: rgb(r, g, bColor),
              });
            }
            
            // Draw new styled text inside the rectangle, vertically centered with small padding
            const selectedFont = box.isBold ? fontBold : fontNormal;
            const [r, g, bColor] = getColorRgb(box.color);
            
            const textX = pdfX + 4; // 4pt left padding
            const textY = pdfY + Math.max(2, (pdfHeight - box.fontSize) / 2);
            
            page.drawText(box.text, {
              x: textX,
              y: textY,
              size: box.fontSize,
              font: selectedFont,
              color: rgb(r, g, bColor),
            });
          }
          
          setProcessingStep("Compiling new PDF document...");
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          downloadBlob(blob, "edited-document.pdf");
          setSuccessMsg("PDF text edited and downloaded successfully!");
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
    { id: "edit" as ToolType, name: "Edit PDF Text", desc: "Add, cover, and place new styled text on PDF pages.", icon: FileText, color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
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
          {/* File Upload Zone / Document details */}
          <div className="space-y-6">
            {!(activeTool === "edit" && files.length > 0) && (
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
            )}

            {/* List of uploaded files */}
            {files.length > 0 && activeTool !== "edit" && (
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

            {/* PDF Editor Interactive Canvas Workspace */}
            {activeTool === "edit" && files.length > 0 && pdfInstance && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      PDF Interactive Editor (Pages: {pageCount})
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Editing: {files[0].name}
                    </p>
                  </div>
                  <button onClick={resetState} className="text-xs text-red-500 hover:underline font-semibold">
                    Change PDF File
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100">
                  💡 <b>How to Edit:</b> Click anywhere on a page to create a text box. Drag to position. Double-click text to type. Change background setting to <b>White Mask</b> to hide/cover the original text underneath!
                </p>
                <div className="space-y-6 max-h-[600px] overflow-y-auto p-4 bg-slate-100 rounded-2xl border">
                  {Array.from({ length: pageCount }).map((_, idx) => (
                    <PageCanvas
                      key={idx}
                      pdf={pdfInstance}
                      pageIndex={idx}
                      textBoxes={textBoxes}
                      onAddTextBox={handleAddTextBox}
                      onUpdateTextBox={handleUpdateTextBox}
                      onDeleteTextBox={handleDeleteTextBox}
                    />
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

/* ─── PDF.js Page Canvas Component ─── */
interface PageCanvasProps {
  pdf: any;
  pageIndex: number;
  textBoxes: TextBox[];
  onAddTextBox: (pageIndex: number, x: number, y: number) => void;
  onUpdateTextBox: (id: string, updates: Partial<TextBox>) => void;
  onDeleteTextBox: (id: string) => void;
}

function PageCanvas({ pdf, pageIndex, textBoxes, onAddTextBox, onUpdateTextBox, onDeleteTextBox }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        setLoadingPage(true);
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setCanvasSize({ w: viewport.width, h: viewport.height });

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        if (isCurrent) setLoadingPage(false);
      } catch (err) {
        console.error("Page render error:", err);
      }
    };
    renderPage();
    return () => {
      isCurrent = false;
    };
  }, [pdf, pageIndex]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return; // Only trigger if click on overlay background
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddTextBox(pageIndex, x, y);
  };

  const pageBoxes = textBoxes.filter((b) => b.pageIndex === pageIndex);

  return (
    <div className="relative border shadow-sm rounded-xl overflow-hidden bg-slate-100 max-w-full mb-6 mx-auto" style={{ width: canvasSize.w ? `${canvasSize.w}px` : "100%" }}>
      <canvas ref={canvasRef} className="max-w-full h-auto block" />
      
      {/* Interactive Drag & Drop Text Overlay Layer */}
      {!loadingPage && (
        <div
          onClick={handleOverlayClick}
          className="absolute inset-0 cursor-text select-none"
          style={{ width: "100%", height: "100%" }}
        >
          {pageBoxes.map((box) => (
            <EditableTextBox
              key={box.id}
              box={box}
              onUpdate={(updates) => onUpdateTextBox(box.id, updates)}
              onDelete={() => onDeleteTextBox(box.id)}
            />
          ))}
        </div>
      )}
      
      {loadingPage && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center min-h-[300px]">
          <div className="size-6 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
/* ─── Editable Draggable Text Box Component ─── */
interface EditableTextBoxProps {
  box: TextBox;
  onUpdate: (updates: Partial<TextBox>) => void;
  onDelete: () => void;
}

function EditableTextBox({ box, onUpdate, onDelete }: EditableTextBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; startW: number; startH: number } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return; // Don't drag while editing text
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeStart({ x: e.clientX, y: e.clientY, startW: box.w, startH: box.h });
  };

  const handleTouchResizeStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setResizeStart({ x: touch.clientX, y: touch.clientY, startW: box.w, startH: box.h });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const parent = document.getElementById(`overlay-${box.id}`)?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const newX = Math.max(0, Math.min(99, box.x + (dx / parentRect.width) * 100));
      const newY = Math.max(0, Math.min(99, box.y + (dy / parentRect.height) * 100));
      
      onUpdate({ x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    else if (resizeStart) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      
      const parent = document.getElementById(`overlay-${box.id}`)?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const newW = Math.max(1, Math.min(100 - box.x, resizeStart.startW + (dx / parentRect.width) * 100));
      const newH = Math.max(0.5, Math.min(100 - box.y, resizeStart.startH + (dy / parentRect.height) * 100));
      
      onUpdate({ w: newW, h: newH });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (dragStart) {
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;
      
      const parent = document.getElementById(`overlay-${box.id}`)?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const newX = Math.max(0, Math.min(99, box.x + (dx / parentRect.width) * 100));
      const newY = Math.max(0, Math.min(99, box.y + (dy / parentRect.height) * 100));
      
      onUpdate({ x: newX, y: newY });
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
    else if (resizeStart) {
      const dx = touch.clientX - resizeStart.x;
      const dy = touch.clientY - resizeStart.y;
      
      const parent = document.getElementById(`overlay-${box.id}`)?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const newW = Math.max(1, Math.min(100 - box.x, resizeStart.startW + (dx / parentRect.width) * 100));
      const newH = Math.max(0.5, Math.min(100 - box.y, resizeStart.startH + (dy / parentRect.height) * 100));
      
      onUpdate({ w: newW, h: newH });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setResizeStart(null);
  };

  useEffect(() => {
    if (dragStart || resizeStart) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragStart, resizeStart]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("touchstart", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const colors = {
    black: "text-black",
    red: "text-red-600",
    blue: "text-blue-600",
    green: "text-green-600",
    white: "text-white"
  };

  const getBgStyle = () => {
    if (box.bgColor === "transparent") return "bg-transparent border-dashed border-slate-300";
    if (box.bgColor.startsWith("#")) {
      return `border-slate-300`;
    }
    return "bg-white border-slate-300";
  };

  return (
    <div
      id={`overlay-${box.id}`}
      onClick={(e) => {
        e.stopPropagation();
        setShowMenu(true);
      }}
      style={{
        position: "absolute",
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.w}%`,
        height: `${box.h}%`,
        backgroundColor: box.bgColor !== "transparent" && box.bgColor.startsWith("#") ? box.bgColor : undefined
      }}
      className={`border rounded p-1 flex flex-col group z-20 shadow-sm ${getBgStyle()}`}
    >
      {/* Small drag bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="cursor-move h-1.5 bg-[#0ea5e9]/20 rounded-sm mb-1 group-hover:bg-[#0ea5e9]/40 transition-all shrink-0"
        title="Drag to reposition"
      />

      <div className="flex-1 min-h-0 relative flex items-center">
        {isEditing ? (
          <textarea
            autoFocus
            value={box.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onBlur={() => setIsEditing(false)}
            style={{ fontSize: `${box.fontSize}px` }}
            className={`w-full h-full bg-transparent border-0 outline-none resize-none font-medium p-0 m-0 leading-tight focus:ring-0 ${box.isBold ? "font-bold" : ""} ${colors[box.color as keyof typeof colors]}`}
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            onTouchStart={(e) => {
              if (showMenu) {
                setIsEditing(true);
              }
            }}
            style={{ fontSize: `${box.fontSize}px` }}
            className={`w-full max-h-full overflow-hidden whitespace-pre-wrap select-all font-medium leading-tight cursor-text ${box.isBold ? "font-bold" : ""} ${colors[box.color as keyof typeof colors]}`}
            title="Double click to edit text"
          >
            {box.text || <span className="text-slate-400 italic text-[10px]">Double click</span>}
          </div>
        )}
      </div>

      {/* Resize Handle at bottom right */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleTouchResizeStart}
        className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize bg-[#0ea5e9]/30 hover:bg-[#0ea5e9] rounded-br-sm opacity-50 group-hover:opacity-100 transition-opacity"
        title="Drag to resize box"
      />

      {/* Floating properties overlay menu */}
      <div className={`absolute left-0 bottom-full mb-1.5 ${showMenu ? "flex" : "hidden"} group-hover:flex items-center gap-1.5 bg-[#0f172a] text-white p-1.5 rounded-lg shadow-xl text-[10px] z-30 whitespace-nowrap`}>
        {/* Font size */}
        <input
          type="number"
          value={box.fontSize}
          onChange={(e) => onUpdate({ fontSize: Math.max(8, parseInt(e.target.value) || 12) })}
          className="w-8 px-1 py-0.5 bg-slate-800 text-white rounded text-center border-0 outline-none text-[10px]"
          title="Font Size (px)"
        />
        {/* Bold */}
        <button
          type="button"
          onClick={() => onUpdate({ isBold: !box.isBold })}
          className={`px-1.5 py-0.5 rounded font-bold ${box.isBold ? "bg-[#0ea5e9]" : "bg-slate-800 hover:bg-slate-700"}`}
        >
          B
        </button>
        {/* Color */}
        <select
          value={box.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="px-1.5 py-0.5 bg-slate-800 text-white rounded border-0 outline-none text-[9px]"
        >
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
        </select>
        {/* BG Mask */}
        <select
          value={["transparent", "#ffffff", "#f8fafc", "#e2e8f0", "#fef3c7", "#000000"].includes(box.bgColor) ? box.bgColor : "custom"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "custom") {
              onUpdate({ bgColor: "#ffffff" });
            } else {
              onUpdate({ bgColor: val });
            }
          }}
          className="px-1.5 py-0.5 bg-slate-800 text-white rounded border-0 outline-none text-[9px]"
          title="Background Fill"
        >
          <option value="#ffffff">White Mask</option>
          <option value="transparent">Transparent</option>
          <option value="#f8fafc">Off-White</option>
          <option value="#e2e8f0">Light Gray</option>
          <option value="#fef3c7">Cream</option>
          <option value="#000000">Black</option>
          <option value="custom">Custom Hex...</option>
        </select>

        {/* Custom hex input */}
        {!["transparent", "#ffffff", "#f8fafc", "#e2e8f0", "#fef3c7", "#000000"].includes(box.bgColor) && (
          <input
            type="text"
            value={box.bgColor}
            onChange={(e) => onUpdate({ bgColor: e.target.value })}
            className="w-12 px-1 py-0.5 bg-slate-800 text-white rounded text-center border-0 outline-none text-[9px] font-mono"
            placeholder="#ffffff"
            title="Enter Hex Color Code"
          />
        )}

        {/* Delete */}
        <button type="button" onClick={onDelete} className="p-1 bg-red-600 rounded hover:bg-red-700" title="Delete text box">
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

