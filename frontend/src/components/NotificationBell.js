import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { APIURLS } from '../APIURLS';

const NotificationBell = ({ onNotificationClick }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);

  const axiosInstance = axios.create({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });


  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 600);
};

  useEffect(() => {
    FetchNotifications();
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);

  const FetchNotifications = () => {
    axiosInstance.get(APIURLS.notification.getNotifications() + localStorage.getItem("id"))
      .then(res => res.data)
      .then(
        (result) => {
          setNotifications(result);
          const unreadNotifications = result.filter(notification => !notification.isRead);
          setNotificationCount(unreadNotifications.length);
        },
        (error) => {
        }
      )
  }
  const ReadNotifications = (id) => {
    axiosInstance.post(APIURLS.notification.readNotifications() + id);
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    let shakeInterval;
    let shakeDuration = 500;
    let intervalDuration = 10000;
  
    const startShakeAnimation = () => {
      const bellIcon = bellRef.current;
      if (notificationCount > 0) {
        bellIcon.classList.add('shake');
        setTimeout(() => {
          bellIcon.classList.remove('shake');
        }, shakeDuration);
      }
    };
  
    shakeInterval = setInterval(() => {
      startShakeAnimation();
      FetchNotifications();
    }, intervalDuration);
  
    return () => clearInterval(shakeInterval);
  }, [notificationCount]);

  const handleNotificationRowClick = (ticketNumber, id) => {
    ReadNotifications(id);
    // window.open(window.location.origin + "/ticketview/" + ticketNumber);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <style>
        {`
          #bell-icon {
            font-size: 32px;
            color: ${notificationCount > 0 ? '#FFD700' : '#808080'};
            background-color: #f2f2f2;
            border-radius: 50%;
            padding: 10px;
            cursor: pointer;
            position: relative;
          }

          #bell-icon.shake {
            animation: shake 0.3s infinite;
          }

          .notification-badge {
            position: absolute;
            top: 6px;
            left: 24px;
            background-color: red;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          }

          .notifications-container {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width:  ${isSmallScreen ? '260px' : '400px'};
            max-height: 600px;
            overflow-y: auto;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            display: ${showNotifications ? 'block' : 'none'};
            z-index: 10;
            text-align:left;
          }
          
          .notifications-header {
            position: sticky;
            top: 0;
            background-color: #3B82F6;
            color: white;
            padding: 10px;
            font-size: 18px;
          }
          
          .notifications-list {
            padding: 10px;
          }
          
          .notification-item {
            font-size:  ${isSmallScreen ? '2.5vw' : '14px'};
            cursor: pointer;
            padding: 10px;
            border-bottom: 1px solid gray;
            margin-bottom: 10px;
          }
          
          .notification-item:hover {
            background-color: #f2f2f2;
          }
          
          .read-notification {
            background-color: #f0f0f0; /* Change this to the desired background color for read notifications */
          }

          @keyframes shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-20deg); }
            50% { transform: rotate(20deg); }
            75% { transform: rotate(-20deg); }
            100% { transform: rotate(20deg); }
          }
        `}
      </style>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <FontAwesomeIcon
          id="bell-icon"
          icon={faBell}
          onClick={handleNotificationClick}
          ref={bellRef}
        />
        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
      </div>
      {showNotifications && (
        <div className="notifications-container">
          <div className="notifications-header">Notifications</div>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                className={`notification-item ${!notification.isRead ? 'read-notification' : ''}`}
                key={notification.id}
                // onClick={(e) => handleNotificationRowClick(notification.ticketNumber, notification.id)}
                onClick={(e) => 
                  {
                    ReadNotifications(notification.id);
                    onNotificationClick(notification.ticketNumber);
                  }}
              >
                <span style={{ color: "blue" }}>{notification.fromUserFullName}</span> {notification.message} in a comment
                <div style={{ color: "blue", marginTop: "10px" }}>
                  {window.location.origin + "/ticketview/" + notification.ticketNumber}
                </div>
                <div style={{ marginTop: "22px", textAlign: "right" }}>
                  {notification.dateText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
