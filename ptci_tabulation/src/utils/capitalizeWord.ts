export const FormatFullName = (value: string): string => {
    let words = value.split(/,\s*/).flatMap(d => d.split(/\s+/)).filter(Boolean).map(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase())
    const [lastName, ...firstName] = words
    return `${lastName}, ${firstName.join(" ")}`;
}

type SplitName = { firstName: string, lastName: string }
export const splitName = (fullName: string): SplitName => {
    const [last, ...first] = fullName.trim().split(/\,\s*/).filter(Boolean);
    const lastName = last ?? "";
    const firstName = first.join(" ") ?? "";
    return { firstName, lastName }
}

export const CapitalizeLabel = <T extends string>(value: T): Capitalize<T> => {
    const lowered = value.toLowerCase();
    return lowered.charAt(0).toUpperCase().concat(lowered.slice(1)) as Capitalize<T>;
};