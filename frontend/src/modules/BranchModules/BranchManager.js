import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import FlyingMessage from '../../components/FlyingMessage';
import LoadingSpinner from '../../LoadingSpinner';
import axios from 'axios';
import { APIURLS } from '../../APIURLS';
import { name } from '@azure/msal-browser/dist/packageMetadata';
import { Alert } from 'reactstrap';


const BranchManager = ({ isOpenAddBranch, setIsOpenAddBranch, currentBranch, isUpdate }) => {
    const [branch, setBranch] = useState(currentBranch);
    const [editingMemberIndex, setEditingMemberIndex] = useState(null);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberId, setNewMemberId] = useState(0);
    const [error, setError] = useState('');
    const [isOpenProcessing, setIsOpenProcessing] = useState(false);
    const [save, setSave] = useState(false);

    const axiosInstanceAdd = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });
    useEffect(() => {
        setBranch(currentBranch);
    }, [currentBranch]);

    const onChange = (e) => {
        setBranch({ ...branch, [e.target.name]: e.target.value });
    };

    const handleAddMember = () => {
        if (newMemberName.trim() === '') {
            return;
        }
        const memberExists = branch.branchMember.some(member => member.memberName === newMemberName.trim());

        if (memberExists) {
            alert('Member with this name already exists.');
            return;
        }
        const addMember = {
            id: 0, // Generate a new id
            name: newMemberName,
            branchId: branch.id, // Associate the member with the current branch
        };

        axiosInstanceAdd.post(APIURLS.branch.addBranchMember(), addMember)
            .then(res => {
                const newMember = {
                    id: res.id, // Generate a new id
                    memberName: newMemberName,
                    branchId: branch.id, // Associate the member with the current branch
                };
                const updatedMembers = [...branch.branchMember, newMember];
                setBranch({ ...branch, branchMember: updatedMembers });
                setNewMemberName('');
                setError('');

                alert('Member Successfully Added!');
            }).catch(function (errorr) {

                const errorMessage = errorr.response.data;
                setError(errorMessage);
                setIsOpenProcessing(false);
            });


    };

    const handleEditMember = (index, id) => {
        setEditingMemberIndex(index);
        setNewMemberName(branch.branchMember[index].memberName);
        setNewMemberId(id);
    };

    const handleSaveUpdateMember = () => {

        if (newMemberName.trim() === '') {
            return;
        }
        const updateMember = {
            id: newMemberId, // Generate a new id
            name: newMemberName,
            branchId: branch.id, // Associate the member with the current branch
        };

        axiosInstanceAdd.post(APIURLS.branch.addBranchMember(), updateMember)
            .then(res => {
                const updatedMembers = [...branch.branchMember];
                updatedMembers[editingMemberIndex].MemberName = newMemberName;
                setBranch({ ...branch, branchMember: updatedMembers });
                setEditingMemberIndex(null);
                setNewMemberName('');
                setNewMemberId(0);

                alert('Member Successfully Updated!');
            }).catch(function (errorr) {

                const errorMessage = errorr.response.data;
                setError(errorMessage);
                setIsOpenProcessing(false);
            });

    };

    const handleDeleteMember = (index, id) => {
        const updatedMembers = branch.branchMember.filter((_, i) => i !== index);
        setBranch({ ...branch, branchMember: updatedMembers });

        axiosInstanceAdd.post(APIURLS.branch.deleteBranchMember() + "id=" + id)
            .then(
                (result) => {
                    alert('Member Successfully Deleted!');
                },
                (error) => {
                }
            );

    };

    const hideModal = () => {
        setIsOpenAddBranch(false);
    };



    const submitFormAdd = (e) => {
        if (branch.name.trim() === '') {
            setError('Name is required');
            return;
        }
        e.preventDefault();
        setIsOpenProcessing(true);
        axiosInstanceAdd.post(APIURLS.branch.saveBranch(), branch)
            .then(res => {
                setIsOpenProcessing(false);
                setSave(true);
                setTimeout(() => setSave(false), 3000);
                hideModal();
                window.location.href = window.location.href;
            }).catch(function (errorr) {

                const errorMessage = errorr.response.data;
                setError(errorMessage);
                setIsOpenProcessing(false);
            });
    };



    return (
        <>
            <Modal show={isOpenAddBranch}>
                <Modal.Header style={{ border: "none" }}>
                    <Modal.Title>{editingMemberIndex === null ? 'Add Section' : 'Edit Section'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ fontSize: "17px", color: "#223E58", fontWeight: "500" }}>Name:</div>
                    <InputGroup>
                        <FormControl
                            type="text"
                            name="name"
                            id="name"
                            onChange={onChange}
                            value={branch.name || ''}
                            required
                        />
                    </InputGroup>
                    <div style={{ color: "red", fontSize: "12px" }}
                        hidden={!(typeof error === 'string' && error.toLowerCase().includes('name') && branch.name.length === 0)}>
                        required!
                    </div>

                    {isUpdate && (

                        <div style={{ marginTop: "20px" }}>
                            <h5>Section Members</h5>
                            <InputGroup className="mb-3">
                                <FormControl
                                    placeholder="Member Name"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={editingMemberIndex === null ? handleAddMember : handleSaveUpdateMember}
                                    disabled={branch.branchMember.length >= 7}
                                >
                                    {editingMemberIndex === null ? 'Add Section' : ' Update Section'}
                                </Button>
                            </InputGroup>

                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branch.branchMember.map((member, index) => (
                                        <tr key={index}>
                                            <td>{member.memberName}</td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" onClick={() => handleEditMember(index, member.id)}>Edit</Button>{' '}
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMember(index, member.id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                </Modal.Body>

                <Modal.Footer style={{ border: "none" }}>
                    <Button
                        style={{ background: "#F43030", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }}
                        variant="outline-danger"
                        onClick={hideModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        style={{ background: "#3B82F6", color: "white", width: "95px", height: "45px", letterSpacing: "0.5px", borderRadius: "8px" }}
                        variant="outline-primary"
                        onClick={submitFormAdd}
                    >
                        Save
                    </Button>
                </Modal.Footer>

                {isOpenProcessing ? <LoadingSpinner /> : <div />}
            </Modal>

            {save ? <FlyingMessage message="Successfully saved!" /> : ""}
        </>
    );
};

export default BranchManager;
