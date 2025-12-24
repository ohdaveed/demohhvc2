import React, { useState, useRef, useEffect, useCallback } from 'react';
import { callGemini, callGeminiVision, fileToBase64 } from '../services/geminiService';
import { VIOLATION_DATABASE, VIOLATION_CHECKLIST, AREAS_INSPECTED, INITIAL_TAGS } from '../constants/violations';
import { ImageEditorModal } from './ImageEditorModal';
import { 
  Upload, Trash2, Sparkles, Printer, Plus, X, Maximize2, RefreshCw,
  Activity, FileText, List, CheckCircle, AlertCircle, Camera, Tag, 
  ArrowRight, AlertTriangle, Download 
} from './Icons';

function InspectionForm() {
  // State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    timeIn: "09:00",
    timeOut: "10:30",
    address: "",
    dba: "",
    owner: "",
    management: "",
    caseNum: `SF-${new Date().getFullYear()}-001`,
    inspector: "",
    facilityType: "Apartment",
    inspectionType: "Routine",
    reportContent: "", 
    correctionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    locationId: "",
    complaintId: "",
  });

  const [checkedAreas, setCheckedAreas] = useState(new Set());
  const [checkedViolations, setCheckedViolations] = useState(new Set());
  const [images, setImages] = useState([]);
  const [modalImageId, setModalImageId] = useState(null);
  const [knownTags, setKnownTags] = useState(INITIAL_TAGS); 
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Fix memory leak: cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArea = (area) => {
    const next = new Set(checkedAreas);
    if (next.has(area)) next.delete(area);
    else next.add(area);
    setCheckedAreas(next);
  };

  const toggleViolation = (id) => {
    const next = new Set(checkedViolations);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedViolations(next);
  };

  const addKnownTag = (tag) => {
    const cleanTag = tag.trim();
    if (!knownTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
      setKnownTags(prev => [...prev, cleanTag]);
    }
  };

  // PDF Handling
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    try {
      const base64 = await fileToBase64(file);
      const prompt = `Analyze PDF... {extract standard fields}`; 
      const text = await callGeminiVision(prompt, base64, "application/pdf");
      if (text) {
         const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
         const data = JSON.parse(cleanJson);
         setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to parse PDF.");
    } finally {
      setIsParsingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // --- AUTOMATED TAGGING WORKFLOW ---
  const analyzeImageForTags = async (img) => {
    try {
      const base64 = await fileToBase64(img.file);
      const mimeType = img.file.type || "image/jpeg";
      
      const allTagOptions = knownTags.join(', ');
      
      const prompt = `
        Analyze this inspection photo.
        Identify if any of the following conditions are present: ${allTagOptions}.
        Return a JSON object with a key "tags" containing an array of strings matching the identified conditions.
        Example: {"tags": ["Rodent Burrows", "Uncontainerized Garbage"]}
      `;

      const text = await callGeminiVision(prompt, base64, mimeType);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      return result.tags || [];
    } catch (e) {
      console.error("Auto-tagging error", e);
      return [];
    }
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFileObjects = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        description: "Analyzing...",
        tags: [],
        highlights: [],
        status: 'analyzing' 
      }));

      setImages(prev => [...prev, ...newFileObjects]);
      
      setModalImageId(newFileObjects[0].id);

      newFileObjects.forEach(async (imgObj) => {
        const detectedTags = await analyzeImageForTags(imgObj);
        
        setImages(prev => prev.map(img => {
          if (img.id === imgObj.id) {
            const desc = detectedTags.length > 0 
              ? `Observed ${detectedTags.join(', ')} at this location.` 
              : "No specific violations detected by AI.";
            
            return { 
              ...img, 
              tags: detectedTags, 
              description: desc,
              status: 'needs_review' 
            };
          }
          return img;
        }));
      });
    }
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove && imageToRemove.url) {
        // Fix memory leak: revoke object URL
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
    if (modalImageId === id) setModalImageId(null);
  };

  const updateImage = (id, updates) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const handleNextImage = () => {
    if (!modalImageId) return;
    const currentIndex = images.findIndex(img => img.id === modalImageId);
    if (currentIndex !== -1 && currentIndex < images.length - 1) {
      setModalImageId(images[currentIndex + 1].id);
    } else {
      setModalImageId(null); 
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    
    // 1. GATHER ALL VIOLATIONS & METADATA
    const checklistFindings = Array.from(checkedViolations).map(id => {
       const dbEntry = VIOLATION_DATABASE[id] || {};
       return { name: id, abatement: dbEntry.action, importance: dbEntry.importance, code: dbEntry.code };
    });

    const imageFindings = images.map((img, idx) => ({
      source: `Photo #${idx + 1}`,
      tags: img.tags,
      description: img.description || "Observed on property.",
      status: img.status
    })).filter(f => f.tags && f.tags.length > 0);

    const prompt = `
      You are generating the COMPLETE narrative body text for an official San Francisco DPH Notice of Violation.
      
      CONTEXT:
      - Date: ${formData.date}
      - Property: ${formData.address}
      - Inspection Type: ${formData.inspectionType}
      - Correction Deadline: ${formData.correctionDate}
      
      INPUT DATA:
      1. Violations Identified (Checklist): ${JSON.stringify(checklistFindings)}
      2. Photo Evidence (User Reviewed): ${JSON.stringify(imageFindings)}
      
      INSTRUCTIONS:
      1. Start with the EXACT sentence: "The following Items Represent Health Code Violations and Must Be Corrected By the Indicated Date(s): ${formData.correctionDate}"
      
      2. Write a brief "Observations" narrative paragraph summarizing the inspection (reason, access, general findings).
      
      3. Generate a "Corrective Actions" section. For each violation type found (consolidating checklist & photos), use this EXACT format:
      
      VIOLATION #[N]: [Title] - [Code Section]
      Location: [Specific location from photo description or general area]
      Condition Observed: [Description of observation. Explain why it is a health hazard using the "Importance" data provided.]
      Required Correction: [Specific actionable steps using the "Abatement" data provided.]

      4. End with the standard enforcement notice: "Failure to comply with this Notice of Violation will result in a citation to a Director's Hearing pursuant to Section 596(e)(3)..." (and the rest of the standard legal text regarding fees and fines).

      Do not use markdown code blocks. Use plain text suitable for a textarea.
    `;

    const text = await callGemini(prompt);
    if (text) setFormData(prev => ({ ...prev, reportContent: text }));
    setIsGeneratingReport(false);
  };

  const selectedImage = images.find(img => img.id === modalImageId);

  return (
    <div className="min-h-screen bg-slate-100 py-8 font-sans print:bg-white print:p-0">
      
      {modalImageId && (
        <ImageEditorModal 
          image={selectedImage}
          onClose={() => setModalImageId(null)}
          onUpdate={updateImage}
          knownTags={knownTags}
          onAddKnownTag={addKnownTag}
          onNextImage={handleNextImage} 
        />
      )}

      {/* --- FLOATING ACTION BAR (Hidden on Print) --- */}
      <div className="fixed bottom-6 right-6 flex gap-3 print:hidden z-40">
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={pdfInputRef}
          onChange={handlePdfUpload} 
        />
        <button 
          onClick={() => pdfInputRef.current.click()} 
          disabled={isParsingPdf}
          className="bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {isParsingPdf ? <Activity size={18} className="animate-spin"/> : <FileText size={18}/>}
          {isParsingPdf ? "Importing..." : "Import PDF"}
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-slate-800 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-700 transition-colors font-medium"
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] print:shadow-none print:w-full">
        
        {/* HEADER */}
        <div className="p-8 border-b-4 border-slate-800 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl rounded">SF</div>
            <div className="text-right">
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">Notice of Violation</h1>
              <h2 className="text-sm font-semibold uppercase text-slate-500">Healthy Housing & Vector Control</h2>
              <p className="text-xs text-slate-400 mt-1">San Francisco Dept. of Public Health</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-xs font-mono border-t border-slate-200 pt-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full font-bold bg-transparent outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">Time In</label>
              <input type="time" name="timeIn" value={formData.timeIn} onChange={handleInputChange} className="w-full font-bold bg-transparent outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">Time Out</label>
              <input type="time" name="timeOut" value={formData.timeOut} onChange={handleInputChange} className="w-full font-bold bg-transparent outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">Case Number</label>
              <input type="text" name="caseNum" value={formData.caseNum} onChange={handleInputChange} className="w-full font-bold bg-transparent outline-none" />
            </div>
          </div>
        </div>

        {/* SECTION 1: LOCATION INFO */}
        <div className="px-8 py-6 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">Location Information</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-indigo-600">Property Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border-b border-slate-300 py-1 focus:border-indigo-600 outline-none transition-colors" placeholder="123 Main St..." />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-indigo-600">Owner Name</label>
              <input type="text" name="owner" value={formData.owner} onChange={handleInputChange} className="w-full border-b border-slate-300 py-1 focus:border-indigo-600 outline-none transition-colors" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-indigo-600">DBA / Business Name</label>
              <input type="text" name="dba" value={formData.dba} onChange={handleInputChange} className="w-full border-b border-slate-300 py-1 focus:border-indigo-600 outline-none transition-colors" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-indigo-600">Management Company</label>
              <input type="text" name="management" value={formData.management} onChange={handleInputChange} className="w-full border-b border-slate-300 py-1 focus:border-indigo-600 outline-none transition-colors" />
            </div>
            {/* Extended Fields for PDF Extraction */}
            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-indigo-600">Location ID</label>
              <input type="text" name="locationId" value={formData.locationId} onChange={handleInputChange} className="w-full border-b border-slate-300 py-1 focus:border-indigo-600 outline-none transition-colors" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-indigo-600">Complaint ID</label>
              <input type="text" name="complaintId" value={formData.complaintId} onChange={handleInputChange} className="w-full border-b border-slate-300 py-1 focus:border-indigo-600 outline-none transition-colors" />
            </div>
          </div>
        </div>

        {/* SECTION 2: FACILITY DETAILS (Checkboxes) */}
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Type of Facility</h4>
              <div className="space-y-1">
                {['Apartment', 'Tourist Hotel', 'SRO', 'Private Residence'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input 
                      type="radio" 
                      name="facilityType" 
                      value={type} 
                      checked={formData.facilityType === type} 
                      onChange={handleInputChange}
                      className="accent-slate-900" 
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Inspection Type</h4>
              <div className="space-y-1">
                {['Routine', 'Complaint', 'Re-inspection', 'Survey'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input 
                      type="radio" 
                      name="inspectionType" 
                      value={type} 
                      checked={formData.inspectionType === type} 
                      onChange={handleInputChange}
                      className="accent-slate-900" 
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Areas Inspected</h4>
              <div className="grid grid-cols-2 gap-1">
                {AREAS_INSPECTED.map(area => (
                  <label key={area} className="flex items-center gap-1 cursor-pointer text-[10px] whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      checked={checkedAreas.has(area)} 
                      onChange={() => toggleArea(area)}
                      className="accent-slate-900 w-3 h-3" 
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: VIOLATION CHECKLIST */}
        <div className="px-8 py-6 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider flex items-center justify-between">
            <span>Violation Categories (Article 11)</span>
          </h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Pests & Vectors</h4>
              <div className="space-y-1.5">
                {VIOLATION_CHECKLIST.pests.map(v => (
                  <label key={v.id} className="flex items-start gap-2 cursor-pointer text-xs group">
                    <input type="checkbox" checked={checkedViolations.has(v.id)} onChange={() => toggleViolation(v.id)} className="mt-0.5 accent-red-600" />
                    <span className={checkedViolations.has(v.id) ? "text-red-700 font-medium" : "text-slate-600"}>{v.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Sanitation</h4>
              <div className="space-y-1.5">
                {VIOLATION_CHECKLIST.sanitation.map(v => (
                  <label key={v.id} className="flex items-start gap-2 cursor-pointer text-xs group">
                    <input type="checkbox" checked={checkedViolations.has(v.id)} onChange={() => toggleViolation(v.id)} className="mt-0.5 accent-red-600" />
                    <span className={checkedViolations.has(v.id) ? "text-red-700 font-medium" : "text-slate-600"}>{v.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Structural</h4>
              <div className="space-y-1.5">
                {VIOLATION_CHECKLIST.structural.map(v => (
                  <label key={v.id} className="flex items-start gap-2 cursor-pointer text-xs group">
                    <input type="checkbox" checked={checkedViolations.has(v.id)} onChange={() => toggleViolation(v.id)} className="mt-0.5 accent-red-600" />
                    <span className={checkedViolations.has(v.id) ? "text-red-700 font-medium" : "text-slate-600"}>{v.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PHOTO DOCUMENTATION (GRID) */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Evidence & Observations</h3>
            <div className="print:hidden flex gap-3">
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-colors">
                <Upload size={14} /> Upload Photos
              </button>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-2">
              {images.map((img, idx) => (
                <div key={img.id} className={`relative group border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-full break-inside-avoid ${img.status === 'verified' ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-slate-200'}`}>
                  <div className="relative aspect-square cursor-pointer bg-slate-100" onClick={() => setModalImageId(img.id)}>
                    <img src={img.url} alt="Evidence" className="w-full h-full object-cover" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      {img.status === 'analyzing' && <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow">Analyzing...</span>}
                      {img.status === 'needs_review' && <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow">Review Needed</span>}
                      {img.status === 'verified' && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-1"><CheckCircle size={8} /> Verified</span>}
                    </div>

                    {(img.highlights || []).map(h => (
                      <div key={h.id} className="absolute w-4 h-4 border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${h.x}%`, top: `${h.y}%` }}></div>
                    ))}
                    
                    {!img.status || img.status !== 'analyzing' ? (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 print:hidden">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm"><Maximize2 className="text-white" size={20} /></div>
                      </div>
                    ) : null}
                    
                    <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 print:hidden" title="Delete"><Trash2 size={12} /></button>
                  </div>
                  <div className="p-2 text-[10px] leading-tight flex-1">
                    <div className="font-bold text-slate-400 mb-1">Photo #{idx + 1}</div>
                    <p className="text-slate-800 line-clamp-3">{img.description || <span className="italic text-slate-400">No description...</span>}</p>
                    {img.tags && img.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {img.tags.slice(0, 3).map(tag => (<span key={tag} className="px-1 bg-slate-100 border border-slate-200 rounded text-[9px] text-slate-600 capitalize">{tag}</span>))}
                        {img.tags.length > 3 && <span className="text-[9px] text-slate-400">+{img.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center print:hidden">
              <p className="text-slate-400 text-sm">No photos uploaded. Click "Upload Photos" to begin evidence collection.</p>
            </div>
          )}
        </div>

        {/* SECTION 5: UNIFIED REPORT CONTENT */}
        <div className="px-8 py-6 pb-12 border-b border-slate-200">
          <div className="mb-4 relative group">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Observations, Corrective Actions, and Correction Date</h3>
              {/* Generate Report Button (Hidden on Print) */}
              <button 
                onClick={generateReport}
                disabled={isGeneratingReport}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 print:hidden"
              >
                <List size={10} /> 
                {isGeneratingReport ? "Generating..." : "Generate Full Report"}
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded border border-slate-200">
                 <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Correction Date:</label>
                 <input 
                   type="date" 
                   name="correctionDate" 
                   value={formData.correctionDate} 
                   onChange={handleInputChange} 
                   className="bg-transparent text-sm font-bold text-slate-900 outline-none" 
                 />
              </div>
              
              <textarea 
                className="w-full p-4 border border-slate-300 rounded text-sm leading-relaxed min-h-[400px] outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 whitespace-pre-wrap font-mono"
                value={formData.reportContent}
                onChange={handleInputChange}
                name="reportContent"
                placeholder="Click 'Generate Full Report' to populate this section with observations, specific violations, and required corrective actions..."
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 pb-12">
          <div className="grid grid-cols-2 gap-12 text-xs text-slate-600 border-t border-slate-200 pt-6">
            <div>
              <p className="font-bold uppercase mb-2 text-slate-900">Compliance Order</p>
              <p className="leading-relaxed text-justify">You are hereby ordered to correct the violations listed above by the Correction Date specified. A re-inspection will be conducted on or after this date. Failure to comply may result in administrative penalties, liens, or legal action per SF Health Code Article 11.</p>
            </div>
            <div>
              <p className="font-bold uppercase mb-8 text-slate-900">Inspector Signature</p>
              <div className="border-b border-black mb-2"></div>
              <div className="flex justify-between font-mono"><span>{formData.inspector || "Inspector Name"}</span><span>REHS #______</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default InspectionForm;
