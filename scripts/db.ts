import postgres from 'https://deno.land/x/postgresjs/mod.js';
import { Class, Spell } from '../weaver/src/lib/types.ts';

export async function createSchema() {
  const sql = postgres(Deno.env.get('POSTGRES_URL')!);
  try {
    const [{ version }] = await sql`SELECT version()`;
    console.log('✅ Connected to:', version);
  } catch (e) {
    console.error('❌ Failed to fetch server version:', e);
    return;
  }

  try {
    await sql.begin(async (tx) => {
      try {
        await tx`
          DROP SCHEMA IF EXISTS public CASCADE
        `;
        await tx`
         CREATE SCHEMA public 
        `;
        await tx`
          GRANT ALL ON SCHEMA public TO postgres
        `;
        await tx`
          GRANT ALL ON SCHEMA public TO public
        `;
      } catch (e) {
        console.error('❌ schema create error:', e.code, e.message);
      }
      try {
        await tx`
          DROP TYPE IF EXISTS component_type CASCADE
        `;
        await tx`
          CREATE TYPE  component_type AS ENUM (
            'verbal','somatic','material'
          )
        `;
        console.log('✅ enum component_type created or already exists');
      } catch (e) {
        console.error('❌ enum component_type error:', e.code, e.message);
      }

      try {
        await tx`
          CREATE TABLE IF NOT EXISTS classes (
            id       SERIAL PRIMARY KEY,
            name     TEXT   NOT NULL,
            name_ua  TEXT   NOT NULL
          )
        `;
        console.log('✅ table classes created or already exists');
      } catch (e) {
        console.error('❌ table classes error:', e.code, e.message);
      }

      try {
        await tx`
          CREATE TABLE IF NOT EXISTS spells (
            id                   SERIAL           PRIMARY KEY,
            school               TEXT             NOT NULL,
            level                INTEGER          NOT NULL CHECK (level >= 0),
            title                TEXT             NOT NULL,
            title_ua             TEXT             NOT NULL,
            description          TEXT             NOT NULL,
            casting_time         TEXT             NOT NULL,
            duration             TEXT             NOT NULL,
            distance             TEXT             NOT NULL,
            components           component_type[] NOT NULL DEFAULT '{}',
            material_description TEXT,
            material_price       INTEGER 
          )
        `;
        console.log('✅ table spells created or already exists');
      } catch (e) {
        console.error('❌ table spells error:', e.code, e.message);
      }

      try {
        await tx`
          CREATE TABLE IF NOT EXISTS spells_classes (
            spell_id  INTEGER NOT NULL REFERENCES spells(id) ON DELETE CASCADE,
            class_id  INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
            PRIMARY KEY (spell_id, class_id)
          )
        `;
        console.log('✅ table spells_classes created or already exists');
      } catch (e) {
        console.error('❌ table spells_classes error:', e.code, e.message);
      }
    });

    console.log('✅ Schema creation transaction completed');
  } catch (e) {
    console.error('❌ Transaction failed, rolled back:', e);
  } finally {
    await sql.end();
  }
}

export async function loadData(classesList: Class[], spellsList: Spell[]) {
  const sql = postgres(Deno.env.get('POSTGRES_URL')!);
  try {
    await sql.begin(async (tx) => {
      await tx`TRUNCATE spells_classes, spells, classes CASCADE`;

      for (const cls of classesList) {
        await tx`
          INSERT INTO classes (id, name, name_ua)
          VALUES (${cls.id}, ${cls.name}, ${cls.name_ua})
        `;
      }

      for (const sp of spellsList) {
        const compLiteral = `{${[...sp.components].join(',')}}`;

        await tx`
          INSERT INTO spells (
            id, school, level,
            title, title_ua, description,
            casting_time, duration, distance,
            components, material_description, material_price
          ) VALUES (
            ${sp.id},
            ${sp.school},
            ${sp.level},
            ${sp.title},
            ${sp.title_ua},
            ${sp.description},
            ${sp.casting_time},
            ${sp.duration},
            ${sp.distance},
            ${compLiteral}::component_type[],
            ${sp.materialDescription ?? null},
            ${sp.materialPrice ?? null}
          )
        `;
      }

      for (const sp of spellsList) {
        for (const classId of sp.classes) {
          await tx`
            INSERT INTO spells_classes (spell_id, class_id)
            VALUES (${sp.id}, ${classId})
          `;
        }
      }
    });

    console.log('✅ loadData completed');
  } catch (err) {
    console.error('❌ loadData failed:', err);
    throw err;
  } finally {
    await sql.end();
  }
}
