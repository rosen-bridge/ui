import { NextResponse } from 'next/server';

import { data, singletonInstance } from '../data';

export async function GET() {
  return NextResponse.json({
    data,
    fakedata: (globalThis as any)['fakedata'] || [],
    singletonData: singletonInstance.getData(),
  });
}
