import { Visibility } from '#generated/com-bryzek-apibuilder.ts';

/**
 * The visibilities a person may choose, named rather than read off the enum: the server refuses
 * every other value on a write.
 */
export const OFFERED_VISIBILITIES: Visibility[] = [Visibility.Organization, Visibility.Public];
