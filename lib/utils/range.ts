export const range = (start: number, end: number): number[] =>
    Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index);