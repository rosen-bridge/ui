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
    keys: [
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
  // fields: [
  //   {
  //     key: 'toChain'
  //   }
  // ]
});

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
