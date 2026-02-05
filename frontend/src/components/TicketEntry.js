import React, { useEffect, useState } from "react";
import { Button, Form, FormGroup, Label, Input, FormText, Modal } from 'reactstrap';
// import logo from '../img/iloilo supermart.svg';
import logo from '../img/logo2.png';
import axios from 'axios';
import LoadingSpinner from "../LoadingSpinner";
import ModalForm from "./Modal";
import Forms from 'react-bootstrap/Form';
import { APIURLS } from "../APIURLS";
import FileInputComponent from "./FileInputComponent";
import FileUpload from "./FileUpload";

function TicketEntry() {

  const [isOpenProcessing, setisOpenProcessing] = useState(false);
  const [isConfirmSave, setisConfirmSave] = useState(false);
  const [ticketId, setticketId] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [branches, setBranches] = useState([]);
  const [branchMembers, setBranchMembers] = useState([]);
  const [users, setUsers] = useState([]);


  const initialTicketState = {
    id: 0,
    calledIn: "2023-07-06T05:54:23.098Z",
    title: "",
    description: "",
    status: 0,
    oldStatus: 0,
    resolution: "",
    assigneeId: 0,
    currentUserId: 0,
    branchId: 0,
    reporterId: localStorage.getItem("id"),
    branchMemberAssigneeId: 0,
    file: []
  };

  const [ticket, setTicket] = useState(initialTicketState);
  const axiosInstanceAdd = axios.create({
    baseURL: APIURLS.ticket.saveTicket(),
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });

  const axiosInstanceGet = axios.create({
    baseURL: APIURLS.user.getUser(),
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });

  useEffect(() => {
    FetchBranches();
    FetchUsers();
  }, []);

  useEffect(() => {
    const selectedBranch = branches.find(branch => branch.id === Number(ticket.branchId));

    if (selectedBranch) {
      setBranchMembers(selectedBranch.branchMember ?? []);
    } else {
      setBranchMembers([]);
    }
  }, [ticket, branches]);

  const FetchUsers = () => {
    axiosInstanceGet.get(APIURLS.user.getUsers())
      .then(res => res.data)
      .then(
        (result) => {
          setUsers(result);
        },
        (error) => {
        }
      )
  }
  const FetchBranches = () => {
    axiosInstanceGet.get(APIURLS.branch.getBranches())
      .then(res => res.data)
      .then(
        (result) => {
          setBranches(result);
        },
        (error) => {
        }
      )
  }
  const submitFormAdd = (e) => {
    if (isOpenProcessing) {
      return;
    }

    e.preventDefault();
    setisOpenProcessing(true);

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    // Append other form data to formData
    formData.append('title', ticket.title);
    formData.append('description', ticket.description);
    formData.append('status', ticket.status.toString());
    formData.append('oldStatus', ticket.oldStatus.toString());
    formData.append('resolution', ticket.resolution);
    formData.append('branchId', ticket.branchId.toString());
    formData.append('assigneeId', ticket.assigneeId.toString());
    formData.append('currentUserId', ticket.currentUserId.toString());
    formData.append('reporterId', ticket.reporterId.toString());
    formData.append('branchMemberAssigneeId', ticket.branchMemberAssigneeId.toString());
    // ... append other fields as needed ...

    axiosInstanceAdd.post(APIURLS.ticket.saveTicket(), formData)
      .then(res => res.data)
      .then((res) => {
        setisConfirmSave(true);
        setticketId(res.ticketNumber);
        // document.getElementById("description").value = '';
        // document.getElementById("title").value = '';
        setTicket(initialTicketState)

        // Reset the file input to its natural state
        if (document.getElementById("attachment")) {
          document.getElementById("attachment").value = '';
        }

        setSelectedFiles([]);
        setisOpenProcessing(false);
      })
      .catch((error) => {
        setisOpenProcessing(false);
      });
  };


  const handleFileChange = (filespick) => {
    setSelectedFiles(filespick);
  };

  const onChange = (e) => {
    setTicket({
      ...ticket,
      [e.target.name]: e.target.value
    });
  }

  const handleFileOpen = (file) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, '_blank');
  };


  const handleDeleteFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    // Assuming you have an input element with the id 'fileInput'
    const fileInput = document.getElementById('attachment');

    if (fileInput) {
      // Create a new FileList excluding the deleted file
      const newFileList = new DataTransfer();
      updatedFiles.forEach((file) => newFileList.items.add(file));

      // Update the input element's files with the new FileList
      fileInput.files = newFileList.files;
    }
  };




  return (
    <div className="App">
      <div className="App-header-app">
        <div className="App-header">
          <Form onSubmit={submitFormAdd} encType="multipart/form-data">
            <div className="text-center">
              <img src={logo} width='277px' height='auto' style={{ marginTop: "20px", marginBottom: "10px" }} />
            </div>
            <div className="text-center submit-text">Submit a Ticket</div>
            <FormGroup className="ticket-form">
              <Label for="title" className="description-text">Title :</Label>
              <Input color="black" className="" type="text" name="title" value={ticket.title} onChange={onChange} id="title" required />
            </FormGroup>
            <FormGroup className="ticket-form">
              <Label for="description" className="description-text">Description :</Label>
              <Input color="black" className="description-input" type="textarea" name="description" value={ticket.description} onChange={onChange} id="description" />
            </FormGroup>

            <FormGroup className="ticket-form">
              <Label for="description" className="description-text">Section :</Label>
              <Forms.Select name={"branchId"} style={{ fontSize: "19px", paddingLeft: "20px", letterSpacing: ".5px" }} onChange={onChange}>
                <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.branchId == 0 ? true : false}>Unassigned</option>
                {branches.map((item) => {
                  return (
                    <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={item.id} selected={ticket.branchId == item.id ? true : false}>{item.name}</option>
                  )
                })}
              </Forms.Select>
            </FormGroup>

            <FormGroup className="ticket-form">
              <Label for="description" className="description-text">Assignee :</Label>
              <Forms.Select name={"branchMemberAssigneeId"} style={{ fontSize: "19px", paddingLeft: "20px", letterSpacing: ".5px" }} onChange={onChange}>
                <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.assigneeId === 0}>Unassigned</option>
                {branchMembers.length > 0 ? (
                  branchMembers.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.memberName}
                    </option>
                  ))
                ) : (
                  <option disabled>No members available</option>
                )}
              </Forms.Select>
            </FormGroup>


            <FormGroup className="ticket-form">

              <Label for="attachment" className="description-text">Attachment :</Label>

              <FileInputComponent selectedFiles={selectedFiles} onFileChange={handleFileChange} />


              {selectedFiles.length > 0 && (
                <div>
                  {selectedFiles.map((file, index) => (
                    <div key={index + 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '18px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <a href="#" onClick={() => handleFileOpen(file)}>
                          {file.name}
                        </a>
                        <button style={{ borderRadius: "100px", backgroundColor: "red", padding: "2px 8px", fontSize: "12px", marginLeft: "10px" }} onClick={(e) => {
                          e.preventDefault();
                          handleDeleteFile(index);
                        }}>x</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}


            </FormGroup>
            <div className="text-center">
              <Button className="custom-btn" type="submit" style={{ backgroundColor: 'blue', marginRight: '10px' }}>
                Submit
              </Button>
              <Button
                className="custom-btn"
                type="button"
                style={{ backgroundColor: 'red', marginLeft: '10px' }}
                onClick={() => window.location.href = window.location.href}
              >
                Cancel
              </Button>
            </div>

          </Form>
          {isOpenProcessing ? <LoadingSpinner /> : <div />}

          {isConfirmSave ? <ModalForm setisConfirmSave={setisConfirmSave} Action={ticketId} /> : <div />}
        </div>
      </div>
    </div>
  )
}
export default TicketEntry;
