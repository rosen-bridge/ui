import Joi from 'joi';

type Fields = {
  key: string;
  operator: '=' | '!' | '<=' | '>=';
  value: boolean | number | string | (number | string)[];
};

type Pagination = {
  offset: number;
  limit: number;
};

type Search = {
  query?: string;
  in?: string;
};

type Sort = {
  key?: string;
  order?: 'ASC' | 'DESC';
};

export type Filters = {
  fields: Fields[];
  pagination: Pagination;
  search?: Search;
  sort?: Sort;
};

export type FiltersRaw = {
  fields?: Fields[];
  pagination?: Partial<Pagination>;
  search?: Partial<Search>;
  sort?: Partial<Sort>;
};

export const filtersSchema = Joi.object<Filters>({
  fields: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        operator: Joi.string().valid('=', '!', '<=', '>=').required(),
        value: Joi.alternatives(
          Joi.boolean(),
          Joi.number(),
          Joi.string(),
          Joi.array().items(Joi.alternatives(Joi.number(), Joi.string())),
        ).required(),
      }),
    )
    .default([]),
  pagination: Joi.object({
    offset: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).max(100).default(20),
  }).default({}),
  search: Joi.object({
    query: Joi.string(),
    in: Joi.string(),
  }),
  sort: Joi.object({
    key: Joi.string().required(),
    order: Joi.string().valid('ASC', 'DESC'),
  }),
});

export const extractFiltersFromSearchParams = (
  searchParams: URLSearchParams,
): FiltersRaw => {
  const filters: FiltersRaw = {};

  if (searchParams.has('in')) {
    filters.search ||= {};
    filters.search.in = searchParams.get('in')!;
    searchParams.delete('in');
  }

  if (searchParams.has('limit')) {
    filters.pagination ||= {};
    filters.pagination.limit = +searchParams.get('limit')!;
    searchParams.delete('limit');
  }

  if (searchParams.has('offset')) {
    filters.pagination ||= {};
    filters.pagination.offset = +searchParams.get('offset')!;
    searchParams.delete('offset');
  }

  if (searchParams.has('search')) {
    filters.search ||= {};
    filters.search.query = searchParams.get('search')!;
    searchParams.delete('search');
  }

  if (searchParams.has('sort')) {
    const raw = searchParams.get('sort')!;

    filters.sort ||= { key: raw };

    if (raw.endsWith('-asc')) {
      filters.sort.key = raw.replace('-asc', '');
      filters.sort.order = 'ASC';
    }

    if (raw.endsWith('-desc')) {
      filters.sort.key = raw.replace('-desc', '');
      filters.sort.order = 'DESC';
    }

    searchParams.delete('sort');
  }

  searchParams.forEach((value, key) => {
    const isArray = key.endsWith('[]') || key.slice(0, -1).endsWith('[]');

    let operator: Fields['operator'] = '=';

    switch (key.at(-1)) {
      case '!':
        operator = '!';
        break;
      case '<':
        operator = '<=';
        break;
      case '>':
        operator = '>=';
        break;
    }

    const name = key
      ?.match(/^(.*?)(?:''|!|<|>|\[\]|\[\]!|\[\]<|\[\]>|$)/)
      ?.at(1)!;

    filters.fields ||= [];

    filters.fields.push({
      key: name,
      operator,
      value: isArray ? value.split(',') : value,
    });
  });

  return filters;
};

export const filtersToTypeormWhere = (
  filters: Filters,
  searchFields: string[],
  mapper: (key: string) => string,
) => {
  const sections: string[] = [];

  for (const field of filters.fields) {
    const key = mapper(field.key);

    const values = [field.value]
      .flat()
      .map((value) => `'${value}'`)
      .join(', ');

    switch (field.operator) {
      case '!': {
        sections.push(`(${key} NOT IN (${values}))`);
        break;
      }
      case '<=': {
        sections.push(`(${key} <= ${field.value})`);
        break;
      }
      case '=': {
        sections.push(`(${key} IN (${values}))`);
        break;
      }
      case '>=': {
        sections.push(`(${key} >= ${field.value})`);
        break;
      }
    }
  }

  if (filters.search?.query) {
    const fields = filters.search.in ? [filters.search.in] : searchFields;

    const query = fields
      .map((field) => `(${mapper(field)} LIKE '%${filters.search?.query}%')`)
      .join(' OR ');

    sections.push(`(${query})`);
  }

  const where = sections.join(' AND ');

  return where;
};
