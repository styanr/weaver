import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectToDB } from '$lib/db';
import { getSpell } from '$lib/spells';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'invalid id');

	const conn = await connectToDB();
	const data = await getSpell(conn, id);
	return data;
};
