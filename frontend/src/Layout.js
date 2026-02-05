import { Outlet, Link, useNavigate } from "react-router-dom";
import React, { Component, useState, useEffect } from 'react';
// import logo from './img/iloilo supermart.svg';
import logo from './img/logo.svg';
import { Fade } from "reactstrap";
import Loading from "./components/Loading";
import DrawerMenu from "./DrawerMenu";
import toggleButtonImage from './img/icons8-menu.svg';
import profileImage from './img/user.png';

import { useMsal } from '@azure/msal-react';
import ErrorLogin from "./components/ErrorLogin";

const Layout = () => {

  const { instance } = useMsal();
  // const [user, setUser] = useState(false);
  // const [ticketentry, setTicketEntry] = useState(false);
  // const [ticketlist, setTicketList] = useState(false);
  // const selectedLink = (a) => {
  //   setUser(false);
  //   setTicketEntry(false);
  //   setTicketList(false);
  //   if (a.target.id == "ticketentry") {
  //     setTicketEntry(true);
  //   }
  //   if (a.target.id == "ticketlist") {
  //     setTicketList(true);
  //   }
  //   if (a.target.id == "users") {
  //     setUser(true);
  //   }
  // };



  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');

  const toggleDrawer = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };
  const logout = event => {
    localStorage.clear();
    navigate('/');
    window.location.reload(false);

  };
  useEffect(() => {
    // Add an event listener to the document to handle clicks outside of the drawer
    const handleOutsideClick = (event) => {
      if (isOpen && !document.querySelector('.drawer').contains(event.target)) {
        closeDrawer();
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener('mousedown', handleOutsideClick);

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleLogoutRedirect = () => {
    localStorage.clear();
    window.location.href = window.location.href;
    // instance.logoutRedirect().catch((error) => console.log(error));
  };
  
  return (
    <>
      <div className="drawer-container">
        <button className="toggle-button" onClick={toggleDrawer}>
          <img width={16} height={16} src={toggleButtonImage} alt="Toggle Drawer" />
        </button>
        <div className={`drawer ${isOpen ? 'open' : ''}`} onClick={closeDrawer}>
          <div className="drawer-content">
            <div>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <img width={70} height={70} src={profileImage} alt="Toggle Drawer" />
              </div>
              <div style={{ textAlign: "center", padding: "10px" }}>
                {localStorage.getItem("fullname")}
              </div>
              <div style={{ textAlign: "center", padding: "0px" }}> 
                {localStorage.getItem("roletext")}
              </div>
              <ul>
              <li hidden={localStorage.getItem("role") != 0 ? true : false}>
                  <Link id="assets" to="/assets" className={window.location.pathname.replace('/', '') == 'assets' ? "ticket-users active" : "ticket-users"}>Assets</Link>
                </li>
                <li hidden={localStorage.getItem("role") != 0 ? true : false}>
                  <Link id="branches" to="/branches" className={window.location.pathname.replace('/', '') == 'branches' ? "ticket-users active" : "ticket-users"}>Branches</Link>
                </li>

                <li hidden={localStorage.getItem("role") != 0 ? true : false}>
                  <Link id="users" to="/users" className={window.location.pathname.replace('/', '') == 'users' ? "ticket-users active" : "ticket-users"}>Users</Link>
                </li>

                <li>
                  <Link id="ticketlist" to="/" className={window.location.pathname.replace('/', '') == '' ? "tickets active" : "tickets"}>Tickets</Link>
                </li>

                <li hidden={localStorage.getItem("role") == 1 ? true : false}>
                  <Link id="ticketentry" to="/ticketentry" className={window.location.pathname.replace('/', '') == 'ticketentry' ? "ticket-entry active" : "ticket-entry"}>Ticket Entry</Link>
                </li>
                
                {/* <li hidden={localStorage.getItem("role") != 0 ? true : false}>
                  <Link id="groups" to="/groups" className={window.location.pathname.replace('/', '') == 'groups' ? "ticket-users active" : "ticket-users"}>Groups</Link>
                </li>

                <li hidden={localStorage.getItem("role") != 0 ? true : false}>
                  <Link id="overtime" to="/overtime" className={window.location.pathname.replace('/', '') == 'overtime' ? "ticket-users active" : "ticket-users"}>Overtime</Link>
                </li> */}


                <li hidden={localStorage.getItem("role") != 0 ? true : false}>
                  <Link id="settings" to="/settings" className={window.location.pathname.replace('/', '') == 'settings' ? "ticket-users active" : "ticket-users"}>Settings</Link>
                </li>

                <li>
                  <Link id="settings" to="/v2">V2</Link>
                </li>

              </ul>
            </div>

            {/* <ul>
              <li hidden={localStorage.getItem("role") != 0 ? true:false}>
                <Link id="users" to="/users" className={window.location.pathname.replace('/','') == 'users' ? "ticket-users active":"ticket-users"}>Users</Link>
              </li>
              <li>
                <Link id="ticketlist" to="/"  className={window.location.pathname.replace('/','') == '' ? "tickets active":"tickets"}>Tickets</Link>
              </li>
              <li>
                <Link id="ticketentry" to="/ticketentry" className={window.location.pathname.replace('/','') == 'ticketentry' ? "ticket-entry active":"ticket-entry"}>Ticket Entry</Link>
              </li>
            </ul> */}


            {/* <button className="drawer-button" onClick={logout}>LOGOUT</button> */}
            <button className="drawer-button" onClick={handleLogoutRedirect}>LOGOUT</button>
          </div>
        </div>
      </div>
      {/* <DrawerMenu /> */}
      <div><img className="main-view-logo" src={logo}></img></div>
      <div className="main-view">
        <nav className="main-navigation">
          <ul>
            <li>
              <div id="users" to="/users" className={window.location.pathname.replace('/', '').length === 0 ? "TICKETS" : window.location.pathname.replace('/', '').toUpperCase()}>{window.location.pathname.replace('/', '').length === 0 || window.location.pathname.replace('/', '').length > 12 ? "TICKETS" : window.location.pathname.replace('/', '') == 'ticketentry' ? "TICKET ENTRY" : window.location.pathname.replace('/', '').toUpperCase()}</div>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-view-body"><Outlet /></div>

      {/* <Loading />  */}
      

      <><ErrorLogin /></>
    </>
  )
};

export default Layout;