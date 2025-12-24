// Calendar and scheduling utilities

export const calendarService = {
  // Create calendar event for follow-up inspection
  createFollowUpEvent: (formData) => {
    const title = `Follow-up Inspection - ${formData.address}`;
    const details = `SF DPH Follow-up Inspection\n\n` +
      `Case Number: ${formData.caseNum}\n` +
      `Property: ${formData.address}\n` +
      `Owner: ${formData.owner}\n` +
      `Correction Due: ${formData.correctionDate}\n\n` +
      `Original Inspector: ${formData.inspector}`;
    
    const correctionDate = new Date(formData.correctionDate);
    const startDate = correctionDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Create Google Calendar link
    const googleCalendarUrl = 
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&details=${encodeURIComponent(details)}` +
      `&dates=${startDate}/${startDate}` +
      `&location=${encodeURIComponent(formData.address || '')}`;
    
    return googleCalendarUrl;
  },

  // Create ICS file for calendar import
  createICSFile: (formData) => {
    const correctionDate = new Date(formData.correctionDate);
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SF DPH//Inspection App//EN',
      'BEGIN:VEVENT',
      `UID:${formData.caseNum}@sfdph.inspection`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(correctionDate)}`,
      `DTEND:${formatDate(new Date(correctionDate.getTime() + 2 * 60 * 60 * 1000))}`, // 2 hours
      `SUMMARY:Follow-up Inspection - ${formData.address}`,
      `DESCRIPTION:SF DPH Follow-up Inspection\\n\\nCase: ${formData.caseNum}\\nProperty: ${formData.address}`,
      `LOCATION:${formData.address || ''}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'DESCRIPTION:Inspection reminder',
      'ACTION:DISPLAY',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return icsContent;
  },

  // Download ICS file
  downloadICS: (formData) => {
    const icsContent = calendarService.createICSFile(formData);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-followup-${formData.caseNum}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Open calendar in new tab
  openInCalendar: (formData) => {
    const url = calendarService.createFollowUpEvent(formData);
    window.open(url, '_blank');
  },
};
