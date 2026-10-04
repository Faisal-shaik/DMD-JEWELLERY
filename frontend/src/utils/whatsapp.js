/**
 * Formats a phone/whatsapp number to international format (prepending country code 91 if 10-digits)
 * and generates a universal wa.me / api.whatsapp.com link compatible with Android, iPhone, and Desktop.
 */
export const formatWhatsAppNumber = (num) => {
  if (!num) return '919010322685'; // Default fallback number
  let digits = num.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return digits;
};

export const getWhatsAppUrl = (number, message = '') => {
  const cleanNum = formatWhatsAppNumber(number);
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleanNum}${textParam}`;
};
