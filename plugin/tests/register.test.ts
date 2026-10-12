import { describe, expect, test } from 'claude-code/testing'
import { FACES } from '../hooks/data/faces.generated'
import { cast, countsAsPrompt, findCharacter, nextFrame, pick, talkMs } from '../hooks/register'

describe('register', () => {
  test('only characters with a baked face are picked, whatever the roll', () => {
    expect(cast().length).toBe(Object.keys(FACES).length)
    for (const r of [0, 0.5, 0.9999]) expect(FACES[pick(() => r).id]).toBeDefined()
  })
  test('next never brings back the character showing', () => {
    for (const r of [0, 0.5, 0.9999]) expect(pick(() => r, 'p1-piposh').id).not.toBe('p1-piposh')
  })
  test('a character is found by Hebrew or English name or id, a part being enough', () => {
    expect(findCharacter('פוסטמה')?.id).toBe('p1-pustema')
    expect(findCharacter('fritz')?.id).toBe('p1-fritz')
    expect(findCharacter('Orchid')?.id).toBe('p1-orchid')
    expect(findCharacter('r-egoz')?.id).toBe('r-egoz')
    expect(findCharacter('nobody here')).toBeNull()
    expect(findCharacter('  ')).toBeNull()
  })
  test('the mouth always moves: the next frame is never the one showing, and stays in range', () => {
    for (let current = 0; current <= 4; current++) {
      for (const r of [0, 0.3, 0.6, 0.9999]) {
        const f = nextFrame(current, 4, () => r)
        expect(f).not.toBe(current)
        expect(f).toBeGreaterThanOrEqual(0)
        expect(f).toBeLessThanOrEqual(4)
      }
    }
  })
  test('talking lasts with the line, between 1.5 and 5 seconds', () => {
    expect(talkMs('hi')).toBe(1500)
    expect(talkMs('x'.repeat(50))).toBe(3000)
    expect(talkMs('x'.repeat(500))).toBe(5000)
  })
  test('only the person typing counts, not slash commands or other origins', () => {
    expect(countsAsPrompt({ text: 'fix it', origin: { kind: 'composer' } as never })).toBe(true)
    expect(countsAsPrompt({ text: '/clear', origin: { kind: 'composer' } as never })).toBe(false)
    expect(countsAsPrompt({ text: 'x', origin: { kind: 'sdk' } as never })).toBe(false)
    expect(countsAsPrompt({ text: 'x', origin: { kind: 'sdk' } as never }, true)).toBe(true)
  })
})
