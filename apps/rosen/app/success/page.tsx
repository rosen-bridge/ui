export default async function Success() {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  const data: any = await response.json();
  return <div>success page title: {data.title}</div>;
}
