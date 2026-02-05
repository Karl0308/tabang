import React, { Component, useState, useEffect, Children } from "react";
import ReactDOM from 'react-dom/client';
import { Container, Row, Col, Input, Label, Table } from "reactstrap";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingSpinner from "./LoadingSpinner";
import { APIURLS } from "./APIURLS";
import FlyingMessage from "./components/FlyingMessage"
import PDFExport from "./components/PDFExport";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from "react-qr-code";
import CopyButton from "./components/CopyButton";

const OvertimeList = () => {

    const GroupInitialState = {
        id: 0,
        name: '',
        departmentId: 0,
        departmentName: '',
        members: []
    };
    const [group, setGroup] = useState(GroupInitialState);
    const [users, setUsers] = useState([]);
    const [itemsData, setItems] = useState([]);
    const [allitemsData, setallItems] = useState([]);
    const [isOpenProcessingTable, setisOpenProcessingTable] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
    const [save, setSave] = useState(false);
    const [data, setData] = useState(GroupInitialState);


    const componentStyle = {
        height: "100%",
        backgroundColor: "transparent"
    };

    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const UpdateOvertime = (data, approve) => {
        if (isOpenProcessingTable) {
            return;
        }

        setisOpenProcessingTable(true);

        axiosInstance.post(APIURLS.overtime.approveOvertime() + "userId=" + localStorage.getItem("id") + "&isApprove=" + approve + "&overtimeId=" + data.id)
            .then(res => res.data)
            .then(
                (result) => {
                    FetchData();
                },
                (error) => {
                    alert(error);
                }
            )
    };

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const FetchData = () => {
        setisOpenProcessingTable(true);
        axiosInstance.get(APIURLS.overtime.getOvertimes() + localStorage.getItem("id"))
            .then(res => res.data)
            .then(
                (result) => {
                    setItems(result);
                    setallItems(result);
                    setisOpenProcessingTable(false);
                },
                (error) => {
                    alert(error);
                }
            )
    }

    useEffect(() => {
        FetchData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.userFullName !== undefined) { viewLeave(); }
        }, 1000);

        return () => clearTimeout(timer);
    }, [data]);

    const GroupSearch = event => {
        setItems(allitemsData);
        if (event.target.value !== '') {
            const searchres = allitemsData.filter(item => item.userFullName.toLowerCase().includes(event.target.value.toLowerCase()));
            setItems(searchres);
        }
        else { setItems(allitemsData); }
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

    const onChangeUserSelect = (event) => {
    };
    const addMember = () => {

    };


    const handleRemoveUser = (id) => {


    };

    const handleSupervisorChange = (id) => {


    };

    const calculateTime = (from, to) => {
        const currentDate = new Date(from);
        const creationDate = new Date(to);

        const differenceInMilliseconds = Math.abs(creationDate - currentDate);

        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const remainingHours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const formattedHours = remainingHours.toString().padStart(2, '0');
        const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
        return days.toString() + "d " + formattedHours.toString() + ":" + formattedMinutes.toString() + "hh:mm";
    };

    const supervisorStatus = (approval) => {
        if (approval == 0) {
            return <Button style={{ fontSize: "10px", margin: "2px" }} variant="secondary" disabled>Pending</Button>
        }
        else if (approval == 1) {
            return <Button style={{ fontSize: "10px", margin: "2px" }} variant="warning" disabled>Approved</Button>
        }
        else if (approval == 2) {
            return <Button style={{ fontSize: "10px", margin: "2px" }} variant="danger" disabled>Declined</Button>
        }
    };
    const headStatus = (approval) => {
        if (approval == 0) {
            return <Button style={{ fontSize: "10px", margin: "2px" }} variant="secondary" disabled>Pending</Button>
        }
        else if (approval == 1) {
            return <Button style={{ fontSize: "10px", margin: "2px" }} variant="success" disabled>Approved</Button>
        }
        else if (approval == 2) {
            return <Button style={{ fontSize: "10px", margin: "2px" }} variant="danger" disabled>Declined</Button>
        }
    };

    const getSignatures = (data) => {
        axiosInstance.get(APIURLS.user.getUsersSignatureOvertime + data.id)
            .then(res => {
                const signatures = res.data;
                const promises = [];

                signatures.forEach(signatureItem => {
                    const { contentType, content } = signatureItem;

                    if (content) {
                        const promise = new Promise((resolve, reject) => {
                            // Decode base64 string to binary data
                            const binaryString = atob(content);
                            // Create a Uint8Array from the binary string
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            // Create a Blob from the Uint8Array
                            const blob = new Blob([bytes], { type: contentType });
                            // Create a data URL for the blob
                            const reader = new FileReader();
                            reader.onload = () => {
                                const signatureDataURL = reader.result;
                                resolve(signatureDataURL);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });

                        promises.push(promise);
                    }
                });

                Promise.all(promises)
                    .then(signatureDataUrls => {
                        data.signature = signatureDataUrls;
                        setData(data);
                        createAndExportPDF();
                    })
                    .catch(error => {
                    });

            }).catch(error => {
            });
    };



    const createAndExportPDF = async () => {
        const divToPrint = document.getElementById("divToExport");
        setTimeout(() => {
            // Your code to execute after 2 seconds
            html2canvas(divToPrint, { scale: 3 })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');

                    const pdf = new jsPDF('p', 'in', 'letter');
                    const imgWidth = pdf.internal.pageSize.getWidth();
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    // pdf.save('divToExport.pdf');
                    const fileName = (data === undefined ? "" : data.userFullName) + " - " + (data === undefined ? "" : new Date(data.dateApplied).toLocaleDateString()) + ".pdf";
                    pdf.save(fileName);

                    // Remove the temporary div from the document
                    document.body.removeChild(divToPrint);
                })
                .catch((error) => {
                });
        }, 1000);
    };

    const handleFileOpen = (item) => {

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

        const spinner = document.createElement('div');
        spinner.style.border = '4px solid rgba(255, 255, 255, 0.3)';
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = '4px solid #3498db';
        spinner.style.width = '100px';
        spinner.style.height = '100px';
        spinner.style.animation = 'spin 1s linear infinite';



        modalContainer.appendChild(spinner);

        document.body.appendChild(modalContainer);
        axiosInstance.get(APIURLS.user.getUsersSignatureOvertime + item.id)
            .then(res => {
                const signatures = res.data;
                const promises = [];

                signatures.forEach(signatureItem => {
                    const { contentType, content } = signatureItem;

                    if (content) {
                        const promise = new Promise((resolve, reject) => {
                            // Decode base64 string to binary data
                            const binaryString = atob(content);
                            // Create a Uint8Array from the binary string
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            // Create a Blob from the Uint8Array
                            const blob = new Blob([bytes], { type: contentType });
                            // Create a data URL for the blob
                            const reader = new FileReader();
                            reader.onload = () => {
                                const signatureDataURL = reader.result;
                                resolve(signatureDataURL);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });

                        promises.push(promise);
                    }
                });

                Promise.all(promises)
                    .then(signatureDataUrls => {
                        item.signature = signatureDataUrls;
                        setData(item);

                        document.body.removeChild(modalContainer);

                    })
                    .catch(error => {
                    });


            }).catch(error => {
            });

    };
    const viewLeave = (item) => {
        const divToPrint = document.getElementById("divToExport");
        html2canvas(divToPrint, { scale: 3 })
            .then((canvas) => {

                const imgData = canvas.toDataURL('image/png');

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

                const spinner = document.createElement('div');
                spinner.style.border = '4px solid rgba(255, 255, 255, 0.3)';
                spinner.style.borderRadius = '50%';
                spinner.style.borderTop = '4px solid #3498db';
                spinner.style.width = '100px';
                spinner.style.height = '100px';
                spinner.style.animation = 'spin 1s linear infinite';



                const downloadButton = document.createElement('button');
                downloadButton.innerText = 'Download';
                downloadButton.style.position = 'absolute';
                downloadButton.style.top = '10px';
                downloadButton.style.right = '70px';
                downloadButton.style.background = 'none';
                downloadButton.style.border = 'none';
                downloadButton.style.cursor = 'pointer';
                downloadButton.addEventListener('click', () => {
                    createAndExportPDF();
                });

                const closeButton = document.createElement('button');
                closeButton.innerText = 'Close';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.background = 'none';
                closeButton.style.border = 'none';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', () => {
                    setData(GroupInitialState);
                    document.body.removeChild(modalContainer);

                });

                modalContainer.appendChild(spinner);
                modalContainer.appendChild(closeButton);
                modalContainer.appendChild(downloadButton);

                document.body.appendChild(modalContainer);


                divToPrint.style.background = 'white';

                const modalImage = new Image();
                modalImage.src = imgData;
                modalImage.style.maxWidth = '90%';
                modalImage.style.maxHeight = '90%';

                modalContainer.removeChild(spinner);
                modalContainer.appendChild(modalImage);



            }).catch(error => {
            });


    };

    // const handleFileOpen = (item) => {
    //     const divToPrint = document.getElementById("divToExport");
    //     html2canvas(divToPrint, { scale: 3 })
    //         .then((canvas) => {

    //             const imgData = canvas.toDataURL('image/png');

    //             const modalContainer = document.createElement('div');
    //             modalContainer.style.position = 'fixed';
    //             modalContainer.style.top = '0';
    //             modalContainer.style.left = '0';
    //             modalContainer.style.width = '100%';
    //             modalContainer.style.height = '100%';
    //             modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    //             modalContainer.style.display = 'flex';
    //             modalContainer.style.alignItems = 'center';
    //             modalContainer.style.justifyContent = 'center';
    //             modalContainer.style.zIndex = '9999';

    //             const spinner = document.createElement('div');
    //             spinner.style.border = '4px solid rgba(255, 255, 255, 0.3)';
    //             spinner.style.borderRadius = '50%';
    //             spinner.style.borderTop = '4px solid #3498db';
    //             spinner.style.width = '100px';
    //             spinner.style.height = '100px';
    //             spinner.style.animation = 'spin 1s linear infinite';



    //             const downloadButton = document.createElement('button');
    //             downloadButton.innerText = 'Download';
    //             downloadButton.style.position = 'absolute';
    //             downloadButton.style.top = '10px';
    //             downloadButton.style.right = '70px';
    //             downloadButton.style.background = 'none';
    //             downloadButton.style.border = 'none';
    //             downloadButton.style.cursor = 'pointer';
    //             downloadButton.addEventListener('click', () => {
    //                 createAndExportPDF();
    //             });

    //             const closeButton = document.createElement('button');
    //             closeButton.innerText = 'Close';
    //             closeButton.style.position = 'absolute';
    //             closeButton.style.top = '10px';
    //             closeButton.style.right = '10px';
    //             closeButton.style.background = 'none';
    //             closeButton.style.border = 'none';
    //             closeButton.style.cursor = 'pointer';
    //             closeButton.addEventListener('click', () => {
    //                 document.body.removeChild(modalContainer);
    //             });

    //             modalContainer.appendChild(spinner);
    //             modalContainer.appendChild(closeButton);
    //             modalContainer.appendChild(downloadButton);

    //             document.body.appendChild(modalContainer);

    //             axiosInstance.get(APIURLS.user.getUsersSignatureOvertime + item.id)
    //                 .then(res => {
    //                     const signatures = res.data;
    //                     const promises = [];

    //                     signatures.forEach(signatureItem => {
    //                         const { contentType, content } = signatureItem;

    //                         if (content) {
    //                             const promise = new Promise((resolve, reject) => {
    //                                 // Decode base64 string to binary data
    //                                 const binaryString = atob(content);
    //                                 // Create a Uint8Array from the binary string
    //                                 const bytes = new Uint8Array(binaryString.length);
    //                                 for (let i = 0; i < binaryString.length; i++) {
    //                                     bytes[i] = binaryString.charCodeAt(i);
    //                                 }
    //                                 // Create a Blob from the Uint8Array
    //                                 const blob = new Blob([bytes], { type: contentType });
    //                                 // Create a data URL for the blob
    //                                 const reader = new FileReader();
    //                                 reader.onload = () => {
    //                                     const signatureDataURL = reader.result;
    //                                     resolve(signatureDataURL);
    //                                 };
    //                                 reader.onerror = reject;
    //                                 reader.readAsDataURL(blob);
    //                             });

    //                             promises.push(promise);
    //                         }
    //                     });

    //                     Promise.all(promises)
    //                         .then(signatureDataUrls => {
    //                             modalContainer.removeChild(spinner);
    //                             item.signature = signatureDataUrls;
    //                             setData(item);

    //                             divToPrint.style.background = 'white';

    //                             const modalImage = new Image();
    //                             modalImage.src = imgData;
    //                             modalImage.style.maxWidth = '90%';
    //                             modalImage.style.maxHeight = '90%';

    //                             modalContainer.appendChild(modalImage);

    //                         })
    //                         .catch(error => {
    //                             console.error('Error processing signatures:', error);
    //                         });


    //                 }).catch(error => {
    //                     console.error('Error fetching user signatures:', error);
    //                 });


    //         })
    //         .catch((error) => {
    //             console.error('Error converting div to PDF:', error);
    //         });

    // };

    const PDFContent = () => {
        return (
            <div id="divToExport">
                <h1>OVERTIME FORM</h1>
                <div className="qr-code">
                    <div>
                        <QRCode value={window.location.origin + " /ticketview/" + (data === undefined ? "" : data.ticketNumber)} size={65} bgColor="#ffffff" fgColor="#000000" level="Q" />
                    </div>
                    <div>
                        {(data === undefined ? "" : data.ticketNumber)}
                    </div>
                </div>
                <div className="container">
                    <div className="flex60">
                        <label>NAME :</label>
                        <label className="label">&nbsp;&nbsp;{data === undefined ? "" : data.userFullName}</label>
                    </div>
                    <div className="flex44">
                        <label>Date :</label>
                        <label className="label">&nbsp;&nbsp;{new Date(data === undefined ? "" : data.dateApplied).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} </label>
                    </div>
                </div>
                <div className="container">
                    <div className="flex60">
                        <label>DATE OF OVERTIME :</label>
                        <label className="label center">{new Date(data === undefined ? "" : data.dateFrom).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} </label>
                        <label>TO</label>
                        <label className="label center">{new Date(data === undefined ? "" : data.dateTo).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} </label>
                    </div>
                    <div className="flex44">
                        <label>NO. OF DAYS :</label>
                        <label className="label-small center">{data === undefined ? "" : data.days}</label>
                        <label>TIME:</label>
                        <label className="label center">{data === undefined ? "" : data.time}</label>
                    </div>
                </div>
                <div className="container reason">
                    <label>REASON FOR OVERTIME :</label>
                </div>
                <div className="container empty">
                    <div className="flex100 empty">
                        <label className="label">&nbsp;&nbsp;{data === undefined ? "" : data.reason}</label>
                    </div>
                </div>
                <div className="container">
                    <div className="flex100">
                        <label className="label">&nbsp;&nbsp;</label>
                    </div>
                </div>
                <div className="container signature-field">
                    <div className="flex44">
                        <label>SUBMITTED BY:</label>
                        <label className="label signature"><img src={data === undefined || data.signature === undefined ? "" : data.signature[0]} height={50} /></label>
                        <label>NOTED BY:</label>
                        <label className="label signature"><img src={data === undefined || data.signature === undefined ? "" : data.supervisorApproval === 1 ? data.signature[1] : ""} height={50} /></label>
                        <label>APPROVED BY:</label>
                        <label className="label signature"><img src={data === undefined || data.signature === undefined ? "" : data.headApproval === 1 ? data.signature[2] : ""} height={50} /></label>
                    </div>
                </div>
            </div>
        );
    };

    if(isSmallScreen)
    {
        return (
            <div style={componentStyle}>
                <div style={{ paddingTop: "20px", paddingBottom: "10px", marginBottom: "20px", display: 'flex', justifyContent: 'space-between', borderBottom: "solid 1px black" }}>
                    <div className="d-flex flex-row">
                        <div className="p-2" style={{ fontSize: "18px", marginTop: "6px" }}>Search:</div>
                        <div className="p-2">
                            <Input
                                type="text"
                                onChange={GroupSearch}
                                className="searchname"
                            /></div>
                    </div>
                </div>
                <div>
                    <Table responsive hover>
                        <thead>
                            <tr style={{ backgroundColor: "white" }}>
                                <th style={{ minWidth: "160px" }}>
                                    <Button
                                        style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                        size="lg"
                                        type="button"
                                        onClick={() => requestSort('name')}
                                        className={getClassNamesFor('name')}
                                    >
                                        Ticket
                                    </Button>
                                </th>
                                <th style={{ minWidth: "160px" }}>
                                    <Button
                                        style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                        size="lg"
                                        type="button"
                                        onClick={() => requestSort('name')}
                                        className={getClassNamesFor('name')}
                                    >
                                        Name
                                    </Button>
                                </th>
    
                                <th style={{ minWidth: "160px" }}>
                                    <Button
                                        style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
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
                                        style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                        size="lg"
                                        type="button"
                                        onClick={() => requestSort('action')}
                                        className={getClassNamesFor('action')}
                                    >
                                        Action
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                return (
                                    <tr key={item.id}>
                                        <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                            <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} />
                                            {item.ticketNumber}
                                        </td>
                                        <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.userFullName}</td>
                                        <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}> {new Date(item.dateApplied).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                      
                                        <td>
                                            <Button style={{ fontSize: "10px", marginRight: "6px" }} variant="outline-primary" onClick={() => UpdateOvertime(item, true)} hidden={localStorage.getItem("role") == 2 ? true : false} disabled={isOpenProcessingTable ? true : false}>Approve</Button>
                                            <Button style={{ fontSize: "10px", marginRight: "6px" }} variant="outline-danger" onClick={() => UpdateOvertime(item, false)} hidden={localStorage.getItem("role") == 2 ? true : false} disabled={isOpenProcessingTable ? true : false}>Decline</Button>
                                            <Button style={{ fontSize: "10px" }} variant="outline-secondary" onClick={() => handleFileOpen(item)} disabled={isOpenProcessingTable ? true : false}>View</Button>
                                            {/* <Button style={{ fontSize: "10px" }} variant="outline-secondary" onClick={() => getSignatures(item)} disabled={item.headApproval === 1 ? false : true}>Download</Button> */}
    
                                        </td>
    
                                    </tr>
                                )
                            })}
                        </tbody>
    
                        {save ? <FlyingMessage message="Successfully saved!" /> : ""}
                    </Table>
                    {isOpenProcessingTable ? <LoadingSpinner /> : <div />}
                </div>
                {/* {PDFContent()} */}
                <PDFContent />
                {/* <PDFExport /> */}
            </div>
    
    
        );
    }
    else{
    return (
        <div style={componentStyle}>
            <div style={{ paddingTop: "20px", paddingBottom: "10px", marginBottom: "20px", display: 'flex', justifyContent: 'space-between', borderBottom: "solid 1px black" }}>
                <div className="d-flex flex-row">
                    <div className="p-2" style={{ fontSize: "18px", marginTop: "6px" }}>Search:</div>
                    <div className="p-2">
                        <Input
                            type="text"
                            onChange={GroupSearch}
                            className="searchname"
                        /></div>
                </div>
            </div>
            <div>
                <Table responsive hover>
                    <thead>
                        <tr style={{ backgroundColor: "white" }}>
                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('name')}
                                    className={getClassNamesFor('name')}
                                >
                                    Ticket
                                </Button>
                            </th>
                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('name')}
                                    className={getClassNamesFor('name')}
                                >
                                    Name
                                </Button>
                            </th>

                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('id')}
                                    className={getClassNamesFor('id')}
                                >
                                    Date
                                </Button>
                            </th>

                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('id')}
                                    className={getClassNamesFor('id')}
                                >
                                    From
                                </Button>
                            </th>

                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('id')}
                                    className={getClassNamesFor('id')}
                                >
                                    To
                                </Button>
                            </th>

                            {/* <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('id')}
                                    className={getClassNamesFor('id')}
                                >
                                    Time
                                </Button>
                            </th> */}

                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('supervisorApprovalText')}
                                    className={getClassNamesFor('supervisorApprovalText')}
                                >
                                    Supervisor
                                </Button>
                            </th>

                            <th style={{ minWidth: "160px" }}>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('supervisorApprovalText')}
                                    className={getClassNamesFor('supervisorApprovalText')}
                                >
                                    Head
                                </Button>
                            </th>

                            <th>
                                <Button
                                    style={{ backgroundColor: "transparent", color: "#3B82F6", border: "none", fontSize: "16px", letterSpacing: "1px" }}
                                    size="lg"
                                    type="button"
                                    onClick={() => requestSort('action')}
                                    className={getClassNamesFor('action')}
                                >
                                    Action
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            return (
                                <tr key={item.id}>
                                    <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>
                                        <CopyButton text={window.location.origin + "/ticketview/" + item.ticketNumber} />
                                        {item.ticketNumber}
                                    </td>
                                    <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.userFullName}</td>
                                    <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}> {new Date(item.dateApplied).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                    <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}> {new Date(item.dateFrom).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                    <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}> {new Date(item.dateTo).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                    {/* <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{calculateTime(item.dateFrom, item.dateTo)}</td> */}
                                    <td>
                                        {supervisorStatus(item.supervisorApproval)}

                                    </td>
                                    <td>
                                        {headStatus(item.headApproval)}
                                    </td>
                                    <td>
                                        <Button style={{ fontSize: "10px", marginRight: "6px" }} variant="outline-primary" onClick={() => UpdateOvertime(item, true)} hidden={localStorage.getItem("role") == 2 ? true : false} disabled={isOpenProcessingTable ? true : false}>Approve</Button>
                                        <Button style={{ fontSize: "10px", marginRight: "6px" }} variant="outline-danger" onClick={() => UpdateOvertime(item, false)} hidden={localStorage.getItem("role") == 2 ? true : false} disabled={isOpenProcessingTable ? true : false}>Decline</Button>
                                        <Button style={{ fontSize: "10px" }} variant="outline-secondary" onClick={() => handleFileOpen(item)} disabled={isOpenProcessingTable ? true : false}>View</Button>
                                        {/* <Button style={{ fontSize: "10px" }} variant="outline-secondary" onClick={() => getSignatures(item)} disabled={item.headApproval === 1 ? false : true}>Download</Button> */}

                                    </td>

                                </tr>
                            )
                        })}
                    </tbody>

                    {save ? <FlyingMessage message="Successfully saved!" /> : ""}
                </Table>
                {isOpenProcessingTable ? <LoadingSpinner /> : <div />}
            </div>
            {/* {PDFContent()} */}
            <PDFContent />
            {/* <PDFExport /> */}
        </div>


    );
}
}
export default OvertimeList