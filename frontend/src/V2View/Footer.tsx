import React from 'react';
import packageJson from '../../package.json';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-300 dark:bg-slate-800 text-black dark:text-white p-2 fixed bottom-0 right-0 w-full z-10 flex justify-between items-center">
        <div className="text-sm">
          © {currentYear} Everyone Technologies, Inc. All rights reserved.
        </div>
        <div className="text-sm">
          Version: {packageJson.version}
        </div>
      </footer>
      
    );
};

export default Footer;
