// PDF Export Service
// Uses browser's print API for PDF generation

export const pdfService = {
  // Generate PDF from current report
  generatePDF: async (reportElement) => {
    if (!reportElement) {
      console.error('Report element not found');
      return false;
    }

    try {
      // Trigger browser print dialog
      window.print();
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  },

  // Email report functionality
  emailReport: (formData, reportContent) => {
    const subject = encodeURIComponent(`SF DPH Inspection Report - ${formData.address || 'Property'}`);
    const body = encodeURIComponent(
      `SF DPH Notice of Violation\n\n` +
      `Case Number: ${formData.caseNum}\n` +
      `Address: ${formData.address}\n` +
      `Date: ${formData.date}\n` +
      `Inspector: ${formData.inspector}\n\n` +
      `Please find the full inspection report attached.\n\n` +
      `${reportContent || ''}`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },

  // Download report as text
  downloadReport: (formData, reportContent) => {
    const content = 
      `SF DPH NOTICE OF VIOLATION\n` +
      `${'='.repeat(50)}\n\n` +
      `Case Number: ${formData.caseNum}\n` +
      `Date: ${formData.date}\n` +
      `Address: ${formData.address}\n` +
      `DBA: ${formData.dba}\n` +
      `Owner: ${formData.owner}\n` +
      `Inspector: ${formData.inspector}\n\n` +
      `${reportContent}\n\n` +
      `Correction Date: ${formData.correctionDate}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-${formData.caseNum}-${formData.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
