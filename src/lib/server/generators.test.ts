import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testCtx } from '#lib/test-support/context.ts';
import { mockApiClients } from '#lib/test-support/mocks.ts';
import { loadAllGenerators } from './generators';
import type { Generator } from '#generated/com-bryzek-apibuilder-generator.ts';

const { getGenerators } = vi.hoisted(() => ({ getGenerators: vi.fn() }));

vi.mock('#lib/api/clients.ts', (importOriginal) => mockApiClients({ getGenerators }, importOriginal));

const generators = (count: number, from = 0): Generator[] =>
  Array.from({ length: count }, (_, i) => ({ key: `g${from + i}`, name: `G ${from + i}` }));

describe('loadAllGenerators', () => {
  beforeEach(() => getGenerators.mockReset());

  it('stops after a short first page', async () => {
    getGenerators.mockResolvedValueOnce(generators(16));

    const response = await loadAllGenerators(testCtx(), {});

    expect(response).toMatchObject({ data: generators(16) });
    expect(getGenerators).toHaveBeenCalledTimes(1);
    expect(getGenerators).toHaveBeenCalledWith({ limit: 100, offset: 0 });
  });

  it('reads past a full page, so a generator sorting after it is not lost', async () => {
    getGenerators.mockResolvedValueOnce(generators(100)).mockResolvedValueOnce(generators(3, 100));

    const response = await loadAllGenerators(testCtx(), {});

    expect(response).toMatchObject({ data: generators(103) });
    expect(getGenerators).toHaveBeenLastCalledWith({ limit: 100, offset: 100 });
  });

  it('fails the whole read when a later page fails, rather than answering with a partial list', async () => {
    getGenerators.mockResolvedValueOnce(generators(100)).mockRejectedValueOnce(new Error('connection dropped'));

    const response = await loadAllGenerators(testCtx(), {});

    expect(response).not.toHaveProperty('data');
  });
});
