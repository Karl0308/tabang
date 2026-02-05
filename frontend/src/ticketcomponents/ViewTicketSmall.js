import { Outlet, Link, useNavigate } from "react-router-dom";
import React, { Component, useState, useEffect } from 'react';
import { Container, Row, Col, Input, Label, Table } from "reactstrap";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CopyButton from "../components/CopyButton";
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { APIURLS } from "../APIURLS";
import LoadingSpinner from "../LoadingSpinner";
import FileInputComponent from "../components/FileInputComponent";

const ViewTicket = ({ openModal, onHide, ticketNum, _ticket, _users, _branches }) => {

    const [isLoading, setIsLoading] = useState(false);

    const [ticketInitialState, setTicketInitialState] = useState({
        id: 0,
        ticketNumber: "",
        calledIn: "",
        title: "",
        description: "",
        status: 0,
        assigneeId: 0,
        reporterId: 0,
        branchId: 0,
        currentUserId: localStorage.getItem("id"),
        file: []
    });
    const ticketCommentInitialState = {
        id: 0,
        comment: "",
        created: "2023-09-08T07:51:31.050Z",
        ticketId: 0,
        userId: localStorage.getItem("id")
    };

    const [ticketComment, setTicketComment] = useState(ticketCommentInitialState);
    const [ticket, setTicket] = useState(ticketInitialState);
    const [ticketOldStatus, setTicketOldStatus] = useState(ticketInitialState);
    const [resolution, setResolution] = useState("");
    const [ShowResolution, setShowResolution] = useState(false);

    const [ticketAttachments, setTicketAttachments] = useState([]);
    const [ticketHistories, setTicketHistories] = useState([]);
    const [ticketComments, setTicketComments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [isCommentView, setisCommentView] = useState(true);
    const [isAddComment, setisAddComment] = useState(false);

    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);


    const [statusColor, setStatusColor] = useState({
        backgroundColor: "",
        color: ""
    });

    useEffect(() => {

        // if (!localStorage.getItem("enhancement")) {
        //     localStorage.clear();
        // }
        // setisOpenProcessing(true);
        if (ticketNum) {
            setTicket(_ticket);
            setStatusColorOfSelectControl(_ticket.status);
            setUsers(_users);
            setBranches(_branches);
            FetchData();
        }
        // FetchUsers();
        // FetchBranches();

    }, [ticketNum]);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const FetchData = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.ticket.getTicketNum() + ticketNum)
            .then(res => res.data)
            .then(
                (result) => {
                    result.file = [];
                    result.oldStatus = result.status;
                    result.currentUserId = localStorage.getItem("id");
                    setTicket(result);
                    setTicketOldStatus(result);
                    FetchTicketHistories(result.id);
                    FetchTicketComments(result.id);
                    FetchTicketAttachments(result.id);
                    setStatusColorOfSelectControl(result.status);

                },
                (error) => {

                }
            );

    }

    const FetchTicketAttachments = (id) => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.ticket.getTicketAttachmentById() + id)
            .then(res => res.data)
            .then(
                (result) => {
                    setTicketAttachments(result);
                    setIsLoading(false);
                },
                (error) => {
                }
            )
    }
    const FetchTicketHistories = (id) => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.ticket.getTicketHistoriesById() + id)
            .then(res => res.data)
            .then(
                (result) => {
                    setTicketHistories(result);
                },
                (error) => {
                }
            )
    }
    const FetchTicketComments = (id) => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.ticket.getTicketCommentsById() + id)
            .then(res => res.data)
            .then(
                (result) => {
                    setTicketComments(result);
                },
                (error) => {
                }
            )
    }

    const UpdateTicket = (e) => {
        if (isLoading) {
            return;
        }
        if (ShowResolution) {
            if (resolution.length < 1) { return; }

            ticket.status = 0;
        }

        e.preventDefault();
        setIsLoading(true);

        ticket.currentUserId = localStorage.getItem("id");
        ticket.resolution = resolution;
        ticket.file = [];

        axiosInstance.post(APIURLS.ticket.updateTicket(), ticket)
            .then(
                (result) => {
                    window.location.reload(false);
                },
                (error) => {
                    setIsLoading(false);
                }
            );
    }


    const addTicketComment = (e) => {
        e.preventDefault();
        if (isLoading) {
            return;
        }
        if (!ticketComment.comment && selectedFiles.length < 1) {
            return;
        }

        const formData = new FormData();

        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });
        // Append other form data to formData
        formData.append('comment', ticketComment.comment);
        formData.append('created', ticketComment.created);
        formData.append('ticketId', ticket.id.toString());
        formData.append('userId', ticketComment.userId.toString());
        // ... append other fields as needed ...


        setIsLoading(true);
        axiosInstance.post(APIURLS.ticket.saveTicketComment(), formData)
            .then(
                (result) => {
                    // result.files = selectedFiles;
                    // setTicketComments([...ticketComments, result.data]);
                    // ticketComment.comment = "";
                    // setIsLoading(false);

                    // Reset the file input to its natural state
                    if (document.getElementById("attachment")) {
                        document.getElementById("attachment").value = '';
                    }

                    result.data.userFullName = localStorage.getItem("fullname");
                    setTicketComments([...ticketComments, result.data]);
                    setSelectedFiles([]);
                    setTicketComment(ticketCommentInitialState);
                    FetchTicketComments(ticket.id);
                    FetchTicketAttachments(ticket.id);
                    setisAddComment(false);
                    setIsLoading(false);
                },
                (error) => {
                    setIsLoading(false);
                }
            );
    }


    const onChange = (e) => {
        if (isLoading) {
            return;
        }

        if (e.target.name === "status") {
            if (parseInt(e.target.value) == 0) {
                setShowResolution(true);
                return;
            }
            setStatusColorOfSelectControl(e.target.value);
        }

        setTicket({
            ...ticket,
            [e.target.name]: e.target.name === "status" ? parseInt(e.target.value) : e.target.value
        });

    };
    const onChangeComment = (e) => {

        setTicketComment({
            ...ticketComment,
            [e.target.name]: e.target.value
        });
    };


    const [error, setError] = useState({
        title: "",
        description: ""
    });

    const hideModal = () => {
        // Perform any necessary cleanup or additional actions here
        onHide();
        setAllStateToInitial();
    };
    const setAllStateToInitial = () => {
        setTicket(ticketInitialState);
        setTicketAttachments([]);
        setTicketComments([]);
        setisAddComment(false);
        setShowResolution(false);
        // setStatusColor("");
    };
    const setStatusColorOfSelectControl = (stat) => {

        //   Done = 0, Open = 1, On_Hold = 2, In_Progress = 3

        if (parseInt(stat) == 0) {
            setStatusColor({
                backgroundColor: "#D1FFD1",
                color: "#10B981"
            });
        }
        if (parseInt(stat) == 1) {
            setStatusColor({
                backgroundColor: "#FFF9A4",
                color: "#F59E0B"
            });
        }
        if (parseInt(stat) == 2) {
            setStatusColor({
                backgroundColor: "#FFD7D7",
                color: "#FF0000"
            });
        }
        if (parseInt(stat) == 3) {
            setStatusColor({
                backgroundColor: "#C9EAFF",
                color: "#3B82F6"
            });
        }
    };

    const handleFileOpen = (file) => {
        if (file.contentType.startsWith('image/')) {

            const modalContainer = document.createElement('div');
            modalContainer.style.position = 'fixed';
            modalContainer.style.top = '0';
            modalContainer.style.left = '0';
            modalContainer.style.width = '100%';
            modalContainer.style.height = '100%';
            modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modalContainer.style.display = 'flex';
            modalContainer.style.alignItems = 'center';
            modalContainer.style.justifyContent = 'center';
            modalContainer.style.zIndex = '9999';

            const modalImage = new Image();
            modalImage.src = `data:${file.contentType};base64,${file.content}`;
            modalImage.style.maxWidth = '90%';
            modalImage.style.maxHeight = '90%';

            modalContainer.appendChild(modalImage);

            const closeButton = document.createElement('button');
            closeButton.innerText = 'Close';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });

            modalContainer.appendChild(closeButton);

            document.body.appendChild(modalContainer);

        } else if (file.contentType.startsWith('video/')) {
            // Display video
            const modalContainer = document.createElement('div');
            modalContainer.style.position = 'fixed';
            modalContainer.style.top = '0';
            modalContainer.style.left = '0';
            modalContainer.style.width = '100%';
            modalContainer.style.height = '100%';
            modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modalContainer.style.display = 'flex';
            modalContainer.style.alignItems = 'center';
            modalContainer.style.justifyContent = 'center';
            modalContainer.style.zIndex = '9999';

            if (file.contentType.startsWith('image/')) {
                // Display image
                const modalImage = new Image();
                modalImage.src = `data:${file.contentType};base64,${file.content}`;
                modalImage.style.maxWidth = '90%';
                modalImage.style.maxHeight = '90%';
                modalContainer.appendChild(modalImage);
            } else if (file.contentType.startsWith('video/')) {
                // Display video
                const modalVideo = document.createElement('video');
                modalVideo.src = `data:${file.contentType};base64,${file.content}`;
                modalVideo.style.maxWidth = '90%';
                modalVideo.style.maxHeight = '90%';
                modalVideo.controls = true; // Enable video controls
                modalContainer.appendChild(modalVideo);
            }

            const closeButton = document.createElement('button');
            closeButton.innerText = 'Close';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });

            modalContainer.appendChild(closeButton);

            document.body.appendChild(modalContainer);
        } else {
            // Provide a download link for other types of files
            const blob = new Blob([Uint8Array.from(atob(file.content), c => c.charCodeAt(0))], { type: file.contentType });
            const fileUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = file.fileName;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(fileUrl);
        }
    };
    const handleFileChange = (filespick) => {
        setSelectedFiles(filespick);
    };

    const handleFileOpenComment = (file) => {
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


    const ChangeCommentHistoryView = (e) => {
        setisCommentView(e.target.dataset.name === "btnComment" ? true : false);
    };

    const ChangeisAddComment = (e) => {
        setisAddComment(!isAddComment);
    };
    const truncateFilename = (filename, maxLength) => {
        if (filename.length > maxLength) {
            return filename.substring(0, maxLength) + '...';
        }
        return filename;
    };

    return (
        <>
            {/* <Modal show={true} onHide={hideModal}> */}
            <Modal show={openModal} onHide={hideModal}>
                <div style={{ position: "absolute", left: 380, display: isLoading ? "inline" : "none" }} > <LoadingSpinner /></div>

                <Modal.Header style={{ margin: "0px", paddingBottom: "0px", border: "none", display: 'flex', flexDirection: 'column', alignItems: "flex-start" }}>
                    <Modal.Title style={{ fontSize: "3vw", letterSpacing: "0.36px", fontWeight: "500", display: "flex", alignItems: "center", marginLeft: "6px" }}>
                        Ticket ID: <div style={{ color: "#2C4AE6", marginLeft: "4px" }}>{ticketNum}</div>
                    </Modal.Title>

                    <div style={{ marginTop: "-10px", fontSize: "2.5vw", marginLeft: "8px" }}>
                        {window.location.origin + "/ticketview/" + ticketNum}
                        <CopyButton text={window.location.origin + "/ticketview/" + ticketNum} />
                    </div>
                </Modal.Header>

                <Button
                    style={{
                        position: "absolute",
                        top: "0px",
                        right: "10px",
                        fontWeight: "bold",
                        fontSize: "8vw",
                        color: "#FE1414",
                        border: "none",
                        backgroundColor: "transparent",
                        transform: "rotate(45deg)"
                    }}
                    onClick={hideModal}
                    active
                >
                    +
                </Button>

                <div style={{ width: "100%", display: ShowResolution ? "inline" : "none" }}>
                    <div style={{ padding: "10px" }} >
                        <div style={{ marginLeft: "6px", fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Resolution:</div>
                        <div>
                            <Input
                                style={{ height: '200px', resize: "none", fontSize: "2.5vw", color: "#223E58", fontWeight: "100", marginBottom: "12px" }}
                                type="textarea"
                                name="resolution"
                                id="resolution"
                                onChange={e => setResolution(e.target.value)}
                                value={resolution === null ? "" : resolution}
                                required
                            />
                        </div>
                        <Button onClick={UpdateTicket} style={{ fontWeight: 'bold', fontSize: '3vw', marginRight: "12px" }}>
                            Save
                        </Button>
                        <Button variant="outline-danger" onClick={e => setShowResolution(false)} style={{ fontWeight: 'bold', fontSize: '3vw' }} active>
                            Cancel
                        </Button>
                    </div>
                </div>

                <Modal.Body style={{ display: ShowResolution ? "none" : "flex", padding: "0px 10px 0px 10px" }}>
                    <div style={{ flex: '60%', border: '1px solid #DBD3D3', marginRight: "2px" }}>

                        <div style={{ padding: "6px" }} >
                            <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Title:</div>
                            <div>
                                <Input
                                    style={{ resize: "none", fontSize: "2.5vw", color: "#223E58", fontWeight: "100" }}
                                    type="text"
                                    name="title"
                                    id="title"
                                    onChange={onChange}
                                    value={ticket.title === null ? "" : ticket.title}
                                    required
                                />
                                <label style={{ color: "red", display: error.title.length > 0 ? "inline" : "none" }}>Enter title.</label>
                            </div>
                        </div>


                        <div style={{ padding: "6px" }} >
                            <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Description:</div>
                            <div>
                                <Input
                                    style={{ height: '100px', resize: "none", fontSize: "2.5vw", color: "#223E58", fontWeight: "100" }}
                                    type="textarea"
                                    name="description"
                                    id="description"
                                    onChange={onChange}
                                    value={ticket.description === null ? "" : ticket.description}
                                    required
                                />
                                <label style={{ color: "red", display: error.description.length > 0 ? "inline" : "none" }}>Enter description.</label>
                            </div>
                        </div>


                        <div style={{ padding: "6px", fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Attachments: {ticketAttachments.length}</div>
                        <div style={{ padding: "6px", height: "80px", overflowY: "auto" }}>
                            <div style={{ marginLeft: "10px" }}>
                                {ticketAttachments.length > 0 ? (
                                    <div>
                                        {ticketAttachments.map((file, index) => (
                                            <div key={index + 1} style={{ textAlign: 'left', fontSize: '2.5vw', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
                                                <a href="#" onClick={() => handleFileOpen(file)}>
                                                    {truncateFilename(file.fileName, 30)}
                                                    {/* {file.fileName} */}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    isLoading ? (
                                        <div style={{ textAlign: 'left', fontSize: '2.5vw', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>Fetching Attachments....</div>
                                    ) : (
                                        <div style={{ textAlign: 'left', fontSize: '2.5vw', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>No attachments</div>
                                    )
                                )
                                }
                            </div>
                        </div>




                        <div style={{ padding: "6px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "8px" }}>
                            {/* <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}> */}
                            <div>
                                <Button
                                    data-name="btnComment"
                                    style={{
                                        fontSize: "2.5vw",
                                        color: isCommentView ? "#223E58" : "#8F8F8F",
                                        fontWeight: "500",
                                        border: "none",
                                        backgroundColor: "transparent",
                                        padding: "4px"
                                    }}
                                    onClick={ChangeCommentHistoryView}
                                >
                                    Comments
                                </Button>

                                <Button
                                    data-name="btnHistory"
                                    style={{
                                        fontSize: "2.5vw",
                                        color: isCommentView ? "#8F8F8F" : "#223E58",
                                        fontWeight: "500",
                                        border: "none",
                                        backgroundColor: "transparent",
                                        padding: "4px"
                                    }}
                                    onClick={ChangeCommentHistoryView}
                                >
                                    History
                                </Button>
                            </div>

                            <Button
                                data-name="btnAddComment"
                                style={{
                                    fontSize: "2.5vw",
                                    fontWeight: "500",
                                    border: "none",
                                    display: isCommentView ? "inline" : "none",
                                    marginRight: "8px",
                                    padding: "4px"
                                }}
                                onClick={ChangeisAddComment}
                            >
                                Add Comment
                            </Button>
                        </div>



                        <div style={{ margin: "6px", height: "270px", border: '1px solid #DBD3D3', display: isCommentView ? "block" : "none" }}>
                            <div style={{ padding: "10px", height: "260px", backgroundColor: "#DBD3D3", display: isAddComment ? "block" : "none" }}>
                                <div>
                                    <Input
                                        style={{ height: '30px', resize: "none", fontSize: "2.5vw", color: "#223E58", fontWeight: "100" }}
                                        type="textarea"
                                        name="comment"
                                        id="comment"
                                        onChange={onChangeComment}
                                        value={ticketComment.comment === null ? "" : ticketComment.comment}
                                        required
                                    />
                                </div>


                                <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #DBD3D3', paddingTop: '10px', paddingBottom: '10px' }}>
                                    <div style={{ flex: '1', textAlign: 'left' }}>
                                        <FileInputComponent selectedFiles={selectedFiles} onFileChange={handleFileChange} />
                                    </div>
                                </div>
                                <div style={{ flex: '1', textAlign: 'right' }}>
                                    <Button style={{ padding: "4px", fontSize: "2.5vw", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "6px" }} variant="outline-primary" onClick={addTicketComment}>Submit</Button>
                                    <Button data-name="btnCancelComment" style={{ padding: "4px", fontSize: "2.5vw", background: "#dc3545", color: "white", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={ChangeisAddComment}>Cancel</Button>

                                </div>

                                <div style={{ width: '100%', display: 'flex', height: '130px', border: '1px solid #DBD3D3', overflowY: "auto", justifyContent: 'space-between', marginTop: '5px' }}>
                                    {selectedFiles.length > 0 && (
                                        <div>
                                            {selectedFiles.map((file, index) => (
                                                <div key={index + 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '2.5vw' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <a href="#" onClick={() => handleFileOpenComment(file)}>
                                                            {file.name}
                                                        </a>
                                                        <button style={{ borderRadius: "100px", backgroundColor: "red", padding: "2px 8px", fontSize: "2.5vw", marginLeft: "10px" }} onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteFile(index);
                                                        }}>x</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>

                            </div>



                            <div style={{ padding: "6px", width: "100%", height: "250px", overflowY: "auto", display: isAddComment ? "none" : "block" }}>
                                <Table responsive>
                                    <tbody>
                                        {ticketComments.map((item) => {
                                            return (
                                                <div style={{ borderBottom: "solid 1px black", width: '100%' }}>
                                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: "2.5vw" }}>
                                                        <div style={{ fontWeight: "bold" }}>{item.userFullName}</div>
                                                        <div style={{ color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>

                                                    </div>
                                                    <div style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word', fontSize: "2.5vw" }}>{item.comment}</div>


                                                    {item.ticketAttachments.length > 0 ? (
                                                        <div>
                                                            {item.ticketAttachments.map((file, index) => (
                                                                <div key={index + 1} style={{ textAlign: 'left', fontSize: '2.5vw' }}>
                                                                    <a href="#" onClick={() => handleFileOpen(file)}>
                                                                        {file.fileName}
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        isLoading ? (
                                                            <div>Fetching Attachments....</div>
                                                        ) : (
                                                            <div></div>
                                                        )
                                                    )
                                                    }
                                                </div>
                                            )
                                        })}

                                    </tbody>

                                </Table>
                            </div>

                        </div>

                        <div style={{ padding: "6px", height: "270px", overflowY: "auto", border: '1px solid #DBD3D3', display: isCommentView ? "none" : "block" }} >

                            <Table responsive>
                                <tbody>
                                    {ticketHistories.map((item) => {
                                        return (

                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DBD3D3', padding: '1px', backgroundColor: "transparent" }}>
                                                <div style={{ flex: '1', textAlign: 'left' }}>
                                                    <div style={{ marginBottom: '6px', fontSize: '3vw', fontWeight: "bold" }}>{item.userFullName}</div>
                                                    <div style={{ fontSize: '3vw' }}>{item.fromStatusText == item.toStatusText ? "Initial Status: " + item.toStatusText.toUpperCase() : "To: " + item.toStatusText.toUpperCase()}</div>
                                                </div>
                                                <div style={{ flex: '1', textAlign: 'right', fontSize: '3vw' }}>
                                                    <div style={{ marginBottom: '6px', fontSize: '3vw', color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                                    <div style={{ fontSize: '3vw' }}>{item.fromStatusText == item.toStatusText ? "" : "From: " + item.fromStatusText.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </tbody>

                            </Table>
                        </div>

                    </div>

                    {/* Details Column */}
                    <div style={{ flex: '40%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '40px' }}>
                            <div style={{ backgroundColor: statusColor.backgroundColor, borderRadius: "8px" }}>
                                <Form.Select className="text-center" value={ticket.status} name={"status"} style={{paddingLeft:"0px",paddingRight:"0px",fontSize:"3.5vw", textAlign:"center", backgroundImage:"none", border: "solid 1px" + statusColor.color, color: statusColor.color, fontWeight: "bold", letterSpacing: ".5px", backgroundColor: "transparent" }} onChange={onChange} disabled={localStorage.getItem("role") == 2 ? true : false}>
                                    <option style={{ paddingLeft:"0px", paddingRight:"0px", textAlign:"center", color: "#F5A314", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={1} selected={ticket.status == 1 ? true : false}>Open</option>
                                    <option style={{ paddingLeft:"0px", paddingRight:"0px", textAlign:"center", color: "#FF0000", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={2} selected={ticket.status == 2 ? true : false}>On Hold</option>
                                    <option style={{ paddingLeft:"0px", paddingRight:"0px", textAlign:"center", color: "#67A8E3", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={3} selected={ticket.status == 3 ? true : false}>In Progress</option>
                                    <option style={{ paddingLeft:"0px", paddingRight:"0px", textAlign:"center", color: "#10B981", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.status == 0 ? true : false}>Done</option>
                                </Form.Select>
                            </div>
                        </div>
                        <div style={{ flex: '1', border: '1px solid #DBD3D3', position: 'relative' }}>
                            <div style={{ padding: "10px", fontSize: "3vw", color: "#223E58", fontWeight: "500", borderBottom: '1px solid #DBD3D3' }}>Details</div>

                            <div style={{ padding: "10px" }}>
                                <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Called In:</div>
                                <div style={{ fontSize: "2.5VW", color: "#223E58", fontWeight: "100" }}>{ticket.calledInText}</div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Branch:</div>
                                <Form.Select name={"branchId"} style={{paddingLeft:"0px",paddingRight:"0px",backgroundImage:"none", textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px" }} onChange={onChange}>
                                    <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.branchId == 0 ? true : false}>Unassigned</option>
                                    {branches.map((item) => (
                                        <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={item.id} selected={ticket.branchId == item.id ? true : false}>{item.name}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Assignee:</div>
                                <Form.Select name={"assigneeId"} style={{ paddingLeft:"0px",paddingRight:"0px",backgroundImage:"none",textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px" }} onChange={onChange} disabled={localStorage.getItem("role") == 0 ? false : true}>
                                    <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.assigneeId == null ? true : false}>Unassigned</option>
                                    {users.filter(x => x.role != 2).map((item) => (
                                        <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.assigneeId == item.id ? true : false}>{item.fullName}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Reporter:</div>
                                <Form.Select name={"status"} style={{ paddingLeft:"0px",paddingRight:"0px",backgroundImage:"none",textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px"}} disabled={true}>
                                    <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.reporterId == null ? true : false}>Unassigned</option>
                                    {users.filter(x => x.role == 2 || x.role == 0).map((item) => (
                                        <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.reporterId == item.id ? true : false}>{item.fullName}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            <Button onClick={UpdateTicket} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '2.5vw', width: "90%" }}>
                                Save Changes
                            </Button>
                        </div>

                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
};

export default ViewTicket;