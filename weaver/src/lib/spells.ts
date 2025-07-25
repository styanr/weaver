import type { PoolClient } from 'pg';

export const getSpell = async (conn: PoolClient, id: number): Promise<any> => {
	const res = await conn.query(
		`SELECT
     spells.*,
     array_to_json(components) AS components
   FROM public.spells AS spells
   WHERE id = $1`,
		[id]
	);

	return res.rows.length > 0 ? res.rows[0] : {};
};
