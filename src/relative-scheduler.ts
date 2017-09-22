import { Mapper, Scheduler, ScheduledTask, Task } from './types';

export class RelativeScheduler<Child> implements Scheduler<Child> {
  origin: Child;
  scheduler: Scheduler<Child>;

  constructor (origin: Child, scheduler: Scheduler<Child>) {
    this.origin = origin;
    this.scheduler = scheduler;
  }

  currentTime () {
    return this.sub(this.scheduler.currentTime(), this.origin);
  }

  scheduleTask (localOffset: Child, delay: Child, period: Child, task: Task<Child>) {
    const origin = this.add(localOffset, this.origin);
    return this.scheduler.scheduleTask(origin, delay, period, task);
  }

  relative (origin: Child) {
    const rel = this.add(origin, this.origin);
    return new RelativeScheduler(rel, this.scheduler);
  }

  cancel (task: ScheduledTask<Child>) {
    return this.scheduler.cancel(task)
  }

  cancelAll (f: (task: ScheduledTask<Child>) => boolean) {
    return this.scheduler.cancelAll(f);
  }

  add(a: Child, b: Child) {
    return this.scheduler.add(a, b);
  }

  sub(a: Child, b: Child) {
    return this.scheduler.sub(a, b);
  }
}
