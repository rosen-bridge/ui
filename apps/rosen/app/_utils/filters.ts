import Joi from 'joi';

type Fields = {
  key: string;
  operator: '=' | '!' | '<' | '>';
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
        operator: Joi.string().valid('=', '!', '<', '>').required(),
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
    searchParams.delete('sort');
  }

  searchParams.forEach((value, key) => {
    const isArray = key.endsWith('[]') || key.slice(0, -1).endsWith('[]');

    const hasOperator = ['!', '<', '>'].includes(key.at(-1)!);

    const operator = (hasOperator ? key.at(-1)! : '=') as Fields['operator'];

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

export const filtersToTypeormWhere = (filters: Filters, pre?: string) => {
  pre = pre ? pre + '.' : '';

  const sections: string[] = [];

  for (const field of filters.fields) {
    const values = [field.value]
      .flat()
      .map((value) => `'${value}'`)
      .join(', ');
    sections.push(
      `(${pre}${field.key}${field.operator == '=' ? ' ' : ' NOT '}IN (${values}))`,
    );
  }

  if (filters.search?.query) {
    if (filters.search.in) {
      sections.push(
        `(${pre}${filters.search.in} LIKE '%${filters.search.query}%')`,
      );
    } else {
      // TODO
    }
  }

  const where = sections.join(' AND ');

  return where;
};
