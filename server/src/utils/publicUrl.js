const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, "");

export function buildFileUrl(key) {
  return `${PUBLIC_URL}/uploads/${key}`;
}
