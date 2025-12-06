# @xan/replay-subject

A set of tooling that encapsulates an object that acts as a variant of
[`Subject`](https://jsr.io/@xan/subject/doc/~/Subject) to be used if you want to replay
[`nexted`](https://jsr.io/@xan/observer/doc/~/Observer.next) value (if any).

## Build

Automated by [JSR](https://jsr.io/).

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { ReplaySubject } from "@xan/replay-subject";

const subject = new ReplaySubject<number>(3);
const controller = new AbortController();

subject.next(1); // Stored in buffer
subject.next(2); // Stored in buffer
subject.next(3); // Stored in buffer
subject.next(4); // Stored in buffer and 1 gets trimmed off

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// 2
// 3
// 4

// Values pushed after the subscribe will emit immediately
// unless the subject is already finalized.
subject.next(5); // Stored in buffer and 2 gets trimmed off

// Console output:
// 5

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// 3
// 4
// 5
```

# Glossary And Semantics

- [@xan/observer](https://jsr.io/@xan/observer#glossary-and-semantics)
- [@xan/observable](https://jsr.io/@xan/observable#glossary-and-semantics)
- [@xan/subject](https://jsr.io/@xan/subject#glossary-and-semantics)
