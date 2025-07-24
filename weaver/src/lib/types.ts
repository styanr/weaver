export type Component = 'verbal' | 'somatic' | 'material';

export interface Class {
	id: number;
	name: string;
	name_ua: string;
}

export interface Spell {
	id: number;
	school: string;
	level: number;
	classes: number[];
	title: string;
	title_ua: string;
	description: string;
	casting_time: string;
	duration: string;
	distance: string;
	components: Set<Component>;
	materialDescription: string | undefined;
	materialPrice: number | undefined;
}
