export const normalizeText = (text) => text.trim().replace(/\s+/g, " ");

export const sluggify = (text) => {
  return text
    .toLowerCase()
    .replace(/[“”"'‘’.,?()\[\]!]/g, "")
    .replace(/[\/]/g, "_")
    .replace(/\s/g, "-")
    .replace(/–/g, "-")
    .replace(/-+/g, "-");
};
