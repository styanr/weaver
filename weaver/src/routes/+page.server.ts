import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load = async () => {
	console.log('redirecting...');
	redirect(302, '/spells');
};
