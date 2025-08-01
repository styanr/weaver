#!/usr/bin/env -S deno --allow-all --env-file

import { spawnSync } from "node:child_process";
import { parse as parsePath, join } from "node:path";
import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { parse } from "@eemeli/yaml";
import { Spell, Class, Component } from "../weaver/src/lib/types.ts";
import process from "node:process";
import { createSchema, loadData } from "./db.ts";

const REPO_URL = "https://github.com/Tuomari-ua/tuomari-ua.github.io";
const SPELLS_DIR_PATH = "srd/_spells";
const CLASSES_DIR_PATH = "srd/_docs/character/classes";
const TEMP_DEST = "temp";
const OUTPUT_DIR = "output";

const SPELL_PREFIXES = {
  castingTime: ["**Час створення:**", "**Час створення**"],
  duration: ["**Тривалість:**", "**Тривалість**"],
  distance: ["**Відстань:**", "**Відстань**"],
  components: ["**Складові:**", "**Складові**"],
} as const;

const CURRENCY_MULTIPLIERS: Record<string, number> = {
  copper: 1,
  silver: 100,
  electrum: 5000,
  gold: 10000,
} as const;

const COMPONENT_SYMBOLS: Record<string, Component> = {
  В: "verbal",
  С: "somatic",
  М: "material",
} as const;

function runCommand(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(`Error: "${command} ${args.join(" ")}" failed.`);
    process.exit(result.status || 1);
  }
}

function cloneSpellsRepository(): void {
  if (existsSync(join(TEMP_DEST, SPELLS_DIR_PATH))) {
    console.log("SRD repository already exists, skipping clone...");
    return;
  }

  console.log("Cloning SRD repository...");

  runCommand("git", [
    "clone",
    "--depth=1",
    "--filter=blob:none",
    "--sparse",
    REPO_URL,
    TEMP_DEST,
  ]);

  process.chdir(TEMP_DEST);
  runCommand("git", [
    "sparse-checkout",
    "set",
    SPELLS_DIR_PATH,
    CLASSES_DIR_PATH,
  ]);
  process.chdir("..");

  console.log(
    `Done: sparse-cloned ${SPELLS_DIR_PATH} into ${join(
      TEMP_DEST,
      SPELLS_DIR_PATH,
    )}`,
  );
}

const extractLine = (
  lines: string[],
  prefixes: readonly string[],
): { index: number; value?: string } => {
  let prefix: string | undefined;

  const index = lines.findIndex((line) => {
    const p = prefixes.find((prefix) => line.startsWith(prefix));
    if (p) {
      prefix = p;
      return true;
    }
    return false;
  });

  if (index === -1) {
    return { index: -1 };
  }

  const value = prefix
    ? lines[index]?.replace(prefix, "").trim()
    : lines[index].trim();
  return { index, value };
};

interface SpellConfig {
  title: string;
  title_ua: string;
  level: number;
  school: string;
  classes: string[];
}

const parseSpellYaml = (contents: string): SpellConfig => {
  const yamlRegex = /---\r?\n([\s\S]*?)\r?\n---/;
  const yamlMatch = contents.match(yamlRegex);

  if (!yamlMatch) {
    throw new Error("No YAML front matter found in spell file");
  }

  const yamlContent = yamlMatch[1];
  const parsed = parse(yamlContent);

  return {
    title: parsed.title.split("[")[1]?.replace("]", "").trim() || "",
    title_ua: parsed.title.split("[")[0].trim() || "",
    level: parseInt(parsed.level, 10),
    school: parsed.tag.trim(),
    classes: parsed.classes.split(",").map((c: string) => c.trim()),
  };
};

const parseClassYaml = (contents: string): string => {
  const yamlRegex = /---\r?\n([\s\S]*?)\r?\n---/;
  const yamlMatch = contents.match(yamlRegex);

  if (!yamlMatch) {
    throw new Error(`No YAML front matter found in class file`);
  }

  const yamlContent = yamlMatch[1];
  const parsed = parse(yamlContent);

  return parsed.title;
};
const spells: Spell[] = [];
const classes: Class[] = [];
const seenClasses = new Set<string>();
let spellCounter = 0;
let classCounter = 0;

function latinize(input: string): string {
  const lookup = {
    А: "A",
    В: "B",
    Е: "E",
    К: "K",
    М: "M",
    Н: "H",
    О: "O",
    Р: "P",
    С: "C",
    Т: "T",
    У: "y",
    Х: "X",
    а: "a",
    в: "B",
    е: "e",
    к: "K",
    м: "M",
    н: "H",
    о: "o",
    р: "p",
    с: "c",
    т: "T",
    у: "y",
    х: "x",
  };
  return Array.from(input.normalize("NFKD"))
    .map((E) => lookup[E] ?? E)
    .join("");
}

const getClassIds = (classNames: string[]): number[] => {
  const spellClassIds: number[] = [];

  for (const name of classNames) {
    const latinized = latinize(name);

    if (!seenClasses.has(latinized)) {
      seenClasses.add(latinized);
      classes.push({
        id: ++classCounter,
        name,
        name_ua: "",
      });
      spellClassIds.push(classCounter);
    } else {
      const existingClass = classes.find((c) => c.name === latinized);
      if (existingClass) {
        spellClassIds.push(existingClass.id);
      }
    }
  }

  return spellClassIds;
};

interface ComponentParseResult {
  components: Set<Component>;
  materialDescription?: string;
  materialPrice?: number;
}

const parseComponents = (componentsLine: string): ComponentParseResult => {
  const componentPrefix = componentsLine.split("(")[0].trim();

  const components: Component[] = componentPrefix.split(",").map((c) => {
    const symbol = c.trim();
    const component = COMPONENT_SYMBOLS[symbol];

    if (!component) {
      throw new Error(`Unexpected component symbol "${symbol}"`);
    }

    return component;
  });

  const componentsSet = new Set<Component>(components);

  const descriptionRegex = /\((.*?)\)/;
  const descriptionMatch = componentsLine.match(descriptionRegex);

  if (!descriptionMatch) {
    return { components: componentsSet };
  }

  const materialDescription = descriptionMatch[1].trim();

  const priceRegex = /(\d+) ([мсез])м/;
  const priceMatch = materialDescription.match(priceRegex);

  if (!priceMatch) {
    return {
      components: componentsSet,
      materialDescription,
    };
  }

  const amount = parseInt(priceMatch[1], 10);
  const currencySymbol = priceMatch[2];

  const currencyMap: Record<string, number> = {
    м: CURRENCY_MULTIPLIERS.copper,
    с: CURRENCY_MULTIPLIERS.silver,
    е: CURRENCY_MULTIPLIERS.electrum,
    з: CURRENCY_MULTIPLIERS.gold,
  };

  const materialPrice = amount * currencyMap[currencySymbol];

  return {
    components: componentsSet,
    materialDescription,
    materialPrice,
  };
};

async function extractSpellFromFile(filePath: string): Promise<Spell> {
  const contents = await fs.readFile(filePath, { encoding: "utf8" });
  const spellConfig = parseSpellYaml(contents);

  const spellClassIds = getClassIds(spellConfig.classes);

  const lines = contents.split("\n");

  const castingTimeResult = extractLine(lines, SPELL_PREFIXES.castingTime);
  const durationResult = extractLine(lines, SPELL_PREFIXES.duration);
  const distanceResult = extractLine(lines, SPELL_PREFIXES.distance);
  const componentsResult = extractLine(lines, SPELL_PREFIXES.components);

  const { components, materialDescription, materialPrice } = parseComponents(
    componentsResult.value || "",
  );

  const lastPropertyIndex = Math.max(
    castingTimeResult.index,
    durationResult.index,
    distanceResult.index,
    componentsResult.index,
  );

  const description = lines
    .slice(lastPropertyIndex + 1)
    .map((line: string) => line.trim())
    .join("\n")
    .trim()
    .replace(/\n{2,}/g, "\n");

  if (spellConfig.title === "Prestidigitation") {
    console.log(contents);
    console.log(description);
  }

  const spell: Spell = {
    id: ++spellCounter,
    school: spellConfig.school,
    level: spellConfig.level,
    classes: spellClassIds,
    title: spellConfig.title,
    title_ua: spellConfig.title_ua,
    description: description,
    casting_time: castingTimeResult.value || "",
    duration: durationResult.value || "",
    distance: distanceResult.value || "",
    components: components,
    materialDescription: materialDescription,
    materialPrice: materialPrice,
  };

  return spell;
}

async function extractClassNameFromFile(
  filePath: string,
): Promise<{ name: string; name_ua: string }> {
  const contents = await fs.readFile(filePath, { encoding: "utf8" });
  const name_ua = parseClassYaml(contents).toLowerCase();
  const name = parsePath(filePath).name.toLowerCase();

  return { name, name_ua };
}

async function ensureOutputDirectory(): Promise<void> {
  if (!existsSync(OUTPUT_DIR)) {
    await fs.mkdir(OUTPUT_DIR);
  }
}

async function removeTempDirectory(): Promise<void> {
  if (!existsSync(TEMP_DEST)) {
    return;
  }

  try {
    await fs.rm(TEMP_DEST, { recursive: true, force: true });
    console.log("Removed temp directory");
  } catch (error) {
    console.error(`Error removing temp directory: ${error}`);
  }
}

async function writeJsonFile(filename: string, data: unknown): Promise<void> {
  const jsonString = JSON.stringify(
    data,
    (_key, value) => (value instanceof Set ? [...value] : value),
    2,
  );

  await fs.writeFile(join(OUTPUT_DIR, filename), jsonString);
}

async function main(): Promise<void> {
  try {
    cloneSpellsRepository();

    console.log("Parsing spell files...");

    for (const file of await fs.readdir(join(TEMP_DEST, CLASSES_DIR_PATH))) {
      if (!file.endsWith(".md")) {
        continue;
      }

      const filePath = join(TEMP_DEST, CLASSES_DIR_PATH, file);
      const classNames = await extractClassNameFromFile(filePath);

      classes.push({
        id: ++classCounter,
        name: classNames.name,
        name_ua: classNames.name_ua,
      });
      seenClasses.add(classNames.name);
    }
    for (const file of await fs.readdir(join(TEMP_DEST, SPELLS_DIR_PATH))) {
      if (!file.endsWith(".md")) {
        continue;
      }

      const filePath = join(TEMP_DEST, SPELLS_DIR_PATH, file);
      const spell = await extractSpellFromFile(filePath);
      spells.push(spell);
    }

    await createSchema();
    await loadData(classes, spells);

    // await removeTempDirectory();
    console.log(
      `Successfully parsed ${spells.length} spells and ${classes.length} classes`,
    );
  } catch (err) {
    console.error("Error parsing spell files:", err);
    process.exit(1);
  }
}

main();
