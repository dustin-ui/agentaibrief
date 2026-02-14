/**
 * ICS Calendar Export Utility
 * Generates .ics files and Google Calendar links from contract dates/deadlines
 */

interface CalendarEvent {
  title: string;
  date: Date;
  description?: string;
  location?: string;
  reminderHoursBefore?: number;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === '\n') return '\\n';
    return `\\${match}`;
  });
}

export function generateICS(events: CalendarEvent[], calendarName?: string, options?: { emails?: string[]; reminderFlags?: boolean[] }): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AgentAIBrief//Contract Analyzer//EN',
    `X-WR-CALNAME:${calendarName || 'Contract Deadlines'}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (let idx = 0; idx < events.length; idx++) {
    const event = events[idx];
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@agentaibrief.com`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(event.date)}`,
      `DTEND:${formatICSDate(new Date(event.date.getTime() + 60 * 60 * 1000))}`,
      `SUMMARY:${escapeICS(event.title)}`,
    );

    if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);

    // Add attendees (email recipients)
    const emails = options?.emails?.filter(e => e && e.includes('@')) || [];
    for (const email of emails) {
      lines.push(`ATTENDEE;RSVP=FALSE;CN=${escapeICS(email)}:mailto:${email}`);
    }

    const hasReminder = options?.reminderFlags ? options.reminderFlags[idx] !== false : true;

    // 24-hour reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(event.title)} - 24 hours until deadline`,
      'END:VALARM',
    );

    // 3-hour reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT3H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(event.title)} - 3 hours until deadline`,
      'END:VALARM',
    );

    // Email reminder at 24 hours (only if checked)
    if (hasReminder && emails.length > 0) {
      for (const email of emails) {
        lines.push(
          'BEGIN:VALARM',
          'TRIGGER:-PT24H',
          'ACTION:EMAIL',
          `ATTENDEE:mailto:${email}`,
          `SUMMARY:Reminder: ${escapeICS(event.title)}`,
          `DESCRIPTION:${escapeICS(event.title)} deadline is in 24 hours`,
          'END:VALARM',
        );
      }
    } else if (hasReminder) {
      // Fallback email reminder without specific attendee
      lines.push(
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:EMAIL',
        `SUMMARY:Reminder: ${escapeICS(event.title)}`,
        `DESCRIPTION:${escapeICS(event.title)} deadline is in 24 hours`,
        'END:VALARM',
      );
    }

    // Email reminder at 3 hours (legacy — keep for backwards compat)
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT3H',
      'ACTION:EMAIL',
      `SUMMARY:URGENT: ${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.title)} deadline is in 3 hours`,
      'END:VALARM',
    );

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Generate a Google Calendar link for an event
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const endDate = new Date(event.date.getTime() + 60 * 60 * 1000);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGCal(event.date)}/${formatGCal(endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Parse date strings from contract analysis into Date objects.
 */
export function parseContractDate(dateStr: string, ratificationDate?: Date): Date | null {
  if (!dateStr) return null;

  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 2000) return direct;

  const daysMatch = dateStr.match(/(\d+)\s*(?:business\s+)?days?\s+(?:from|after|of)\s+ratification/i);
  if (daysMatch && ratificationDate) {
    const days = parseInt(daysMatch[1]);
    const result = new Date(ratificationDate);
    result.setDate(result.getDate() + days);
    return result;
  }

  return null;
}

/**
 * Extract calendar events from analyzed contract data
 */
export function extractCalendarEvents(
  contractData: Record<string, unknown>,
  address: string,
  ratificationDate?: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const refDate = ratificationDate || new Date();

  // Closing date
  const closingDate = parseContractDate(contractData.closingDate as string);
  if (closingDate) {
    events.push({
      title: `🏠 CLOSING: ${address}`,
      date: closingDate,
      description: `Settlement/Closing for ${address}`,
      location: (contractData.settlementCompany as string) || undefined,
    });
  }

  // Contingencies
  const contingencies = contractData.contingencies as Array<{ type: string; deadline: string; details: string }>;
  if (contingencies) {
    for (const c of contingencies) {
      if (c.deadline?.toLowerCase().includes('waiv')) continue;
      const date = parseContractDate(c.deadline, refDate);
      if (date) {
        events.push({
          title: `⚠️ DEADLINE: ${c.type} - ${address}`,
          date,
          description: `${c.type} contingency deadline.\n${c.details}`,
        });
      }
    }
  }

  // All dates and deadlines from comparison data
  const allDates = contractData.allDatesAndDeadlines as Array<{ event: string; date: string; daysFromRatification?: number; daysFromNow?: number }>;
  if (allDates) {
    for (const d of allDates) {
      let date: Date | null = null;

      // First try daysFromRatification if we have a ratification date
      if (d.daysFromRatification && ratificationDate) {
        date = new Date(ratificationDate);
        date.setDate(date.getDate() + d.daysFromRatification);
      }

      // Then try parsing the date string
      if (!date && d.date) {
        date = parseContractDate(d.date, refDate);
      }

      if (date) {
        events.push({
          title: `📋 ${d.event} - ${address}`,
          date,
          description: `${d.event} for ${address}${d.daysFromRatification ? ` (${d.daysFromRatification} days from ratification)` : ''}`,
        });
      }
    }
  }

  // EMD due date
  const emd = contractData.earnestMoney as { amount?: string; dueDate?: string };
  if (emd?.dueDate) {
    const date = parseContractDate(emd.dueDate, refDate);
    if (date) {
      events.push({
        title: `💰 EMD DUE: ${emd.amount || 'Earnest Money'} - ${address}`,
        date,
        description: `Earnest money deposit of ${emd.amount} due`,
      });
    }
  }

  // Possession date
  if (contractData.possessionDate && (contractData.possessionDate as string).toLowerCase() !== 'at settlement') {
    const date = parseContractDate(contractData.possessionDate as string);
    if (date) {
      events.push({
        title: `🔑 POSSESSION: ${address}`,
        date,
        description: 'Buyer takes possession',
      });
    }
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return events.filter(e => {
    const key = `${e.title}-${e.date.toISOString()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
