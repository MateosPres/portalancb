export const onlyDigits = (value?: string | null): string => (value || '').replace(/\D/g, '');

export const formatCpf = (value?: string | null): string => {
    const digits = onlyDigits(value).slice(0, 11);
    if (!digits) return '';

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export const normalizeCpfForStorage = (value?: string | null): string => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length !== 11) return digits;
    return formatCpf(digits);
};

export const normalizePhoneForStorage = (value?: string | null): string => {
    const digitsRaw = onlyDigits(value);
    if (!digitsRaw) return '';

    let digits = digitsRaw;
    if (digits.startsWith('55') && digits.length > 11) {
        digits = digits.slice(2);
    }

    if (digits.length < 10 || digits.length > 11) return '';
    return `+55${digits}`;
};

export const formatPhoneForDisplay = (value?: string | null): string => {
    const digitsRaw = onlyDigits(value);
    if (!digitsRaw) return '';

    let digits = digitsRaw;
    if (digits.startsWith('55') && digits.length > 11) {
        digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);

    if (digits.length <= 2) return `(${digits}`;

    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);

    if (number.length <= 4) return `(${ddd}) ${number}`;
    if (number.length <= 8) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;

    return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
};
