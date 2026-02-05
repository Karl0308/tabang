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
import StarRating from "../components/StarRating";
import MentionInput from "../components/MentionInput";
import QRCode from 'react-qr-code';
import AsyncSelect from 'react-select/async';
import { faTemperatureUp, faTruck } from "@fortawesome/free-solid-svg-icons";
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import CommentsTable from "../components/CommentsTable";
import AltchaCaptcha from "../AltchaCaptcha";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const axiosObj = axios.create({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    }
});

const ViewTicket = ({ openModal, onHide, _ticketNum, _ticket, _users, _branches, _ticketChanges }) => {

    const [isLoading, setIsLoading] = useState(false);

    const [ticketInitialState, setTicketInitialState] = useState({
        id: 0,
        ticketNumber: "",
        calledIn: "",
        dueDate: "",
        title: "",
        description: "",
        status: 0,
        priority: 0,
        assigneeId: 0,
        branchMemberAssigneeId: 0,
        reporterId: 0,
        branchId: 0,
        currentUserId: localStorage.getItem("id"),
        starRate: 0,
        file: [],
        linkTickets: ""
    });
    const ticketCommentInitialState = {
        id: 0,
        comment: "",
        created: "2023-09-08T07:51:31.050Z",
        ticketId: 0,
        userId: localStorage.getItem("id")
    };
    const ticketLinkInitialState = {
        ticketId: 0,
        linkTicketNumber: ""
    };
    const overtimeInitialState = {
        id: 0,
        userFullName: localStorage.getItem('fullname'),
        userId: localStorage.getItem('id'),
        dateApplied: new Date(),
        dateFrom: "",
        dateTo: "",
        days: "",
        time: "",
        reason: "",
        ticketId: 0,
        ticketNumber: "",
        supervisorApproval: 0,
        headApproval: 0
    };

    const [ticketComment, setTicketComment] = useState(ticketCommentInitialState);
    const [ticketLink, setticketLink] = useState(ticketLinkInitialState);
    const [ticketLinkError, setticketLinkError] = useState("");
    const [ticket, setTicket] = useState(ticketInitialState);
    const [overtime, setOvertime] = useState(overtimeInitialState);
    const [overtimeOptionDay, setOvertimeOptionDay] = useState("day");
    const [ticketOldStatus, setTicketOldStatus] = useState(ticketInitialState);
    const [resolution, setResolution] = useState("");
    const [ShowResolution, setShowResolution] = useState(false);

    const [ticketAttachments, setTicketAttachments] = useState([]);
    const [ticketHistories, setTicketHistories] = useState([]);
    const [ticketComments, setTicketComments] = useState([]);
    const [ticketOvertimes, setTicketOvertimes] = useState([]);
    const [ticketCatchUps, setTicketCatchUps] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [isCommentView, setisCommentView] = useState(true);
    const [isHistoryView, setisHistoryView] = useState(false);
    const [isRelatedIssuesView, setisRelatedIssuesView] = useState(false);
    const [isApplyOvertimeView, setisApplyOvertimeView] = useState(false);
    const [isCatchUpView, setisCatchUpView] = useState(false);



    const [isAddComment, setisAddComment] = useState(false);
    const [isApplyOvertime, setisApplyOvertime] = useState(false);
    const [isAddTicketLink, setisAddTicketLink] = useState(false);

    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [branchMembers, setBranchMembers] = useState([]);

    const [appSetting, setAppSetting] = useState(null);


    const [statusColor, setStatusColor] = useState({
        backgroundColor: "",
        color: ""
    });

    const [ticketAssets, setTicketAssets] = useState([]);

    const handleAssetOnChange = (selectedOption) => {
        setTicketAssets(selectedOption);
        saveTicketProp("ticketAssets", JSON.stringify(selectedOption));
    };

    const filterAssetsOptions = (inputValue, callback) => {
        const searchTermParam = inputValue != null ? inputValue : "";
        axiosObj.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
        axiosObj.get(`${APIURLS.ticket.ticketBase()}GetAssets?searchTerm=${searchTermParam}`)
            .then((response) => {
                const options = []
                response.data.forEach((asset) => {
                    options.push({
                        label: asset.code,
                        value: asset.id
                    })
                })
                callback(options);
            })
    }

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
    };

    useEffect(() => {
        const selectedBranch = branches.find(branch => branch.id === Number(ticket.branchId));

        if (selectedBranch) {
            setBranchMembers(selectedBranch.branchMember ?? []);
        } else {
            setBranchMembers([]);
        }
    }, [ticket, branches]);

    useEffect(() => {

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {

        // if (!localStorage.getItem("enhancement")) {
        //     localStorage.clear();
        // }
        // setisOpenProcessing(true);
        if (_ticketNum) {
            setTicket(_ticket);
            setStatusColorOfSelectControl(_ticket.status);
            setUsers(_users);
            setBranches(_branches);
            FetchData();
            FetchAppSettings();

        }
        // FetchUsers();
        // FetchBranches();

    }, [_ticketNum]);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Access-Control-Allow-Origin': '*'
        }
    });
    const FetchAppSettings = () => {

        setIsLoading(true);
        axiosInstance.get(APIURLS.appsetting.getAppSettings())
            .then(res => res.data)
            .then(
                (result) => {
                    setIsLoading(false);
                    setAppSetting(result);
                },
                (error) => {
                    setIsLoading(false);
                }
            )
    }

    const FetchData = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.ticket.getTicketNum() + _ticketNum)
            .then(res => res.data)
            .then(
                (result) => {
                    result.file = [];
                    result.oldStatus = result.status;
                    result.oldTitle = result.title;
                    result.oldDescription = result.description;
                    result.currentUserId = localStorage.getItem("id");
                    setTicket(result);
                    setTicketOldStatus(result);
                    setTicketAttachments(result.ticketAttachments);
                    setTicketComments(result.ticketComments);
                    setTicketOvertimes(result.overtimeDTO);
                    setTicketHistories(result.ticketHistories);
                    setTicketCatchUps(result.ticketCatchups);
                    // FetchTicketHistories(result.id);
                    // FetchTicketComments(result.id);
                    // FetchTicketAttachments(result.id);
                    setStatusColorOfSelectControl(result.status);
                    setTicketAssets(result.ticketAssets.map(q => ({ value: q.id, label: q.asset.code })));
                    setIsLoading(false);

                },
                (error) => {

                }
            );

    }

    const getUser = (id) => {
        const user = users.find(x => x.id == id);
        if (user == undefined) { return "Unassigned"; }
        else { return user.fullName; }

    };
    // const FetchTicketAttachments = (id) => {
    //     setIsLoading(true);
    //     axiosInstance.get(APIURLS.ticket.getTicketAttachmentById + id)
    //         .then(res => res.data)
    //         .then(
    //             (result) => {
    //                 setTicketAttachments(result);
    //                 setIsLoading(false);
    //             },
    //             (error) => {
    //                 console.log(error);
    //             }
    //         )
    // }
    // const FetchTicketHistories = (id) => {
    //     setIsLoading(true);
    //     axiosInstance.get(APIURLS.ticket.getTicketHistoriesById + id)
    //         .then(res => res.data)
    //         .then(
    //             (result) => {
    //                 setTicketHistories(result);
    //             },
    //             (error) => {
    //                 console.log(error);
    //             }
    //         )
    // }
    // const FetchTicketComments = (id) => {
    //     setIsLoading(true);
    //     axiosInstance.get(APIURLS.ticket.getTicketCommentsById + id)
    //         .then(res => res.data)
    //         .then(
    //             (result) => {
    //                 setTicketComments(result);
    //             },
    //             (error) => {
    //                 console.log(error);
    //             }
    //         )
    // }

    const saveTicketProp = (name, value) => {

        setIsLoading(true);
        axiosInstance.post(APIURLS.ticket.saveTicketProp() + "userId= " + ticket.currentUserId + "&ticketId= " + ticket.id + "&name=" + name + "&value=" + encodeURIComponent(value))
            .then(
                (result) => {
                    setIsLoading(false);
                },
                (error) => {
                    setIsLoading(false);
                }
            );
    };

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
        ticket.ticketAssets = ticketAssets;
        ticket.file = [];

        axiosInstance.post(APIURLS.ticket.updateTicket(), ticket)
            .then(
                (result) => {
                    // window.location.reload(false);
                    hideModal();
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

                    // FetchTicketComments(ticket.id);
                    // FetchTicketAttachments(ticket.id);

                    setisAddComment(false);
                    setIsLoading(false);
                },
                (error) => {
                    setIsLoading(false);
                }
            );
    }

    const addTicketLink = (e) => {
        e.preventDefault();
        if (isLoading) {
            return;
        }
        if (!ticketLink.linkTicketNumber) {
            return;
        }

        setIsLoading(true);
        setticketLinkError("");
        ticketLink.ticketId = ticket.id;
        axiosInstance.post(APIURLS.ticket.saveTicketLink(), ticketLink)
            .then(
                (result) => {
                    ticket.linkTickets = result.data;

                    setticketLink(ticketLinkInitialState);
                    setisAddTicketLink(false);
                    setIsLoading(false);
                    setticketLinkError("");
                },
                (error) => {
                    setticketLinkError(error.response.data);
                    setIsLoading(false);
                }
            );
    }

    const addOvertime = (e) => {
        e.preventDefault();
        if (isLoading) {
            return;
        }
        if (overtime.dateFrom === "" || overtime.dateTo === "" || overtime.reason === "") {
            return;
        }

        setIsLoading(true);
        overtime.ticketId = ticket.id;
        axiosInstance.post(APIURLS.overtime.saveOvertime(), overtime)
            .then(
                (result) => {

                    setOvertime(overtimeInitialState);
                    setisApplyOvertime(false);
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
            [e.target.name]: e.target.name === "status" || e.target.name === "priority" ? parseInt(e.target.value) : e.target.value
        });
        if (e.target.name !== "description" && e.target.name !== "title") { saveTicketProp(e.target.name, e.target.value); }

    };


    const onChangeDueDate = (e) => {
        // alert(ticket.dueDate);
        if (isLoading) {
            return;
        }
        setTicket({
            ...ticket,
            dueDate: e
        });
        saveTicketProp("dueDate", e);

    };

    const handleLeave = (e) => {
        if (e.target.name == "title") {
            if (ticket.oldTitle !== ticket.title) {
                setTicket({
                    ...ticket,
                    oldTitle: e.target.value
                });
                saveTicketProp(e.target.name, e.target.value);
            }
        }
        else {
            if (ticket.oldDescription !== ticket.description) {
                setTicket({
                    ...ticket,
                    oldDescription: e.target.value
                });
                saveTicketProp(e.target.name, e.target.value);
            }
        }
    };

    const onChangeComment = (e) => {

        setTicketComment({
            ...ticketComment,
            [e.target.name]: e.target.value
        });
    };
    const onChangeTicketLink = (e) => {

        setticketLink({
            ...ticketLink,
            [e.target.name]: e.target.value
        });
    };

    const handleChangeMentionComment = (value) => {
        // console.log("Input value:", value);
        setTicketComment({
            ...ticketComment,
            comment: value
        });

        // console.log(ticketComment.comment);
    };


    const [error, setError] = useState({
        title: "",
        description: ""
    });

    const hideModal = () => {
        if (isLoading) {
            return;
        }
        _ticketChanges(ticket);
        onHide();
        setAllStateToInitial();
    };
    const setAllStateToInitial = () => {
        setTicket(ticketInitialState);
        setTicketAttachments([]);
        setTicketComments([]);
        setisAddComment(false);
        setShowResolution(false);

        setTicketComment(ticketCommentInitialState);
        setResolution("");
        setSelectedFiles([]);

        setisCommentView(true);
        setisHistoryView(false);
        setisRelatedIssuesView(false);
        setisApplyOvertimeView(false);
        setisApplyOvertime(false);
        setOvertime(overtimeInitialState);

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
        if (!file) {
            return;
        }

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

        // Create a spinner element
        const spinner = document.createElement('div');
        spinner.style.border = '4px solid rgba(255, 255, 255, 0.3)';
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = '4px solid #3498db';
        spinner.style.width = '100px';
        spinner.style.height = '100px';
        spinner.style.animation = 'spin 1s linear infinite';
        modalContainer.appendChild(spinner);

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

        // Fetch the file data
        axiosInstance.get(APIURLS.ticket.getAttachmentById() + file.id)
            .then(res => res.data)
            .then(
                (fileData) => {
                    // Remove the loading indicator
                    modalContainer.removeChild(spinner);

                    if (file.contentType.startsWith('image/')) {
                        // Display image
                        const modalImage = new Image();
                        modalImage.src = `data:${fileData.contentType};base64,${fileData.content}`;
                        modalImage.style.maxWidth = '90%';
                        modalImage.style.maxHeight = '90%';

                        modalContainer.appendChild(modalImage);
                    } else if (file.contentType.startsWith('video/')) {
                        // Display video
                        const modalVideo = document.createElement('video');
                        modalVideo.src = `data:${fileData.contentType};base64,${fileData.content}`;
                        modalVideo.style.maxWidth = '90%';
                        modalVideo.style.maxHeight = '90%';
                        modalVideo.controls = true; // Enable video controls

                        modalContainer.appendChild(modalVideo);
                    } else {
                        // Provide a download link for other types of files
                        const blob = new Blob([Uint8Array.from(atob(fileData.content), c => c.charCodeAt(0))], { type: fileData.contentType });
                        const fileUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = fileUrl;
                        a.download = file.fileName;
                        a.target = '_blank';
                        modalContainer.appendChild(a);
                        a.click();
                        modalContainer.removeChild(a);
                        URL.revokeObjectURL(fileUrl);
                    }
                },
                (error) => {
                    // Handle error - you might want to display an error message in the modal
                }
            );
    };


    // const handleFileOpen = () => {

    //     if (file.contentType.startsWith('image/')) {

    //         const modalContainer = document.createElement('div');
    //         modalContainer.style.position = 'fixed';
    //         modalContainer.style.top = '0';
    //         modalContainer.style.left = '0';
    //         modalContainer.style.width = '100%';
    //         modalContainer.style.height = '100%';
    //         modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    //         modalContainer.style.display = 'flex';
    //         modalContainer.style.alignItems = 'center';
    //         modalContainer.style.justifyContent = 'center';
    //         modalContainer.style.zIndex = '9999';

    //         const modalImage = new Image();
    //         modalImage.src = `data:${file.contentType};base64,${file.content}`;
    //         modalImage.style.maxWidth = '90%';
    //         modalImage.style.maxHeight = '90%';

    //         modalContainer.appendChild(modalImage);

    //         const closeButton = document.createElement('button');
    //         closeButton.innerText = 'Close';
    //         closeButton.style.position = 'absolute';
    //         closeButton.style.top = '10px';
    //         closeButton.style.right = '10px';
    //         closeButton.style.background = 'none';
    //         closeButton.style.border = 'none';
    //         closeButton.style.cursor = 'pointer';
    //         closeButton.addEventListener('click', () => {
    //             document.body.removeChild(modalContainer);
    //         });

    //         modalContainer.appendChild(closeButton);

    //         document.body.appendChild(modalContainer);

    //     } else if (file.contentType.startsWith('video/')) {
    //         // Display video
    //         const modalContainer = document.createElement('div');
    //         modalContainer.style.position = 'fixed';
    //         modalContainer.style.top = '0';
    //         modalContainer.style.left = '0';
    //         modalContainer.style.width = '100%';
    //         modalContainer.style.height = '100%';
    //         modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    //         modalContainer.style.display = 'flex';
    //         modalContainer.style.alignItems = 'center';
    //         modalContainer.style.justifyContent = 'center';
    //         modalContainer.style.zIndex = '9999';

    //         if (file.contentType.startsWith('image/')) {
    //             // Display image
    //             const modalImage = new Image();
    //             modalImage.src = `data:${file.contentType};base64,${file.content}`;
    //             modalImage.style.maxWidth = '90%';
    //             modalImage.style.maxHeight = '90%';
    //             modalContainer.appendChild(modalImage);
    //         } else if (file.contentType.startsWith('video/')) {
    //             // Display video
    //             const modalVideo = document.createElement('video');
    //             modalVideo.src = `data:${file.contentType};base64,${file.content}`;
    //             modalVideo.style.maxWidth = '90%';
    //             modalVideo.style.maxHeight = '90%';
    //             modalVideo.controls = true; // Enable video controls
    //             modalContainer.appendChild(modalVideo);
    //         }

    //         const closeButton = document.createElement('button');
    //         closeButton.innerText = 'Close';
    //         closeButton.style.position = 'absolute';
    //         closeButton.style.top = '10px';
    //         closeButton.style.right = '10px';
    //         closeButton.style.background = 'none';
    //         closeButton.style.border = 'none';
    //         closeButton.style.cursor = 'pointer';
    //         closeButton.addEventListener('click', () => {
    //             document.body.removeChild(modalContainer);
    //         });

    //         modalContainer.appendChild(closeButton);

    //         document.body.appendChild(modalContainer);
    //     } else {
    //         // Provide a download link for other types of files
    //         const blob = new Blob([Uint8Array.from(atob(file.content), c => c.charCodeAt(0))], { type: file.contentType });
    //         const fileUrl = URL.createObjectURL(blob);
    //         const a = document.createElement('a');
    //         a.href = fileUrl;
    //         a.download = file.fileName;
    //         a.target = '_blank';
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);
    //         URL.revokeObjectURL(fileUrl);
    //     }
    // };

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

        setisCommentView(false);
        setisHistoryView(false);
        setisRelatedIssuesView(false);
        setisApplyOvertimeView(false);
        setisCatchUpView(false);
        switch (e.target.dataset.name) {
            case "btnComment":
                setisCommentView(true);
                break;
            case "btnHistory":
                setisHistoryView(true);
                break;
            case "btnApplyOvertime":
                setisApplyOvertimeView(true);
                break;
            case "btnCatchUp":
                setisCatchUpView(true);
                break;
            default:
                setisRelatedIssuesView(true);
                break;
        }
    };

    const ChangeisAddComment = (e) => {
        setisAddComment(!isAddComment);
    };
    const ChangeisAddTicketLink = (e) => {
        setisAddTicketLink(!isAddTicketLink);
        setticketLinkError("");
    };

    const ChangeisAddAddApplyOvertime = (e) => {

        setOvertime(overtimeInitialState);
        setisApplyOvertime(!isApplyOvertime);
    };

    const truncateFilename = (filename, maxLength) => {
        if (filename.length > maxLength) {
            return filename.substring(0, maxLength) + '...';
        }
        return filename;
    };


    const Statuses = () => {
        const role = parseInt(localStorage.getItem("role"));

        return (
            <>
                {role === 0 ? (
                    isSmallScreen ? (
                        <>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#F5A314", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={1} selected={ticket.status == 1 ? true : false}>Open</option>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#FF0000", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={2} selected={ticket.status == 2 ? true : false}>On Hold</option>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#67A8E3", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={3} selected={ticket.status == 3 ? true : false}>In Progress</option>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#10B981", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.status == 0 ? true : false}>Done</option>

                        </>
                    ) : (
                        <>
                            <option style={{ color: "#F5A314", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={1} selected={ticket.status == 1 ? true : false}>Open</option>
                            <option style={{ color: "#FF0000", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={2} selected={ticket.status == 2 ? true : false}>On Hold</option>
                            <option style={{ color: "#67A8E3", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={3} selected={ticket.status == 3 ? true : false}>In Progress</option>
                            <option style={{ color: "#10B981", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.status == 0 ? true : false}>Done</option>
                        </>
                    )

                ) : (
                    isSmallScreen ? (
                        <>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#F5A314", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={1} selected={ticket.status == 1 ? true : false}>Open</option>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#FF0000", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={2} selected={ticket.status == 2 ? true : false}>On Hold</option>
                            <option style={{ paddingLeft: "0px", paddingRight: "0px", textAlign: "center", color: "#67A8E3", fontSize: "3vw", letterSpacing: ".5px", paddingBottom: "10px" }} value={3} selected={ticket.status == 3 ? true : false}>In Progress</option>

                        </>
                    ) : (
                        <>
                            <option style={{ color: "#F5A314", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={1} selected={ticket.status == 1 ? true : false}>Open</option>
                            <option style={{ color: "#FF0000", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={2} selected={ticket.status == 2 ? true : false}>On Hold</option>
                            <option style={{ color: "#67A8E3", fontSize: "19px", letterSpacing: ".5px", paddingBottom: "10px" }} value={3} selected={ticket.status == 3 ? true : false}>In Progress</option>
                        </>
                    )

                )}
            </>
        );
    };

    const priorityList = () => {

        return (
            <>
                (
                <option
                    style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }}
                    value={1}
                    selected={ticket.priority == 1 ? true : false}
                >
                    Low
                </option>
                <option
                    style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }}
                    value={2}
                    selected={ticket.priority == 2 ? true : false}
                >
                    Medium
                </option>
                <option
                    style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }}
                    value={3}
                    selected={ticket.priority == 3 ? true : false}
                >
                    High
                </option>
                <option
                    style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }}
                    value={4}
                    selected={ticket.priority == 4 ? true : false}
                >
                    Critical
                </option>

                )
            </>
        );
    };


    const handleRatingChange = (newRating) => {

        const role = parseInt(localStorage.getItem("id"));
        if (role === ticket.reporterId) {
            if (isLoading) {
                return;
            }

            setIsLoading(true);

            setTicket({
                ...ticket,
                starRate: newRating
            });
            axiosInstance.post(APIURLS.ticket.saveStarRating() + "ticketId=" + ticket.id + "&star=" + newRating)
                .then(
                    (result) => {
                        setIsLoading(false);

                    },
                    (error) => {
                        setIsLoading(false);
                    }
                );
        }
    };


    const formatTimeDifference = (from, to) => {
        const currentDate = new Date(from);
        const creationDate = new Date(to);

        const timeDifference = currentDate - creationDate;
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m ago`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`;
        } else {
            return `${minutes}m ago`;
        }
    };


    const handleDateFromChange = (e) => {
        e.preventDefault();

        const startDate = new Date(ticket.calledIn);
        const endDate = new Date(ticket.timeStamp);
        const pickedDateFrom = new Date(e.target.value);
        const pickedDateTo = new Date(overtime.dateTo);

        if ((pickedDateFrom < startDate || pickedDateFrom > endDate) || (pickedDateFrom > pickedDateTo)) {
            return;
        }

        const differenceInMilliseconds = Math.abs(pickedDateFrom - pickedDateTo);

        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const totalHours = differenceInMilliseconds / (1000 * 60 * 60);
        const remainingMinutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

        // date from
        const fromDateHours = pickedDateFrom.getHours();
        let formattedfromDateHours = fromDateHours > 12 ? fromDateHours - 12 : fromDateHours;
        const ampmFrom = fromDateHours < 12 ? 'AM' : 'PM';
        const fromDateMinutes = pickedDateFrom.getMinutes() === 0 ? "00" : pickedDateFrom.getMinutes();

        // date to
        const toDateHours = pickedDateTo.getHours();
        let formattedtoDateHours = toDateHours > 12 ? toDateHours - 12 : toDateHours;
        const ampmTo = toDateHours < 12 ? 'AM' : 'PM';
        const toDateMinutes = pickedDateTo.getMinutes() === 0 ? "00" : pickedDateTo.getMinutes();

        if (overtimeOptionDay === 'day') {

            if (overtime.dateFrom === "") {
                setOvertime({
                    ...overtime,
                    dateFrom: e.target.value,
                    dateTo: e.target.value,
                    days: "1",
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }
            else {
                setOvertime({
                    ...overtime,
                    dateFrom: e.target.value,
                    days: (days + 1).toString(),
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }

        }
        else {

            if (overtime.dateFrom === "") {
                setOvertime({
                    ...overtime,
                    dateFrom: e.target.value,
                    dateTo: e.target.value,
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }
            else {
                setOvertime({
                    ...overtime,
                    dateFrom: e.target.value,
                    days: totalHours + "hr",
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }

        }

    };
    const handleDateToChange = (e) => {
        e.preventDefault();

        const startDate = new Date(ticket.calledIn);
        const endDate = new Date(ticket.timeStamp);
        const pickedDateFrom = new Date(overtime.dateFrom);
        const pickedDateTo = new Date(e.target.value);

        if ((pickedDateTo < startDate || pickedDateTo > endDate) || (pickedDateFrom > pickedDateTo)) {
            return;
        }

        const differenceInMilliseconds = Math.abs(pickedDateFrom - pickedDateTo);

        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const totalHours = differenceInMilliseconds / (1000 * 60 * 60);
        const remainingMinutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

        // date from
        const fromDateHours = pickedDateFrom.getHours();
        let formattedfromDateHours = fromDateHours > 12 ? fromDateHours - 12 : fromDateHours;
        const ampmFrom = fromDateHours < 12 ? 'AM' : 'PM';
        const fromDateMinutes = pickedDateFrom.getMinutes() === 0 ? "00" : pickedDateFrom.getMinutes();

        // date to
        const toDateHours = pickedDateTo.getHours();
        let formattedtoDateHours = toDateHours > 12 ? toDateHours - 12 : toDateHours;
        const ampmTo = toDateHours < 12 ? 'AM' : 'PM';
        const toDateMinutes = pickedDateTo.getMinutes() === 0 ? "00" : pickedDateTo.getMinutes();

        if (overtimeOptionDay === 'day') {

            if (overtime.dateFrom === "") {
                setOvertime({
                    ...overtime,
                    dateFrom: e.target.value,
                    dateTo: e.target.value,
                    days: "1",
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }
            else {
                setOvertime({
                    ...overtime,
                    dateTo: e.target.value,
                    days: (days + 1).toString(),
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }

        }
        else {

            if (overtime.dateFrom === "") {
                setOvertime({
                    ...overtime,
                    dateFrom: e.target.value,
                    dateTo: e.target.value,
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }
            else {
                setOvertime({
                    ...overtime,
                    dateTo: e.target.value,
                    days: totalHours + "hr",
                    time: formattedfromDateHours + ":" + fromDateMinutes + " " + ampmFrom + " - " + formattedtoDateHours + ":" + toDateMinutes + " " + ampmTo
                });
            }

        }

    };


    const renderMentions = (comment) => {
        const mentionRegex = /@\[([^[\]]+)\]\((\d+)\)/g;
        let lastIndex = 0;
        const parts = [];

        let match;
        while ((match = mentionRegex.exec(comment)) !== null) {
            const username = match[1];
            const userId = match[2];
            const mentionText = match[0];
            const mentionIndex = match.index;

            // Push the text before the mention
            if (mentionIndex > lastIndex) {
                parts.push(comment.substring(lastIndex, mentionIndex));
            }

            // Push the mention with blue color
            parts.push(
                <span key={mentionIndex} style={{ color: 'blue' }}>
                    {username}
                </span>
            );

            // Update lastIndex
            lastIndex = mentionIndex + mentionText.length;
        }

        // Push the remaining text after the last mention
        if (lastIndex < comment.length) {
            parts.push(comment.substring(lastIndex));
        }

        return parts;
    };

    const setSeverity = (from, to) => {
        const currentDate = new Date(from);
        const creationDate = new Date(to);

        const timeDiffMs = creationDate.getTime() - currentDate.getTime();

        const hoursDiff = timeDiffMs / (1000 * 60 * 60);
        if (appSetting !== null) {
            if (parseInt(hoursDiff) < parseInt(appSetting.newTo)) {
                // yellow
                // return appSetting.newColor;
                return '#fffacd'
            }
            else if (parseInt(hoursDiff) < parseInt(appSetting.warningTo)) {
                // orange
                // return appSetting.warningColor;
                return '#ffdab9'
            }
            else {
                // red
                // return appSetting.severeColor;
                return '#ffb6c1'
            }
        }
    };


    const handleActionCommentComplete = (action, data) => {
        FetchData();
    };

    const showCaptcha = () => {
        const now = new Date();
        const ticketDate = new Date(ticket.timeStamp);

        const timeDifference = now - ticketDate;

        const daysDifference = timeDifference / (1000 * 3600 * 24);

        return daysDifference > 7 && ticket.status !== 0;
    };


    const handleCaptchaComplete = (data) => {

        const notify = () => {
            toast.success("Successfully Catchup!", {
                position: "top-center", // Centered toast
                autoClose: 5000, // Close after 5 seconds
            });
        };

        axiosInstance.post(APIURLS.ticket.catchup() + "ticketId=" + data.ticketId + "&userId=" + localStorage.getItem("id"))
            .then(
                (result) => {
                    notify();
                    FetchData()
                },
                (error) => {
                }
            );

    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconSize = 24; // Adjust the size as needed
        switch (extension) {
            case 'pdf':
                return <FaFilePdf size={iconSize} />;
            case 'doc':
            case 'docx':
                return <FaFileWord size={iconSize} />;
            case 'xls':
            case 'xlsx':
                return <FaFileExcel size={iconSize} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'ico':
            case 'webp':
                return <FaFileImage size={iconSize} />;
            default:
                return <FaFileAlt size={iconSize} />;
        }
    };
    if (isSmallScreen) {
        return (
            <>
                {/* <Modal show={true} onHide={hideModal}> */}
                <Modal show={openModal} onHide={hideModal}>
                    <div style={{ position: "absolute", left: 380, display: isLoading ? "inline" : "none" }} > <LoadingSpinner /></div>

                    <Modal.Header style={{ margin: "0px", paddingBottom: "0px", border: "none", display: 'flex', flexDirection: 'column', alignItems: "flex-start" }}>
                        <Modal.Title style={{ fontSize: "3vw", letterSpacing: "0.36px", fontWeight: "500", display: "flex", alignItems: "center", marginLeft: "6px" }}>
                            Ticket ID: <div style={{ color: "#2C4AE6", marginLeft: "4px" }}>{ticket.ticketNumber}</div>
                        </Modal.Title>

                        <div style={{ marginTop: "-10px", fontSize: "2.5vw", marginLeft: "8px" }}>
                            {window.location.origin + "/ticketview/" + ticket.ticketNumber}
                            <CopyButton text={window.location.origin + "/ticketview/" + ticket.ticketNumber} />
                        </div>
                    </Modal.Header>

                    {isLoading ?
                        <LoadingSpinner /> :
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
                    }
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

                    <Modal.Body style={{ display: ShowResolution ? "none" : "flex", padding: "0px 10px 10px 10px" }}>
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
                                        onBlur={handleLeave}
                                        value={ticket.title === null ? "" : ticket.title}
                                        required
                                        readOnly={localStorage.getItem("role") == 1 ? true : false}
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
                                        onBlur={handleLeave}
                                        value={ticket.description === null ? "" : ticket.description}
                                        required
                                        readOnly={localStorage.getItem("role") == 1 ? true : false}
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
                                                        {getFileIcon(file.fileName)} {truncateFilename(file.fileName, 30)}
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
                                            color: isHistoryView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent",
                                            padding: "4px"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                    >
                                        History
                                    </Button>

                                    <Button
                                        data-name="btnRelatedIssues"
                                        style={{
                                            fontSize: "2.5vw",
                                            color: isRelatedIssuesView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent",
                                            padding: "4px"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                    >
                                        Related Issues
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

                                <Button
                                    data-name="btnAddRelatedIssues"
                                    style={{
                                        fontSize: "2.5vw",
                                        fontWeight: "500",
                                        border: "none",
                                        display: isRelatedIssuesView ? "inline" : "none",
                                        marginRight: "8px",
                                        padding: "4px"
                                    }}
                                    onClick={ChangeisAddTicketLink}
                                >
                                    Add Related Issues
                                </Button>
                            </div>



                            <div style={{ margin: "6px", height: "270px", border: '1px solid #DBD3D3', display: isCommentView ? "block" : "none" }}>
                                <div style={{ padding: "10px", height: "260px", backgroundColor: "#DBD3D3", overflowY: "auto", display: isAddComment ? "block" : "none" }}>
                                    <div>
                                        <Input
                                            style={{ fontSize: "2.5vw", color: "#223E58", fontWeight: "100" }}
                                            type="textarea"
                                            name="comment"
                                            rows="6"
                                            id="comment"
                                            onChange={onChangeComment}
                                            value={ticketComment.comment === null ? "" : ticketComment.comment}
                                            required
                                        />
                                        {/* <MentionInput userList={users} onChange={handleChangeMentionComment} /> */}
                                        <MentionInput userList={users} value={ticketComment.comment} onChange={handleChangeMentionComment} />

                                    </div>


                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px' }}>
                                        <div style={{ flex: '1', textAlign: 'left' }}>
                                            <FileInputComponent selectedFiles={selectedFiles} onFileChange={handleFileChange} />
                                        </div>
                                    </div>
                                    <div style={{ flex: '1', textAlign: 'right' }}>
                                        <Button style={{ padding: "4px", fontSize: "2.5vw", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "6px" }} variant="outline-primary" onClick={addTicketComment}>Submit</Button>
                                        <Button data-name="btnCancelComment" style={{ padding: "4px", fontSize: "2.5vw", background: "#dc3545", color: "white", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={ChangeisAddComment}>Cancel</Button>

                                    </div>

                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
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
                                                    <div style={{ borderBottom: "solid 1px #DBD3D3", width: '100%' }}>
                                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: "2.5vw" }}>
                                                            <div style={{ fontWeight: "bold" }}>{item.userFullName}</div>
                                                            <div style={{ color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>

                                                        </div>
                                                        <div style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word', fontSize: "2.5vw" }}> {renderMentions(item.comment)}</div>


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

                            <div style={{ padding: "6px", height: "270px", overflowY: "auto", border: '1px solid #DBD3D3', display: isHistoryView ? "block" : "none" }} >
                                <Table responsive>
                                    <tbody>
                                        {ticketHistories.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    {index === 0 ?
                                                        (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DBD3D3', padding: '1px', backgroundColor: "transparent" }}>
                                                                <div style={{ flex: '1', textAlign: 'left' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '3vw', fontWeight: "bold" }}>{getUser(item.userId)} <span style={{ fontWeight: "normal" }}>created this ticket.</span></div>
                                                                </div>
                                                                <div style={{ flex: '1', textAlign: 'right', fontSize: '3vw' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '3vw', color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                        :
                                                        (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DBD3D3', padding: '1px', backgroundColor: "transparent" }}>
                                                                <div style={{ flex: '1', textAlign: 'left' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '3vw', fontWeight: "bold" }}>  {getUser(item.userId)} <span style={{ fontWeight: "normal" }}>changed the</span> {item.propName} </div>
                                                                    <div style={{ fontSize: '2vw', fontWeight: "bold" }}>From :</div>
                                                                    <div style={{ fontSize: '3vw', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{item.oldData}</div>
                                                                </div>
                                                                <div style={{ flex: '1', textAlign: 'right', fontSize: '3vw' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '3vw', color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                                                    <div style={{ fontSize: '2.5vw', fontWeight: "bold" }}>To :</div>
                                                                    <div style={{ fontSize: '3vw', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{item.newData}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            <div style={{ padding: "6px", height: "270px", border: '1px solid #DBD3D3', display: isRelatedIssuesView ? "block" : "none" }}>

                                <div style={{ padding: "10px", height: "260px", backgroundColor: "#DBD3D3", display: isAddTicketLink ? "block" : "none" }}>
                                    <div>
                                        <Input
                                            style={{ fontSize: "2.5vw", color: "#223E58", fontWeight: "100" }}
                                            type="textarea"
                                            rows="1"
                                            name="linkTicketNumber"
                                            id="linkTicketNumber"
                                            onChange={onChangeTicketLink}
                                            value={ticketLink.linkTicketNumber === null ? "" : ticketLink.linkTicketNumber}
                                            required
                                            placeholder="Type ticket link or ticket number..."
                                        />
                                        <div style={{ color: "red" }}>{ticketLinkError}</div>
                                    </div>

                                    <div style={{ flex: '1', textAlign: 'right' }}>
                                        <Button style={{ padding: "4px", fontSize: "2.5vw", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "6px" }} variant="outline-primary" onClick={addTicketLink}>Submit</Button>
                                        <Button data-name="btnCancelComment" style={{ padding: "4px", fontSize: "2.5vw", background: "#dc3545", color: "white", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={ChangeisAddTicketLink}>Cancel</Button>

                                    </div>
                                </div>

                                <div style={{ padding: "6px", width: "100%", height: "250px", overflowY: "auto", display: isAddTicketLink ? "none" : "block" }}>
                                    <Table responsive>
                                        <tbody>
                                            {!ticket.linkTickets || typeof ticket.linkTickets !== 'string' ? [] : ticket.linkTickets.split(".,.").map((item) => {
                                                const length = item.length;
                                                const splitIndex = Math.min(length, length - 7);

                                                const title = item.substring(0, splitIndex - 3);
                                                const ticketnum = item.substring(splitIndex);
                                                return (
                                                    <div style={{ borderBottom: "solid 1px #DBD3D3", paddingBottom: "10px", width: '100%' }}>
                                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '2.5vw' }}>
                                                            <div style={{ fontWeight: "bold" }}>{title}</div>
                                                        </div>
                                                        <a href={window.location.origin + "/ticketview/" + ticketnum} target="_blank" style={{ color: "blue", whiteSpace: 'pre-line', overflowWrap: 'break-word', fontSize: '2.5vw' }}>{window.location.origin + "/ticketview/" + ticketnum}</a>
                                                    </div>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </div>

                            </div>


                        </div>

                        {/* Details Column */}
                        <div style={{ flex: '40%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '40px' }}>
                                <div style={{ backgroundColor: statusColor.backgroundColor, borderRadius: "8px" }}>
                                    <Form.Select className="text-center" value={ticket.status} name={"status"} style={{ paddingLeft: "0px", paddingRight: "0px", fontSize: "3.5vw", textAlign: "center", backgroundImage: "none", border: "solid 1px" + statusColor.color, color: statusColor.color, fontWeight: "bold", letterSpacing: ".5px", backgroundColor: "transparent" }} onChange={onChange} disabled={localStorage.getItem("role") == 2 ? true : false}>
                                        {Statuses()}
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
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Priority:</div>
                                    <Form.Select name={"priority"} style={{ paddingLeft: "0px", paddingRight: "0px", backgroundImage: "none", textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 2 ? true : false}>
                                        {priorityList()}
                                    </Form.Select>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Due Date:</div>
                                    <Datetime
                                        value={ticket.dueDate ? new Date(ticket.dueDate) : null}
                                        onChange={onChangeDueDate}
                                        dateFormat="YYYY-MM-DD"
                                        timeFormat={false}
                                        inputProps={{
                                            placeholder: ticket.dueDate ? '' : 'Please select due date',
                                        }}
                                    />
                                </div>



                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Elapsed Duration from Called In :</div>
                                    <div style={{ fontSize: "2.5VW", color: "#223E58", fontWeight: "100", backgroundColor: setSeverity(ticket.calledIn, new Date()), padding: "8px", borderRadius: "8px" }}> {ticket.status === 0 ? formatTimeDifference(ticket.timeStamp, ticket.calledIn) : formatTimeDifference(new Date(), ticket.calledIn)}</div>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Branch:</div>
                                    <Form.Select name={"branchId"} style={{ paddingLeft: "0px", paddingRight: "0px", backgroundImage: "none", textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 0 ? false : true}>
                                        <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.branchId == 0 ? true : false}>Unassigned</option>
                                        {branches.map((item) => (
                                            <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={item.id} selected={ticket.branchId == item.id ? true : false}>{item.name}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Assignee:</div>
                                    <Form.Select name={"assigneeId"} style={{ paddingLeft: "0px", paddingRight: "0px", backgroundImage: "none", textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 2 ? true : false}>
                                        <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.assigneeId == null ? true : false}>Unassigned</option>
                                        {users.filter(x => x.role != 2).map((item) => (
                                            <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.assigneeId == item.id ? true : false}>{item.fullName}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Reporter:</div>
                                    <Form.Select name={"status"} style={{ paddingLeft: "0px", paddingRight: "0px", backgroundImage: "none", textAlign: "center", fontSize: "2.5vw", letterSpacing: ".5px" }} disabled={true}>
                                        <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.reporterId == null ? true : false}>Unassigned</option>
                                        {users.filter(x => x.role == 2 || x.role == 0).map((item) => (
                                            <option style={{ fontSize: "2.5vw", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.reporterId == item.id ? true : false}>{item.fullName}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div className="my-1" style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Assets:</div>
                                    <AsyncSelect
                                        isMulti
                                        value={ticketAssets}
                                        placeholder="Assign assets...."
                                        defaultOptions
                                        onChange={handleAssetOnChange}
                                        loadOptions={filterAssetsOptions}
                                    />
                                </div>

                                <div style={{ padding: "10px", textAlign: "center", display: ticket.status === 0 ? "block" : "none" }}>
                                    <StarRating value={ticket.starRate} mobile={isSmallScreen} onChange={handleRatingChange} ticketuserId={ticket.reporterId} />
                                    <div style={{ fontSize: "3vw", color: "#223E58", fontWeight: "500" }}>Rating</div>
                                </div>


                                {/* <div style={{ textAlign: 'center', position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '2.5vw', width: "90%" }}>
                                    <QRCode
                                        value={window.location.origin + "/ticketview/" + ticket.ticketNumber}
                                        size={80} // Size of the QR code in pixels
                                        bgColor="#ffffff" // Background color
                                        fgColor="#000000" // Foreground color
                                        level="Q" // Error correction level: 'L', 'M', 'Q', 'H'
                                        includeMargin={true} // Include white border around the QR code
                                    />
                                </div> */}



                                {/* <Button onClick={UpdateTicket} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '2.5vw', width: "90%" }}>
                                    Save Changes
                                </Button> */}
                            </div>

                        </div>

                    </Modal.Body>

                </Modal>
            </>
        )

    }
    else {
        return (
            <>
                <Modal show={openModal} onHide={hideModal}>
                    <div style={{ position: "absolute", right: 100, display: isLoading ? "inline" : "none" }} > <LoadingSpinner /></div>

                    <Modal.Header style={{ margin: "0px", paddingBottom: "0px", border: "none", width: '100%', display: 'flex', flexDirection: 'column', alignItems: "flex-start" }}>
                        <Modal.Title style={{ fontSize: "21px", letterSpacing: "0.36px", fontWeight: "500", display: "flex", alignItems: "center", marginLeft: "12px" }}>
                            Ticket ID: <div style={{ color: "#2C4AE6", marginLeft: "4px" }}>{ticket.ticketNumber}</div>
                        </Modal.Title>

                        <div style={{ marginTop: "-10px", marginLeft: "14px" }}>
                            {window.location.origin + "/ticketview/" + ticket.ticketNumber}
                            <CopyButton text={window.location.origin + "/ticketview/" + ticket.ticketNumber} />
                        </div>
                    </Modal.Header>

                    <Button
                        style={{
                            position: "absolute",
                            top: "0px",
                            right: "10px",
                            fontWeight: "bold",
                            fontSize: "40px",
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
                            <div style={{ marginLeft: "6px", fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Resolution:</div>
                            <div>
                                <Input
                                    style={{ height: '200px', resize: "none", fontSize: "15px", color: "#223E58", fontWeight: "100", marginBottom: "12px" }}
                                    type="textarea"
                                    name="resolution"
                                    id="resolution"
                                    onChange={e => setResolution(e.target.value)}
                                    value={resolution === null ? "" : resolution}
                                    required
                                />
                            </div>
                            <Button onClick={UpdateTicket} style={{ fontWeight: 'bold', fontSize: '16px', marginRight: "12px" }}>
                                Save
                            </Button>
                            <Button variant="outline-danger" onClick={e => setShowResolution(false)} style={{ fontWeight: 'bold', fontSize: '16px' }} active>
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <Modal.Body style={{ display: ShowResolution ? "none" : "flex" }}>
                        <div style={{ flex: '80%', marginRight: '10px', border: '1px solid #DBD3D3', padding: '10px' }}>

                            <div style={{ padding: "10px" }} >
                                <div style={{ marginLeft: "6px", fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Title:</div>
                                <div>
                                    <Input
                                        style={{ height: '30px', resize: "none", fontSize: "15px", color: "#223E58", fontWeight: "100" }}
                                        type="textarea"
                                        name="title"
                                        id="title"
                                        onChange={onChange}
                                        onBlur={handleLeave}
                                        value={ticket.title === null ? "" : ticket.title}
                                        required
                                        readOnly={localStorage.getItem("role") == 1 ? true : false}
                                    />
                                    <label style={{ color: "red", display: error.title.length > 0 ? "inline" : "none" }}>Enter title.</label>
                                </div>
                            </div>


                            <div style={{ padding: "10px" }} >
                                <div style={{ marginLeft: "6px", fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Description:</div>
                                <div>
                                    <Input
                                        style={{ height: '200px', resize: "none", fontSize: "15px", color: "#223E58", fontWeight: "100", whiteSpace: 'pre-line', overflowWrap: 'break-word' }}
                                        type="textarea"
                                        name="description"
                                        id="description"
                                        onChange={onChange}
                                        onBlur={handleLeave}
                                        value={ticket.description === null ? "" : ticket.description}
                                        required
                                        readOnly={localStorage.getItem("role") == 1 ? true : false}
                                    />
                                    <label style={{ color: "red", display: error.description.length > 0 ? "inline" : "none" }}>Enter description.</label>
                                </div>
                            </div>


                            <div style={{ marginLeft: "6px", fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Attachments: {ticketAttachments.length}</div>
                            <div style={{ padding: "10px", height: "120px", overflowY: "auto" }}>
                                <div style={{ marginLeft: "10px" }}>
                                    {ticketAttachments.length > 0 ? (
                                        <div>
                                            {ticketAttachments.map((file, index) => (
                                                <div key={index + 1} style={{ marginBottom: '5px', fontSize: '12px' }}>
                                                    <a href="#" onClick={() => handleFileOpen(file)} title={file.fileName}>
                                                        {getFileIcon(file.fileName)} {truncateFilename(file.fileName, 40)}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        isLoading ? (
                                            <div>Fetching Attachments....</div>
                                        ) : (
                                            <div>No attachments</div>
                                        )
                                    )}


                                </div>
                            </div>




                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}> */}
                                <div>
                                    <Button
                                        data-name="btnComment"
                                        style={{
                                            fontSize: "17px",
                                            color: isCommentView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                    >
                                        Comments
                                    </Button>

                                    <Button
                                        data-name="btnHistory"
                                        style={{
                                            fontSize: "17px",
                                            color: isHistoryView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                    >
                                        History
                                    </Button>

                                    <Button
                                        data-name="btnRelatedIssues"
                                        style={{
                                            fontSize: "17px",
                                            color: isRelatedIssuesView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                    >
                                        Related Issues
                                    </Button>

                                    <Button
                                        data-name="btnApplyOvertime"
                                        style={{
                                            fontSize: "17px",
                                            color: isApplyOvertimeView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                        disabled={ticket.status === 0 ? false : true}
                                    >
                                        Overtime
                                    </Button>

                                    <Button
                                        data-name="btnCatchUp"
                                        style={{
                                            fontSize: "17px",
                                            color: isCatchUpView ? "#223E58" : "#8F8F8F",
                                            fontWeight: "500",
                                            border: "none",
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={ChangeCommentHistoryView}
                                    >
                                        Catch Up's
                                    </Button>


                                </div>

                                <Button
                                    data-name="btnAddComment"
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        border: "none",
                                        display: isCommentView ? "inline" : "none",
                                        marginRight: "12px"
                                    }}
                                    onClick={ChangeisAddComment}
                                >
                                    Add Comment
                                </Button>

                                <Button
                                    data-name="btnAddRelatedIssues"
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        border: "none",
                                        display: isRelatedIssuesView ? "inline" : "none",
                                        marginRight: "12px"
                                    }}
                                    onClick={ChangeisAddTicketLink}
                                >
                                    Add Related Issues
                                </Button>

                                <Button
                                    data-name="btnAddApplyOvertime"
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        border: "none",
                                        display: isApplyOvertimeView ? "inline" : "none",
                                        marginRight: "12px"
                                    }}
                                    onClick={ChangeisAddAddApplyOvertime}
                                >
                                    Apply Overtime
                                </Button>

                            </div>



                            <div style={{ padding: "5px", height: "270px", border: '1px solid #DBD3D3', display: isCommentView ? "block" : "none" }}>
                                <div style={{ padding: "10px", height: "260px", backgroundColor: "#DBD3D3", overflowY: "auto", display: isAddComment ? "block" : "none" }}>
                                    <div>
                                        {/* <Input
                                            style={{ fontSize: "15px", color: "#223E58", fontWeight: "100" }}
                                            type="textarea"
                                            rows="6"
                                            name="comment"
                                            id="comment"
                                            onChange={onChangeComment}
                                            value={ticketComment.comment === null ? "" : ticketComment.comment}
                                            required
                                        /> */}
                                        {/* <MentionInput userList={users} onChange={handleChangeMentionComment} /> */}
                                        <MentionInput userList={users} value={ticketComment.comment} onChange={handleChangeMentionComment} />
                                        {/* <label style={{ color: "red", display: isShowDescriptionError }}>Enter description.</label> */}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px' }}>
                                        <div style={{ flex: '1', textAlign: 'left' }}>
                                            <FileInputComponent selectedFiles={selectedFiles} onFileChange={handleFileChange} />
                                        </div>
                                    </div>
                                    <div style={{ flex: '1', textAlign: 'right' }}>
                                        <Button style={{ padding: "4px", fontSize: "12px", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "6px" }} variant="outline-primary" onClick={addTicketComment}>Submit</Button>
                                        <Button data-name="btnCancelComment" style={{ padding: "4px", fontSize: "12px", background: "#dc3545", color: "white", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={ChangeisAddComment}>Cancel</Button>

                                    </div>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                        {selectedFiles.length > 0 && (
                                            <div>
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index + 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <div style={{ textAlign: 'left' }}>
                                                            <a href="#" onClick={() => handleFileOpenComment(file)}>
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

                                    </div>

                                </div>



                                {/* <div style={{ width: "100%", height: "250px", overflowY: "auto", display: isAddComment ? "none" : "block" }}>
                                    <Table responsive>
                                        <tbody>
                                            {ticketComments.map((item) => {
                                                return (
                                                    <div style={{ borderBottom: "solid 1px #DBD3D3", width: '100%' }}>
                                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <div style={{ fontWeight: "bold" }}>{item.userFullName}</div>
                                                            <div style={{ color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                                        </div>
                                                        <div style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word', fontSize: '14px' }}>
                                                            {renderMentions(item.comment)}
                                                        </div>


                                                        {item.ticketAttachments.length > 0 ? (
                                                            <div>
                                                                {item.ticketAttachments.map((file, index) => (
                                                                    <div key={index + 1} style={{ textAlign: 'left', fontSize: '12px' }}>
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
                                                                <></>
                                                            )
                                                        )
                                                        }
                                                    </div>
                                                )
                                            })}

                                        </tbody>

                                    </Table>
                                </div>
                                 */}
                                <CommentsTable
                                    ticketComments={ticketComments}
                                    isAddComment={isAddComment}
                                    renderMentions={renderMentions}
                                    handleFileOpen={handleFileOpen}
                                    isLoading={isLoading}
                                    onActionComplete={handleActionCommentComplete}
                                />

                            </div>

                            <div style={{ padding: "10px", height: "270px", overflowY: "auto", border: '1px solid #DBD3D3', display: isHistoryView ? "block" : "none" }} >

                                <Table responsive>
                                    <tbody>
                                        {ticketHistories.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    {index === 0 ?
                                                        (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px', backgroundColor: "transparent" }}>
                                                                <div style={{ flex: '1', textAlign: 'left' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: "bold" }}>
                                                                        {getUser(item.userId)} <span style={{ fontWeight: "normal" }}>created this ticket.</span>
                                                                    </div>
                                                                </div>
                                                                <div style={{ flex: '1', textAlign: 'right' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '14px', color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                        :
                                                        (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px', backgroundColor: "transparent" }}>
                                                                <div style={{ flex: '1', textAlign: 'left' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: "bold" }}>
                                                                        {getUser(item.userId)} <span style={{ fontWeight: "normal" }}>changed the</span> {item.propName}
                                                                    </div>
                                                                    <div style={{ fontSize: '12px', fontWeight: "bold" }}>From :</div>
                                                                    <div style={{ fontSize: '12px', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{item.oldData}</div>
                                                                </div>
                                                                <div style={{ flex: '1', textAlign: 'right' }}>
                                                                    <div style={{ marginBottom: '6px', fontSize: '14px', color: "#716E6E" }}>{new Date(item.createdText).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                                                    <div style={{ fontSize: '12px', fontWeight: "bold" }}>To :</div>
                                                                    <div style={{ fontSize: '12px', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{item.newData}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            <div style={{ padding: "5px", height: "270px", border: '1px solid #DBD3D3', display: isRelatedIssuesView ? "block" : "none" }}>
                                <div style={{ padding: "10px", height: "260px", backgroundColor: "#DBD3D3", display: isAddTicketLink ? "block" : "none" }}>
                                    <div>
                                        <Input
                                            style={{ fontSize: "15px", color: "#223E58", fontWeight: "100" }}
                                            type="textarea"
                                            rows="1"
                                            name="linkTicketNumber"
                                            id="linkTicketNumber"
                                            onChange={onChangeTicketLink}
                                            value={ticketLink.linkTicketNumber === null ? "" : ticketLink.linkTicketNumber}
                                            required
                                            placeholder="Type ticket link or ticket number..."
                                        />
                                        <div style={{ color: "red" }}>{ticketLinkError}</div>
                                    </div>

                                    <div style={{ flex: '1', textAlign: 'right', paddingTop: '10px' }}>
                                        <Button style={{ padding: "4px", fontSize: "12px", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "6px" }} variant="outline-primary" onClick={addTicketLink}>Submit</Button>
                                        <Button data-name="btnCancelComment" style={{ padding: "4px", fontSize: "12px", background: "#dc3545", color: "white", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={ChangeisAddTicketLink}>Cancel</Button>
                                    </div>

                                </div>

                                <div style={{ width: "100%", height: "250px", overflowY: "auto", display: isAddTicketLink ? "none" : "block" }}>
                                    <Table responsive>
                                        <tbody>
                                            {!ticket.linkTickets || typeof ticket.linkTickets !== 'string' ? [] : ticket.linkTickets.split(".,.").map((item) => {
                                                const length = item.length;
                                                const splitIndex = Math.min(length, length - 7);

                                                const title = item.substring(0, splitIndex - 3);
                                                const ticketnum = item.substring(splitIndex);
                                                return (
                                                    <div style={{ borderBottom: "solid 1px #DBD3D3", paddingBottom: "10px", width: '100%' }}>
                                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <div style={{ fontWeight: "bold" }}>{title}</div>
                                                        </div>
                                                        <a href={window.location.origin + "/ticketview/" + ticketnum} target="_blank" style={{ color: "blue", whiteSpace: 'pre-line', overflowWrap: 'break-word', fontSize: '14px' }}>{window.location.origin + "/ticketview/" + ticketnum}</a>
                                                    </div>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </div>

                            </div>

                            <div style={{ padding: "5px", height: "270px", border: '1px solid #DBD3D3', display: isApplyOvertimeView ? "block" : "none" }}>

                                <div style={{ padding: "10px", height: "260px", backgroundColor: "#DBD3D3", display: isApplyOvertime ? "block" : "none", overflowY: "auto" }}>

                                    <div>
                                        <label style={{ padding: "4px" }}>
                                            <input
                                                type="radio"
                                                value="day"
                                                checked={overtimeOptionDay === 'day'}
                                                onChange={e => { setOvertimeOptionDay(e.target.value); setOvertime(overtimeInitialState); }}
                                                style={{ margin: "4px" }}

                                            />
                                            DAY
                                        </label>
                                        <label style={{ padding: "4px" }}>
                                            <input
                                                type="radio"
                                                value="hours"
                                                checked={overtimeOptionDay === 'hours'}
                                                onChange={e => { setOvertimeOptionDay(e.target.value); setOvertime(overtimeInitialState); }}
                                                style={{ margin: "4px" }}
                                            />
                                            HOURS
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex' }}>

                                        <div style={{ flex: '1', flexBasis: '60%', display: 'flex', alignItems: 'center', margin: "8px" }}>
                                            <label style={{ marginRight: '10px' }}>NAME:</label>
                                            <Input
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#223E58",
                                                    fontWeight: "100",
                                                    flex: '1',
                                                }}
                                                type="text"
                                                name="userFullName"
                                                id="userFullName"
                                                // onChange={handleChange}
                                                value={overtime.userFullName}
                                                required
                                            />
                                        </div>

                                        <div style={{ flex: '1', flexBasis: '40%', display: 'flex', alignItems: 'center', margin: "8px" }}>
                                            <label style={{ marginRight: '10px' }}>DATE:</label>
                                            <Input
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#223E58",
                                                    fontWeight: "100",
                                                    flex: '1',
                                                }}
                                                type="datetime-local" // Change type to datetime-local
                                                name="dateApplied"
                                                id="dateApplied"
                                                // onChange={handleChange}
                                                value={overtime.dateApplied ? new Date(overtime.dateApplied.getTime() - (overtime.dateApplied.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}

                                                required
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex' }}>

                                        <div style={{ flex: '1', flexBasis: '60%', display: 'flex', alignItems: 'center', margin: "8px" }}>
                                            <label style={{ marginRight: '10px' }}>DATE OF OVERTIME:</label>
                                            <Input
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#223E58",
                                                    fontWeight: "100",
                                                    flex: '1',
                                                }}
                                                type={"datetime-local"}
                                                name="dateFrom"
                                                id="dateFrom"
                                                onChange={handleDateFromChange}
                                                value={overtime.dateFrom}
                                                required
                                            />

                                            <label style={{ marginRight: '10px', marginLeft: '10px' }}>TO:</label>
                                            <Input
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#223E58",
                                                    fontWeight: "100",
                                                    flex: '1',
                                                }}
                                                type={"datetime-local"}
                                                name="dateTo"
                                                id="dateTo"
                                                onChange={handleDateToChange}
                                                value={overtime.dateTo}
                                                required
                                            />
                                        </div>

                                        <div style={{ flex: '1', flexBasis: '40%', display: 'flex', alignItems: 'center', margin: "8px" }}>
                                            <label style={{ marginRight: '10px' }}>NO. OF DAYS:</label>
                                            <Input
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#223E58",
                                                    fontWeight: "100",
                                                    flex: '.4'
                                                }}
                                                type="text"
                                                name="dateApplied"
                                                id="dateApplied"
                                                value={overtime.days}
                                                required
                                            />
                                            <label style={{ marginRight: '10px', marginLeft: '10px' }}>TIME:</label>
                                            <Input
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#223E58",
                                                    fontWeight: "100",
                                                    flex: '1'
                                                }}
                                                type="text"
                                                name="dateApplied"
                                                id="dateApplied"
                                                onChange={e => overtimeOptionDay === 'day' ? setOvertime({ ...overtime, time: e.target.value }) : ""}
                                                value={overtime.time}
                                                required
                                            />
                                        </div>
                                    </div>


                                    <div style={{ marginTop: "12px" }}>

                                        <label style={{ marginRight: '10px' }}>REASON FOR OVERTIME:</label>
                                        <Input
                                            style={{
                                                fontSize: "15px",
                                                color: "#223E58",
                                                fontWeight: "100",
                                                flex: '1',
                                            }}
                                            type="textarea" // Change type to datetime-local
                                            name="dateApplied"
                                            id="dateApplied"
                                            rows={2}
                                            onChange={e => setOvertime({ ...overtime, reason: e.target.value })}
                                            value={overtime.reason}
                                            required
                                        />

                                    </div>


                                    <div style={{ flex: '1', textAlign: 'right', paddingTop: '10px' }}>

                                        <Button style={{ padding: "4px", fontSize: "12px", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "6px" }} variant="outline-primary" onClick={addOvertime}>Submit</Button>

                                        <Button data-name="btnCancelComment" style={{ padding: "4px", fontSize: "12px", background: "#dc3545", color: "white", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={ChangeisAddAddApplyOvertime}>Cancel</Button>
                                    </div>

                                </div>

                                <div style={{ width: "100%", height: "250px", overflowY: "auto", display: isApplyOvertime ? "none" : "block" }}>

                                    {ticketOvertimes ? (
                                        ticketOvertimes.map((item) => (
                                            <div style={{ borderBottom: "solid 1px #DBD3D3", width: '100%' }}>
                                                {/* <div style={{ display: 'flex', justifyContent: 'right', padding: '10px' }}>

                                                    <Button style={{ padding: "8px", fontSize: "16px", background: "#3B82F6", color: "white", letterSpacing: "0.5px", borderRadius: "8px", marginRight: "10px", width: "20%" }} variant="outline-primary"
                                                    //  onClick={addOvertime}
                                                    >View</Button>
                                                </div> */}
                                                <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>

                                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                                            <div style={{ padding: '8px', fontWeight: "500" }}>
                                                                {new Date(item.dateApplied).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                                            </div>
                                                            <div style={{ padding: '8px', fontWeight: "500" }}>
                                                                {item.userFullName}
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', fontWeight: '500' }}>
                                                                From:
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', fontWeight: '500' }}>
                                                                To:
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', textAlign: 'left', padding: '8px' }}>
                                                                {new Date(item.dateFrom).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                                            </div>
                                                            <div style={{ display: 'flex', textAlign: 'left', padding: '8px' }}>
                                                                {new Date(item.dateTo).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                                            </div>
                                                        </div>

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', fontWeight: '500' }}>
                                                                Supervisor Approval:
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', fontWeight: '500' }}>
                                                                Head Approval:
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px', fontWeight: '500' }}>
                                                                {item.supervisorApprovalText}
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px', fontWeight: '500' }}>
                                                                {item.headApprovalText}
                                                            </div>
                                                        </div>
                                                        {/* <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <Form.Select name={"supervisorApproval"} style={{ textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} disabled={isLoading ? true : false}>
                                                                    <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={item.supervisorApproval == null ? true : false}>Pending</option>
                                                                    <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={1} selected={item.supervisorApproval == null ? true : false}>Approved</option>
                                                                    <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={2} selected={item.supervisorApproval == null ? true : false}>Declined</option>
                                                                </Form.Select>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <Form.Select name={"headApproval"} style={{ textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} disabled={isLoading ? true : false}>
                                                                    <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={item.headApproval == null ? true : false}>Pending</option>
                                                                    <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={1} selected={item.headApproval == null ? true : false}>Approved</option>
                                                                    <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={2} selected={item.headApproval == null ? true : false}>Declined</option>
                                                                </Form.Select>
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </div>


                                                {/* <div style={{ display: 'flex', justifyContent: 'left', padding: '10px' }}>
                                                    <Button
                                                        style={{ padding: '8px', fontSize: '16px', background: '#3B82F6', color: 'white', letterSpacing: '0.5px', borderRadius: '8px', width: '120px' }}
                                                        variant="outline-primary"
                                                    // onClick={handleButtonClick}
                                                    >
                                                        View
                                                    </Button>
                                                </div> */}
                                            </div>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">No Overtime</td>
                                        </tr>
                                    )}

                                </div>

                            </div>


                            <div style={{ padding: "10px", height: "270px", overflowY: "auto", border: '1px solid #DBD3D3', display: isCatchUpView ? "block" : "none" }} >

                                <Table responsive>
                                    <tbody>
                                        {ticketCatchUps.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px', backgroundColor: "transparent" }}>
                                                        <div style={{ flex: '1', textAlign: 'left' }}>
                                                            <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: "bold" }}>
                                                                {getUser(item.userId)} <span style={{ fontWeight: "normal" }}>{item.dateText}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                        </div>


                        <div style={{ flex: '20%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '50px' }}>
                                <div style={{ backgroundColor: statusColor.backgroundColor, borderRadius: "8px" }}>
                                    <Form.Select value={ticket.status} name={"status"} style={{ border: "solid 1px" + statusColor.color, color: statusColor.color, textAlign: "center", fontSize: "20px", fontWeight: "bold", paddingLeft: "20px", letterSpacing: ".5px", backgroundColor: "transparent" }} onChange={onChange} disabled={localStorage.getItem("role") == 2 ? true : false}>
                                        {Statuses()}
                                    </Form.Select>
                                </div>
                            </div>
                            <div style={{ flex: '1', border: '1px solid #DBD3D3', position: 'relative' }}>
                                <div style={{ padding: "10px", fontSize: "17px", color: "#223E58", fontWeight: "500", borderBottom: '1px solid #DBD3D3' }}>Details</div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Called In:</div>
                                    <div style={{ fontSize: "15px", color: "#223E58", fontWeight: "100" }}>{ticket.calledInText}</div>
                                </div>
                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Priority:</div>
                                    <Form.Select name={"priority"} style={{ textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 2 ? true : false}>
                                        {priorityList()}
                                    </Form.Select>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Due Date:</div>

                                    <Datetime
                                        value={ticket.dueDate ? new Date(ticket.dueDate) : null}
                                        onChange={onChangeDueDate}
                                        dateFormat="YYYY-MM-DD"
                                        timeFormat={false}
                                        inputProps={{
                                            placeholder: ticket.dueDate ? '' : 'Please select due date',
                                        }}
                                    />
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Elapsed Duration from Called In:</div>
                                    <div style={{ fontSize: "15px", color: "#223E58", fontWeight: "100", backgroundColor: setSeverity(ticket.calledIn, new Date()), padding: "8px", borderRadius: "8px" }}>{ticket.status === 0 ? formatTimeDifference(ticket.timeStamp, ticket.calledIn) : formatTimeDifference(new Date(), ticket.calledIn)}</div>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Branch:</div>
                                    <Form.Select name={"branchId"} style={{ textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 0 ? false : true}>
                                        <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={0} selected={ticket.branchId == 0 ? true : false}>Unassigned</option>
                                        {branches.map((item) => (
                                            <option style={{ letterSpacing: ".5px", paddingBottom: "10px" }} value={item.id} selected={ticket.branchId == item.id ? true : false}>{item.name}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Assignee:</div>
                                    <Form.Select name={"assigneeId"} style={{ textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 2 ? true : false}>
                                        <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.assigneeId == null ? true : false}>Unassigned</option>
                                        {users.filter(x => x.role != 2).map((item) => (
                                            <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.assigneeId == item.id ? true : false}>{item.fullName}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                                {/* <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Assignee:</div>
                                    <Form.Select name={"branchMemberAssigneeId"} style={{ textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} onChange={onChange} disabled={isLoading ? true : localStorage.getItem("role") == 2 ? true : false}>
                                        <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.BranchMemberAssigneeId == null ? true : false}>Unassigned</option>
                                        {branchMembers.map((item) => (
                                            <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.branchMemberAssigneeId == item.id ? true : false}>{item.memberName}</option>
                                        ))}
                                    </Form.Select>
                                </div> */}

                                <div style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Reporter:</div>
                                    <Form.Select name={"status"} style={{ appearance: "none", backgroundImage: "none", textAlign: "center", fontSize: "15px", paddingLeft: "20px", letterSpacing: ".5px" }} disabled={true}>
                                        <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={0} selected={ticket.reporterId == null ? true : false}>Unassigned</option>
                                        {users.filter(x => x.role == 2 || x.role == 0).map((item) => (
                                            <option style={{ fontSize: "15px", letterSpacing: ".5px", marginBottom: "20px" }} value={item.id} selected={ticket.reporterId == item.id ? true : false}>{item.fullName}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div className="my-1" style={{ padding: "10px" }}>
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Assets:</div>
                                    <AsyncSelect
                                        isMulti
                                        value={ticketAssets}
                                        placeholder="Assign assets...."
                                        defaultOptions
                                        onChange={handleAssetOnChange}
                                        loadOptions={filterAssetsOptions}

                                    />
                                </div>

                                <div className="my-1" style={{ padding: "10px" }}>
                                    {/* {showCaptcha() && <AltchaCaptcha onCaptchaComplete={handleCaptchaComplete} ticketId={ticket.id} />} */}
                                    {<AltchaCaptcha onCaptchaComplete={handleCaptchaComplete} ticketId={ticket.id} />}
                                </div>


                                <div style={{ padding: "10px", textAlign: "center", display: ticket.status === 0 ? "block" : "none" }}>
                                    <StarRating value={ticket.starRate} mobile={isSmallScreen} onChange={handleRatingChange} ticketuserId={ticket.reporterId} />
                                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Rating</div>
                                </div>

                                {/* <div style={{ textAlign: 'center', position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '16px', width: "90%", }}>
                                    <QRCode
                                        value={window.location.origin + "/ticketview/" + ticket.ticketNumber}
                                        size={160} // Size of the QR code in pixels
                                        bgColor="#ffffff" // Background color
                                        fgColor="#000000" // Foreground color
                                        level="Q" // Error correction level: 'L', 'M', 'Q', 'H'
                                        includeMargin={true} // Include white border around the QR code
                                    />
                                </div> */}


                                {/* <Button onClick={UpdateTicket} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '16px', width: "90%" }}>
                                    Save Changes
                                </Button> */}
                            </div>

                        </div>

                    </Modal.Body>

                </Modal>
            </>
        )
    }
};

export default ViewTicket;