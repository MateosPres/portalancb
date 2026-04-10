const formatWeekdayLabel = (date: Date) => {
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
    const normalized = weekday.replace('.', '').trim();
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const normalizeDateToIso = (dateValue?: string) => {
    if (!dateValue) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;

    const brDate = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brDate) {
        return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
    }

    return dateValue;
};

const parseIsoDate = (dateValue?: string) => {
    const normalized = normalizeDateToIso(dateValue);
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day, 12, 0, 0, 0);
};

export const formatShortWeekdayDate = (dateValue?: string) => {
    const parsed = parseIsoDate(dateValue);
    if (!parsed) return dateValue || '';

    const weekday = formatWeekdayLabel(parsed);
    const datePart = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit'
    }).format(parsed);

    return `${weekday}, ${datePart}`;
};

export const formatShortWeekdayDateTime = (dateValue?: string, timeValue?: string) => {
    const base = formatShortWeekdayDate(dateValue);
    if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) return base;
    return `${base} • ${timeValue}`;
};
