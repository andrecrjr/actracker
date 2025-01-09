import { useEffect, useState } from 'react';

export default () => {
  const [text, setText] = useState('actracker');

  // useEffect(() => {
  //   async function fetchMyApi() {
  //     const data = await hello();
  //     console.log(data);
  //   }

  //   fetchMyApi();
  // }, []);

  return <p>{text}</p>;
};
