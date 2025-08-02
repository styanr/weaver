import { connectToDB } from '$lib/db';
import { QueryBuilder } from '$lib/query';
import type { Component, SpellSlim } from '$lib/types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const idsParam = url.searchParams.get('ids');
	if (!idsParam) {
		return json({ error: 'Missing ids parameter' }, { status: 400 });
	}
	const ids = idsParam
		.split(',')
		.map((v) => Number(v.trim()))
		.filter((v) => Number.isInteger(v));
	if (ids.length === 0) {
		return json([], { status: 200 });
	}

	const conn = await connectToDB();
	try {
		const qb = new QueryBuilder()
			.withClause({
				text: `
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
          spells.material_description,
          spells.material_price,
          array_to_json(array_agg(c.name_ua)) AS classes,
          array_to_json(components) AS components
        FROM public.spells AS spells
      `
			})
			.withClause({
				text: 'INNER JOIN spells_classes sc ON spells.id = sc.spell_id INNER JOIN classes c ON sc.class_id = c.id'
			})
			.withClause({
				text: 'WHERE spells.id = ANY($)',
				values: [ids]
			})
			.withClause({ text: 'GROUP BY spells.id' })
			.withClause({ text: 'ORDER BY spells.level' });

		const { text, values } = qb.build();
		const result = await conn.query({ text, values });

		const spells: SpellSlim[] = result.rows.map((item) => ({
			id: item.id,
			slug: item.slug,
			school: item.school,
			level: item.level,
			classes: item.classes,
			title: item.title,
			title_ua: item.title_ua,
			casting_time: item.casting_time,
			duration: item.duration,
			distance: item.distance,
			components: item.components as Set<Component>,
			materialDescription: item.material_description,
			materialPrice: item.material_price
		}));

		return json(spells);
	} finally {
		conn.release();
	}
};
