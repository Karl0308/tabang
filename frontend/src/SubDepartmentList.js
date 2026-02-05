import React, { Component, useState, useEffect, Children } from "react";
import { Container, Row, Col, Input, Label, Table } from "reactstrap";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingSpinner from "./LoadingSpinner";
import { APIURLS } from "./APIURLS";
import FlyingMessage from "./components/FlyingMessage"


const SubDepartmentList = () => {

    const GroupInitialState = {
        id: 0,
        name: '',
        departmentId: 0,
        departmentName: '',
        members: []
    };
    const [group, setGroup] = useState(GroupInitialState);
    const [itemsData, setItems] = useState([]);
    const [allitemsData, setallItems] = useState([]);
    const [isOpenProcessingTable, setisOpenProcessingTable] = useState(false);
    const [isOpenProcessing, setisOpenProcessing] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
    const [save, setSave] = useState(false);
    const componentStyle = {
        height: "100%",
        backgroundColor: "transparent"
    };

    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
    };

    const showModal = (data) => {
        setIsOpenModal(true);
        setGroup(data);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const FetchData = () => {
        setisOpenProcessingTable(true);
        axiosInstance.get(APIURLS.groups.getSubDepartments())
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

    const GroupSearch = event => {
        setItems(allitemsData);
        if (event.target.value !== '') {
            const searchres = allitemsData.filter(item => item.fullName.toLowerCase().includes(event.target.value.toLowerCase()));
            setItems(searchres);
        }
        else { setItems(allitemsData); }
    };

    const submitFormAdd = (e) => {
        e.preventDefault();
        setisOpenProcessing(true);
        axiosInstance.post(APIURLS.groups.saveSaveSubDepartment(), group)
            .then(res => {
                setisOpenProcessing(false);
                setIsOpenModal(false);
                FetchData();
                setGroup(GroupInitialState);
                setSave(true);
                // setError("");
            }).catch(function (errorr) {
                alert(errorr);
                setisOpenProcessing(false);
            });
    }

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
                <div><Button onClick={() => showModal(GroupInitialState)} variant="success">Add Groups</Button></div>
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
                                        <Button style={{ width: "72px", height: "25px", border: "1px solid #EDEDED", color: "#A4AEB7", padding: "0px", borderRadius: "15px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.78px", marginRight: "10px" }} variant="outline-secondary" onClick={() => showModal(item)}  disabled={isOpenProcessingTable ? true : false}>View</Button>
                                    </td>

                                </tr>
                            )
                        })}
                    </tbody>

                </Table>
                {isOpenProcessingTable ? <LoadingSpinner /> : <div />}
            </div>
            {/* add Group */}
            <>
                <Modal show={isOpenModal} >
                    <Modal.Header style={{ border: "none" }}>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Name:</div>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            onChange={e => setGroup({ ...group, name: e.target.value })}
                            value={group.name === null ? "" : group.name}
                            required
                        />
                    </Modal.Body>


                    <Modal.Footer style={{ border: "none" }}>
                        <Button style={{ background: "#F43030", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-danger" onClick={e => { setIsOpenModal(false); setGroup(GroupInitialState); }}>Cancel</Button>
                        <Button style={{ background: "#3B82F6", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }} variant="outline-primary" onClick={submitFormAdd}>Save</Button>
                    </Modal.Footer>

                    {isOpenProcessing ? <LoadingSpinner /> : <div />}
                </Modal>
                {save ? <FlyingMessage message="Successfully saved!" /> : ""}
            </>
         
        </div>


    );
}
export default SubDepartmentList