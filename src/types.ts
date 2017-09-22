import { Disposable } from '@most/types';

export interface Task<Time> {
  run(time: Time): void;
  error(time: Time, e: Error): void;
  dispose(): void;
}

export interface ScheduledTask<Time> {
  active: boolean;
  task: Task<Time>;
  run(): void;
  error(err: Error): void;
  dispose(): void;
}

export {
  Disposable,
}

export interface Scheduler<Time> {
  currentTime(): Time;
  scheduleTask(offset: Time | 0, delay: Time | 0, period: Time | -1, task: Task<Time>): ScheduledTask<any>;
  relative(offset: Time): Scheduler<any>;
  cancel(task: ScheduledTask<any>): void;
  cancelAll(predicate: (task: ScheduledTask<any>) => boolean): void;
  add(a: Time, b: Time): Time;
  sub(a: Time, b: Time): Time;
}

export interface Stream<Time, A> {
  run (sink: Sink<Time, A>, scheduler: Scheduler<Time>): Disposable;
}

export interface Sink<Time, A> {
  event(time: Time, value: A): void;
  end(time: Time): void;
  error(time: Time, err: Error): void;
}

export interface Mapper<Parent, Child, Control> {
  parentToChild(parent: Parent, control: Control): Child;
  childToParent(child: Child, control: Control): Parent;
  add(a: Child, b: Child): Child;
  sub(a: Child, b: Child): Child;
  mul(a: Child, b: Child): Child;
  div(a: Child, b: Child): Child;
  zero: Child;
}
