const SCHEDULERS = '@@most-map-time/scheduler';

export function wrapScheduledTask(task, scheduler, params) {
  const schedulers = task[SCHEDULERS] = task[SCHEDULERS] || new Map();
  schedulers.set(scheduler, params);
  return task;
}

export function recomputeTasks(scheduler, prev, next, parentEpoch) {
  const rootScheduler = getRoot(scheduler);
  const rootEpoch = childToRoot(scheduler.parent, parentEpoch);
  const tasks = [];
  scheduler.cancelAll((task) => {
    const schedulers = task[SCHEDULERS];
    const shouldCancel = schedulers && schedulers.has(scheduler);
    if (shouldCancel) tasks.push(task);
    return shouldCancel;
  });

  tasks.forEach((task) => {
    const schedulers = task[SCHEDULERS];
    if (!(schedulers && schedulers.has(scheduler))) return false;

    let { delay, period } = schedulers.get(scheduler);
    const prevDelay = childToRoot(scheduler, delay, prev);
    const prevPeriod = childToRoot(scheduler, period, prev);
    const nextDelay = childToRoot(scheduler, delay, next);
    const nextPeriod = childToRoot(scheduler, period, next);

    // TODO handle offsets properly

    const { time } = task;
    const prevOffset = period === -1 ? prevDelay : rootScheduler.add(prevPeriod, prevDelay);
    const nextOffset = period === -1 ? nextDelay : rootScheduler.add(nextPeriod, nextDelay);
    const originTime = rootScheduler.sub(time, prevOffset);
    const diff = rootScheduler.isNegative(originTime) ?
      rootScheduler.zero :
      rootScheduler.sub(rootEpoch, originTime);

    const frac = rootScheduler.div(diff, prevOffset);
    const fracOffset = rootScheduler.mul(frac, nextOffset);
    const fracDelay = rootScheduler.sub(nextOffset, fracOffset);

    task.time = rootScheduler.add(rootEpoch, fracDelay);
    task.period = nextPeriod;

    rootScheduler.timeline.add(task);
  });
}

export function getRoot(scheduler) {
  const { parent } = scheduler;
  return parent && parent !== scheduler ?
    getRoot(parent) :
    scheduler;
}

export function childToRoot(scheduler, value, control) {
  if (value === -1) return -1;
  value = scheduler.childToParent ? scheduler.childToParent(value, control) : value;
  const { parent } = scheduler;
  return parent && parent !== scheduler ?
    childToRoot(parent, value, control) :
    value;
}

export function rootTime(scheduler) {
  return getRoot(scheduler).currentTime();
}

export function rootTimeline(scheduler) {
  return getRoot(scheduler).timeline;
}
