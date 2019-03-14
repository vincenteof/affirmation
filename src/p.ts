const enum PromiseState {
  PENDING,
  FULFILLED,
  REJECTED
}

// tslint:disable-next-line:no-empty
const EMPTY_EXECUTOR = () => {}

type ResolveFunc<T> = (value?: T) => void
type RejectFunc = (reason: any) => void

type FulfilledHandler<T1, T2> = (
  value: T1
) => T2 | P<T2> | Thenable<T2> | undefined | null
type RejectedHandler<T> = (
  reason: any
) => T | P<T> | Thenable<T> | undefined | null

interface Thenable<T> {
  then(resolve?: ResolveFunc<T>, reject?: RejectFunc): void
}

function isThenable(arg: any): arg is Thenable<any> {
  return (arg as Thenable<any>).then !== undefined
}

class QueueItem {}

class P<T> {
  private state: PromiseState
  private result?: T
  private reason?: any

  constructor(executor: (resolve: ResolveFunc<T>, reject: RejectFunc) => void) {
    this.state = PromiseState.PENDING
    this.execute(executor)
  }

  private execute(
    executor: (resolve: ResolveFunc<T>, reject: RejectFunc) => void
  ) {
    // todo: deal with mutiple times calling
    const resolveWrapper = (value?: T) => {
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

  private resolve<T>(
    self: P<any>,
    x: T | P<T> | Thenable<T> | undefined | null
  ): void {
    if (x instanceof P) {
      if (x.state === PromiseState.PENDING) {
        console.log('push item to queue')
      } else {
        this.copyFinishedPromise(self, x)
        // todo: deal underlying promises
      }
      return
    }

    if (isThenable(x)) {
      // todo: deal with mutiple times calling
      // todo: make some abstraction for it
      const resolveWrapper = (value?: T) => {
        this.resolve(self, value)
      }
      const rejectWrapper = (reason: any) => {
        this.reject(self, reason)
      }
      try {
        x.then(resolveWrapper, rejectWrapper)
      } catch (e) {
        rejectWrapper(e)
      }
    }

    // todo: resolve simple values and also make notifications to underlying promises
  }

  private copyFinishedPromise(p1: P<any>, p2: P<any>): void {
    p1.state = p2.state
    if (p2.state === PromiseState.FULFILLED) {
      p1.result = p2.result
    } else if (p2.state === PromiseState.REJECTED) {
      p1.reason = p2.reason
    }
  }

  private reject<T>(
    self: P<any>,
    x: T | P<T> | Thenable<T> | undefined | null
  ): void {
    console.log('')
  }
}
