import {
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
} from '@rosen-bridge/extended-typeorm';
import { Filter } from '@rosen-bridge/query-params';

/**
 * Converts a {@link Filter} object from `@rosen-bridge/query-params` into
 * TypeORM-compatible query options.
 *
 * @param filters - Parsed query filters.
 * @param mapper - Transforms filter keys before they are used in the query.
 * @returns TypeORM pagination, sorting, and where options.
 */
export const filtersToTypeorm = (
  filters: Filter,
  mapper: (key: string) => string,
) => {
  const pagination = filters.pagination;

  const sorts = filters.sorts?.map((sort) =>
    Object.assign({}, sort, { key: mapper(sort.key) }),
  );

  const where: ObjectLiteral = {};

  for (const field of filters.fields || []) {
    const key = mapper(field.key);

    switch (field.type) {
      case 'number': {
        switch (field.operator) {
          case 'greaterThanOrEqual': {
            where[key] = MoreThanOrEqual(field.value);
            break;
          }
          case 'lessThanOrEqual': {
            where[key] = LessThanOrEqual(field.value);
            break;
          }
        }
        break;
      }
      case 'string': {
        switch (field.operator) {
          case 'contains': {
            where[key] = ILike(`%${field.value}%`);
            break;
          }
          case 'endsWith': {
            where[key] = ILike(`%${field.value}`);
            break;
          }
          case 'equal': {
            where[key] = field.value;
            break;
          }
          case 'notEqual': {
            where[key] = Not(field.value);
            break;
          }
          case 'startsWith': {
            where[key] = ILike(`${field.value}%`);
            break;
          }
        }
        break;
      }
      case 'stringArray': {
        switch (field.operator) {
          case 'excludes': {
            where[key] = Not(In(field.values));
            break;
          }
          case 'includes': {
            where[key] = In(field.values);
            break;
          }
        }
        break;
      }
    }
  }

  return { pagination, sorts, where };
};
