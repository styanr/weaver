import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectToDB } from '$lib/db';
import { getSpell } from '$lib/spells';
import type { Spell } from '$lib/types';

export const load: PageServerLoad<{ spell: Spell }> = async ({ params }) => {
  const conn = await connectToDB();
  try {
    const spell = await getSpell(conn, params.slug);
    console.log(spell);
    if (!spell) {
      throw error(404, `Spell not found`);
    }

    return { spell };
  } finally {
    conn.release();
  }
};
