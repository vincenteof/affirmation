const enum PromiseState {
  PENDING,
  FULFILLED,
  REJECTED
}

type ResolveFunc = (value: any) => void
type RejectFunc = (reason: any) => void
type FulfilledHandler<InT, OutT> = (value: InT) => OutT | Aff<OutT>
type RejectedHandler<OutT> = (reason: any) => OutT | Aff<OutT>
type ExecutorFunc = (resolve: ResolveFunc, reject: RejectFunc) => void

class Aff<T> {
  private state: PromiseState

  constructor(executor: ExecutorFunc) {
    this.state = PromiseState.PENDING
  }

  then<T1, T2>(
    onFulfilled: FulfilledHandler<T, T1>,
    onRejected: RejectedHandler<T2>
  ): Aff<T1 | T2> | null {
    return null
  }

  catch<T1>(onRejected: RejectedHandler<T1>): Aff<T1> | null {
    return null
  }
}
