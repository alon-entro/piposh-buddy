const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const LOOKUP = new Map([...ALPHABET].map((c, i) => [c, i]))

export function base64Decode(s: string): Uint8Array {
  const clean = s.replace(/=+$/, '')
  const out: number[] = []
  let buf = 0, bits = 0
  for (const ch of clean) {
    const v = LOOKUP.get(ch)
    if (v === undefined) throw new Error(`invalid base64 character: ${ch}`)
    buf = (buf << 6) | v
    bits += 6
    if (bits >= 8) {
      bits -= 8
      out.push((buf >> bits) & 255)
    }
  }
  return new Uint8Array(out)
}

export const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s)

export function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (const byte of utf8(s)) {
    h ^= byte
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
