export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
  );
  if (!response.ok) {
    throw new Error('THIS IS AN ERROR FROM CLIENT');
  }
  const data: any = await response.json();
  return Response.json(data);
}
