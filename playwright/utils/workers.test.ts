// dry-copy: sveltekit/playwright-local-workers-test — every copy of this region must match; `dev repo copies` checks it (ISS-10190)
/**
 * The worker count is config, so nothing in the browser suite can assert it — a suite that runs
 * at the wrong number is exactly the suite that cannot be trusted to report on it. These are the
 * properties the derivation has to keep: bounded above, never zero, one worker per four threads
 * in between, and monotonic, so a smaller machine never asks for more workers than a bigger one.
 *
 * Every assertion is written against `MAX_LOCAL_WORKERS` rather than a literal, because the
 * ceiling is the one number each repo measures for itself and this file is identical in all of
 * them.
 */

import { describe, expect, it } from 'vitest';
import { MAX_LOCAL_WORKERS, localWorkers } from './workers';

describe('localWorkers', () => {
  it('has a ceiling that is a whole number of workers', () => {
    expect(Number.isInteger(MAX_LOCAL_WORKERS)).toBe(true);
    expect(MAX_LOCAL_WORKERS).toBeGreaterThanOrEqual(1);
  });

  it('never asks a machine for more than the measured ceiling', () => {
    for (let cpus = 1; cpus <= 256; cpus++) {
      expect(localWorkers(cpus)).toBeLessThanOrEqual(MAX_LOCAL_WORKERS);
    }
  });

  it('reaches the ceiling on a big enough machine and stays there', () => {
    // 20 threads ran 20 workers under the constant this replaced; 128 is a machine nobody in this
    // fleet has yet.
    for (const cpus of [MAX_LOCAL_WORKERS * 4, Math.max(20, MAX_LOCAL_WORKERS * 4), 64, 128]) {
      expect(localWorkers(cpus)).toBe(MAX_LOCAL_WORKERS);
    }
  });

  it('always asks for at least one worker, however small the box', () => {
    // `availableParallelism()` reports at least 1, but a cgroup-confined build reports a handful,
    // and `Math.floor(2 / 4)` is 0 — which playwright reads as "use the default", i.e. back to
    // a number nobody chose.
    for (const cpus of [1, 2, 3]) {
      expect(localWorkers(cpus)).toBe(1);
    }
  });

  it('gives one worker per four hardware threads below the ceiling', () => {
    for (let workers = 1; workers <= MAX_LOCAL_WORKERS; workers++) {
      expect(localWorkers(workers * 4)).toBe(workers);
      expect(localWorkers(workers * 4 + 3)).toBe(workers);
    }
  });

  it('is monotonic, so a bigger machine is never asked to do less', () => {
    const counts = Array.from({ length: 64 }, (_, i) => localWorkers(i + 1));

    expect(counts).toEqual([...counts].sort((a, b) => a - b));
  });
});
// dry-copy-end
