const MENU_FINGERPRINT_FIELDS = ["name", "description", "price", "category", "imageUrl", "available", "featured", "sortOrder"];

function timestampValue(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value === "string") return Date.parse(value) || 0;
  return 0;
}

export function menuFingerprint(item) {
  return JSON.stringify(MENU_FINGERPRINT_FIELDS.map(field => item[field] ?? null));
}

// Retain a deterministic canonical document: oldest createdAt, then document ID.
// A name alone is never used as the duplicate criterion.
export function findExactMenuDuplicateGroups(items) {
  const byFingerprint = new Map();
  items.forEach(item => {
    if (!item?.id) return;
    const group = byFingerprint.get(menuFingerprint(item)) || [];
    group.push(item);
    byFingerprint.set(menuFingerprint(item), group);
  });
  return [...byFingerprint.values()]
    .filter(group => group.length > 1)
    .map(group => {
      const sorted = [...group].sort((a, b) => timestampValue(a.createdAt) - timestampValue(b.createdAt) || a.id.localeCompare(b.id));
      return { canonical: sorted[0], duplicates: sorted.slice(1) };
    });
}

// A display identity is stronger than a name-only match: this project assigns
// one sort position per named product within a category. It lets customers see
// one record while an administrator reviews any conflicting field values.
export function findMenuIdentityCollisionGroups(items) {
  const byIdentity = new Map();
  items.forEach(item => {
    if (!item?.id) return;
    const identity = JSON.stringify([item.name ?? null, item.category ?? null, item.sortOrder ?? null]);
    const group = byIdentity.get(identity) || [];
    group.push(item);
    byIdentity.set(identity, group);
  });
  return [...byIdentity.values()]
    .filter(group => group.length > 1)
    .map(group => {
      const sorted = [...group].sort((a, b) => timestampValue(a.createdAt) - timestampValue(b.createdAt) || a.id.localeCompare(b.id));
      return { canonical: sorted[0], duplicates: sorted.slice(1), exact: new Set(sorted.map(menuFingerprint)).size === 1 };
    });
}

export function collapseExactMenuDuplicates(items) {
  const byDocumentId = new Map();
  items.forEach(item => { if (item?.id) byDocumentId.set(item.id, item); });
  const documentItems = [...byDocumentId.values()];
  const duplicateGroups = findMenuIdentityCollisionGroups(documentItems);
  const duplicateIds = new Set(duplicateGroups.flatMap(group => group.duplicates.map(item => item.id)));
  return {
    allByDocumentId: byDocumentId,
    items: documentItems.filter(item => !duplicateIds.has(item.id)),
    duplicateGroups
  };
}
