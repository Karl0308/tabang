import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { APIURLS } from '../APIURLS';
import axios from 'axios';

const CommentsTable = ({ ticketComments, isAddComment, renderMentions, handleFileOpen, isLoading, onActionComplete }) => {
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const [commentIdToDelete, setCommentIdToDelete] = useState(null);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Access-Control-Allow-Origin': '*'
        }
    });

    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditedComment(comment.comment);
    };

    const handleSaveClick = (commentId) => {
        // Implement save logic here
        // e.g., call an API to update the comment
        setEditingCommentId(null);
        if (onActionComplete) {
            axiosInstance.post(APIURLS.ticket.editComment() + "commentId=" + commentId + "&newcomment=" + editedComment)
                .then(
                    (result) => {
                        onActionComplete('save', { commentId, comment: editedComment });

                    },
                    (error) => {
                    }
                );
        }
    };

    const handleDeleteClick = (commentId) => {
        const confirmed = window.confirm('Are you sure you want to delete this comment?');
        if (confirmed) {
            // Implement delete logic here
            if (onActionComplete) {
                axiosInstance.post(APIURLS.ticket.deleteComment() + "commentId=" + commentId)
                    .then(
                        (result) => {
                            onActionComplete('delete', { commentId: commentIdToDelete });

                        },
                        (error) => {
                        }
                    );
            }
        }
    };



    return (
        <div style={{ width: "100%", height: "250px", overflowY: "auto", display: isAddComment ? "none" : "block" }}>
            <Table responsive>
                <tbody>
                    {ticketComments.map((item) => (
                        <div key={item.id} style={{ borderBottom: "solid 1px #DBD3D3", width: '100%' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <div style={{ fontWeight: "bold" }}>{item.userFullName}</div>
                                <div style={{ color: "#716E6E" }}>
                                    {new Date(item.createdText).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true,
                                    })}
                                </div>
                            </div>
                            <div style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word', fontSize: '14px' }}>
                                {editingCommentId === item.id ? (
                                    <input
                                        type="text"
                                        value={editedComment}
                                        onChange={(e) => setEditedComment(e.target.value)}
                                        style={{ width: '100%', marginBottom: '10px' }}
                                    />
                                ) : (
                                    renderMentions(item.comment)
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                <div>
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
                                        isLoading && <div>Fetching Attachments....</div>
                                    )}
                                </div>
                                <div>
                                    {editingCommentId === item.id ? (
                                        <Button variant="success" size="sm" onClick={() => handleSaveClick(item.id)}>
                                            Save
                                        </Button>
                                    ) : (
                                        item.userId.toString() === localStorage.getItem('id') && (
                                            <>
                                                <Button variant="warning" size="sm" onClick={() => handleEditClick(item)}>
                                                    Edit
                                                </Button>{' '}
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteClick(item.id)}>
                                                    Delete
                                                </Button>
                                            </>
                                        )
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default CommentsTable;
