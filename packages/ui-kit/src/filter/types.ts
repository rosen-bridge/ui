 export type FilterField = 
| {
    key: string;
    type: 'collection'
    operator: 'includes'| 'excludes';
    values: string[];
  }
| {
    key: string;
    type: 'number'
    operator: 'lessThanOrEqual'| 'greaterThanOrEqual';
    value: number;
  }
| {
    key: string;
    type: 'string'
    operator: 'startsWith'| 'contains'| 'endsWith';
    value: string;
  };

export type FilterSort = {
  key: string;
  order?: 'ASC' | 'DESC';
};

export type FilterPagination = {
  offset?: number;
  limit?: number;
};

export type Filter = {
  fields?: FilterField[];
  pagination?: FilterPagination;
  sorts?: FilterSort[];
};

export type FilterConfig = {
  // fields?: ({ key: string; })[];
  pagination?: {
    enable?: boolean;
    offset?: {
      min?: number, 
      max?: number, 
      default?: number
    }, 
    limit?: {
      min?: number, 
      max?: number, 
      default?: number
    }
  };
  sorts?: {
    enable?: boolean;
    keys?: Array<{ 
      key: string; 
      defaultOrder?: 'ASC' | 'DESC';
    }>;
  };
}
