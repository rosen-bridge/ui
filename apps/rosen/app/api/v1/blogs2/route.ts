import { NextResponse } from 'next/server';
import { addPosts } from '@/_lib/data';

export const POST = async (req: Request, res: Response) => {
  const { title, desc } = await req.json();
  try {
    const post = { title, desc, date: new Date(), id: Date.now().toString() };
    addPosts(post);
    return NextResponse.json({ message: 'ok', post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Error', err }, { status: 500 });
  }
};
