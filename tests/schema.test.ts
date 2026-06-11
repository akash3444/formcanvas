import { describe, it, expect } from 'vitest'
import { buildSchema, buildDefaultValues } from '../lib/form-builder/schema'
import {
  makeInput,
  makeTextarea,
  makeCheckbox,
  makeSwitch,
  makeSelect,
  makeRadioGroup,
  makeCheckboxGroup,
  makeSlider,
} from './fixtures'

// buildSchema is the runtime source of truth for the live preview's validation.
// These tests pin its behaviour directly (the parity test then proves the
// generator's string output matches it).

describe('buildSchema — input (text)', () => {
  it('accepts any string when optional', () => {
    const schema = buildSchema([makeInput()])
    expect(schema.safeParse({ name: '' }).success).toBe(true)
  })

  it('rejects empty string when required', () => {
    const schema = buildSchema([makeInput({ required: true })])
    expect(schema.safeParse({ name: '' }).success).toBe(false)
    expect(schema.safeParse({ name: 'Ada' }).success).toBe(true)
  })
})

describe('buildSchema — input (email/url)', () => {
  it('rejects an invalid email', () => {
    const schema = buildSchema([makeInput({ inputType: 'email' })])
    expect(schema.safeParse({ name: 'not-an-email' }).success).toBe(false)
    expect(schema.safeParse({ name: 'a@b.com' }).success).toBe(true)
  })

  it('rejects an invalid url', () => {
    const schema = buildSchema([makeInput({ inputType: 'url' })])
    expect(schema.safeParse({ name: 'nope' }).success).toBe(false)
    expect(schema.safeParse({ name: 'https://x.com' }).success).toBe(true)
  })
})

describe('buildSchema — input (number)', () => {
  it('enforces min and max', () => {
    const schema = buildSchema([
      makeInput({ inputType: 'number', validation: { min: 1, max: 10 } }),
    ])
    expect(schema.safeParse({ name: 0 }).success).toBe(false)
    expect(schema.safeParse({ name: 11 }).success).toBe(false)
    expect(schema.safeParse({ name: 5 }).success).toBe(true)
  })

  it('allows undefined when optional but rejects it when required', () => {
    expect(
      buildSchema([makeInput({ inputType: 'number' })]).safeParse({
        name: undefined,
      }).success
    ).toBe(true)
    expect(
      buildSchema([
        makeInput({ inputType: 'number', required: true }),
      ]).safeParse({ name: undefined }).success
    ).toBe(false)
  })
})

describe('buildSchema — string length validation', () => {
  it('optional input only enforces minLength when a value is present', () => {
    const schema = buildSchema([makeInput({ validation: { minLength: 3 } })])
    expect(schema.safeParse({ name: '' }).success).toBe(true) // empty allowed
    expect(schema.safeParse({ name: 'ab' }).success).toBe(false) // too short
    expect(schema.safeParse({ name: 'abc' }).success).toBe(true)
  })

  it('enforces maxLength on textarea', () => {
    const schema = buildSchema([makeTextarea({ validation: { maxLength: 5 } })])
    expect(schema.safeParse({ bio: '123456' }).success).toBe(false)
    expect(schema.safeParse({ bio: '12345' }).success).toBe(true)
  })
})

describe('buildSchema — boolean fields', () => {
  it('required checkbox must be true', () => {
    const schema = buildSchema([makeCheckbox({ required: true })])
    expect(schema.safeParse({ acceptTerms: false }).success).toBe(false)
    expect(schema.safeParse({ acceptTerms: true }).success).toBe(true)
  })

  it('optional switch accepts either value', () => {
    const schema = buildSchema([makeSwitch()])
    expect(schema.safeParse({ notifications: false }).success).toBe(true)
    expect(schema.safeParse({ notifications: true }).success).toBe(true)
  })
})

describe('buildSchema — choice fields', () => {
  it('required select rejects empty string', () => {
    const schema = buildSchema([makeSelect({ required: true })])
    expect(schema.safeParse({ country: '' }).success).toBe(false)
    expect(schema.safeParse({ country: 'usa' }).success).toBe(true)
  })

  it('required radio-group rejects empty string', () => {
    const schema = buildSchema([makeRadioGroup({ required: true })])
    expect(schema.safeParse({ gender: '' }).success).toBe(false)
    expect(schema.safeParse({ gender: 'male' }).success).toBe(true)
  })

  it('required checkbox-group rejects an empty array', () => {
    const schema = buildSchema([makeCheckboxGroup({ required: true })])
    expect(schema.safeParse({ interests: [] }).success).toBe(false)
    expect(schema.safeParse({ interests: ['sports'] }).success).toBe(true)
  })
})

describe('buildSchema — slider', () => {
  it('enforces min and max bounds', () => {
    const schema = buildSchema([makeSlider({ min: 0, max: 100 })])
    expect(schema.safeParse({ volume: -1 }).success).toBe(false)
    expect(schema.safeParse({ volume: 101 }).success).toBe(false)
    expect(schema.safeParse({ volume: 50 }).success).toBe(true)
  })
})

describe('buildDefaultValues', () => {
  it('uses type-appropriate empty defaults', () => {
    const defaults = buildDefaultValues([
      makeInput({ name: 'text' }),
      makeInput({ name: 'num', inputType: 'number' }),
      makeTextarea({ name: 'bio' }),
      makeCheckbox({ name: 'agree' }),
      makeSwitch({ name: 'notify' }),
      makeSelect({ name: 'country' }),
      makeRadioGroup({ name: 'gender' }),
      makeCheckboxGroup({ name: 'interests' }),
    ])
    expect(defaults).toEqual({
      text: '',
      num: undefined,
      bio: '',
      agree: false,
      notify: false,
      country: '',
      gender: '',
      interests: [],
    })
  })

  it('respects an explicit defaultValue', () => {
    const defaults = buildDefaultValues([
      makeInput({ name: 'text', defaultValue: 'hello' }),
      makeCheckbox({ name: 'agree', defaultValue: true }),
      makeCheckboxGroup({ name: 'interests', defaultValue: ['sports'] }),
    ])
    expect(defaults).toEqual({
      text: 'hello',
      agree: true,
      interests: ['sports'],
    })
  })

  it('defaults a slider to its midpoint when no defaultValue is set', () => {
    const defaults = buildDefaultValues([
      makeSlider({ name: 'volume', min: 0, max: 100, defaultValue: undefined }),
    ])
    expect(defaults.volume).toBe(50)
  })
})
