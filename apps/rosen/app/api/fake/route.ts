import { NextResponse } from 'next/server';

import { data, singletonInstance } from '../data';
import { getDatabaseClient } from '../databaseClient';

export async function GET() {
  const { instance, has } = getDatabaseClient();
  return NextResponse.json({
    has,
    data,
    fakedata: (globalThis as any)['fakedata'] || [],
    singletonData: singletonInstance.getData(),
    getDatabaseClient: instance.getData(),
  });
}
