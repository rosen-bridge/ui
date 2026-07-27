import Joi from 'joi';

const OPERATORS = ['==', '!=', '<=', '>=', '*=', '^=', '$='] as const;

type Field = {
  key: string;
  operator: (typeof OPERATORS)[number];
  value: boolean | number | string | (number | string)[];
};

type Sort = {
  key: string;
  order?: 'ASC' | 'DESC';
};

type Search = {
  query: string;
  in?: string[];
};

type Pagination = {
  offset?: number;
  limit?: number;
};

export type Filters = {
  fields?: Field[];
  pagination?: Pagination;
  search?: Search;
  sort?: Sort;
};

export const FiltersSchema = Joi.object<Filters>({
  fields: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      operator: Joi.string()
        .valid(...OPERATORS)
        .required(),
      value: Joi.alternatives(
        Joi.boolean(),
        Joi.number(),
        Joi.string(),
        Joi.array().items(Joi.alternatives(Joi.number(), Joi.string())),
      ).required(),
    }),
  ),
  pagination: Joi.object({
    offset: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).max(100).default(20),
  }),
  search: Joi.object({
    query: Joi.string().required(),
    in: Joi.array().items(Joi.string()),
  }),
  sort: Joi.object({
    key: Joi.string().required(),
    order: Joi.string().valid('ASC', 'DESC'),
  }),
});

export const searchParamsToFilters = (
  searchParams: URLSearchParams,
): Filters => {
  const filters: Filters = {};

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
    filters.search = {
      query: searchParams.get('search')!,
    };
    searchParams.delete('search');
  }

  if (searchParams.has('in')) {
    if (filters.search) {
      filters.search.in = searchParams.get('in')!.split(',');
    }
    searchParams.delete('in');
  }

  if (searchParams.has('sort')) {
    const [key, order] = searchParams.get('sort')!.split('-');

    filters.sort = {
      key,
      order: order as Sort['order'],
    };

    searchParams.delete('sort');
  }

  searchParams.forEach((value, key) => {
    const isArray = key.endsWith('[]') || key.slice(0, -1).endsWith('[]');

    const operator =
      OPERATORS.find((operator) => key.at(-1) === operator.at(0)) || '==';

    const name = (key + '=')
      .split(`${isArray ? '[]' : ''}${operator.at(0)}`)
      .at(0)!;

    filters.fields ||= [];

    filters.fields.push({
      key: name,
      operator,
      value: isArray ? value.split(',') : value,
    });
  });

  return filters;
};

export const filtersToTypeorm = (
  filters: Filters,
  mapper: (key: string) => string,
) => {
  const sections: string[] = [];

  for (const field of filters.fields || []) {
    const key = mapper(field.key);

    const values = [field.value]
      .flat()
      .map((value) => `'${value}'`)
      .join(', ');

    switch (field.operator) {
      case '!=': {
        sections.push(`(${key} NOT IN (${values}))`);
        break;
      }
      case '<=': {
        sections.push(`(${key} <= ${field.value})`);
        break;
      }
      case '==': {
        sections.push(`(${key} IN (${values}))`);
        break;
      }
      case '>=': {
        sections.push(`(${key} >= ${field.value})`);
        break;
      }
      case '*=': {
        sections.push(`(${key} ILIKE '%${field.value}%')`);
        break;
      }
      case '^=': {
        sections.push(`(${key} ILIKE '${field.value}%')`);
        break;
      }
      case '$=': {
        sections.push(`(${key} ILIKE '%${field.value}')`);
        break;
      }
    }
  }

  if (filters.search) {
    const query = filters.search.in
      ?.map((field) => `(${mapper(field)} ILIKE '%${filters.search!.query}%')`)
      ?.join(' OR ');

    query && sections.push(`(${query})`);
  }

  const query = sections.join(' AND ');

  const pagination = filters.pagination;

  const sort = filters.sort?.key
    ? Object.assign({}, filters.sort, { key: mapper(filters.sort.key) })
    : filters.sort;

  return { query, pagination, sort };
};
