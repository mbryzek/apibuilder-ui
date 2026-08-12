import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { subset, validRange } from 'semver';
import { describe, expect, it } from 'vitest';

/**
 * What Node version this repo runs on, said once and kept true (ISS-2433).
 *
 * Before this, `.nvmrc` said 26 and nothing read it: package.json declared no `engines`, CI never
 * looked at the file, and the fleet built the repo on 24 the whole time. The floor that was
 * actually ENFORCED came from somewhere nobody would think to look -- `.npmrc`'s `engine-strict=true`
 * applies each individual dependency's own `engines` field, so `npm ci` on Node 18 failed with an
 * EBADENGINE naming a transitive Cloudflare package. A real constraint, arriving by accident, in an
 * error message about a package the repo never mentions.
 *
 * package.json `engines` is now the one declaration, and `engine-strict=true` makes it a real gate:
 * npm refuses to install for anyone outside it and names THIS package rather than a transitive one.
 * These tests are the other half -- they keep that declaration honest, because it is a hand-written
 * range and the tree it has to describe changes under it on every dependency bump.
 */

const root = new URL('../', import.meta.url);
const read = (name: string) => readFileSync(fileURLToPath(new URL(name, root)), 'utf8');

const declared: string = JSON.parse(read('package.json')).engines?.node;
const nvmrc = read('.nvmrc').trim();

interface LockPackage {
  engines?: { node?: string };
  // Platform binaries (esbuild, rolldown, sharp, fsevents). npm only applies the engines check to
  // packages it actually installs, so these constrain nothing on a machine they are not built for.
  os?: string[];
  cpu?: string[];
}

const lockPackages: Record<string, LockPackage> = JSON.parse(read('package-lock.json')).packages;

describe('declared Node version', () => {
  it('is a real semver range', () => {
    expect(validRange(declared)).not.toBeNull();
  });

  it('covers no version the dependency tree rejects', () => {
    // The check that stops the declaration going stale. A dependency bump can raise the real floor
    // silently -- which is exactly how this issue arose -- and `engine-strict` would then surface it
    // as an EBADENGINE about a package nobody chose. Subset, not "does our floor satisfy each range":
    // three packages here support 22.13+ and 24+ but NOT 23, so a plain `>=22.13.0` would admit a
    // version the tree refuses to install on.
    const rejects = Object.entries(lockPackages)
      // '' is this package's own entry in the lockfile, not a dependency.
      .filter(([name, pkg]) => name !== '' && pkg.engines?.node && !pkg.os && !pkg.cpu)
      .filter(([, pkg]) => !subset(declared, pkg.engines!.node!))
      .map(([name, pkg]) => `${name} requires ${pkg.engines!.node!}`);

    expect(rejects).toEqual([]);
  });

  it('is what .nvmrc pins developers to', () => {
    // The drift this issue was filed for. `.nvmrc` is read as a range ("24" means 24.x), so this
    // fails if it is bumped to a line the dependency tree rejects, or left behind when the floor
    // rises. Deliberately NOT an assertion about the version CI happens to run: the fleet upgrades
    // Node on its own schedule, and a check that pinned the build to one major would park every
    // pull request in this repo the day that happened.
    expect(subset(nvmrc, declared)).toBe(true);
  });
});
