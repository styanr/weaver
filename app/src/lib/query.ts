import type { QueryConfig } from 'pg';

export type ClauseValues<T> = T extends Array<infer U> ? T : never;

export interface Clause<I = any[]> {
  text: string;
  values?: ClauseValues<I>;
}

export class QueryBuilder {
  private clauses: Clause[] = [];

  withClause(clause: Clause) {
    this.clauses.push(clause);
    return this;
  }

  build(): QueryConfig {
    const queryText = this.clauses.map((c) => c.text).join(' ');
    const allValues = this.clauses
      .flatMap((c) => c.values)
      .filter((c) => c !== undefined);

    console.log(queryText);
    console.log(allValues);

    const paramRegex = /\$\d*/g;

    const matches = queryText.match(paramRegex);

    const matchesLength = matches?.length ?? 0;
    if (matchesLength !== allValues.length)
      throw new Error('Invalid parameters count passed.');

    let paramCounter = 1;
    const paramText = queryText.replace(paramRegex, () => {
      return `$${paramCounter++}`;
    });

    return {
      text: paramText,
      values: allValues,
    };
  }
}
