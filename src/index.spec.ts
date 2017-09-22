import { test } from 'ava'
import * as most from '@most/core';
import * as scheduler from '@most/scheduler';
import * as Big from 'big.js';
import { mapTime, Mapper, Stream } from 'most-map-time';

type milliseconds = number;
type beat = BigJsLibrary.BigJS | number;
type bpm = number;

const mToS = new Big(60);
const sToMs = new Big(1000);
const zero = new Big(0);

const toFloat = (f: BigJsLibrary.BigJS) => parseFloat(f.toString());

class BPMMapper implements Mapper<milliseconds, beat, bpm> {
  parentToChild(ms: milliseconds, bpm: bpm) {
    // const beats = ms / (60 / bpm) / 1000;
    const beats = new Big(Math.round(ms)).div(mToS.div(bpm)).div(sToMs);
    return beats;
  }

  childToParent(beat: beat, bpm: bpm) {
    // const ms = beat / (bpm / 60 / 1000);
    const ms = new Big(beat).div(new Big(bpm).div(mToS).div(sToMs));
    return Math.round(toFloat(ms));
  }

  add(a: beat, b: beat) {
    return new Big(a).plus(b);
  }

  sub(a: beat, b: beat) {
    return new Big(a).minus(b);
  }

  mul(a: beat, b: beat) {
    return new Big(a).times(b);
  }

  div(a: beat, b: beat) {
    return new Big(a).div(b);
  }

  get zero() {
    return zero;
  }
}

test('foo', t => {
  const ts: Array<beat> = [];
  const mapper = new BPMMapper();
  const delay = Math.floor(Math.random() * 1000) + 2000;
  const bpm = most.merge(most.now(120), most.delay(delay, most.now(180)));
  const p = most.take(16, most.periodic(1));
  const accTime = (v: any, time : beat) => { ts.push(time); return v; };
  const s = most.map(accTime, mapTime(mapper, bpm, p));
  const sch = scheduler.newDefaultScheduler();

  Object.assign(sch, {
    add(a: number, b: number) {
      return toFloat(new Big(a).plus(b));
    },

    sub(a: number, b: number) {
      return toFloat(new Big(a).minus(b));
    },

    mul(a: number, b: number) {
      return toFloat(new Big(a).times(b));
    },

    div(a: number, b: number) {
      return toFloat(new Big(a).div(b));
    },

    round(a: number) {
      return Math.round(a);
    },

    zero: 0,

    isNegative(n: number) {
      return n < 0;
    },
  });

  return most
    // .runEffects(p, sch)
    .runEffects(s, sch)
    .then(() => {
      ts
        .map(toFloat)
        .map(x => Math.round(x))
        .forEach((x, i) => {
          t.true(x === i);
        });
    });
});
