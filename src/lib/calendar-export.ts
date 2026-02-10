/**
 * ICS Calendar Export Utility
 * Generates .ics files from contract dates/deadlines
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

export function generateICS(events: CalendarEvent[], calendarName?: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AgentAIBrief//Contract Analyzer//EN',
    `X-WR-CALNAME:${calendarName || 'Contract Deadlines'}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@agentaibrief.com`;
    const reminderHours = event.reminderHoursBefore ?? 48;

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

    // Add reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT' + reminderHours + 'H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(event.title)} - deadline approaching`,
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Parse date strings from contract analysis into Date objects.
 * Handles various formats: "March 15, 2026", "10 days from ratification", etc.
 */
export function parseContractDate(dateStr: string, ratificationDate?: Date): Date | null {
  if (!dateStr) return null;

  // Try direct date parse
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 2000) return direct;

  // Handle "X days from ratification" patterns
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

  return events;
}
