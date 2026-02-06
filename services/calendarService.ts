
import { Booking, BookingStatus } from '../types';

/**
 * Parses an iCalendar (.ics) string into a list of Booking objects.
 * Handles both VALUE=DATE and standard datetime formats.
 */
export const parseICS = (icsData: string): Partial<Booking>[] => {
  const bookings: Partial<Booking>[] = [];
  // Standardize line endings and split by events
  const cleanedData = icsData.replace(/\r\n/g, '\n');
  const events = cleanedData.split('BEGIN:VEVENT');
  
  for (let i = 1; i < events.length; i++) {
    const event = events[i];
    
    // Improved Regex to handle various formats:
    // DTSTART;VALUE=DATE:20240510
    // DTSTART:20240510T150000Z
    const summaryMatch = event.match(/SUMMARY:(.*)/);
    const startMatch = event.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
    const endMatch = event.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/);
    const uidMatch = event.match(/UID:(.*)/);

    if (startMatch && endMatch) {
      const startRaw = startMatch[1];
      const endRaw = endMatch[1];
      
      const checkIn = `${startRaw.slice(0, 4)}-${startRaw.slice(4, 6)}-${startRaw.slice(6, 8)}`;
      const checkOut = `${endRaw.slice(0, 4)}-${endRaw.slice(4, 6)}-${endRaw.slice(6, 8)}`;
      
      let guestName = summaryMatch ? summaryMatch[1].trim() : 'Airbnb Guest';
      // Standardize generic Airbnb strings to a consistent "placeholder"
      const lowerName = guestName.toLowerCase();
      if (lowerName.includes('reserved') || lowerName.includes('airbnb') || !guestName) {
        guestName = 'Airbnb Guest';
      } else {
        // Clean up common Airbnb patterns if it is a real name
        guestName = guestName
          .replace('Reserved - ', '')
          .replace(' (Reserved)', '')
          .split('\\n')[0] 
          .trim();
      }

      const id = uidMatch ? uidMatch[1].trim() : `air-${Math.random().toString(36).substr(2, 9)}`;

      const today = new Date().toISOString().split('T')[0];
      let status = BookingStatus.UPCOMING;
      if (today >= checkIn && today < checkOut) {
        status = BookingStatus.CHECKED_IN;
      } else if (today >= checkOut) {
        status = BookingStatus.COMPLETED;
      }

      bookings.push({
        id,
        guestName: guestName,
        checkIn,
        checkOut,
        status,
        totalPrice: 0,
        guestsCount: 1,
        source: 'Airbnb',
        isSynced: true
      });
    }
  }
  
  return bookings;
};

export const syncAirbnbCalendar = async (icalUrl: string): Promise<Partial<Booking>[]> => {
  if (!icalUrl) return [];

  // Use a CORS proxy to bypass browser restrictions on airbnb.com
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(icalUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      // Try direct if proxy fails (some proxies have limits)
      const directResponse = await fetch(icalUrl).catch(() => null);
      if (!directResponse || !directResponse.ok) {
        throw new Error('Could not reach Airbnb servers. Please try uploading the .ics file manually.');
      }
      const icsText = await directResponse.text();
      return parseICS(icsText);
    }
    
    const icsText = await response.text();
    return parseICS(icsText);
  } catch (error) {
    console.error('Sync Error:', error);
    throw error;
  }
};
