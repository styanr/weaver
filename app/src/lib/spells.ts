import type { PoolClient } from 'pg';
import type { Spell } from './types';

export const getSpell = async (conn: PoolClient, slug: string): Promise<Spell | null> => {
	const res = await conn.query(
		`
        SELECT 
          spells.id,
          spells.slug,
          spells.school,
          spells.level,
          spells.title,
          spells.title_ua,
          spells.casting_time,
          spells.duration,
          spells.distance,
          spells.description,
          spells.material_description,
          spells.material_price,
          array_to_json(array_agg(c.name_ua)) AS classes,
          array_to_json(components) AS components
        FROM public.spells AS spells
        INNER JOIN spells_classes sc ON spells.id = sc.spell_id 
        INNER JOIN classes c ON sc.class_id = c.id
        WHERE spells.slug = $1
        GROUP BY spells.id
        LIMIT 1`,
		[slug]
	);

	return res.rows.length > 0
		? {
				id: res.rows[0].id,
				slug: res.rows[0].slug,
				school: res.rows[0].school,
				level: res.rows[0].level,
				classes: res.rows[0].classes,
				title: res.rows[0].title,
				title_ua: res.rows[0].title_ua,
				casting_time: res.rows[0].casting_time,
				duration: res.rows[0].duration,
				distance: res.rows[0].distance,
				components: res.rows[0].components,
				description: res.rows[0].description,
				materialDescription: res.rows[0].material_description,
				materialPrice: res.rows[0].material_price
			}
		: null;
};
