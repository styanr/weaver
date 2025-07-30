import type { PoolClient } from 'pg';
import type { Spell } from './types';

export const getSpell = async (conn: PoolClient, id: number): Promise<Spell | null> => {
	const res = await conn.query<Spell>(
		`
    SELECT
    spells.*,
    array_to_json(components) AS components
      FROM public.spells AS spells
    WHERE id = $1
    LIMIT 1`,
		[id]
	);

	return res.rows.length > 0 ? res.rows[0] : null;
};
