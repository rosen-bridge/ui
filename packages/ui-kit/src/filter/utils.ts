// import { FindManyOptions,In,LessThanOrEqual,MoreThanOrEqual,Not,ILike } from '@rosen-bridge/extended-typeorm';
import * as z from "zod";
import deepmerge from 'deepmerge';
import { Filter, FilterConfig, FilterSort } from './types';
import { FILTER_CONFIG_DEFAULT, FILTER_FIELD_OPERATORS } from './constants';

// const createFieldsSchema = (config: FilterConfig): z.ZodType<Filter['fields']> => {
//   // const fields1 = z.array(z.union(config.fields!.map((field) => z.object({key: z.literal(field.key)})))).optional();

//   // const fieldSchemas = (config.fields ?? []).map(
//   //   (field) =>
//   //     z.object({
//   //       key: z.literal(field.key)
//   //     })
//   // );

//   // const fields =
//   //   fieldSchemas.length > 0
//   //     ? z.discriminatedUnion("key", fieldSchemas)
//   //     : z.never();


//   const schema = z.array(z.object({}));

//   return schema;
// }

const createPaginationSchema = (config: FilterConfig): z.ZodType<Filter['pagination']> => {
  if (!config.pagination?.enable) {
    return z.undefined({
      error: "Pagination is disabled"
    });
  }

  let limit = z.number({
    error: 'Limit must be a number',
  });

  if (config.pagination?.limit?.min !== undefined) {
    limit = limit.min(config.pagination.limit.min, {
      error: `Limit cannot be smaller than ${config.pagination.limit.min}`,
    });
  }

  if (config.pagination?.limit?.max !== undefined) {
    limit = limit.max(config.pagination.limit.max, {
      error: `Limit cannot be greater than ${config.pagination.limit.max}`,
    });
  }

  if (config.pagination?.limit?.default !== undefined) {
    limit = limit.default(config.pagination.limit.default) as unknown as z.ZodNumber;
  }

  let offset = z.number({
    error: 'Offset must be a number',
  });

  if (config.pagination?.offset?.min !== undefined) {
    offset = offset.min(config.pagination.offset.min, {
      error: `Offset cannot be smaller than ${config.pagination.offset.min}`,
    });
  }

  if (config.pagination?.offset?.max !== undefined) {
    offset = offset.max(config.pagination.offset.max, {
      error: `Offset cannot be greater than ${config.pagination.offset.max}`,
    });
  }

  if (config.pagination?.offset?.default !== undefined) {
    offset = offset.default(config.pagination.offset.default) as unknown as z.ZodNumber;
  }
 
  const schema = z
    .object({ 
      limit: limit.optional(),
      offset: offset.optional(),
    })
    .prefault({})
    .optional();

  return schema;
}

const createSortsSchema = (config: FilterConfig): z.ZodType<Filter['sorts']> => {
  if (!config.sorts?.enable) {
    return z.undefined({
      error: "Sorting is disabled"
    });
  }

  const sorts = (config.sorts?.keys || []);

  const objects = sorts.map((field) => {
    const key = z.literal(field.key);

    let order = z
      .enum(["ASC", "DESC"])
      .optional();

    if (field.defaultOrder) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order = order.default(field.defaultOrder) as any;
    }

    return z.object({ key, order });
  });

  const keys = sorts.map((sort) => `'${sort.key}'`).join(', ');

  const schema = z
    .array(
      z.union(objects, {
        error: `Sort key or order missing or invalid. Use ${keys} for key and 'ASC' or 'DESC' for order`
      })
    )
    .optional();   

  return schema;
}
 
const createFilterSchema = (config: FilterConfig): z.ZodType<Filter> => {
  // const fields = createFieldsSchema(config);

  const pagination = createPaginationSchema(config);

  const sorts = createSortsSchema(config);

  return z.object({ pagination, sorts }); 
}

const urlToFilter = (url: string): Filter => {
  const { searchParams } = new URL(url);

  const filters: Filter = {
    fields: [],
    sorts: []
  };

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

  if (searchParams.has('sorts')) {
    const raw = searchParams.get('sorts') || '';

    const values = raw.split(',');

    for (const value of values) {
      const sections = value.split('-');

      const key = sections.at(0) as string;

      const order = sections.at(1) as FilterSort['order'];

      filters.sorts ||= [];

      filters.sorts.push({ key, order })
    }
 
    searchParams.delete('sorts');
  }

  searchParams.forEach((value, key) => {
    const operator = FILTER_FIELD_OPERATORS.find((operator) => key.endsWith(operator.symbol));

    if (!operator) return;

    const name = key.split(operator.symbol).at(0)!;

    filters.fields ||= [];

    switch (operator.key) {
      case 'includes':
      case 'excludes': {
        filters.fields.push({
          key: name,
          type: 'collection',
          operator: operator.key,
          values: value.split(',')
        });
        break;
      }
      case 'greaterThanOrEqual':
      case 'lessThanOrEqual': {
        filters.fields.push({
          key: name,
          type: 'number',
          operator: operator.key,
          value: +value
        });
        break; 
      }
      case 'contains':
      case 'startsWith':
      case 'endsWith': {
        filters.fields.push({
          key: name,
          type: 'string',
          operator: operator.key,
          value
        });
        break;
      }
    }
  });

  return filters;
};

export const createFilterParser = (partialConfig?: FilterConfig) => {
  const config = deepmerge(FILTER_CONFIG_DEFAULT, partialConfig || {});

  const schema = createFilterSchema(config);

  return (url: string): Filter => {
    const filter = urlToFilter(url);

    try {
      return schema.parse(filter)
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details = (error as any)?.issues?.at(0)?.message;

      const message = details || 'Unexpected Error';

      throw new Error(message, { cause: error });
    }
  }
}

// export const filterToTypeorm = <T>(filters: Filter): FindManyOptions<T> => {
//   const result: FindManyOptions<T> = {
//     order: {},
//     where: {},
//   };

//   result.skip = filters.pagination?.offset;

//   result.take = filters.pagination?.limit;

//   filters.sorts?.forEach((sort) => { 
//     (result.order as Record<string, unknown>)[sort.key] = sort.order;
//   });

//   for (const field of filters.fields || []) {
//     let condition;

//     switch (field.operator) {
//       case 'includes': {
//         condition = In(field.values);
//         break;
//       }
//       case 'excludes': {
//         condition = Not(In(field.values));
//         break;
//       }
//       case 'lessThanOrEqual': {
//         condition = LessThanOrEqual(field.value);
//         break;
//       }
//       case 'greaterThanOrEqual': {
//         condition = MoreThanOrEqual(field.value);
//         break;
//       }
//       case 'contains': {
//         condition = ILike(`%${field.value}%`);
//         break;
//       }
//       case 'startsWith': {
//         condition = ILike(`${field.value}%`);
//         break;
//       }
//       case 'endsWith': {
//         condition = ILike(`%${field.value}`);
//         break;
//       }
//     }
    
//     (result.where as Record<string, unknown>)[field.key] = condition;
//   }

//   return result;
// };
 
