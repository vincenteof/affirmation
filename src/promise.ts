const enum PromiseState {
  PENDING,
  FULFILLED,
  REJECTED
}

type ResolveFunc = (value: any) => void
type RejectFunc = (reason: any) => void
type FulfilledHandler<InT, OutT> = (value: InT) => OutT | P<OutT>
type RejectedHandler<OutT> = (reason: any) => OutT | P<OutT>
type ExecutorFunc = (resolve: ResolveFunc, reject: RejectFunc) => void

// tslint:disable-next-line:no-empty
const EMPTY_EXECUTOR = () => {}

class P<T> {
  private state: PromiseState
  private result?: T
  private reason?: any

  constructor(executor: ExecutorFunc) {
    this.state = PromiseState.PENDING
    this.initialSync(executor)
  }

  private initialSync(executor: ExecutorFunc) {
    const resolveWrapper = (value: any) => {
      this.resolve(this, value)
    }

    const rejectWrapper = (reason: any) => {
      this.reject(this, reason)
    }

    try {
      executor(resolveWrapper, rejectWrapper)
    } catch (e) {
      rejectWrapper(e)
    }
  }

  private resolve<T>(self: P<T>, value: T): void {
    self.state = PromiseState.FULFILLED
    self.result = value
  }

  private reject(self: P<any>, reason: any): void {
    self.state = PromiseState.REJECTED
    self.reason = reason
  }

  then<T1, T2>(
    onFulfilled: FulfilledHandler<T, T1>,
    onRejected: RejectedHandler<T2>
  ): P<T1 | T2> {
    const another = new P<T1 | T2>(EMPTY_EXECUTOR)
    if (this.state === PromiseState.PENDING) {
      console.log('')
    } else {
      const handler =
        this.state === PromiseState.FULFILLED ? onFulfilled : onRejected
      const value =
        this.state === PromiseState.FULFILLED ? this.result : this.reason

      let thenRet
      try {
        thenRet = handler(value)
      } catch (e) {
        another.state = PromiseState.REJECTED
        another.reason = e
        return another
      }

      // just dealing with simple value for then result here
      another.result = thenRet as T1 | T2
    }

    return another
  }

  catch<T1>(onRejected: RejectedHandler<T1>): P<T1> | null {
    return null
  }
}

export { P }
