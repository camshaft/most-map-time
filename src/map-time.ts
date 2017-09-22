import { disposeBoth, disposeNone } from '@most/disposable';
import { Scheduler, Sink, Stream, Mapper } from './types';
import { MapTimeScheduler } from './scheduler';
import { SourceSink } from './source-sink';

export class MapTime<Parent, Child, ControlValue, A> {
  mapper : Mapper<Parent, Child, ControlValue>;
  control : Stream<Parent, ControlValue>;
  source : Stream<Child, A>;

  constructor(
    mapper: Mapper<Parent, Child, ControlValue>,
    control: Stream<Parent, ControlValue>,
    source: Stream<Child, A>
  ) {
    this.mapper = mapper;
    this.control = control;
    this.source = source;
  }

  run(sink: Sink<Child, A>, parentScheduler: Scheduler<Parent>) {
    const scheduler = new MapTimeScheduler(parentScheduler, this.mapper);

    const sourceSink = new SourceSink(scheduler, sink);

    const d1 = this.control.run(scheduler, parentScheduler);
    const d2 = this.source.run(sourceSink, scheduler);

    // return disposeNone();
    return disposeBoth(d1, d2);
  }
}
