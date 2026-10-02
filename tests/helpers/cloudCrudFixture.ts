/** Nonsensitive in-memory query adapter for the actual SELECT/INSERT/conditional UPDATE contract. */
export interface CloudFixtureRow { user_id?: string; data: any; updated_at: string }
export function cloudCrudFixture(options: {
  read?: (userId: string) => Promise<{ data: CloudFixtureRow | null; error: any }>;
  write?: (row: CloudFixtureRow & { user_id: string }) => Promise<{ error: any }>;
} = {}) {
  const rows = new Map<string, CloudFixtureRow>();
  const commit = async (incoming: CloudFixtureRow & { user_id: string }, insert: boolean, filters: Map<string, string>) => {
    const previous = rows.get(incoming.user_id);
    if (insert && previous) return { data: null, error: { code: '23505', message: 'Synthetic duplicate insert' } };
    if (!insert && (!previous || previous.updated_at !== filters.get('updated_at'))) return { data: [], error: null };
    const result = await options.write?.(incoming) ?? { error: null };
    if (result.error) return { data: null, error: result.error };
    const stored = JSON.parse(JSON.stringify(incoming));
    rows.set(incoming.user_id, stored);
    return { data: [stored], error: null };
  };
  return { rows, client: { from: () => ({
    select: () => ({ eq: (_key: string, userId: string) => ({ maybeSingle: async () => options.read
      ? options.read(userId) : { data: rows.get(userId) ?? null, error: null } }) }),
    insert: (row: CloudFixtureRow & { user_id: string }) => ({ select: () => commit(row, true, new Map()) }),
    update: (value: Pick<CloudFixtureRow, 'data' | 'updated_at'>) => {
      const filters = new Map<string, string>();
      const query = {
        eq: (key: string, filter: string) => { filters.set(key, filter); return query; },
        select: () => commit({ ...value, user_id: filters.get('user_id')! }, false, filters),
      };
      return query;
    },
  }) } };
}
