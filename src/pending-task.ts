import { ScheduledTask, Task } from './types';
import { MapTimeScheduler } from './scheduler';

export class PendingTask<Parent, Child, ControlValue> implements ScheduledTask<Child> {
  active: boolean;
  running: boolean;
  task: Task<Child>;
  delay: Child | 0;
  localOffset: Child | 0;
  period: Child | -1;
  scheduler: MapTimeScheduler<Parent, Child, ControlValue>;
  errors: Array<Error>;

  constructor(
    localOffset: Child | 0,
    delay: Child | 0,
    period: Child | -1,
    task: Task<Child>,
    scheduler: MapTimeScheduler<Parent, Child, ControlValue>
  ) {
    this.delay = delay;
    this.localOffset = localOffset;
    this.period = period;
    this.task = task;
    this.scheduler = scheduler;
    this.active = true;
    this.running = false;
  }

  run() {
    this.running = true;
  }

  error(error: Error) {
    this.errors.push(error);
  }

  dispose() {
    this.active = false;
    this.running = false;
    this.scheduler.cancel(this);
    return this.task.dispose();
  }
}
