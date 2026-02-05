
import React, { useRef, useState } from 'react';
import Altcha from './Altcha';
import './App.css'; // Make sure to have some basic styles for the popup
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Container, Row, Col, Input, Label, Table } from "reactstrap";

const PopupForm = ({ onClose, onCaptchaComplete, ticketId }) => {
    const altchaRef = useRef(null);
    const [comment, setCommment] = useState("");


    const handleSubmit = (e) => {
        e.preventDefault();

        onCaptchaComplete({ comment, captchaValue: altchaRef.current?.value, ticketId });
        onClose();
    };
    return (

        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 p-4">
            <div className="text-2xl font-medium text-[#223E58] dark:text-white mb-4">Catch Up:</div>

            <form onSubmit={handleSubmit}>
                <fieldset>
                    <Altcha ref={altchaRef} />
                </fieldset>

                <div className="mt-4 flex justify-end gap-4">
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-4 py-2 rounded"
                    >
                        Submit
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={onClose}
                        className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-800 dark:text-white font-bold text-base px-4 py-2 rounded"
                        active
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>

    );
};

function AltchaCaptcha({ ticketId, onCaptchaComplete }) {
    const [isOpen, setIsOpen] = useState(false);

    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    return (
        <>
            <Button
                onClick={openPopup}
                className="w-full font-bold text-lg py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
            >
                Catch Up
            </Button>



            <Modal show={isOpen} onHide={closePopup} >
                <PopupForm onClose={closePopup} onCaptchaComplete={onCaptchaComplete} ticketId={ticketId} />
            </Modal>
        </>
    );
}

export default AltchaCaptcha;
