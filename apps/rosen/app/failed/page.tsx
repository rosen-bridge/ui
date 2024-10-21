export default async function Failed() {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/todos/fake',
  );
  if (!response.ok) {
    throw new Error('Network response was not ok ...............');
  }
  const data: any = await response.json();
  return <div>failed page title: {data.title}</div>;
}
