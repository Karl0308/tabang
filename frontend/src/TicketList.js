import React, { Component, useState, useEffect, Children } from "react";
import { Container, Row, Col, Input, Label, Table } from "reactstrap";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingSpinner from "./LoadingSpinner";
import { APIURLS } from "./APIURLS";
import CopyButton from "./components/CopyButton";
import DrawerMenu from "./DrawerMenu";
import Select from 'react-select'
import FileInputComponent from "./components/FileInputComponent";
// import ModalViewImage from "./components/ModalViewImage"


import { useMsal } from '@azure/msal-react';
import ViewTicket from "./ticketcomponents/ViewTicket";
import ViewTicketSmall from "./ticketcomponents/ViewTicketSmall";
import StarRating from "./components/StarRating";
import NotificationBell from "./components/NotificationBell";
// import { createClaimsTable } from '../utils/claimUtils';
const TicketList = (props) => {

    // const tokenClaims = createClaimsTable(props.idTokenClaims);

    const initialTicketState = {
        id: 0,
        ticketNumber: "",
        calledIn: "2023-07-06T05:54:23.098Z",
        title: "",
        description: "",
        status: 0,
        assigneeId: 0,
        reporterId: 0,
        branchId: 0,
        currentUserId: localStorage.getItem("id"),
        file: []
    };


    const [ticket, setTicket] = useState({
        id: 0,
        ticketNumber: "",
        calledIn: "2023-07-06T05:54:23.098Z",
        title: "",
        description: "",
        status: 0,
        assigneeId: 0,
        reporterId: 0,
        branchId: 0,
        currentUserId: localStorage.getItem("id"),
        file: []
    });

    const [ticketComment, setTicketComment] = useState({
        id: 0,
        comment: "",
        created: "2023-09-08T07:51:31.050Z",
        ticketId: 0,
        userId: 0
    });

    const filterStatusInitialState = { value: 1, label: 'Open' };

    const [filter, setFilter] = useState({
        search: "",
        status: [filterStatusInitialState],
        userOption: [],
        branches: [],
        priority: []
    });


    const [users, setUsers] = useState([]);

    const [itemsData, setItems] = useState([]);
    const [ticketHistories, setTicketHistories] = useState([]);
    const [ticketComments, setTicketComments] = useState([]);
    const [ticketAttachments, setTicketAttachments] = useState([]);
    const [allitemsData, setAllItems] = useState([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isOpenHistory, setIsOpenHistory] = React.useState(false);
    const [isOpenComment, setIsOpenComment] = React.useState(false);
    const [isOpenCommentAndHistory, setIsOpenCommentAndHistory] = React.useState(false);
    const [isOpenProcessing, setisOpenProcessing] = useState(false);
    const [isLoadingComment, setisLoadingComment] = useState(false);
    const [isOpenProcessingTable, setisOpenProcessingTable] = useState(false);
    const [pages, setPages] = useState(0);
    const [statusColor, setStatusColor] = useState("#F5A314");
    const [isShowDescriptionError, setisShowDescriptionError] = useState("none")
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
    const [showResolution, setshowResolution] = useState(false);
    const [resolution, setResolution] = useState("");
    // const [statusFilter, setStatusFilter] = useState(1);
    const [branches, setBranches] = useState([]);
    const [lastTicketStatus, setLastTicketStatus] = useState();

    const [selectedFiles, setSelectedFiles] = useState([]);

    const [appSetting, setAppSetting] = useState();


    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
    };

    const AssigneeList = [
        { value: 'ALL', label: 'ALL' },
        { value: (parseInt(localStorage.getItem('id'))), label: 'Current User' },
        { value: 'Unassigned', label: 'Unassigned' },
        ...users.filter(x => x.role !== 2)
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
            .map((user) => ({ value: user.id, label: user.fullName }))

    ];


    const BranchList = [
        { value: 'ALL', label: 'ALL' },
        { value: 'Unassigned', label: 'Unassigned' },
        ...branches.sort((a, b) => a.name.localeCompare(b.name))
            .map((branch) => ({ value: branch.id, label: branch.name }))

    ];



    const StatusList = [
        { value: 4, label: 'ALL' },
        { value: 1, label: 'Open' },
        { value: 2, label: 'On Hold' },
        { value: 3, label: 'In Progress' },
        { value: 0, label: 'Done' }
    ];



    const PriorityList = [
        { value: 1, label: 'Low' },
        { value: 2, label: 'Medium' },
        { value: 3, label: 'High' },
        { value: 4, label: 'Critical' },
    ];


    const onChangeUserFilter = (e) => {

        setFilter(filter => ({
            ...filter,
            userOption: e
        }));

        // setItems(allitemsData);
        // if (e.some(option => option.value === 'ALL') || e.length == 0) {
        //     setItems(allitemsData);
        // }
        // else {

        //     const filterValues = e.map(option => option.value);

        //     const filter = allitemsData.filter(item => filterValues.includes(item.assigneeId));

        //     let combinedFilter = filter;

        //     if (e.some(option => option.value === 'Unassigned')) {
        //         const filter2 = allitemsData.filter(item => item.assigneeId == null);
        //         combinedFilter = combinedFilter.concat(filter2);
        //     }

        //     if (e.some(option => option.value === 'CurrentUser')) {
        //         const filter3 = allitemsData.filter(item => item.assigneeId == localStorage.getItem('id'));
        //         combinedFilter = combinedFilter.concat(filter3);
        //     }

        //     // Remove duplicates from the combinedFilter array
        //     const uniqueCombinedFilter = Array.from(new Set(combinedFilter));

        //     setItems(uniqueCombinedFilter);
        // }

    };

    const onChangeBranchFilter = (e) => {
        setFilter(filter => ({
            ...filter,
            branches: e
        }));

    };

    const onChangeStatusFilter = (e) => {

        setFilter(filter => ({
            ...filter,
            status: e
        }));

        if (e.length === 0) {
            setFilter(filter => ({
                ...filter,
                status: [filterStatusInitialState]
            }));
        }
    };

    const onChangePriorityFilter = (e) => {

        setFilter(filter => ({
            ...filter,
            priority: e
        }));
    };

    // const handleFileOpen = (file) => {
    //     if (file.contentType.startsWith('image/')) {
    //         // Display image
    //         const img = new Image();
    //         img.src = `data:${file.contentType};base64,${file.content}`;
    //         const newWindow = window.open();
    //         newWindow.document.write('<html><head><title>File Preview</title></head><body></body></html>');
    //         newWindow.document.body.appendChild(img);


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

    const handleFileOpen = (file) => {
        if (file.contentType.startsWith('image/')) {
            //   // Display image
            //   const img = new Image();
            //   img.src = `data:${file.contentType};base64,${file.content}`;
            //   const newWindow = window.open();
            //   newWindow.document.write('<html><head><title>File Preview</title></head><body></body></html>');
            //   newWindow.document.body.appendChild(img);

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

    const handleFileOpenComment = (file) => {
        const fileUrl = URL.createObjectURL(file);
        window.open(fileUrl, '_blank');
    };

    const { instance } = useMsal();
    async function getuserData() {
        try {
            const res = await axios.post(APIURLS.user.loginEmail + '?email=' + props.idTokenClaims.preferred_username)

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('fullname', res.data.fullName);
            localStorage.setItem('email', props.idTokenClaims.preferred_username);
            localStorage.setItem('roletext', res.data.roleText);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('id', res.data.id);
            localStorage.setItem('enhancement', "enhancement");
            FetchData();
            FetchUsers();
            FetchBranches();
        } catch (error) {
            // alert(error);
            localStorage.setItem('errorlogin', "Email not registered. Contact your administrator!");
        }
    }

    const showModal = (data) => {
        FetchTicketHistories(data.id);
        FetchTicketComments(data.id);
        FetchTicketAttachments(data.id);
        setIsOpen(true);
        data.oldStatus = data.status;
        data.currentUserId = localStorage.getItem("id");
        setTicket(data);
        ticketComment.comment = "";
        ticketComment.ticketId = data.id;
        ticketComment.userId = data.currentUserId;
        if (data.status == 0) {
            setStatusColor("#10B981")
        }
        if (data.status == 1) {
            setStatusColor("#F5A314")
        }
        if (data.status == 2) {
            setStatusColor("#FF0000")
        }
        if (data.status == 3) {
            setStatusColor("#67A8E3")
        }
    };

    const [updatedTicket, setUpdatedTicket] = useState(null);

    const hideModal = () => {
        FetchDataTimer();
        setIsOpen(false);
        setIsOpenComment(false);
        setIsOpenHistory(false);
        setIsOpenCommentAndHistory(false);
        setTicket(initialTicketState);

        // setTicketAttachments([]);
    };
    const setTicketChanges = (_ticket) => {

        const updatedItems = itemsData.map((i) => (i.id === ticket.id ? _ticket : i));

        setItems(updatedItems);
    };

    const showCommentModal = () => {
        setLastTicketStatus(parseInt(ticket.status));
        setIsOpenComment(true);
        setIsOpenCommentAndHistory(true);
    };
    const showHistoryModal = () => {
        setLastTicketStatus(parseInt(ticket.status));
        setIsOpenHistory(true);
        setIsOpenCommentAndHistory(true);
    };

    const showAttachmentModal = () => {
        setIsOpenHistory(true);
        setIsOpenCommentAndHistory(true);
    };


    const BackToTicketView = () => {
        setIsOpenHistory(false);
        setIsOpenComment(false);
        setshowResolution(false);
        setIsOpenCommentAndHistory(false);
        if (lastTicketStatus == 0) {
            setStatusColor("#10B981")
        }
        if (lastTicketStatus == 1) {
            setStatusColor("#F5A314")
        }
        if (lastTicketStatus == 2) {
            setStatusColor("#FF0000")
        }
        if (lastTicketStatus == 3) {
            setStatusColor("#67A8E3")
        }

        setTicket({
            ...ticket,
            status: lastTicketStatus
        });
    };


    // window size
    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Initial Load Data
    useEffect(() => {
        // if (!localStorage.getItem("enhancement")) {
        //     localStorage.clear();
        // }
        if (localStorage.getItem('id') == null) {
            getuserData();
        }
        // setFilter(filter => ({
        //     ...filter,
        //     status: localStorage.getItem('roletext') == 'reporter' ? 4 : 1,
        // }));

        FetchData();
        FetchUsers();
        FetchBranches();
        FetchAppSettings();
    }, []);

    // Check Data

    const [counter, setCounter] = useState(0);
    const [timeStamp, setTimeStamp] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCounter(counter + 1);
            FetchDataTimer();
        }, 10000);

        return () => {
            clearTimeout(timeout);
        };
    }, [counter]);
    // const config = {
    //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    // };

    const axiosInstanceGet = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });
    const FetchDataTimer = () => {

        if (filter.search.length > 3) { return; }
        axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;

        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.ticket.getTickets + (timeStamp === null ? "" : "?_timeStamp=" + timeStamp))
            .then(res => res.data)
            .then(
                (result) => {
                    setisOpenProcessingTable(false);
                    if (result.length > 0) {
                        const lastDate = (result.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))[0]).timeStamp;
                        setTimeStamp(lastDate);

                        const sortedResults = result.sort((a, b) => {
                            if (a.priority !== b.priority) {
                                return b.priority - a.priority;
                            }
                            return new Date(a.timestamp) - new Date(b.timestamp);
                        });
                        setItems(sortedResults);
                        setAllItems(sortedResults);
                        setPages((sortedResults.length / 10))
                    }
                },
                (error) => {

                    if (error.response.status === 401) {
                        getuserData();
                    }
                    setisOpenProcessing(false);
                }
            )

    }
    const FetchAppSettings = () => {

        axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;

        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.appsetting.getAppSettings)
            .then(res => res.data)
            .then(
                (result) => {
                    setisOpenProcessingTable(false);
                    setAppSetting(result);
                },
                (error) => {
                    setisOpenProcessing(false);
                }
            )
    }
    const FetchData = () => {

        axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;

        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.ticket.getTickets + (timeStamp === null ? "" : "?_timeStamp=" + timeStamp.toUTCString()))
            .then(res => res.data)
            .then(
                (result) => {
                    setisOpenProcessingTable(false);
                    if (result.length > 0) {
                        const lastDate = (result.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))[0]).timeStamp;
                        setTimeStamp(lastDate);

                        const sortedResults = result.sort((a, b) => {
                            if (a.priority !== b.priority) {
                                return b.priority - a.priority;
                            }
                            return new Date(a.timestamp) - new Date(b.timestamp);
                        });

                        setItems(sortedResults);
                        setAllItems(sortedResults);
                        setPages((sortedResults.length / 10))
                        // console.log(result);
                    }
                },
                (error) => {
                    if (error.response.status === 401) {
                        getuserData();
                    }
                    setisOpenProcessing(false);
                }
            )
    }

    const FetchDataSearch = (value) => {

        axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;

        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.ticket.getTicketSearch + value)
            .then(res => res.data)
            .then(
                (result) => {
                    setisOpenProcessingTable(false);
                    if (result.length > 0) {
                        const lastDate = (result.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))[0]).timeStamp;
                        setTimeStamp(lastDate);

                        const sortedResults = result.sort((a, b) => {
                            if (a.priority !== b.priority) {
                                return b.priority - a.priority;
                            }
                            return new Date(a.timestamp) - new Date(b.timestamp);
                        });
                        setItems(sortedResults);
                        setAllItems(sortedResults);
                        setPages((sortedResults.length / 10))
                    }
                },
                (error) => {
                    if (error.response.status === 401) {
                        getuserData();
                    }
                    setisOpenProcessing(false);
                }
            )
    }

    const FetchBranches = () => {
        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.branch.getBranches)
            .then(res => res.data)
            .then(
                (result) => {
                    setBranches(result);
                },
                (error) => {
                }
            )
    }
    const FetchTicketHistories = (id) => {
        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.ticket.getTicketHistoriesById + id)
            .then(res => res.data)
            .then(
                (result) => {
                    setTicketHistories(result);
                    setisOpenProcessingTable(false);
                },
                (error) => {
                    setisOpenProcessing(false);
                }
            )
    }

    const FetchTicketComments = (id) => {
        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.ticket.getTicketCommentsById + id)
            .then(res => res.data)
            .then(
                (result) => {
                    setTicketComments(result);
                    setisOpenProcessingTable(false);
                },
                (error) => {
                    setisOpenProcessing(false);
                }
            )
    }

    const FetchTicketAttachments = (id) => {
        setisOpenProcessingTable(true);
        setisOpenProcessing(true);
        axiosInstanceGet.get(APIURLS.ticket.getTicketAttachmentById + id)
            .then(res => res.data)
            .then(
                (result) => {
                    setTicketAttachments(result);
                    setisOpenProcessing(false);
                    setisOpenProcessingTable(false);
                },
                (error) => {
                    setisOpenProcessing(false);
                    setisOpenProcessing(false);
                }
            )
    }

    const FetchUsers = () => {
        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.user.getUsers)
            .then(res => res.data)
            .then(
                (result) => {
                    setUsers(result);
                    setisOpenProcessingTable(false);
                },
                (error) => {

                }
            )
    }


    const UpdateTicket = (e) => {
        if (isOpenProcessing) {
            return;
        }

        if (!resolution && e.target.id === "resolution") {
            return;
        }
        ticket.resolution = resolution;
        if (showResolution) {
            ticket.status = 0;
        }
        if (ticket.description == "") {
            setisShowDescriptionError("block")
            return;
        }
        else {

            setisShowDescriptionError("none")
        }
        e.preventDefault();
        setisOpenProcessing(true);
        ticket.file = [];
        axiosInstanceGet.post(APIURLS.ticket.updateTicket, ticket)
            .then(
                (result) => {
                    setIsOpen(false);
                    window.location.reload(false);
                },
                (error) => {
                    alert(error);
                    setisOpenProcessing(false);
                }
            );
    }


    const handleFileChange = (filespick) => {
        setSelectedFiles(filespick);
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

    const addTicketComment = (e) => {
        e.preventDefault();
        if (isOpenProcessing) {
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
        formData.append('ticketId', ticketComment.ticketId.toString());
        formData.append('userId', ticketComment.userId.toString());
        // ... append other fields as needed ...


        setisOpenProcessing(true);
        axiosInstanceGet.post(APIURLS.ticket.saveTicketComment, formData)
            .then(
                (result) => {
                    result.data.userFullName = localStorage.getItem("fullname");
                    result.files = selectedFiles;
                    setTicketComments([...ticketComments, result.data]);
                    ticketComment.comment = "";
                    setisOpenProcessing(false);

                    // Reset the file input to its natural state
                    if (document.getElementById("attachment")) {
                        document.getElementById("attachment").value = '';
                    }

                    // Clear the selected files after submission
                    setSelectedFiles([]);

                    FetchTicketComments(ticket.id);
                },
                (error) => {
                    setisOpenProcessing(false);
                }
            );
    }

    const onChange = (e) => {

        setTicket({
            ...ticket,
            [e.target.name]: e.target.value
        });
    };

    const onChangeTicketComment = (e) => {

        setTicketComment({
            ...ticketComment,
            [e.target.name]: e.target.value
        });
    };

    const ChangeStatusFilter = (e) => {

        setFilter(filter => ({
            ...filter,
            status: parseInt(e.target.value)
        }));


        // setItems(allitemsData);
        // if (parseInt(e.target.value) == 4) {
        //     setItems(allitemsData);
        // }
        // else {
        //     const filter = allitemsData.filter(item => item.status == parseInt(e.target.value));
        //     setItems(filter);
        // }

    };

    const onChangeSelect = (e) => {

        setLastTicketStatus(parseInt(ticket.status));
        if (e.target.name == "status") {
            if (parseInt(e.target.value) == 0) {
                setshowResolution(true);
                setIsOpenCommentAndHistory(true);
            }
            else {

                if (parseInt(e.target.value) == 0) {
                    setStatusColor("#10B981")
                }
                if (parseInt(e.target.value) == 1) {
                    setStatusColor("#F5A314")
                }
                if (parseInt(e.target.value) == 2) {
                    setStatusColor("#FF0000")
                }
                if (parseInt(e.target.value) == 3) {
                    setStatusColor("#67A8E3")
                }
            }
        }
        setTicket({
            ...ticket,
            [e.target.name]: parseInt(e.target.value)
        });
    };
    const onChangeResolution = (e) => {
        setResolution(e.target.value);
    };

    const componentStyle = {
        height: "100%",
        backgroundColor: "transparent"
    };
    const headerStyle = {
        fontSize: "25px",
        fontWeight: "bold",
        textDecoration: "underline",
        fontFamily: "sans-serif",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "20px"
    };
    const h2Style = {
        fontSize: "20px",
        fontWeight: "bold",
        fontFamily: "sans-serif",
        paddingLeft: "20px",
        paddingRight: "20px"
    };

    const useSortableData = (items, config = null) => {
        const [sortConfig, setSortConfig] = React.useState(config);

        const sortedItems = React.useMemo(() => {
            let sortableItems = [...items];
            if (sortConfig !== null) {
                sortableItems.sort((a, b) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }
            return sortableItems;
        }, [items, sortConfig]);

        const requestSort = (key) => {
            let direction = 'ascending';
            if (
                sortConfig &&
                sortConfig.key === key &&
                sortConfig.direction === 'ascending'
            ) {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        };

        return { items: sortedItems, requestSort, sortConfig };
    };

    const { items, requestSort, sortConfig } = useSortableData(itemsData);

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    const TicketSearch = event => {

        setFilter(filter => ({
            ...filter,
            search: event.target.value
        }));

        if (event.target.value.length > 3) {
            FetchDataSearch(event.target.value);
        }
        // setItems(allitemsData);
        // if (event.target.value !== '') {
        //     const searchres = allitemsData.filter(item => item.ticketNumber.toLowerCase().includes(event.target.value.toLowerCase()));
        //     setItems(searchres);
        // }
        // else { setItems(allitemsData); }

    };

    const badgeStatus = (name) => {
        var statusname = 'success';
        var size = isSmallScreen ? "16vw" : "";
        var sizeLongText = isSmallScreen ? "18vw" : "";
        var sizeLonglongText = isSmallScreen ? "23vw" : "";
        if (name == 0) {
            statusname = 'success'
            return <div className="dot-container-done">Done</div>
        }
        else if (name == 1) {
            statusname = 'secondary'
            return <div className="dot-container-open">Open</div>
        }
        else if (name == 2) {
            statusname = 'secondary'
            return <div className="dot-container-onhold">On Hold</div>
        }
        else if (name == 3) {
            statusname = 'primary'
            return <div className="dot-container-inprogress">In Progress</div>
        }

    };


    const handleRatingChange = (newRating, item) => {

        const role = parseInt(localStorage.getItem("id"));
        if (role === item.reporterId) {

            const updatedItems = itemsData.map((i) => (i.id === item.id ? { ...i, starRate: newRating } : i));
            setItems(updatedItems);
            axiosInstanceGet.post(APIURLS.ticket.saveStarRating + "ticketId=" + item.id + "&star=" + newRating);
        }
    };

    const [hoveredRow, setHoveredRow] = useState(null);

    const handleMouseEnter = (rowId) => {
        setHoveredRow(rowId);
    };

    const handleMouseLeave = () => {
        setHoveredRow(null);
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

    const getTicketList = () => {
        if (localStorage.getItem("role") == 1) {
            return (
                items.filter
                    (x =>
                        (filter.status.length === 0 || filter.status.some(option => option.value === 4) ? true :
                            (
                                filter.status.some(option => option.value === x.status)
                            )
                        ) &&
                        (filter.search !== "" ? x.ticketNumber && x.ticketNumber.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || (x.title && x.title.toLowerCase().includes(filter.search && filter.search.toLowerCase()))
                            || x.description && x.description.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.branchName && x.branchName.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.reporterText && x.reporterText.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            : true) &&
                        (filter.userOption.length === 0 || filter.userOption.some(option => option.value === 'ALL') ? true :
                            // (
                            //     filter.userOption.some(option => option.value === 'CurrentUser') &&
                            //     (x.assigneeId === localStorage.getItem('id'))
                            // )
                            // ||
                            (
                                filter.userOption.some(option => option.value === 'Unassigned') &&
                                (x.assigneeId === null)
                            )
                            ||
                            (
                                filter.userOption.some(option => option.value && option.value === x.assigneeId)
                            )
                        ) &&
                        (filter.branches.length === 0 || filter.branches.some(branch => branch.value === 'ALL') ? true :
                            (
                                filter.branches.some(branch => branch.value === 'Unassigned') &&
                                (x.branchId === null)
                            )
                            ||
                            (
                                filter.branches.some(branch => branch.value && branch.value === x.branchId)
                            )
                        ) &&
                        (filter.priority.length === 0 ? true :
                            (
                                filter.priority.some(option => option.value === x.priority)
                            )
                        )
                    )
                    .slice(0, 100)
                    .map((item) => {
                        return (
                            <tr key={item.id} onClick={hoveredRow === null ? () => showModal(item) : undefined}>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }} onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
                                    <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} />
                                    {item.ticketNumber}
                                </td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.calledInText}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                    <div style={{ backgroundColor: setSeverity(item.calledIn, new Date()), padding: "8px", borderRadius: "8px" }}> {item.status === 0 ? formatTimeDifference(item.timeStamp, item.calledIn) : formatTimeDifference(new Date(), item.calledIn)}</div>
                                </td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.title}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getBranch(item.branchId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getUser(item.reporterId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getUser(item.assigneeId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.priorityName}</td>

                                <td style={{ textAlign: "center" }} >
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',  // Ensure horizontal centering
                                        }}
                                    >
                                        <div style={{ display: "inline-block", marginRight: "5px" }}>
                                            {badgeStatus(item.status)}
                                        </div>

                                        {item.statusName === 'Done' && (
                                            <>
                                                <span style={{ color: item.starRate !== 0 ? '#ffd700' : '#ccc', marginLeft: '5px', fontSize: '24px' }}>★</span> {item.starRate}
                                            </>
                                        )}

                                        {/* {hoveredRow === item.id && item.statusName === 'Done' && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '0',
                                                    left: '0%',
                                                    transform: 'translateY(-50%)',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                                                    padding: '10px',
                                                    zIndex: 1,
                                                    borderRadius: '5px',
                                                    fontSize: '14px',
                                                    color: '#333',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Rate Me!
                                                <StarRating
                                                    value={item.starRate}
                                                    mobile={isSmallScreen}
                                                    onChange={(newRating) => handleRatingChange(newRating, item)}
                                                />
                                            </div>
                                        )} */}
                                    </div>
                                </td>


                                {/* <td><Button style={{ width: "72px", height: "25px", border: "1px solid #EDEDED", color: "#A4AEB7", padding: "0px", borderRadius: "15px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px" }} variant="outline-secondary" onClick={() => showModal(item)} >View</Button></td> */}
                            </tr>
                        )
                    }))
        }
        else if (localStorage.getItem("role") == 2) {
            return (
                items.filter
                    (x =>
                        (filter.status.length === 0 || filter.status.some(option => option.value === 4) ? true :
                            (
                                filter.status.some(option => option.value === x.status)
                            )
                        ) &&
                        (filter.search !== "" ? x.ticketNumber && x.ticketNumber.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || (x.title && x.title.toLowerCase().includes(filter.search && filter.search.toLowerCase()))
                            || x.description && x.description.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.branchName && x.branchName.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.reporterText && x.reporterText.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            : true) &&
                        (filter.userOption.length === 0 || filter.userOption.some(option => option.value === 'ALL') ? true :
                            // (
                            //     filter.userOption.some(option => option.value === 'CurrentUser') &&
                            //     (x.assigneeId === localStorage.getItem('id'))
                            // )
                            // ||
                            (
                                filter.userOption.some(option => option.value === 'Unassigned') &&
                                (x.assigneeId === null)
                            )
                            ||
                            (
                                filter.userOption.some(option => option.value && option.value === x.assigneeId)
                            )
                        ) &&
                        (filter.priority.length === 0 ? true :
                            (
                                filter.priority.some(option => option.value === x.priority)
                            )
                        ) &&
                        (x.reporterId === parseInt(localStorage.getItem('id')))
                    )
                    .slice(0, 100)
                    .map((item) => {
                        return (
                            <tr key={item.id} onClick={hoveredRow === null ? () => showModal(item) : undefined}>

                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }} onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
                                    {/* <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}> */}
                                    <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} />
                                    {item.ticketNumber}
                                </td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.calledInText}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                    <div style={{ backgroundColor: setSeverity(item.calledIn, new Date()), padding: "8px", borderRadius: "8px" }}> {item.status === 0 ? formatTimeDifference(item.timeStamp, item.calledIn) : formatTimeDifference(new Date(), item.calledIn)}</div>
                                </td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.title}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getBranch(item.branchId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getUser(item.reporterId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getUser(item.assigneeId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.priorityName}</td>

                                <td style={{ textAlign: "center" }} onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',  // Ensure horizontal centering
                                        }}
                                    >
                                        <div style={{ display: "inline-block", marginRight: "5px" }}>
                                            {badgeStatus(item.status)}
                                        </div>

                                        {item.statusName === 'Done' && (
                                            <>
                                                <span style={{ color: item.starRate !== 0 ? '#ffd700' : '#ccc', marginLeft: '5px', fontSize: '24px' }}>★</span> {item.starRate}
                                            </>
                                        )}

                                        {hoveredRow === item.id && item.statusName === 'Done' && parseInt(item.reporterId) === parseInt(localStorage.getItem('id')) && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '0',
                                                    left: '0%',
                                                    transform: 'translateY(-50%)',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                                                    padding: '10px',
                                                    zIndex: 1,
                                                    borderRadius: '5px',
                                                    fontSize: '14px',
                                                    color: '#333',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Rate Me!
                                                <StarRating
                                                    value={item.starRate}
                                                    mobile={isSmallScreen}
                                                    onChange={(newRating) => handleRatingChange(newRating, item)}
                                                    ticketuserId={item.reporterId}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* <td><Button style={{ width: "72px", height: "25px", border: "1px solid #EDEDED", color: "#A4AEB7", padding: "0px", borderRadius: "15px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px" }} variant="outline-secondary" onClick={() => showModal(item)} >View</Button></td> */}
                            </tr>
                        )
                    }))
        }
        else {
            return (

                items.filter
                    (x =>
                        (filter.status.length === 0 || filter.status.some(option => option.value === 4) ? true :
                            (
                                filter.status.some(option => option.value === x.status)
                            )
                        ) &&
                        (filter.search !== "" ? x.ticketNumber && x.ticketNumber.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || (x.title && x.title.toLowerCase().includes(filter.search && filter.search.toLowerCase()))
                            || x.description && x.description.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.branchName && x.branchName.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.reporterText && x.reporterText.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            : true) &&
                        (filter.userOption.length === 0 || filter.userOption.some(option => option.value === 'ALL') ? true :
                            (
                                filter.userOption.some(option => option.value === 'Unassigned') &&
                                (x.assigneeId === null)
                            )
                            ||
                            (
                                filter.userOption.some(option => option.value && option.value === x.assigneeId)
                            )
                        ) &&
                        (filter.branches.length === 0 || filter.branches.some(branch => branch.value === 'ALL') ? true :
                            (
                                filter.branches.some(branch => branch.value === 'Unassigned') &&
                                (x.branchId === null)
                            )
                            ||
                            (
                                filter.branches.some(branch => branch.value && branch.value === x.branchId)
                            )
                        ) &&
                        (filter.priority.length === 0 ? true :
                            (
                                filter.priority.some(option => option.value === x.priority)
                            )
                        )
                    )
                    .slice(0, 100)
                    .map((item) => {
                        return (
                            <tr key={item.id} onClick={hoveredRow === null ? () => showModal(item) : undefined}>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }} onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
                                    <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} />
                                    {item.ticketNumber}
                                </td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.calledInText}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                    <div style={{ backgroundColor: setSeverity(item.calledIn, new Date()), padding: "8px", borderRadius: "8px" }}> {item.status === 0 ? formatTimeDifference(item.timeStamp, item.calledIn) : formatTimeDifference(new Date(), item.calledIn)}</div>
                                </td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.title}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getBranch(item.branchId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getUser(item.reporterId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getUser(item.assigneeId)}</td>
                                <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.priorityName}</td>

                                <td style={{ textAlign: "center" }} onMouseEnter={() => handleMouseEnter(item.id)} onMouseLeave={handleMouseLeave}>
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',  // Ensure horizontal centering
                                        }}
                                    >
                                        <div style={{ display: "inline-block", marginRight: "5px" }}>
                                            {badgeStatus(item.status)}
                                        </div>

                                        {item.statusName === 'Done' && (
                                            <>
                                                <span style={{ color: item.starRate !== 0 ? '#ffd700' : '#ccc', marginLeft: '5px', fontSize: '24px' }}>★</span> {item.starRate}
                                            </>
                                        )}

                                        {hoveredRow === item.id && item.statusName === 'Done' && parseInt(item.reporterId) === parseInt(localStorage.getItem('id')) && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '0',
                                                    left: '0%',
                                                    transform: 'translateY(-50%)',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                                                    padding: '10px',
                                                    zIndex: 1,
                                                    borderRadius: '5px',
                                                    fontSize: '14px',
                                                    color: '#333',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Rate Me!
                                                <StarRating
                                                    value={item.starRate}
                                                    mobile={isSmallScreen}
                                                    onChange={(newRating) => handleRatingChange(newRating, item)}
                                                    ticketuserId={item.reporterId}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* <td><Button style={{ width: "72px", height: "25px", border: "1px solid #EDEDED", color: "#A4AEB7", padding: "0px", borderRadius: "15px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px" }} variant="outline-secondary" onClick={() => showModal(item)} >View</Button></td> */}
                            </tr>
                        )
                    }))
        }

    };
    const getTicketList2 = () => {
        if (localStorage.getItem("role") == 1) {
            return (
                items.filter
                    (x =>
                        (filter.status.length === 0 || filter.status.some(option => option.value === 4) ? true :
                            (
                                filter.status.some(option => option.value === x.status)
                            )
                        ) &&
                        (filter.search !== "" ? x.ticketNumber && x.ticketNumber.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || (x.title && x.title.toLowerCase().includes(filter.search && filter.search.toLowerCase()))
                            || x.description && x.description.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.branchName && x.branchName.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.reporterText && x.reporterText.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            : true) &&
                        (filter.userOption.length === 0 || filter.userOption.some(option => option.value === 'ALL') ? true :
                            // (
                            //     filter.userOption.some(option => option.value === 'CurrentUser') &&
                            //     (x.assigneeId === localStorage.getItem('id'))
                            // )
                            // ||
                            (
                                filter.userOption.some(option => option.value === 'Unassigned') &&
                                (x.assigneeId === null)
                            )
                            ||
                            (
                                filter.userOption.some(option => option.value && option.value === x.assigneeId)
                            )
                        ) &&
                        (filter.branches.length === 0 || filter.branches.some(branch => branch.value === 'ALL') ? true :
                            (
                                filter.branches.some(branch => branch.value === 'Unassigned') &&
                                (x.branchId === null)
                            )
                            ||
                            (
                                filter.branches.some(branch => branch.value && branch.value === x.branchId)
                            )
                        )
                    )
                    .slice(0, 100)
                    .map((item) => {
                        return (
                            <tr key={item.id} onClick={() => showModal(item)}>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                    {/* <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} /> */}
                                    {item.ticketNumber}
                                </td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.calledInText}</td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.title}</td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getBranch(item.branchId)}</td>
                            </tr>
                        )
                    }))
        }
        else if (localStorage.getItem("role") == 2) {
            return (
                items.filter
                    (x =>
                        (filter.status.length === 0 || filter.status.some(option => option.value === 4) ? true :
                            (
                                filter.status.some(option => option.value === x.status)
                            )
                        ) &&
                        (filter.search !== "" ? x.ticketNumber && x.ticketNumber.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || (x.title && x.title.toLowerCase().includes(filter.search && filter.search.toLowerCase()))
                            || x.description && x.description.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.branchName && x.branchName.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.reporterText && x.reporterText.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            : true) &&
                        (filter.userOption.length === 0 || filter.userOption.some(option => option.value === 'ALL') ? true :
                            // (
                            //     filter.userOption.some(option => option.value === 'CurrentUser') &&
                            //     (x.assigneeId === localStorage.getItem('id'))
                            // )
                            // ||
                            (
                                filter.userOption.some(option => option.value === 'Unassigned') &&
                                (x.assigneeId === null)
                            )
                            ||
                            (
                                filter.userOption.some(option => option.value && option.value === x.assigneeId)
                            )
                        ) &&
                        (x.reporterId === parseInt(localStorage.getItem('id')))
                    )
                    .slice(0, 100)
                    .map((item) => {
                        return (
                            <tr key={item.id} onClick={() => showModal(item)}>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                    {/* <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} /> */}
                                    {item.ticketNumber}
                                </td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.calledInText}</td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.title}</td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getBranch(item.branchId)}</td>
                            </tr>
                        )
                    }))
        }
        else {
            return (

                items.filter
                    (x =>
                        (filter.status.length === 0 || filter.status.some(option => option.value === 4) ? true :
                            (
                                filter.status.some(option => option.value === x.status)
                            )
                        ) &&
                        (filter.search !== "" ? x.ticketNumber && x.ticketNumber.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || (x.title && x.title.toLowerCase().includes(filter.search && filter.search.toLowerCase()))
                            || x.description && x.description.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.branchName && x.branchName.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            || x.reporterText && x.reporterText.toLowerCase().includes(filter.search && filter.search.toLowerCase())
                            : true) &&
                        (filter.userOption.length === 0 || filter.userOption.some(option => option.value === 'ALL') ? true :
                            (
                                filter.userOption.some(option => option.value === 'Unassigned') &&
                                (x.assigneeId === null)
                            )
                            ||
                            (
                                filter.userOption.some(option => option.value && option.value === x.assigneeId)
                            )
                        ) &&
                        (filter.branches.length === 0 || filter.branches.some(branch => branch.value === 'ALL') ? true :
                            (
                                filter.branches.some(branch => branch.value === 'Unassigned') &&
                                (x.branchId === null)
                            )
                            ||
                            (
                                filter.branches.some(branch => branch.value && branch.value === x.branchId)
                            )
                        )
                    )
                    .slice(0, 100)
                    .map((item) => {
                        return (
                            <tr key={item.id} onClick={() => showModal(item)}>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                    {/* <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} /> */}
                                    {item.ticketNumber}
                                </td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.calledInText}</td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.title}</td>
                                <td style={{ color: "##000000", fontSize: "2.5vw", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{getBranch(item.branchId)}</td>
                            </tr>
                        )
                    }))
        }

    };

    const getUser = (id) => {
        const reporter = users.find(x => x.id == id);
        if (reporter == undefined) { return "Unassigned"; }
        else { return reporter.fullName; }

    };
    const getBranch = (id) => {
        const branch = branches.find(x => x.id == id);
        if (branch == undefined) { return "Unassigned"; }
        else { return branch.name; }

    };

    const handleNotificationClick = async (tickeNum) => {
        showModal(await GetTicket(tickeNum));
    };

    const GetTicket = async (ticketNum) => {
        try {
            axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;

            const response = await axiosInstanceGet.get(APIURLS.ticket.getTicketNum + ticketNum);
            return response.data;
        } catch (error) {
            // Handle the error as needed
            return null;
        }
    };


    if (isSmallScreen) {
        return (

            <div>
                <div style={componentStyle}>
                    <div style={{ paddingTop: "12px", paddingBottom: "6px", marginBottom: "20px", borderBottom: "solid 1px black" }}>

                        <div style={{ textAlign: "right" }}>

                            <NotificationBell onNotificationClick={handleNotificationClick} />
                        </div>
                        <div className="d-flex flex-row">
                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "8px" }}>Ticket:</div>
                            <div className="p-2" style={{ width: "100%" }}>
                                <Input
                                    type="text"
                                    onChange={TicketSearch}
                                    className="searchname"
                                    style={{ fontSize: "3vw" }}
                                /></div>
                        </div>
                        <div className="d-flex flex-row">

                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "8px" }}>Status:</div>
                            <div className="p-2" style={{ width: "100%" }}>

                                <Select isMulti options={StatusList}
                                    onChange={onChangeStatusFilter}
                                    value={filter.status}
                                />

                            </div>
                        </div>
                        <div className="d-flex flex-row">
                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "10px", display: localStorage.getItem("roletext") === "reporter" ? "none" : "inline" }}>Assignee:</div>
                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "px", width: "300px", width: "100%", display: localStorage.getItem("roletext") === "reporter" ? "none" : "inline" }}>

                                <Select isMulti options={AssigneeList}
                                    onChange={onChangeUserFilter}
                                />
                            </div>
                        </div>
                        <div className="d-flex flex-row">
                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "10px", display: localStorage.getItem("roletext") === "reporter" ? "none" : "inline" }}>Branch:</div>
                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "px", width: "300px", width: "100%", display: localStorage.getItem("roletext") === "reporter" ? "none" : "inline" }}>
                                <Select isMulti options={BranchList} onChange={onChangeBranchFilter} />
                            </div>
                        </div>

                        <div className="d-flex flex-row">
                            <div className="p-2" style={{ fontSize: "3vw", marginTop: "8px" }}>Priority:</div>
                            <div className="p-2" style={{ width: "100%" }}>

                                <Select isMulti options={PriorityList}
                                    onChange={onChangePriorityFilter}
                                    value={filter.priority}
                                />

                            </div>
                        </div>
                    </div>

                    <div>
                        {/* <Table responsive>
                            <thead>
                                <tr style={{ backgroundColor: "white" }}>
                                    <th style={{ minWidth: "160px" }}>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "3.5vw", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('ticketNumber')}
                                            className={getClassNamesFor('ticketNumber')}
                                        >
                                            Ticket
                                        </Button>
                                    </th>
                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "3.5vw", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('id')}
                                            className={getClassNamesFor('id')}
                                        >
                                            Date
                                        </Button>
                                    </th>
                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "3.5vw", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('title')}
                                            className={getClassNamesFor('title')}
                                        >
                                            Title
                                        </Button>
                                    </th>

                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "3.5vw", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('branchName')}
                                            className={getClassNamesFor('branchName')}
                                        >
                                            Sections
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {getTicketList2()}
                            </tbody>

                        </Table> */}
                        <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                            <Table responsive hover style={{ tableLayout: 'fixed', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("ticketNumber")}
                                                className={getClassNamesFor("ticketNumber")}
                                            >
                                                Ticket ID
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("id")}
                                                className={getClassNamesFor("id")}
                                            >
                                                Called In
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "200px", width: "200px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("id")}
                                                className={getClassNamesFor("id")}
                                            >
                                                Elapsed Duration from Called In
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "200px", width: "200px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("title")}
                                                className={getClassNamesFor("title")}
                                            >
                                                Title
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("branchName")}
                                                className={getClassNamesFor("branchName")}
                                            >
                                                Branch
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("reporterText")}
                                                className={getClassNamesFor("reporterText")}
                                            >
                                                Reporter
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("assigneeText")}
                                                className={getClassNamesFor("assigneeText")}
                                            >
                                                Assignee
                                            </Button>
                                        </th>

                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("priority")}
                                                className={getClassNamesFor("priority")}
                                            >
                                                Priority
                                            </Button>
                                        </th>
                                        <th style={{ minWidth: "160px", width: "160px" }}>
                                            <Button
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: "#3B82F6",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    letterSpacing: "1px",
                                                }}
                                                size="lg"
                                                type="button"
                                                onClick={() => requestSort("statusName")}
                                                className={getClassNamesFor("statusName")}
                                            >
                                                Status
                                            </Button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{getTicketList()}</tbody>
                            </Table>
                        </div>

                        {isOpenProcessingTable ? <LoadingSpinner /> : <div />}
                    </div>
                </div>
                <>
                    <ViewTicket openModal={isOpen} onHide={hideModal} _ticketNum={ticket.ticketNumber} _ticket={ticket} _users={users} _branches={branches}
                        _ticketChanges={setTicketChanges} />

                </>

            </div>
        )
    }
    else {
        return (

            <div>
                <div style={componentStyle}>
                    {/* <div style={{ paddingTop: "20px", paddingBottom: "10px", marginBottom: "20px", display: 'flex', alignItems: 'center', borderBottom: "solid 1px black" }}> */}
                    {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="p-2" style={{ fontSize: "18px", marginTop: "6px" }}>Search Ticket ID:</div>
                            <div className="p-2">
                                <Input
                                    type="text"
                                    onChange={TicketSearch}
                                    className="searchname"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: "30px" }}>
                            <div className="p-2" style={{ fontSize: "18px", marginTop: "6px" }}>Status:</div>
                            <div className="p-2" style={{ fontSize: "18px", marginTop: "px", width: "300px" }}>
                                <Select isMulti options={StatusList} onChange={onChangeStatusFilter} value={filter.status} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: "30px", display: localStorage.getItem("roletext") === "reporter" ? "none" : "flex" }}>
                            <div className="p-2" style={{ fontSize: "18px", marginTop: "6px" }}>Assignee:</div>
                            <div className="p-2" style={{ fontSize: "18px", marginTop: "px", width: "350px" }}>
                                <Select isMulti options={AssigneeList} onChange={onChangeUserFilter} />
                            </div>
                        </div> */}
                    {/* <div style={{ marginLeft: "auto" }}>
                            <NotificationBell />
                        </div> */}
                    {/* </div> */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', paddingTop: "20px", paddingBottom: "10px", marginBottom: "20px", display: 'flex', alignItems: 'center', borderBottom: "solid 1px black" }}>
                        <div style={{ flex: '1 0 10%', marginRight: '10px', textAlign: 'left' }}>
                            <label htmlFor="searchname">Search Ticket ID:</label>
                            <br />
                            {/* <input type="text" id="first-name" name="first-name" style={{ width: '100%', padding: '5px' }} /> */}
                            <Input
                                type="text"
                                onChange={TicketSearch}
                                className="searchname"
                            />
                        </div>
                        <div style={{ flex: '1 0 10%', marginRight: '10px', textAlign: 'left' }}>
                            <label htmlFor="status">Status:</label>
                            <br />
                            {/* <input type="text" id="middle-name" name="middle-name" style={{ width: '100%', padding: '5px' }} /> */}
                            <Select isMulti options={StatusList} onChange={onChangeStatusFilter} value={filter.status} />
                        </div>
                        <div style={{ flex: '1 0 10%', marginRight: '10px', textAlign: 'left', display: localStorage.getItem("roletext") === "reporter" ? "none" : "inline" }}>
                            <label htmlFor="assignee">Assignee:</label>
                            <br />
                            {/* <input type="text" id="last-name" name="last-name" style={{ width: '100%', padding: '5px' }} /> */}
                            <Select isMulti options={AssigneeList} onChange={onChangeUserFilter} />
                        </div>
                        <div style={{ flex: '1 0 10%', marginRight: '10px', textAlign: 'left', display: localStorage.getItem("roletext") === "reporter" ? "none" : "inline" }}>
                            <label htmlFor="branch">Branch:</label>
                            <br />
                            {/* <input type="text" id="last-name" name="last-name" style={{ width: '100%', padding: '5px' }} /> */}
                            <Select isMulti options={BranchList} onChange={onChangeBranchFilter} />
                        </div>
                        <div style={{ flex: '1 0 10%', textAlign: 'left' }}>
                            <label htmlFor="status">Priority:</label>
                            <br />
                            {/* <input type="text" id="middle-name" name="middle-name" style={{ width: '100%', padding: '5px' }} /> */}
                            <Select isMulti options={PriorityList} onChange={onChangePriorityFilter} value={filter.priority} />
                        </div>
                        <div style={{ flex: '1 0 25%', textAlign: 'right' }}>
                            <NotificationBell onNotificationClick={handleNotificationClick} />
                        </div>
                    </div>

                    <div>
                        <Table responsive hover >
                            <thead>
                                <tr>
                                    <th style={{ minWidth: "160px" }}>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('ticketNumber')}
                                            className={getClassNamesFor('ticketNumber')}
                                        >
                                            Ticket ID
                                        </Button>
                                    </th>
                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('id')}
                                            className={getClassNamesFor('id')}
                                        >
                                            Called In
                                        </Button>
                                    </th>
                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('id')}
                                            className={getClassNamesFor('id')}
                                        >
                                            Elapsed Duration from Called In
                                        </Button>
                                    </th>
                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('title')}
                                            className={getClassNamesFor('title')}
                                        >
                                            Title
                                        </Button>
                                    </th>
                                    {/* <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('description')}
                                            className={getClassNamesFor('description')}
                                        >
                                            Description
                                        </Button>
                                    </th> */}

                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('branchName')}
                                            className={getClassNamesFor('branchName')}
                                        >
                                            Branch
                                        </Button>
                                    </th>


                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('reporterText')}
                                            className={getClassNamesFor('reporterText')}
                                        >
                                            Reporter
                                        </Button>
                                    </th>

                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('assigneeText')}
                                            className={getClassNamesFor('assigneeText')}
                                        >
                                            Assignee
                                        </Button>
                                    </th>

                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('priority')}
                                            className={getClassNamesFor('priority')}
                                        >
                                            Priority
                                        </Button>
                                    </th>
                                    <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('statusName')}
                                            className={getClassNamesFor('statusName')}
                                        >
                                            Status
                                        </Button>
                                    </th>

                                    {/* <th>
                                        <Button
                                            style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                            size="lg"
                                            type="button"
                                            onClick={() => requestSort('action')}
                                            className={getClassNamesFor('action')}
                                        >
                                            Action
                                        </Button>
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {getTicketList()}
                            </tbody>
                        </Table>

                        {isOpenProcessingTable ? <LoadingSpinner /> : <div />}

                    </div>
                </div>
                <>
                    <ViewTicket
                        style={{ transform: 'scale(0.5)' }}
                        openModal={isOpen}
                        onHide={hideModal}
                        _ticketNum={ticket.ticketNumber}
                        _ticket={ticket}
                        _users={users}
                        _branches={branches}
                        _ticketChanges={setTicketChanges}
                    />
                </>
            </div>
        )
    }
}

export default TicketList