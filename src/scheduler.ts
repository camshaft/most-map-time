import { Stream, Scheduler, ScheduledTask, Sink, Task, Mapper } from './types';
import { RelativeScheduler } from './relative-scheduler';
import { PendingTask } from './pending-task';
import { wrapScheduledTask, recomputeTasks } from './scheduled-task';

export class MapTimeScheduler<Parent, Child, ControlValue> implements Scheduler<Child>, Sink<Parent, ControlValue> {
  parent : Scheduler<Parent>;
  mapper : Mapper<Parent, Child, ControlValue>;
  control : ControlValue;
  hasValue : boolean;
  pendingTasks : Array<PendingTask<Parent, Child, ControlValue>>;
  parentEpoch: Parent;
  childEpoch: Child;

  constructor(parent: Scheduler<Parent>, mapper: Mapper<Parent, Child, ControlValue>) {
    this.parent = parent;
    this.mapper = mapper;
    this.hasValue = false;
    this.pendingTasks = [];
  }

  currentTime() {
    return this.parentToChild(this.parent.currentTime());
  }

  scheduleTask(offset: Child | 0, delay: Child | 0, period: Child | -1, task: Task<any>): ScheduledTask<any> {
    if (!this.hasValue) {
      const st = new PendingTask(offset, delay, period, task, this);
      this.pendingTasks.push(st);
      return st;
    }

    const { control } = this;

    return wrapScheduledTask(this.parent.scheduleTask(
      offset === 0 ? offset : this.mapper.childToParent(offset, control),
      delay === 0 ? delay : this.mapper.childToParent(delay, control),
      period === -1 ? period : this.mapper.childToParent(period, control),
      task
    ), this, {
      delay,
      period,
    });
  }

  relative(offset: Child): Scheduler<Child> {
    return new RelativeScheduler(offset, this);
  }

  cancel(task: ScheduledTask<any>) {
    this.parent.cancel(task);
  }

  cancelAll(f: (task: ScheduledTask<any>) => boolean) {
    this.parent.cancelAll(f);
  }

  event(nextParent: Parent, nextControl: ControlValue) {
    const {
      childEpoch: prevChild,
      control: prevControl,
      hasValue,
      parent,
      parentEpoch: prevParent,
    } = this;

    const nextChild = hasValue ?
      this.add(prevChild, this.mapper.parentToChild(parent.sub(nextParent, prevParent), prevControl)) :
      this.mapper.zero;

    recomputeTasks(this, prevControl, nextControl, nextParent);

    this.hasValue = true;
    this.control = nextControl;
    this.childEpoch = nextChild;
    this.parentEpoch = nextParent;

    this.pendingTasks.forEach(({ delay, localOffset, period, task, scheduler, active, running }) => {
      if (active) {
        const st = this.scheduleTask(localOffset, delay, period, task);
        if (running) st.run();
      }
    });
    this.pendingTasks = [];
  }

  end(t: Parent) {}
  error(t: Parent, e: Error) {}

  childToParent(childV: Child, control = this.control): Parent {
    const { childEpoch, parentEpoch, parent } = this;
    const childVE = childEpoch ? this.sub(childV, childEpoch) : childV;
    const parentV = this.mapper.childToParent(childVE, control);
    return parentEpoch ? parent.add(parentEpoch, parentV) : parentV;
  }

  parentToChild(parentV: Parent, control = this.control): Child {
    const { childEpoch, parentEpoch, parent } = this;
    const parentVE = parentEpoch ? parent.sub(parentV, parentEpoch) : parentV;
    const childV = this.mapper.parentToChild(parentVE, control);
    return childEpoch ? this.add(childEpoch, childV) : childV;
  }

  add(a: Child, b: Child) {
    return this.mapper.add(a, b);
  }

  sub(a: Child, b: Child) {
    return this.mapper.sub(a, b);
  }
}
