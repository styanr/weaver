<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import { LocalStorage } from '$lib/storage.svelte';
	import type { PageProps } from './$types';
	import type { Component } from '$lib/types';
	import Ribbon from '$lib/components/Ribbon.svelte';
	import { Bookmark } from 'lucide-svelte';
	let { data }: PageProps = $props();
	let spell = data.spell;

	const savedSpellsStorage = new LocalStorage<number[]>('savedSpells', []);

	const isSaved = $derived(savedSpellsStorage.current.includes(spell.id));

	const toggleSpell = (id: number) => {
		if (!savedSpellsStorage.current.includes(id)) {
			savedSpellsStorage.current.push(id);
		} else {
			savedSpellsStorage.current = savedSpellsStorage.current.filter(
				(saved: number) => saved !== id
			);
		}
	};

	const componentsToUkrainian = (components: Set<Component>) => {
		const lookup = {
			somatic: 'соматична',
			verbal: 'вербальна',
			material: 'матеріальна'
		};

		return components
			.values()
			.map((c) => lookup[c])
			.toArray();
	};
</script>

<a
	href="/spells"
	class="group absolute -top-0 left-5 z-50 flex flex-row items-center justify-start gap-x-6 transition-all"
>
	<Ribbon class="" />
	<div
		class="small-caps text-2xl italic opacity-0 transition-all duration-300 group-hover:opacity-70"
	>
		Зміст
	</div>
</a>

<a
	href="/spells/saved"
	class="group absolute -top-0 right-5 z-50 flex flex-row items-center justify-start gap-x-6 transition-all"
>
	<div
		class="small-caps text-2xl italic opacity-0 transition-all duration-300 group-hover:opacity-70"
	>
		Гримуар
	</div>
	<Ribbon class="" />
</a>

<div class="x-8 mx-auto py-6">
	<div class="flex w-full justify-center">
		<div class="relative mb-8 flex w-fit justify-center gap-10">
			<Header
				title={`${spell.title_ua}`}
				subtitle={spell.title}
				class="flex w-fit flex-col items-center justify-center"
			/>
			<button
				class="group btn absolute -top-0 -right-20 btn-circle inset-shadow-base-content btn-xl hover:inset-shadow-sm/30 active:scale-95"
				onclick={() => toggleSpell(spell.id)}
			>
				<Bookmark
					class="text-base-content transition-all group-hover:scale-110 group-active:scale-125"
					fill={isSaved ? 'currentColor' : 'none'}
					stroke-width={isSaved ? 0 : 1.5}
				/>
			</button>
		</div>
	</div>
	<div class="mb-6 text-center capitalize italic opacity-75">
		{#each spell.classes as casterClass, i}
			{casterClass}{i < spell.classes.length - 1 ? ', ' : ''}
		{/each}
	</div>

	<div class="mb-8 flex items-center justify-center">
		<div class="h-px flex-1 bg-base-content/20"></div>
		<div class="mx-4 text-base-content/40">⁂</div>
		<div class="h-px flex-1 bg-base-content/20"></div>
	</div>

	<table class="m-auto mb-8 w-[80%] border-collapse">
		<tbody>
			<tr class="border-b border-base-content/10">
				<th class="small-caps py-3 pr-8 text-left font-medium tracking-wide italic opacity-75"
					>Школа</th
				>
				<td class="py-3 text-left">{spell.school}</td>
			</tr>
			<tr class="border-b border-base-content/10">
				<th class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
					>Час створення</th
				>
				<td class="py-3 text-left">{spell.casting_time}</td>
			</tr>
			<tr class="border-b border-base-content/10">
				<th class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75">Відстань</th
				>
				<td class="py-3 text-left">{spell.distance}</td>
			</tr>
			<tr class="border-b border-base-content/10">
				<th class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75">Складові</th
				>
				<td class="py-3 text-left">{componentsToUkrainian(spell.components).join(', ')}</td>
			</tr>
			<tr>
				<th class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
					>Тривалість</th
				>
				<td class="py-3 text-left">{spell.duration}</td>
			</tr>
		</tbody>
	</table>

	{#if spell.materialDescription}
		<div class="mt-8 mb-4 flex items-center justify-center">
			<div class="h-px flex-1 bg-base-content/15"></div>
			<div class="small-caps mx-4 text-base tracking-widest text-base-content/50">Матеріали</div>
			<div class="h-px flex-1 bg-base-content/15"></div>
		</div>
		<div class="mb-6 text-center">
			<Markdown text={spell.materialDescription} class="inline text-base-content/80 italic" />
		</div>
	{/if}

	<div class="leading-relaxed">
		<Markdown text={spell.description} class="prose max-w-none text-justify text-2xl" />
	</div>
</div>
