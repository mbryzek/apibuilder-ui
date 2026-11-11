/**
 * What a toggle changes: the page's form re-runs only the load that depends on this, never the org
 * layout's, whose org and membership a subscription cannot change. ISS-78824
 */
export const SUBSCRIPTIONS_DEPENDENCY = 'apibuilder:subscriptions';
