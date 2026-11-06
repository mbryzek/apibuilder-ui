import { Visibility } from '#generated/com-bryzek-apibuilder.ts';

/**
 * The visibilities a person may choose. `user` is retired: the server refuses it on every write
 * and a stored row reads as `organization`, so no select offers it.
 */
export const OFFERED_VISIBILITIES: Visibility[] = Object.values(Visibility).filter((v) => v !== Visibility.User);
