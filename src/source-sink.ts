import { Sink } from './types';
import { MapTimeScheduler } from './scheduler';

export class SourceSink<Parent, Child, ControlValue, A> implements Sink<Parent, A> {
  scheduler: MapTimeScheduler<Parent, Child, ControlValue>;
  sink : Sink<Child, A>;

  constructor(scheduler: MapTimeScheduler<Parent, Child, ControlValue>, sink: Sink<Child, A>) {
    this.scheduler = scheduler;
    this.sink = sink;
  }

  event(parent: Parent, x: A) {
    const child = this.scheduler.parentToChild(parent);
    console.log('EVENT', parent, child.toString());
    this.sink.event(child, x);
  }

  end(parent: Parent) {
    const child = this.scheduler.parentToChild(parent);
    console.log('END', parent, child.toString());
    this.sink.end(child);
  }

  error(parent: Parent, e: Error) {
    const child = this.scheduler.parentToChild(parent);
    this.sink.error(child, e);
  }
}
