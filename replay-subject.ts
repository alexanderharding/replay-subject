import { isObserver, type Observer } from "@xan/observer";
import { Subject } from "@xan/subject";
import type { Observable } from "@xan/observable";
import { of } from "@xan/observable-of";
import { flat } from "@xan/observable-flat";
import type { ReplaySubjectConstructor } from "./replay-subject-constructor.ts";
import { defer } from "@xan/observable-defer";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@xan/subject/doc/~/Subject).
 */
export type ReplaySubject<Value = unknown> = Subject<Value>;

export const ReplaySubject: ReplaySubjectConstructor = class {
  readonly [Symbol.toStringTag] = "ReplaySubject";
  readonly #bufferSize: number;
  /**
   * Tracking a known list of buffered values, so we don't have to clone them while
   * iterating to prevent reentrant behaviors.
   */
  #bufferSnapshot?: Observable;
  readonly #buffer: Array<unknown> = [];
  readonly #subject = new Subject();
  readonly signal = this.#subject.signal;
  readonly #observable = flat(
    defer(() => (this.#bufferSnapshot ??= of(...this.#buffer))),
    this.#subject,
  );

  constructor(bufferSize = Infinity) {
    if (typeof bufferSize !== "number") {
      throw new TypeError("Parameter 1 is not of type 'Number'");
    }
    Object.freeze(this);
    this.#bufferSize = Math.max(1, Math.floor(bufferSize));
  }

  next(value: unknown): void {
    if (!(this instanceof ReplaySubject)) {
      throw new TypeError("'this' is not instanceof 'ReplaySubject'");
    }
    if (!this.signal.aborted) {
      // Add the next value to the buffer.
      const length = this.#buffer.push(value);
      // Trim the buffer, if needed.
      if (length > this.#bufferSize) this.#buffer.shift();
      // Reset the buffer snapshot since it is now stale.
      this.#bufferSnapshot = undefined;
    }
    this.#subject.next(value);
  }

  return(): void {
    if (this instanceof ReplaySubject) this.#subject.return();
    else throw new TypeError("'this' is not instanceof 'ReplaySubject'");
  }

  throw(value: unknown): void {
    if (this instanceof ReplaySubject) this.#subject.throw(value);
    else throw new TypeError("'this' is not instanceof 'ReplaySubject'");
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof ReplaySubject)) {
      throw new TypeError("'this' is not instanceof 'ReplaySubject'");
    }
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObserver(observer)) {
      throw new TypeError("Parameter 1 is not of type 'Observer'");
    }
    this.#observable.subscribe(observer);
  }
};

Object.freeze(ReplaySubject);
Object.freeze(ReplaySubject.prototype);
