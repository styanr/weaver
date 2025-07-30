import { connectToDB } from '$lib/db';
import { QueryBuilder } from '$lib/query';
import type { Component } from '$lib/types';
import { json, type RequestHandler } from '@sveltejs/kit';

const PAGE_SIZE = 15;

export interface SpellSlim {
	id: number;
	school: string;
	level: number;
	classes: number[];
	title: string;
	title_ua: string;
	casting_time: string;
	duration: string;
	distance: string;
	components: Set<Component>;
	materialDescription: string | undefined;
	materialPrice: number | undefined;
}

interface PagedResponse<T> {
	items: T[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
}

export const GET: RequestHandler = async ({ url }) => {
	const conn = await connectToDB();

	const searchQueryParam = url.searchParams.get('query') ?? '';
	const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

	try {
		const filterClause = {
			text: 'WHERE title_ua ILIKE $',
			values: [`${searchQueryParam}%`]
		};

		const orderClause = {
			text: 'ORDER by id'
		};

		const pagingClause = {
			text: 'OFFSET $ LIMIT $',
			values: [PAGE_SIZE * (page - 1), PAGE_SIZE]
		};

		const countQueryBuilder = new QueryBuilder().withClause({
			text: 'SELECT COUNT(*) FROM public.spells AS spells'
		});

		const searchQueryBuilder = new QueryBuilder().withClause({
			text: `
        SELECT 
          spells.id, 
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
        FROM public.spells AS spells`
		});

		const joinClause = {
			text: 'INNER JOIN spells_classes sc ON spells.id = sc.spell_id INNER JOIN classes c ON sc.class_id = c.id'
		};
		const aggregateClause = {
			text: 'GROUP BY spells.id'
		};

		const countQuery = countQueryBuilder.withClause(filterClause).build();

		const searchQuery = searchQueryBuilder
			.withClause(joinClause)
			.withClause(filterClause)
			.withClause(aggregateClause)
			.withClause(orderClause)
			.withClause(pagingClause)
			.build();

		console.log(searchQuery);

		const countResult = await conn.query(countQuery);

		const result = await conn.query(searchQuery);
		console.log(result);

		const response = result.rows.length > 0 ? result.rows : [];
		const spells: SpellSlim[] = response.map((item) => ({
			id: item.id,
			school: item.school,
			level: item.level,
			classes: item.classes,
			title: item.title,
			title_ua: item.title_ua,
			casting_time: item.casting_time,
			duration: item.duration,
			distance: item.distance,
			components: item.components,
			materialDescription: item.material_description,
			materialPrice: item.material_description
		}));

		const payload: PagedResponse<SpellSlim> = {
			items: spells,
			totalCount: countResult.rows[0] ? Number(countResult.rows[0].count) : 0,
			pageNumber: page,
			pageSize: PAGE_SIZE
		};

		console.log(payload);

		return json(payload);
	} finally {
		conn.release();
	}
};
