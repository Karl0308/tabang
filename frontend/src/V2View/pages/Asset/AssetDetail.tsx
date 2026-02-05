
import React, { useState, useRef, useEffect } from 'react';
import { Ticket } from '../../objects/Ticket';
import axios from 'axios';
import { APIURLS } from '../../../APIURLS';

interface Asset {
    id: number;
    code: string;
    name: string;
    branch: string;
    equipment: string;
}

interface ModalProps {
    selected: Asset | null;
    setSelected: React.Dispatch<React.SetStateAction<Asset | null>>;
    handleSave: () => void;
}

const AssetDetail: React.FC<ModalProps> = ({ selected, setSelected, handleSave }) => {
    // const [data, setData] = useState(selected ? selected.name : '');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });
    const saveData = async () => {
        handleSave();
    };

    const handleClose = () => {
        setSelected(null);
    };
    useEffect(() => {
        FetchTicket();
    }, [selected]);
    const FetchTicket = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.ticket.GetTicketAsset() + selected?.id)
            .then((res) => {
                setTickets(res.data);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
            });

    };

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

    return (
        <div ref={dropdownRef} className={`fixed top-0 left-0 h-screen w-full md:w-1/3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-1000 overflow-y-auto pb-4 text-black dark:text-white ${selected ? 'translate-x-0' : '-translate-x-full'
            }`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-6 bg-slate-200 dark:bg-gray-800 p-4">
                    <h2 className="text-2xl font-bold underline text-black dark:text-white">ASSETS</h2>
                    <button onClick={() => setSelected(null)} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Asset Tag:</p>
                    <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={selected ? selected.code : ''} onChange={(e) => {
                        if (selected) {
                            setSelected({ ...selected, code: e.target.value });
                        }
                    }} />
                </div>
                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Description:</p>
                    <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={selected ? selected.name : ''} onChange={(e) => {
                        if (selected) {
                            setSelected({ ...selected, name: e.target.value });
                        }
                    }} />
                </div>

                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Branch:</p>
                    <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={selected ? selected.branch : ''} onChange={(e) => {
                        if (selected) {
                            setSelected({ ...selected, branch: e.target.value });
                        }
                    }} />
                </div>

                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Category:</p>
                    <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={selected ? selected.equipment : ''} onChange={(e) => {
                        if (selected) {
                            setSelected({ ...selected, equipment: e.target.value });
                        }
                    }} />
                </div>


                <div className="flex justify-between">
                    <button
                        onClick={() => setSelected(null)}
                        className="flex-grow px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 m-2"
                    >
                        Close
                    </button>
                    <button
                        onClick={saveData}
                        className="flex-grow px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 m-2"
                    >
                        Save
                    </button>
                </div>


                <div className="mb-4 mt-4">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Tickets:</p>
                    <ul className="p-0">
                        {tickets && tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <li key={ticket.id} className="mb-2">
                                    <div className="flex items-start">
                                        <div className="flex flex-col">
                                            <p className="text-gray-700 dark:text-gray-300 text-left break-words whitespace-pre-wrap">
                                                {ticket.ticketNumber} - {ticket.title}
                                            </p>
                                        </div>
                                        <button
                                            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            onClick={() => window.open(window.location.origin + '/ticketview/' + ticket.ticketNumber, "_blank")}
                                        >
                                            View Ticket
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No assets available.</p>
                        )}
                    </ul>
                </div>




            </div>


        </div>

    );
};

export default AssetDetail;