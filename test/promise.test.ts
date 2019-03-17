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

  // todo: should be fixed
  it('resolves in async function', done => {
    new P(resolve => {
      setTimeout(() => {
        resolve(1)
      }, 100)
    }).then(value => {
      expect(value).toEqual(1)
      done()
    })
  })
})

describe('promise creation and rejection test', () => {
  it('creates a new promise and simply rejects', done => {
    new P((reslove, reject) => {
      reject('simple')
    }).catch(value => {
      expect(value).toEqual('simple')
      done()
    })
  })

  it('creates a new promise and rejects mutiple times', done => {
    const p = new P((resolve, reject) => {
      reject('mutiple')
    })
    p.catch(value => {
      expect(value).toEqual('mutiple')
      done()
    })
    p.catch(value => {
      expect(value).toEqual('mutiple')
      done()
    })
  })

  // should be fixed
  it('returns a fulfilled promise after being catched', done => {
    const p = new P((resolve, reject) => {
      reject('mutiple')
    })
      .catch(value => {
        expect(value).toEqual('mutiple')
        done()
        return 'resolved?'
      })
      .then(value => {
        expect(value).toEqual('resolved?')
        done()
      })
  })
})
