export function GetCookiesObj(cookie) {
  const map = {}
  for (const item of cookie.split(/\s*;\s*/)) {
    if (item.length === 0) {
      continue
    }
    const [key, value] = item.split(/\s*=\s*/)
    if (key === undefined || value === undefined || key.length === 0) {
      continue
    }
    map[key] = decodeURIComponent(value)
  }
  return map
}
