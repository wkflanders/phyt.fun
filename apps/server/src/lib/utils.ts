export const toStringValue = (value: unknown): string | undefined => {
    if (value == null) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return value.toString();
    // For non-primitive objects, use JSON.stringify.
    return JSON.stringify(value);
};
