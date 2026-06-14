// Utility formatters for Elhakim Travel financial data

/**
 * Format number to Indonesian Rupiah (IDR)
 * e.g., 5000000 -> Rp 5.000.000
 */
export const formatRupiah = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format ISO date string to local Indonesian Date
 * e.g., "2026-06-03" -> "3 Juni 2026"
 */
export const formatIndoDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

/**
 * Format ISO datetime string to local Indonesian Datetime
 * e.g., "2026-06-03T12:00:00Z" -> "3 Juni 2026, 19:00 WIB"
 */
export const formatIndoDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    return `${formattedDate} WIB`;
  } catch (e) {
    return dateTimeString;
  }
};

/**
 * Convert numbers to Indonesian text spelling (Terbilang)
 * e.g., 1025000 -> "Satu Juta Dua Puluh Lima Ribu"
 */
export const terbilang = (number) => {
  const words = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];
  
  const num = Math.floor(Math.abs(number));
  
  if (num < 12) {
    return words[num];
  }
  if (num < 20) {
    return words[num - 10] + ' Belas';
  }
  if (num < 100) {
    return words[Math.floor(num / 10)] + ' Puluh ' + words[num % 10];
  }
  if (num < 200) {
    return 'Seratus ' + terbilang(num - 100);
  }
  if (num < 1000) {
    return words[Math.floor(num / 100)] + ' Ratus ' + terbilang(num % 100);
  }
  if (num < 2000) {
    return 'Seribu ' + terbilang(num - 1000);
  }
  if (num < 1000000) {
    return terbilang(Math.floor(num / 1000)) + ' Ribu ' + terbilang(num % 1000);
  }
  if (num < 1000000000) {
    return terbilang(Math.floor(num / 1000000)) + ' Juta ' + terbilang(num % 1000000);
  }
  if (num < 1000000000000) {
    return terbilang(Math.floor(num / 1000000000)) + ' Miliar ' + terbilang(num % 1000000000);
  }
  return 'Nominal Terlalu Besar';
};

/**
 * Formats a number to word spelling with Rupiah suffix
 */
export const terbilangRupiah = (number) => {
  if (number === 0) return 'Nol Rupiah';
  const result = terbilang(number).trim();
  // clean up extra spaces
  return (result.replace(/\s+/g, ' ') + ' Rupiah');
};

/**
 * Truncate text for table displays
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};
