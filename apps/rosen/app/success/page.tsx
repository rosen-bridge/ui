export default async function Success() {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  if (!response.ok) {
    throw new Error('Network response was not ok ...............');
  }
  const data: any = await response.json();
  return <div>success page title: {data.title}</div>;
}
