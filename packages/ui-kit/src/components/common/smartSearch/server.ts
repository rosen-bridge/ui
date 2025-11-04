import { 
  FindManyOptions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  ILike 
} from '@rosen-bridge/extended-typeorm';
import Joi from 'joi';

export const FILTERS_FIELD_OPERATORS = ['==', '!=', '<=', '>=', '*=', '^=', '$='] as const;

export type FiltersField = {
  key: string;
  operator: (typeof FILTERS_FIELD_OPERATORS)[number];
  value: boolean | number | null | string | ( boolean | number | null | string)[];
};

export type FiltersSort = {
  key: string;
  order?: 'ASC' | 'DESC';
};

export type FiltersSearch = {
  query: string;
  in?: string[];
};

export type FiltersPagination = {
  offset?: number;
  limit?: number;
};

export type Filters = {
  fields: FiltersField[];
  pagination?: FiltersPagination;
  search?: FiltersSearch;
  sorts: FiltersSort[];
};

export const urlSearchParamsToFilters = (
  urlSearchParams: URLSearchParams,
): Filters => {
  const filters: Filters = {
    fields: [],
    sorts: []
  };

  if (urlSearchParams.has('limit')) {
    filters.pagination ||= {};
    filters.pagination.limit = +urlSearchParams.get('limit')!;
    urlSearchParams.delete('limit');
  }

  if (urlSearchParams.has('offset')) {
    filters.pagination ||= {};
    filters.pagination.offset = +urlSearchParams.get('offset')!;
    urlSearchParams.delete('offset');
  }

  if (urlSearchParams.has('search')) {
    filters.search = {
      query: urlSearchParams.get('search')!,
    };
    urlSearchParams.delete('search');
  }

  if (urlSearchParams.has('in')) {
    if (filters.search) {
      filters.search.in = urlSearchParams.get('in')!.split(',');
    }
    urlSearchParams.delete('in');
  }

  if (urlSearchParams.has('sorts')) {
    const raw = urlSearchParams.get('sorts') || '';

    const values = raw.split(',');

    for (const value of values) {
      const sections = value.split('-');

      const key = sections.at(0) as string;

      const order = sections.at(1) as FiltersSort['order'];

      filters.sorts.push({ key, order })
    }
 
    urlSearchParams.delete('sorts');
  }

  urlSearchParams.forEach((value, key) => {
    const isArray = key.endsWith('[]') || key.slice(0, -1).endsWith('[]');

    const operator =
      FILTERS_FIELD_OPERATORS.find((operator) => key.at(-1) === operator.at(0)) || '==';

    const name = (key + '=')
      .split(`${isArray ? '[]' : ''}${operator.at(0)}`)
      .at(0)!;

    filters.fields.push({
      key: name,
      operator,
      value: isArray ? value.split(',') : value,
    });
  });

  return filters;
};

export const FiltersSchema = Joi.object<Filters>({
  fields: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      operator: Joi.string()
        .valid(...FILTERS_FIELD_OPERATORS)
        .required(),
      value: Joi.alternatives(
        Joi.boolean(),
        Joi.number(),
        Joi.string(),
        Joi.array().items(Joi.alternatives(Joi.number(), Joi.string())),
      ).required(),
    }),
  ).required(),
  pagination: Joi.object({
    offset: Joi.number().min(0),
    limit: Joi.number().min(1),
  }),
  search: Joi.object({
    query: Joi.string().required(),
    in: Joi.array().items(Joi.string()),
  }),
  sorts: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      order: Joi.string().valid('ASC', 'DESC'),
    })
  ).required(),
});

export const filtersToTypeorm = <T>(filters: Filters): FindManyOptions<T> => {
  const result: FindManyOptions<T> = {
    order: {},
    where: {},
  };

  result.skip = filters.pagination?.offset;

  result.take = filters.pagination?.limit;

  filters.sorts.forEach((sort) => { 
    (result.order as Record<string, unknown>)[sort.key] = sort.order;
  });

  for (const field of filters.fields || []) {
    let condition;

    switch (field.operator) {
      case '!=': {
        condition = Not(In([field.value].flat()));
        break;
      }
      case '<=': {
        condition = LessThanOrEqual(field.value);
        break;
      }
      case '==': {
        condition = In([field.value].flat());
        break;
      }
      case '>=': {
        condition = MoreThanOrEqual(field.value);
        break;
      }
      case '*=': {
        condition = ILike(`%${field.value}%`);
        break;
      }
      case '^=': {
        condition = ILike(`${field.value}%`);
        break;
      }
      case '$=': {
        condition = ILike(`%${field.value}`);
        break;
      }
    }
    
    (result.where as Record<string, unknown>)[field.key] = condition;
  }

  return result;
};

export * from '../../../filter'
