export function fmtDateFromString(val?: string) {
  if (!val) {
    return ""
  }
  return new Date(val).toLocaleString()
}
