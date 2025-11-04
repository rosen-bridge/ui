import { 
  FILTER_FIELD_COLLECTION_OPERATORS, 
  FILTER_FIELD_NUMBER_OPERATORS, 
  FILTER_FIELD_STRING_OPERATORS 
} from "./constants";
  
export type FilterFieldCollection = {
  key: string;
  type: 'collection'
  operator: typeof FILTER_FIELD_COLLECTION_OPERATORS[number];
  values: string[];
}

export type FilterFieldNumber = {
  key: string;
  type: 'number'
  operator: typeof FILTER_FIELD_NUMBER_OPERATORS[number];
  value: number;
}

export type FilterFieldString = {
  key: string;
  type: 'string'
  operator: typeof FILTER_FIELD_STRING_OPERATORS[number];
  value: string;
}

export type FilterField = FilterFieldCollection | FilterFieldNumber | FilterFieldString;

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

export type FilterConfigFieldCollection = {
  key: string; 
  type: 'collection';
  operators?: FilterFieldCollection['operator'][];
  values?: string[];
}

export type FilterConfigFieldNumber = {
  key: string; 
  type: 'number';
  operators?: FilterFieldNumber['operator'][];
}

export type FilterConfigFieldString = {
  key: string; 
  type: 'string';
  operators?: FilterFieldString['operator'][];
}

export type FilterConfigField = FilterConfigFieldCollection | FilterConfigFieldNumber | FilterConfigFieldString;

export type FilterConfigSort = {
  key: string; 
  defaultOrder?: 'ASC' | 'DESC';
}

export type FilterConfig = {
  fields?: {
    enable?: boolean;
    items?: FilterConfigField[]
  };
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
    items?: FilterConfigSort[];
  };
}
