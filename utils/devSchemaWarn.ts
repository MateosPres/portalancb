const warned = new Set<string>();

const shouldWarn = () => {
    try {
        return Boolean(import.meta.env?.DEV);
    } catch {
        return false;
    }
};

export const warnSchemaFallback = (
    scope: string,
    field: string,
    value: unknown,
    fallback: unknown
) => {
    if (!shouldWarn()) return;

    const key = `${scope}:${field}:${String(value)}:${String(fallback)}`;
    if (warned.has(key)) return;
    warned.add(key);

    console.warn(`[schema-normalize] ${scope}.${field} invalido, usando fallback.`, {
        value,
        fallback,
    });
};
