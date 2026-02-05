import React, { useState } from 'react';
import { Ticket } from '../../objects/Ticket';
import StarRating from '../../component/StarRating';
import fileIcon from '../images/file.png';
import QRCode from 'react-qr-code';
import applogo from '../images/applogo.png'
import { DocumentType } from '../../objects/DocumentType';
import { User } from '../../objects/User';
import { Branch } from '../../objects/Branch';
import { Workstream } from '../../objects/Workstream';
import WorkstreamDetail from './WorkstreamDetail';


interface WorkstreamDetailsProps {
    selected: Workstream | null;
    setSelected: React.Dispatch<React.SetStateAction<Workstream | null>>;
    handleSave: () => void;
    handleClose: () => void;
    isView : boolean | true;
    users: User[];
    branches: Branch[];
}

const WorkstreamViewPopup = ({ selected, setSelected, handleSave , handleClose, isView, users, branches }: WorkstreamDetailsProps) => {
 return (
  <>
    {/* Overlay */}
    <div
      className={`
        fixed inset-0 bg-black bg-opacity-50 z-40 
        transition-opacity duration-300
        ${selected ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={handleClose}
    />

    {/* Slide-in Ticket Drawer */}
    <div
       className={`
    fixed top-0 right-0 h-full
    w-full md:w-[80%] lg:w-2/3 xl:w-1/2
    bg-white dark:bg-gray-900
    border-l border-gray-300 dark:border-gray-700
    shadow-2xl z-50
    transform transition-transform duration-500
    ${selected ? 'translate-x-0' : 'translate-x-full'}
    overflow-y-auto overflow-x-hidden max-w-full
  `}
    >
      <WorkstreamDetail
        selected={selected}
        setSelected={setSelected}
        handleSave={handleSave}
        handleClose={handleClose}
        isView={false}
        users={users}
        branches={branches}
      />
    </div>
  </>
);

};

export default WorkstreamViewPopup;
