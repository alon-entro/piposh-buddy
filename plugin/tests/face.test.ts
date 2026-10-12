import { describe, expect, test } from 'claude-code/testing'
import { CHARACTERS } from '../hooks/characters'
import { FACES } from '../hooks/data/faces.generated'
import { faceRows, faceSize, faceSvg, frames, type Face } from '../hooks/render/face'

// A 2x3 face, rest all colour 1; one talk frame paints its middle pixel in colour 2. Bytes pack two indexes each.
const tiny: Face = {
  w: 2, h: 3, palette: ['', '#000000', '#ff0000'],
  rest: btoa(String.fromCharCode(0x11, 0x11, 0x11)),
  talk: [{ x: 1, y: 1, w: 1, h: 1, px: btoa(String.fromCharCode(0x20)) }],
}

describe('face', () => {
  test('a talk frame is the rest with its patch laid on', () => {
    expect(frames(tiny)).toEqual([[1, 1, 1, 1, 1, 1], [1, 1, 1, 2, 1, 1]])
  })
  test('half-block rows: two pixel rows per text row, a clear bottom half on an odd height', () => {
    expect(faceSize(tiny)).toEqual({ rows: 2, cols: 2 })
    const rows = faceRows(tiny, 1)
    expect(rows[0]).toEqual([{ text: '▀', fg: '#000000', bg: '#000000' }, { text: '▀', fg: '#000000', bg: '#ff0000' }])
    expect(rows[1]).toEqual([{ text: '▀▀', fg: '#000000' }])
  })
  test('svg: one rect per run, nothing for clear pixels', () => {
    const svg = faceSvg({ ...tiny, rest: btoa(String.fromCharCode(0x01, 0x11, 0x11)) }, 0)
    expect(svg).toContain('viewBox="0 0 2 3"')
    expect(svg.match(/<rect/g)?.length).toBe(3)
    expect(svg).toContain('<rect x="1" y="0" width="1"')
  })
  test('every baked face is a roster character, decodes whole and talks with at least two mouths', () => {
    for (const [id, { big, small }] of Object.entries(FACES)) {
      expect(CHARACTERS.some(c => c.id === id)).toBe(true)
      for (const face of [big, small]) {
        expect(face.talk.length).toBeGreaterThanOrEqual(2)
        expect(face.palette.length).toBeLessThanOrEqual(16)
        for (const f of frames(face)) expect(f.length).toBe(face.w * face.h)
      }
      expect(small.h).toBeLessThan(big.h)
    }
  })
})
