import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { useMsal } from '@azure/msal-react';

const ErrorLogin = () => {
    const [showModal, setShowModal] = useState(false);
    const intervalRef = useRef(null); // Create a ref for the interval
    const { instance } = useMsal();

    const checkLocalStorage = () => {
        if (localStorage.getItem('errorlogin')) {
            setShowModal(true);
            clearInterval(intervalRef.current); // Clear the interval when data is found
        }
    };

    useEffect(() => {
        intervalRef.current = setInterval(checkLocalStorage, 1000); // check every second

        return () => clearInterval(intervalRef.current); // clear interval on component unmount
    }, []);

    const handleLogoutRedirect = () => {
        localStorage.clear();
        instance.logoutRedirect().catch(() => {});
    };

    return (
        <div>
            <Modal className='errorlogin' show={showModal} centered>
                <Modal.Header>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your email address may not be registered or may be inactive in our system. Please contact your administrator for assistance. Additionally, ensure that you log out of your account for security reasons.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleLogoutRedirect}>Logout</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ErrorLogin;
