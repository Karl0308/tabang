import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Importing altcha package will introduce a new element <altcha-widget>
import 'altcha';

const Altcha = forwardRef(({ onStateChange }, ref) => {
  const widgetRef = useRef(null);
  const [value, setValue] = useState(null);

  useImperativeHandle(ref, () => ({
    get value() {
      return value;
    },
  }), [value]);

  
  useEffect(() => {
    const handleStateChange = (ev) => {
      if ('detail' in ev) {
        setValue(ev.detail.payload || null);
        if (onStateChange) {
          onStateChange(ev);
        }
      }
    };

    const current = widgetRef.current;
    

    if (current) {
      current.addEventListener('statechange', handleStateChange);
      return () => current.removeEventListener('statechange', handleStateChange);
    }
  }, [onStateChange]);
  
  const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

  /* Configure your `challengeurl` and remove the `test` attribute, see docs: https://altcha.org/docs/website-integration/#using-altcha-widget  */
  return (
    <altcha-widget
    ref={widgetRef}
    style={{
      '--altcha-max-width': '100%',
      filter: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'invert(1) hue-rotate(180deg)' : 'none',
      backgroundColor: 'transparent',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      color: theme === 'dark' ? '#white' : 'black',
    }}
    debug
    test
  />
  
  );
});

export default Altcha;
