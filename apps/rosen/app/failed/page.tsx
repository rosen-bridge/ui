export default async function Failed() {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/todos/fake',
  );
  const data: any = await response.json();
  return <div>failed page title: {data.title}</div>;
}
