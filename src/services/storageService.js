// Local storage service for draft inspection reports

const STORAGE_KEYS = {
  DRAFTS: 'inspection_drafts',
  CURRENT_DRAFT: 'current_inspection_draft',
  IMAGES: 'inspection_images',
};

export const storageService = {
  // Save current inspection draft
  saveDraft: (formData, images, checkedAreas, checkedViolations) => {
    try {
      const draft = {
        id: formData.caseNum || crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        formData,
        checkedAreas: Array.from(checkedAreas),
        checkedViolations: Array.from(checkedViolations),
        imageCount: images.length,
        imageMetadata: images.map(img => ({
          id: img.id,
          description: img.description,
          tags: img.tags,
          highlights: img.highlights,
          status: img.status,
        })),
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_DRAFT, JSON.stringify(draft));
      
      // Also save to drafts list
      const drafts = storageService.getAllDrafts();
      const existingIndex = drafts.findIndex(d => d.id === draft.id);
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft;
      } else {
        drafts.push(draft);
      }
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
      
      return draft.id;
    } catch (error) {
      console.error('Error saving draft:', error);
      return null;
    }
  },

  // Load current draft
  loadCurrentDraft: () => {
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.CURRENT_DRAFT);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  },

  // Load a specific draft
  loadDraft: (id) => {
    try {
      const drafts = storageService.getAllDrafts();
      return drafts.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  },

  // Get all drafts
  getAllDrafts: () => {
    try {
      const drafts = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      return drafts ? JSON.parse(drafts) : [];
    } catch (error) {
      console.error('Error loading drafts:', error);
      return [];
    }
  },

  // Delete a draft
  deleteDraft: (id) => {
    try {
      const drafts = storageService.getAllDrafts();
      const filtered = drafts.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
      
      // Also clear current draft if it's the one being deleted
      const current = storageService.loadCurrentDraft();
      if (current && current.id === id) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_DRAFT);
      }
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  },

  // Clear current draft
  clearCurrentDraft: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DRAFT);
      return true;
    } catch (error) {
      console.error('Error clearing draft:', error);
      return false;
    }
  },

  // Save images to IndexedDB (for larger storage)
  saveImages: async (images) => {
    // For now, store metadata only in localStorage
    // Full IndexedDB implementation would go here for production
    try {
      const imageData = images.map(img => ({
        id: img.id,
        url: img.url,
        file: img.file ? {
          name: img.file.name,
          size: img.file.size,
          type: img.file.type,
        } : null,
      }));
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imageData));
      return true;
    } catch (error) {
      console.error('Error saving images:', error);
      return false;
    }
  },

  // Check if there's a saved draft
  hasDraft: () => {
    return !!localStorage.getItem(STORAGE_KEYS.CURRENT_DRAFT);
  },
};
