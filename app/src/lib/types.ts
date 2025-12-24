export type Component = 'verbal' | 'somatic' | 'material';

export interface Class {
  id: number;
  name: string;
  name_ua: string;
}

export interface Spell {
  id: number;
  slug: string;
  school: string;
  level: number;
  classes: string[];
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

export interface SpellSlim {
  id: number;
  slug: string;
  school: string;
  level: number;
  classes: string[];
  title: string;
  title_ua: string;
  casting_time: string;
  duration: string;
  distance: string;
  components: Set<Component>;
  materialDescription: string | undefined;
  materialPrice: number | undefined;
}
