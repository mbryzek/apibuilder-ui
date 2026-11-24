/**
 * vitest's global setup (`vite.config.ts`'s `test.globalSetup`): reads this app's screen budget record
 * from platform once, before the first spec, and hands it to every screen budget spec (DES-139972).
 */
import { budgetRecordSetup } from '#lib/telemetry/budgetRecord.ts';

export default budgetRecordSetup('apibuilder-ui');
