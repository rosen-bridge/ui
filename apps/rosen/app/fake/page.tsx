'use client';

import { getFakeData, setFakeData } from '@/_actions/getFakeData';
import { useState } from 'react';

const Fake = () => {
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  return (
    <div>
      <input value={key} onInput={(event: any) => setKey(event.target.value)} />
      <br />
      <input
        value={value}
        onInput={(event: any) => setValue(event.target.value)}
      />
      <br />
      <button onClick={() => setFakeData(key, value).then(console.log)}>
        SET
      </button>
      <br />
      <button onClick={() => getFakeData().then(console.log)}>GET</button>
    </div>
  );
};

export default Fake;
