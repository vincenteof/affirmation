import { P, Thenable } from '../src/p'

describe('promise creation and resolution test', () => {
  it('creates a new promise and simply resolves', () => {
    new P(resolve => {
      resolve('simple')
    }).then(value => {
      expect(value).toBe('simple')
    })
  })

  it('creates a new promise and resolves another promise', () => {
    new P(resolve => {
      const q = new P(resolveInner => {
        resolveInner('inner simple')
      })
      resolve(q)
    }).then(value => {
      expect(value).toBe('inner simple')
    })
  })

  it('creates a new promise and resolves another thenable', () => {
    new P(resolve => {
      const thenable: Thenable<string> = {
        then: resolveInner => {
          resolveInner('thenable simple')
        }
      }
      resolve(thenable)
    }).then(value => {
      expect(value).toBe('thenable simple')
    })
  })
})
