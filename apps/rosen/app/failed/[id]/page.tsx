export default async function Failed({ params }: any) {
  console.log(33333, params);
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${params.id}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok ...............');
  }
  const data: any = await response.json();
  return <div>failed page title: {data.title}</div>;
}
