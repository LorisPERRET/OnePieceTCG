export const COLLECTION_UPDATED_AT_KEY = "collection-updated-at";

export function markCollectionUpdated() {
    if (typeof window === "undefined") return;
    localStorage.setItem(COLLECTION_UPDATED_AT_KEY, String(Date.now()));
}

export function readCollectionUpdatedAt(): number {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(COLLECTION_UPDATED_AT_KEY);
    if (!raw) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
}
