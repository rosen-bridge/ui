import { createFilterParser } from "@rosen-bridge/ui-kit/dist/components/common/smartSearch/server";
import { NextResponse } from 'next/server';

const parser = createFilterParser({
  pagination: { 
    // enable: false,
    limit: {
      default: 12
    }
  },
  sorts: {
    // enable: false,
    items: [
      {
        key: 'qqq',
        defaultOrder: 'DESC'
      },
      {
        key: 'www',
        // defaultOrder: 'ASC'
      }
    ]
  },
  fields: {
    enable: true,
    items: [
      {
        key: 'toChain',
        type: 'collection',
        operators: ['includes'],
        values: ['v1', 'v2']
      },
      {
        key: 'amount',
        type: 'number',
        // operators: ['greaterThanOrEqual', "equal"]
      },
      {
        key: 'tokenName',
        type: 'string',
        // operators: ['equal']
      },
      {
        key: 'eventId',
        type: 'string',
        operators: ['contains']
      }
    ]
  },
  // fields1: [
  //   {
  //     key: 'k1',
  //     operators: [],
  //     values: []
  //   }
  // ]
});

/**
 * string     -> equal, not equal
 * collection -> includes, excludes
 * amount     -> equal, not equal, greaterThanOrEqual, lessThanOrEqual
 */

export async function GET(request: Request) {
  try {
    return NextResponse.json(parser(request.url));
  } catch (error: any) {
    return NextResponse.json({ 
      issues: error.issues,
      // message: error.message,
      name: error.name,
      type: error.type,
      cause: error.cause,
    }, { status: 400 });
  }
}
