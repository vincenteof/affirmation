enum PromiseState {
  PENDING,
  FULFILLED,
  REJECTED
}

// tslint:disable-next-line:no-empty
const EMPTY_EXECUTOR = () => {}

type ResolveFunc<T> = (value?: T) => void
type RejectFunc = (reason: any) => void

type FulfilledHandler<T1, T2> = (
  value?: T1
) => T2 | P<T2> | Thenable<T2> | undefined | null

type RejectedHandler<T> = (
  reason?: any
) => T | P<T> | Thenable<T> | undefined | null

interface Thenable<T> {
  then(resolve: ResolveFunc<T>, reject: RejectFunc): void
}

function isThenable(arg: any): arg is Thenable<any> {
  if (arg === undefined || arg === null) {
    return false
  }
  return (arg as Thenable<any>).then !== undefined
}

class QueueItem {
  promise: P<any>
  fulfilledHandler?: FulfilledHandler<any, any>
  rejectedHandler?: RejectedHandler<any>

  constructor(
    promise: P<any>,
    fulfilledHandler?: FulfilledHandler<any, any>,
    rejectedHandler?: RejectedHandler<any>
  ) {
    this.promise = promise
    this.fulfilledHandler = fulfilledHandler
    this.rejectedHandler = rejectedHandler
  }

  handleFulfilled(parent: P<any>) {
    parent.thenCore(this.promise, this.fulfilledHandler)
  }

  handleRejected(parent: P<any>) {
    parent.thenCore(this.promise, undefined, this.rejectedHandler)
  }
}

class P<T> {
  private state: PromiseState
  private result?: T | null
  private reason?: any
  private queue: QueueItem[]

  constructor(executor: (resolve: ResolveFunc<T>, reject: RejectFunc) => void) {
    this.state = PromiseState.PENDING
    this.queue = []
    this.execute(executor)
  }

  private execute(
    executor: (resolve: ResolveFunc<T>, reject: RejectFunc) => void
  ): void {
    // use createWrapper method to deal with mutiple times calling
    const resolveWrapper = P.createResolveWrapper(this)
    const rejectWrapper = P.createRejectWrapper(this)
    try {
      executor(resolveWrapper, rejectWrapper)
    } catch (e) {
      rejectWrapper(e)
    }
  }

  public then(
    fulfilledHandler?: FulfilledHandler<any, any>,
    rejectedHandler?: RejectedHandler<any>
  ): P<any> {
    const resultPromise = new P(EMPTY_EXECUTOR)
    this.thenCore(resultPromise, fulfilledHandler, rejectedHandler)
    return resultPromise
  }

  thenCore(
    underlying: P<any>,
    fulfilledHandler?: FulfilledHandler<any, any>,
    rejectedHandler?: RejectedHandler<any>
  ): void {
    if (this.state === PromiseState.PENDING) {
      // todo: push to queue
      return
    }

    let handler = fulfilledHandler
    let value = this.result
    if (this.state === PromiseState.REJECTED) {
      handler = rejectedHandler
      value = this.reason
    }
    nextRun(() => {
      let thenResult
      try {
        if (handler) {
          thenResult = handler(value)
        }
        P.resolve(underlying, thenResult)
      } catch (e) {
        P.reject(underlying, e)
      }
    })
  }

  public catch(rejectedHandler?: RejectedHandler<any>): P<any> {
    return this.then(undefined, rejectedHandler)
  }

  private static resolve<T>(
    self: P<T>,
    x: T | P<T> | Thenable<T> | undefined | null
  ): void {
    if (x instanceof P) {
      if (x.state === PromiseState.PENDING) {
        // push to queue
        const copyHandler = () => {
          P.copyFinishedPromise(self, x)
        }
        const queueItem = new QueueItem(self, copyHandler, copyHandler)
        x.queue.push(queueItem)
      } else {
        P.copyFinishedPromise(self, x)
        // deal with underlying promises
        P.notifyUnderlying(self)
      }
      return
    }
    if (isThenable(x)) {
      const resolveWrapper = P.createResolveWrapper(self)
      const rejectWrapper = P.createRejectWrapper(self)
      try {
        x.then(resolveWrapper, rejectWrapper)
      } catch (e) {
        rejectWrapper(e)
      }
      // it seems we don't need to notify because we delegate self to another resolve process
      return
    }
    // resolve simple values and also make notifications to underlying promises
    self.state = PromiseState.FULFILLED
    self.result = x
    P.notifyUnderlying(self)
  }

  private static reject<T>(self: P<any>, x: any): void {
    self.state = PromiseState.REJECTED
    self.reason = x
    P.notifyUnderlying(self)
  }

  static copyFinishedPromise(p1: P<any>, p2: P<any>): void {
    p1.state = p2.state
    if (p2.state === PromiseState.FULFILLED) {
      p1.result = p2.result
    } else if (p2.state === PromiseState.REJECTED) {
      p1.reason = p2.reason
    }
  }

  static notifyUnderlying(parent: P<any>): void {
    for (let item of parent.queue) {
      if (parent.state === PromiseState.FULFILLED) {
        item.handleFulfilled(parent)
      } else if (parent.state === PromiseState.REJECTED) {
        item.handleRejected(parent)
      }
    }
  }

  static createResolveWrapper<T>(self: P<T>) {
    let called = false
    return (value?: T) => {
      if (!called) {
        P.resolve(self, value)
        called = true
      }
    }
  }

  static createRejectWrapper(self: P<any>) {
    let called = false
    return (reason: any) => {
      if (!called) {
        P.reject(self, reason)
        called = true
      }
    }
  }
}

function nextRun(fn: () => void) {
  setTimeout(fn, 0)
}

export { P, Thenable }
