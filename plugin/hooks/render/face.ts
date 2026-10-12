import { base64Decode } from '../codec'

/** A mouth frame: the box where it differs from the resting face, as packed palette indexes. */
export type Patch = { x: number; y: number; w: number; h: number; px: string }
/** A face as scripts/bake.py writes it: 4-bit palette indexes (0 clear), packed two to a byte, base64. */
export type Face = { w: number; h: number; palette: string[]; rest: string; talk: Patch[] }

export type Run = { text: string; fg?: string; bg?: string }

const unpack = (px: string, n: number) => Array.from(base64Decode(px)).flatMap(b => [b >> 4, b & 15]).slice(0, n)

const cache = new WeakMap<Face, number[][]>()
/** Every frame's indexes, the resting face first: each talk frame is the rest with its patch laid on. */
export function frames(face: Face): number[][] {
  let out = cache.get(face)
  if (!out) {
    const rest = unpack(face.rest, face.w * face.h)
    out = [rest, ...face.talk.map(p => {
      const f = rest.slice(), px = unpack(p.px, p.w * p.h)
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) f[(p.y + y) * face.w + p.x + x] = px[y * p.w + x]!
      return f
    })]
    cache.set(face, out)
  }
  return out
}

/** Terminal cells the face takes: one column per pixel, two pixel rows per text row. */
export const faceSize = (face: Face) => ({ rows: Math.ceil(face.h / 2), cols: face.w })

/** Half-block rows of one frame. */
export function faceRows(face: Face, frame: number): Run[][] {
  const px = frames(face)[frame]!
  const at = (x: number, y: number) => (y < face.h ? face.palette[px[y * face.w + x]!] ?? '' : '')
  const rows: Run[][] = []
  for (let y = 0; y < face.h; y += 2) {
    const runs: Run[] = []
    for (let x = 0; x < face.w; x++) {
      const top = at(x, y), bottom = at(x, y + 1)
      const cell: Run = top && bottom ? { text: '▀', fg: top, bg: bottom } : top ? { text: '▀', fg: top } : bottom ? { text: '▄', fg: bottom } : { text: ' ' }
      const last = runs[runs.length - 1]
      if (last && last.fg === cell.fg && last.bg === cell.bg && last.text[0] === cell.text) last.text += cell.text
      else runs.push(cell)
    }
    rows.push(runs)
  }
  return rows
}

const svgCache = new WeakMap<Face, string[]>()
/** One frame as SVG markup, a rect per same-colour run, crisp at any scale; built once per frame, as talking redraws it often. */
export function faceSvg(face: Face, frame: number): string {
  const built = svgCache.get(face) ?? []
  svgCache.set(face, built)
  return built[frame] ??= buildSvg(face, frame)
}

function buildSvg(face: Face, frame: number): string {
  const px = frames(face)[frame]!
  const rects: string[] = []
  for (let y = 0; y < face.h; y++) {
    for (let x = 0; x < face.w;) {
      const k = px[y * face.w + x]!
      let end = x + 1
      while (end < face.w && px[y * face.w + end] === k) end++
      if (k) rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${face.palette[k]}"/>`)
      x = end
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${face.w} ${face.h}" width="${face.w}" height="${face.h}" shape-rendering="crispEdges">${rects.join('')}</svg>`
}
