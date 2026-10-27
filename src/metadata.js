export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
export function formatValue(value) {
  if (value == null) return "Not recorded";
  if (value instanceof Date) return value.toISOString();
  if (ArrayBuffer.isView(value))
    return `[${value.constructor.name}: ${value.byteLength.toLocaleString()} bytes]`;
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
export function flattenGroups(groups) {
  const out = {};
  for (const [group, fields] of Object.entries(groups || {})) {
    if (
      fields &&
      typeof fields === "object" &&
      !Array.isArray(fields) &&
      !ArrayBuffer.isView(fields) &&
      !(fields instanceof Date)
    )
      Object.assign(out, fields);
    else out[group] = fields;
  }
  return out;
}
export function coordinates(tags) {
  let lat = tags.latitude,
    lon = tags.longitude;
  const decimal = (value) =>
    Array.isArray(value)
      ? Number(value[0]) + Number(value[1]) / 60 + Number(value[2]) / 3600
      : Number(value);
  if (lat == null && tags.GPSLatitude != null)
    lat = decimal(tags.GPSLatitude) * (tags.GPSLatitudeRef === "S" ? -1 : 1);
  if (lon == null && tags.GPSLongitude != null)
    lon = decimal(tags.GPSLongitude) * (tags.GPSLongitudeRef === "W" ? -1 : 1);
  if (
    lat == null ||
    lon == null ||
    !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lon)) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  )
    return null;
  return { latitude: Number(lat), longitude: Number(lon) };
}
export function formatBytes(bytes) {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
}
export const tidyNumber = (value) =>
  Number.isFinite(Number(value))
    ? String(Number(Number(value).toFixed(2)))
    : String(value);
export function cameraSettings(tags) {
  return [
    tags.FNumber != null ? `ƒ/${tidyNumber(tags.FNumber)}` : null,
    tags.ExposureTime != null
      ? tags.ExposureTime < 1
        ? `1/${Math.round(1 / tags.ExposureTime)} s`
        : `${tidyNumber(tags.ExposureTime)} s`
      : null,
    tags.ISO != null ? `ISO ${tags.ISO}` : null,
    tags.FocalLength != null ? `${tidyNumber(tags.FocalLength)} mm` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function captureLabel(value) {
  if (!value) return "Not recorded";
  const match = String(value).match(
    /^(\d{4})[:-](\d{2})[:-](\d{2})[T ](\d{2}:\d{2}:\d{2})/,
  );
  if (!match) return String(value);
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]} · ${match[4]}`;
}
