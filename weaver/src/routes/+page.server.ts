import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load = async () => {
	redirect(302, '/spells');
};
