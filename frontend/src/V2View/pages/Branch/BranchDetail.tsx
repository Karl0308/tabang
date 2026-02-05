
import React, { useState, useRef, useEffect } from 'react';
import { Branch, BranchMember } from '../../objects/Branch';
import { DepartmentBase } from '../../objects/enum';

interface ModalProps {
    selected: Branch | null;
    setSelected: React.Dispatch<React.SetStateAction<Branch | null>>;
    handleSave: () => void;
}

const BranchDetail: React.FC<ModalProps> = ({ selected, setSelected, handleSave }) => {
    // const [data, setData] = useState(selected ? selected.name : '');
    const [branchMember, setBranchMember] = useState<BranchMember[] | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const saveData = async () => {
        handleSave();
    };

    const handleClose = () => {
        setSelected(null);
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

    useEffect(() => {

    }, []);
    const departments = Object.entries(DepartmentBase)
        .filter(([key, value]) => isNaN(Number(key))) // Filter out reverse-mapped numbers
        .map(([key, value]) => ({ id: value as number, name: key }));

    return (
        <div ref={dropdownRef} className={`fixed top-0 left-0 h-screen w-full md:w-1/3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-1000 overflow-y-auto pb-4 text-black dark:text-white ${selected ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-6 bg-slate-200 dark:bg-gray-800 p-4">
                    <h2 className="text-2xl font-bold underline text-black dark:text-white">BRANCH DETAILS</h2>
                    <button onClick={() => setSelected(null)} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Name:</p>
                    <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={selected ? selected.name : ''} onChange={(e) => {
                        if (selected) {
                            setSelected({ ...selected, name: e.target.value });
                        }
                    }} />
                </div>


                <div className="mb-4">
                    <label className="text-gray-700 dark:text-gray-300 font-semibold text-left block mb-2">
                        Department:
                    </label>
                    <select
                       className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
                        value={selected?.departmentBase || ""}
                        onChange={(e) => {
                            if (selected) {
                                setSelected({ ...selected, departmentBase: Number(e.target.value) });
                            }
                        }}
                    >
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
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
            </div>

        </div>

    );
};

export default BranchDetail;