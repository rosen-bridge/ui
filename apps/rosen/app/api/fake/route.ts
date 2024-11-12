import { NextResponse } from 'next/server';

import { data, singletonInstance } from '../data';
import { getDatabaseClient } from '../databaseClient';

export async function GET() {
  return NextResponse.json({
    data,
    fakedata: (globalThis as any)['fakedata'] || [],
    singletonData: singletonInstance.getData(),
    getDatabaseClient: getDatabaseClient().getData(),
  });
}
