export type TextDirection = "rtl" | "ltr";

const RTL_RE = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
const LTR_RE = /[A-Za-z]/;

export function getTextDirection(text?: string | null): TextDirection {
  const value = (text || "").trim();
  if (!value) return "rtl";

  const firstStrong = value.match(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFCA-Za-z]/);
  if (!firstStrong) return "rtl";
  return RTL_RE.test(firstStrong[0]) ? "rtl" : "ltr";
}

export function isProbablyArabic(text?: string | null) {
  return RTL_RE.test(text || "");
}

export function hasEnglish(text?: string | null) {
  return LTR_RE.test(text || "");
}
