import { useState } from 'react';

const useDark = (): [boolean, () => void] => {
  const [darkTheme, setDarkTheme] = useState(false);

  const changeTheme = () => {
    setDarkTheme(!darkTheme);
    document.documentElement.classList.toggle('dark', !darkTheme);
  };

  return [darkTheme, changeTheme];
};

export { useDark };
