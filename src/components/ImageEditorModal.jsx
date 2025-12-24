import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, ChevronRight } from './Icons';

export const ImageEditorModal = ({ 
  image, 
  onClose, 
  onUpdate, 
  knownTags, 
  onAddKnownTag, 
  onNextImage 
}) => {
  const [newTag, setNewTag] = useState("");
  const imgRef = useRef(null);

  // Fix: Added proper dependencies to useEffect
  const updateDescription = useCallback((tags) => {
    if (tags && tags.length > 0 && !image?.description) {
      const desc = `Observed ${tags.join(', ')} in this location.`;
      onUpdate(image.id, { description: desc });
    }
  }, [image?.id, image?.description, onUpdate]);

  useEffect(() => {
    if (image?.tags) {
      updateDescription(image.tags);
    }
  }, [image?.tags, updateDescription]);

  if (!image) return null;

  const handleImageClick = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newHighlights = [...(image.highlights || []), { x, y, id: crypto.randomUUID() }];
    onUpdate(image.id, { highlights: newHighlights });
  };

  const removeHighlight = (e, highlightId) => {
    e.stopPropagation();
    const newHighlights = (image.highlights || []).filter(h => h.id !== highlightId);
    onUpdate(image.id, { highlights: newHighlights });
  };

  const handleAddTag = (tagToAdd) => {
    const tag = tagToAdd || newTag;
    if (tag.trim()) {
      const cleanTag = tag.trim();
      let updatedTags = image.tags || [];
      
      if (!updatedTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
        updatedTags = [...updatedTags, cleanTag];
        const newDesc = `Observed ${updatedTags.join(', ')} at this location.`;
        onUpdate(image.id, { tags: updatedTags, description: newDesc });
      }
      
      onAddKnownTag(cleanTag);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = (image.tags || []).filter(t => t !== tagToRemove);
    const newDesc = updatedTags.length > 0 ? `Observed ${updatedTags.join(', ')} at this location.` : "";
    onUpdate(image.id, { tags: updatedTags, description: newDesc });
  };

  const handleVerify = () => {
    onUpdate(image.id, { status: 'verified' });
    if (onNextImage) onNextImage();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden">
        
        {/* Left: Image Canvas */}
        <div className="flex-1 bg-slate-900 relative flex items-center justify-center p-4 cursor-crosshair overflow-hidden">
          <div className="relative inline-block max-w-full max-h-full">
            <img 
              ref={imgRef}
              src={image.url} 
              alt="Inspection" 
              className="max-w-full max-h-full object-contain"
              onClick={handleImageClick}
            />
            {(image.highlights || []).map(h => (
              <div
                key={h.id}
                onClick={(e) => removeHighlight(e, h.id)}
                className="absolute w-12 h-12 border-4 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-500/20 transition-colors shadow-sm z-10"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                title="Click to remove highlight"
              />
            ))}
          </div>
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm pointer-events-none">
            Click image to highlight violations
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Review Evidence</h3>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${image.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {image.status === 'verified' ? 'Verified' : 'Review Needed'}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Tag Management */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Assigned Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(image.tags || []).map(tag => (
                  <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200 flex items-center gap-1 capitalize font-medium">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12}/></button>
                  </span>
                ))}
                {(image.tags || []).length === 0 && <span className="text-xs text-slate-400 italic">No tags assigned</span>}
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500"
                    placeholder="Add custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button onClick={() => handleAddTag()} className="bg-slate-800 text-white p-1.5 rounded hover:bg-slate-700"><Plus size={14}/></button>
                </div>
                
                {/* Known Tags Quick Select */}
                <div className="text-[10px] text-slate-500 font-medium mt-2 mb-1">Suggested Tags:</div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {knownTags.filter(t => !(image.tags || []).includes(t)).map(t => (
                    <button 
                      key={t}
                      onClick={() => handleAddTag(t)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-[10px] text-slate-600 capitalize text-left"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Description (Auto-Updates)
              </label>
              <textarea 
                className="w-full text-sm p-2 border border-slate-300 rounded h-24 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none bg-slate-50"
                placeholder="Description updates as tags change..."
                value={image.description || ""}
                onChange={(e) => onUpdate(image.id, { description: e.target.value })}
              />
            </div>

          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
            <button 
              onClick={handleVerify} 
              className="bg-emerald-600 text-white w-full py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Confirm & Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
