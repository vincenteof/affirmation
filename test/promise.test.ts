import { P, Thenable } from '../src/p'

describe('promise creation and resolution test', () => {
  it('creates a new promise and simply resolves', done => {
    new P(resolve => {
      resolve('simple')
    }).then(value => {
      expect(value).toEqual('simple')
      done()
    })
  })

  it('creates a new promise and resolves another promise', done => {
    new P(resolve => {
      const q = new P(resolveInner => {
        resolveInner('inner simple')
      })
      resolve(q)
    }).then(value => {
      expect(value).toEqual('inner simple')
      done()
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
      expect(value).toEqual('thenable simple')
    })
  })

  it('resolves most one time', done => {
    new P(resolve => {
      resolve(1)
      resolve(2)
    }).then(value => {
      expect(value).toEqual(1)
      done()
    })
  })
})
