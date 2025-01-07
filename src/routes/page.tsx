import { get as hello } from '@api/hello';
import { useEffect, useState } from 'react';

export default () => {
  const [text, setText] = useState('');

  useEffect(() => {
    async function fetchMyApi() {
      const data = await hello();
      console.log(data);
    }

    fetchMyApi();
  }, []);

  return <p>{text}</p>;
};
