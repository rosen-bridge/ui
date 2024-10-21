'use client';

import { useEffect, useState } from 'react';

export default function Success() {
  const [data, setData] = useState<any>({});
  const [id, setId] = useState('');
  async function load() {
    const response = await fetch(
      `/success/api?id=${id}`,
      // `https://jsonplaceholder.typicode.com/todos/${id}`,
    );
    if (!response.ok) {
      throw new Error('THIS IS AN ERROR FROM CLIENT');
    }
    const data: any = await response.json();
    setData(data);
  }
  function onInput(event: any) {
    setId(event.target.value);
  }
  return (
    <div>
      success page title: {data.title}
      <br />
      <input value={id} onInput={onInput} />
      <button onClick={load}>fetch</button>
    </div>
  );
}
