import { describe, it, expect } from 'vitest'
import { hello } from '../src/index'

describe('hello function', () => {
  it('should return a greeting message', () => {
    expect(hello('Alice')).toBe('Hello, Alice!')
    expect(hello('Bob')).toBe('Hello, Bob!')
  })
})
