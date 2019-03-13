import { P } from '../src/promise'

describe('promise creation test', () => {
  it('works if true is truthy', () => {
    const p = new P((resolve, reject) => {
      resolve(1)
    }).then(
      value => {
        console.log(value)
      },
      value => {
        console.log(value)
      }
    )
    expect(true).toBeTruthy()
  })
})
