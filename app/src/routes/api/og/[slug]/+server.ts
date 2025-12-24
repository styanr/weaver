import SpellOgComponent from '$lib/components/og/SpellOgComponent.svelte';
import { connectToDB } from '$lib/db';
import { getSpell } from '$lib/spells';
import { downloadOgImage, existsOgImage, uploadOgImage } from '$lib/storage';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { error, type RequestHandler } from '@sveltejs/kit';

const garamondRegular = new GoogleFont('EB Garamond', { weight: 400 });
const garamondRegularItalic = new GoogleFont('EB Garamond', {
  weight: 400,
  style: 'italic',
});
const garamondBold = new GoogleFont('EB Garamond', { weight: 700 });
const garamondBoldItalic = new GoogleFont('EB Garamond', {
  weight: 700,
  style: 'italic',
});
const alegreyaMedium = new GoogleFont('Alegreya SC', {
  weight: 500,
});
const alegreyaRegularItalic = new GoogleFont('Alegreya SC', {
  weight: 400,
  style: 'italic',
});

export const GET: RequestHandler = async ({ params }) => {
  if (!params.slug) return error(404);

  if (await existsOgImage(params.slug)) {
    console.log('Cache hit for', params.slug);
    return new Response((await downloadOgImage(params.slug)).data);
  }

  const conn = await connectToDB();

  try {
    const spell = await getSpell(conn, params.slug);
    if (!spell) {
      throw error(404, `Spell not found`);
    }
    const resolvedFontOptions = await resolveFonts([
      garamondRegular,
      garamondRegularItalic,
      garamondBold,
      garamondBoldItalic,
      alegreyaMedium,
      alegreyaRegularItalic,
    ]);

    const image = new ImageResponse(
      SpellOgComponent,
      { width: 1200, height: 630, fonts: resolvedFontOptions },
      { spell }
    );

    const blob = await image.blob();
    await uploadOgImage(params.slug, blob);

    return new Response(blob);
  } finally {
    conn.release();
  }
};
