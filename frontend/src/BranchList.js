import React, { Component, useState, useEffect, Children } from "react";
import { Container, Row, Col, Input, Label, Table } from "reactstrap";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingSpinner from "./LoadingSpinner";
import { APIURLS } from "./APIURLS";
import FlyingMessage from "./components/FlyingMessage"
import { confirmAlert } from 'react-confirm-alert';
import BranchManager from "./modules/BranchModules/BranchManager";

const BranchList = (props) => {
    const initialState = {
        id: 0,
        name: "",
        branchMember: [
        ],
    };
    
    const [branch, setBranch] = useState(initialState);


    const [itemsData, setItems] = useState([]);
    const [allitemsData, setallItems] = useState([]);
    const [isOpenAddBranch, setIsOpenAddBranch] = React.useState(false);
    const [isUpdate, setIsUpdate] = React.useState(false);
    const [isOpenViewBranch, setIsOpenViewBranch] = React.useState(false);
    const [isOpenProcessing, setisOpenProcessing] = useState(false);
    const [isOpenProcessingTable, setisOpenProcessingTable] = useState(false);
    const [pages, setPages] = useState(0);
    const [isShowDescriptionError, setisShowDescriptionError] = useState("none")
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
    const [error, setError] = useState([]);
    const [save, setSave] = useState(false);

    const [branches, setBranches] = useState([]);

    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const showModal = (data, isupdate) => {
        setIsUpdate(isupdate);
        setBranch(data);
        setSave(false);
        setIsOpenAddBranch(true);
    };

    const hideModal = () => {
        setIsOpenAddBranch(false);
        setBranch(initialState);
    };
    const showViewBranchModal = (data) => {
        setIsOpenViewBranch(true);
        setBranch(data);
        setSave(false);
    };

    const hideViewBranchModal = () => {
        setIsOpenViewBranch(false);
        setBranch(initialState);
    };

    useEffect(() => {
        FetchData();
    }, []);

    const axiosInstanceGet = axios.create({
        baseURL: APIURLS.branch.getBranches(),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });
    const axiosInstanceDelete = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const deleteBranch = (branchId) => {
        return axiosInstanceDelete.delete(APIURLS.branch.deleteBranch() + branchId).then(res => {
            FetchData();
        }).catch(function (errorr) {
            alert('The branch cannot be deleted because it is associated with tickets or users.');
        });
        
   
    }

    const FetchData = () => {
        setisOpenProcessingTable(true);
        axiosInstanceGet.get(APIURLS.branch.getBranches())
            .then(res => res.data)
            .then(
                (result) => {
                    setItems(result);
                    setallItems(result);
                    setPages((result.length / 10))
                    setisOpenProcessingTable(false);
                },
                (error) => {
                }
            )
    }



    const onChange = (e) => {

        setBranch({
            ...branch,
            [e.target.name]: e.target.value
        });
    };

    const onChangeSelect = (e) => {
        setBranch({
            ...branch,
            [e.target.name]: parseInt(e.target.value)
        });
    };
    const onChangestatus = (e) => {
        setBranch({
            ...branch,
            [e.target.name]: (e.target.value == 0 ? false : true)
        });
    };
    const axiosInstanceAdd = axios.create({
        baseURL: APIURLS.branch.saveBranch(),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const submitFormAdd = (e) => {
        e.preventDefault();
        setisOpenProcessing(true);
        axiosInstanceAdd.post(APIURLS.branch.saveBranch(), branch)
            .then(res => {
                setisOpenProcessing(false);
                setIsOpenAddBranch(false);
                FetchData();
                setBranch(initialState);
                setSave(true);
                setError("");
            }).catch(function (errorr) {

                const errorMessage = errorr.response.data;
                setError(errorMessage);
                setisOpenProcessing(false);
            });
    }
    const submitFormedit = (e) => {
        e.preventDefault();
        setisOpenProcessing(true);
        axiosInstanceAdd.post(APIURLS.branch.saveBranch(), branch)
            .then(res => {
                setisOpenProcessing(false);
                setIsOpenViewBranch(false);
                FetchData();
                setBranch(initialState);
                setSave(true);
                setError("");
            }).catch(function (error) {
                const errorMessage = error.response.data[""][0];
                setError(errorMessage);
                setisOpenProcessing(false);
            });
    }

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
    const BranchSearch = event => {
        setItems(allitemsData);
        if (event.target.value !== '') {
            const searchres = allitemsData.filter(item => item.name.toLowerCase().includes(event.target.value.toLowerCase()));
            setItems(searchres);
        }
        else { setItems(allitemsData); }
        // }

    };
    const handleRemoveBranch = (branch) => {
        confirmAlert({
            title: 'Confirm remove',
            message: 'Are you sure to do remove Branch ' + branch.name + "?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        deleteBranch(branch.id);
                    }
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    return (

        <div>
            <div style={componentStyle}>
                {/* <div style={{ position: "relative", textAlign: "center", marginTop: "16px", padding: "10px", border: "1px solid none", borderRadius: "10px", backgroundColor: "#10B981", color: "white" }}>
                        <div style={{ fontSize: "30px", fontWeight: "bold" }}>USER LIST</div>
                    </div> */}
                <div style={{ paddingTop: "20px", paddingBottom: "10px", marginBottom: "20px", display: 'flex', justifyContent: 'space-between', borderBottom: "solid 1px black" }}>
                    <div className="d-flex flex-row">
                        <div className="p-2" style={{ fontSize: "18px", marginTop: "6px" }}>Search:</div>
                        <div className="p-2">
                            <Input
                                type="text"
                                onChange={BranchSearch}
                                className="searchname"
                            /></div>
                    </div>
                    <div><Button onClick={() => showModal(initialState,false)} variant="success">Add Branch</Button></div>
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
                                        Name
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
                                        <td style={{ color: "##000000", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", whiteSpace: "normal", overflowWrap: "break-word", wordWrap: "break-word" }}>{item.name}</td>
                                        <td>
                                            <Button style={{ width: "72px", height: "25px", border: "1px solid #EDEDED", color: "#A4AEB7", padding: "0px", borderRadius: "15px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", marginRight: "10px" }} variant="outline-secondary" onClick={() => showModal(item, true)} >View</Button>
                                            <Button style={{ width: "72px", height: "25px", border: "1px solid #EDEDED", color: "#A4AEB7", padding: "0px", borderRadius: "15px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", marginRight: "10px" }} variant="outline-secondary" onClick={() => handleRemoveBranch(item)} >Delete</Button>

                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>

                    </Table>
                    {isOpenProcessingTable ? <LoadingSpinner /> : <div />}
                </div>
            </div>

            {/* add Branch */}
            <>
                <Modal show={isOpenAddBranch} >
                    <Modal.Header style={{ border: "none" }}>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Name:</div>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            onChange={onChange}
                            value={branch.name === null ? "" : branch.name}
                            required
                        />
                        <div style={{ color: "red", fontSize: "12px" }} hidden={typeof error === 'string' && error.toLowerCase().includes('name') && branch.name.length == 0 ? false : true}>required!</div>

                    </Modal.Body>
                    <Modal.Footer style={{ border: "none" }}>
                        <Button style={{ background: "#F43030", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={hideModal}>Cancel</Button>
                        <Button style={{ background: "#3B82F6", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-primary" onClick={submitFormAdd}>Save</Button>
                    </Modal.Footer>

                    {isOpenProcessing ? <LoadingSpinner /> : <div />}
                </Modal>
                {save ? <FlyingMessage message="Successfully saved!" /> : ""}
                  {/* <BranchManager 
                isOpenAddBranch={isOpenAddBranch} 
                setIsOpenAddBranch={setIsOpenAddBranch} 
                currentBranch={branch}
                isUpdate={isUpdate}
            /> */}
            </>


            {/* update Branch */}
            <>
                <Modal show={isOpenViewBranch} >
                    <Modal.Header style={{ border: "none" }}>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Name:</div>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            onChange={onChange}
                            value={branch.namee === null ? "" : branch.name}
                            required
                        />
                        <div style={{ color: "red", fontSize: "12px" }} hidden={typeof error === 'string' && error.toLowerCase().includes('fullname') && branch.name.length == 0 ? false : true}>required!</div>

                    </Modal.Body>

                    <Modal.Footer style={{ border: "none" }}>
                        <Button style={{ background: "#F43030", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={hideViewBranchModal}>Cancel</Button>
                        <Button style={{ background: "#3B82F6", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-primary" onClick={submitFormedit}>Save</Button>
                    </Modal.Footer>

                    {isOpenProcessing ? <LoadingSpinner /> : <div />}
                </Modal>
                {save ? <FlyingMessage message="Successfully saved!" /> : ""}
            </>
        </div>
    )
}

export default BranchList