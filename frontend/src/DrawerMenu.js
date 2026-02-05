import React, { useState } from 'react';
import './DrawerMenu.css';
import toggleButtonImage from './img/icons8-menu.svg'; 
import profileImage from './img/user.png'; 

const DrawerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };
  const logout = event => {
    localStorage.clear();
    window.location.reload(false);
  };

  return (
    <div className="drawer-container">
      <button className="toggle-button" onClick={toggleDrawer}>
      <img width={16} height={16} src={toggleButtonImage} alt="Toggle Drawer" />
      </button>
      <div className={`drawer ${isOpen ? 'open' : ''}`} onClick={closeDrawer}>
        <div className="drawer-content">
            <div>
                <div style={{textAlign:"center", marginBottom:"30px"}}>
                    <img width={70} height={70} src={profileImage} alt="Toggle Drawer" />
                </div>
                <div style={{textAlign:"center",padding:"10px"}}>
                    {localStorage.getItem("fullname")}
                </div>
                <div style={{textAlign:"center",padding:"0px"}}>
                    {localStorage.getItem("roletext")}
                </div>
            </div>
          {/* <ul>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul> */}
          
          <button className="drawer-button" onClick={logout}>LOGOUT</button>
        </div>
      </div>
    </div>
  );
};

export default DrawerMenu;
