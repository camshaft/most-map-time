import { Stream, Sink, Mapper } from './types';
import { MapTime } from './map-time';

export { Mapper, Stream };

export function mapTime<Parent, Child, Control, A>(
  mapper: Mapper<Parent, Child, Control>,
  control: Stream<Parent, Control>,
  source: Stream<Child, A>
) {
  return new MapTime(mapper, control, source);
}
