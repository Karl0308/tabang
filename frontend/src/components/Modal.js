// @src/components/Modal.jsx

import React from "react";
import styles from "./Modal.module.css";
import { RiCloseLine } from "react-icons/ri";
import Axios from "axios";
import logo from "../img/ticket check.svg"
import CopyButton from "./CopyButton";

// const Modal = ( setIsOpen, setitemId, props ) => {
const Modal = (props) => {

  return (
    <>
      <div className={styles.darkBG} onClick={() => props.setisConfirmSave(true)} />
      <div className={styles.centered}>
        <div className={styles.copybutton}>

          <div style={{ border: "none", width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
            <div className={styles.linkurl}>{window.location.origin + "/ticketview/" + props.Action}</div>
            <div><CopyButton text={window.location.origin + "/ticketview/" + props.Action} /></div>
          </div>

        </div>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h5 className={styles.heading}><img className={styles.logo} src={logo}></img></h5>
          </div>
          {/* <button className={styles.closeBtn} onClick={() => props.setisConfirmSave(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button> */}
          <div className={styles.modalContent} >
            Ticket ID: {" " + props.Action}
          </div>
          <div className={styles.modalContent2}>
            Your ticket has been successfully created!
          </div>
          <div className={styles.modalActions}>
            <div className={styles.actionsContainer}>
              {/* <button className={styles.deleteBtn} onClick={() => deleteItem()}>
                Delete
              </button> */}
              <button
                className={styles.cancelBtn}
                onClick={() => props.setisConfirmSave(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;