
import React, { useState, useRef, useEffect } from 'react';
import { BranchMember } from '../../objects/Branch';
import axios from 'axios';
import { APIURLS } from '../../../APIURLS';
import { ToastContainer, toast } from 'react-toastify';

interface ModalProps {
    selected: BranchMember | null;
    setSelected: React.Dispatch<React.SetStateAction<BranchMember | null>>;
}

const MemberDetail: React.FC<ModalProps> = ({ selected, setSelected }) => {
    // const [data, setData] = useState(selected ? selected.name : '');
    const [branchMembers, setBranchMembers] = useState<BranchMember[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const saveData = async () => {

        const branchMember: any = {
            id: 0,
            name: selected?.memberName,
            branchId: selected?.branchId
        };

        setIsLoading(true);

        const AddPromise = axiosInstance.post(APIURLS.branch.addBranchMember(), branchMember)
            .then(res => {

                if (selected !== null) {

                    setBranchMembers(prevData => {
                        // Ensure prevData is treated as an array
                        if (prevData) {
                            return [...prevData, res.data]; // Append to the existing array
                        } else {
                            return [res.data]; // If prevData is null, initialize it as an array
                        }
                    });

                    const initialBranchMember: BranchMember = {
                        id: 0,
                        memberName: '',
                        branchId: selected?.branchId,
                        isDeleted: false,
                        branchName: selected?.branchName.toUpperCase()
                    };

                    setSelected(initialBranchMember);
                    setIsLoading(false);
                }


            });

        toast.promise(
            AddPromise,
            {
                pending: "Adding Member...",
                success: "Member Added!",
                error: "Error Saving Member!"
            },
            {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light"
            }
        );

    };

    const handleClose = () => {
        setSelected(null);
    };

    const fetchData = () => {
        // setIsLoading(true);
        // axiosInstance.get(APIURLS.branch.getBranchMemberByBranchId + selected?.branchId)
        //     .then(res => res.data)
        //     .then(
        //         (result) => {
        //             setBranchMembers(result);
        //             setIsLoading(false);
        //         },
        //         (error) => {
        //             setIsLoading(false);
        //         }
        //     )
    }
    useEffect(() => {
        fetchData();
    }, [selected]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {

                setSelected(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDelete = (data: BranchMember) => {
        // setIsLoading(true);
        // const deletePromiseee = axiosInstance.post(APIURLS.branch.deleteBranchMember + data.id)
        //     .then(() => {
        //         setBranchMembers(prevData => {
        //             if (prevData) {
        //                 // Filter out the member to delete
        //                 return prevData.filter(member => member.id !== data.id);
        //             }
        //             return prevData; // Return the previous state if null
        //         });
        //         setIsLoading(false);
        //     })

        // toast.promise(deletePromiseee, {
        //     pending: "Deleting Member...",
        //     success: "Member Deleted!",
        //     error: "Error Deleting Member!"
        // }, {
        //     position: "top-right",
        //     autoClose: 5000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     theme: "light"
        // });
    };


    return (
        <div ref={dropdownRef} className={`fixed top-0 left-0 h-screen w-full md:w-1/3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-1000 text-black dark:text-white ${selected ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-6 bg-slate-200 dark:bg-gray-800 p-4">
                    <h2 className="text-2xl font-bold underline text-black dark:text-white">{selected?.branchName} MEMBERS</h2>
                    <button onClick={() => setSelected(null)} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Name:</p>
                    <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 text-black dark:text-white" value={selected ? selected.memberName : ''} onChange={(e) => {
                        if (selected) {
                            setSelected({ ...selected, memberName: e.target.value });
                        }
                    }} />
                </div>

                <div className="flex justify-between">
                    <button onClick={() => setSelected(null)} className="flex-grow px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 m-2">Close</button>
                    <button
                        onClick={saveData}
                        className="flex-grow px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 m-2">Save</button>
                </div>
            </div>

            <div className="overflow-x-auto mt-4">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-left text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wider cursor-pointer">
                                Name
                            </th>
                            <th className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-left text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branchMembers && branchMembers.length > 0 ? (
                            branchMembers.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index !== branchMembers.length - 1 ? 'border-b border-gray-300 dark:border-gray-700' : ''}`}>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">{item.memberName}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="mx-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-2 rounded dark:border-red-700 dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                    No members available.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
            {/* <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            /> */}
        </div>

    );
};

export default MemberDetail;