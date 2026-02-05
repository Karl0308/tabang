import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFExport = () => {
    const exportAsPDF = () => {
        const input = document.getElementById('divToExport');
        input.style.width = '8.5in'; // Set width to 8.5 inches
        input.style.height = '5.5in'; // Set height to 5.5 inches

        html2canvas(input, { scale: 3 }) // Increase scale for better resolution
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');

                const pdf = new jsPDF('p', 'in', 'letter');
                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save('divToExport.pdf');
            });
    };

    const exportAsImage = () => {
        const input = document.getElementById('divToExport');
        input.style.width = '8.5in';
        input.style.height = '5.5in';

        html2canvas(input, {
            scale: 3, // Increase scale for better resolution
            logging: true, // Enable logging for debugging
            allowTaint: true, // Allow taint for cross-origin images
            useCORS: true, // Use CORS for fetching images
        }).then((canvas) => {
            // Convert canvas to image data URL
            const imageData = canvas.toDataURL('image/png');

            // Create a new window/tab with the image
            const imageWindow = window.open('');
            imageWindow.document.write('<img src="' + imageData + '" />');

            // Reset styles after conversion
            input.style.width = '';
            input.style.height = '';
            input.style.padding = '';
            input.style.fontSize = '';
            input.style.lineHeight = '';
        });
    };

    return (
        <div>
            <div id="divToExport">
                <h1>OVERTIME FORM</h1>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: '60%', display: 'flex', alignItems: 'center', paddingRight: "40px" }}>
                        <label>NAME :</label>
                        <label style={{ flex: '1', borderBottom: '1px solid black' }}>{"   KARLO CUNANAN"}</label>
                    </div>
                    <div style={{ flex: '44%', display: 'flex', alignItems: 'center' }}>
                        <label>Date :</label>
                        <label style={{ flex: '1', borderBottom: '1px solid black' }}>03-14-2024, 7:51 AM</label>
                    </div>
                </div>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: '60%', display: 'flex', alignItems: 'center', textAlign: 'center', paddingRight: "40px" }}>
                        <label>DATE OF OVERTIME :</label>
                        <label style={{ flex: '1', borderBottom: '1px solid black' }}>03-10-2024</label>
                        <label>TO</label>
                        <label style={{ flex: '1', borderBottom: '1px solid black' }}>03-11-2024</label>
                    </div>
                    <div style={{ flex: '44%', display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                        <label>NO. OF DAYS :</label>
                        <label style={{ flex: '.3', borderBottom: '1px solid black' }}>24hr</label>
                        <label>TIME:</label>
                        <label style={{ flex: '1', borderBottom: '1px solid black' }}>08:00AM-05:00PM</label>
                    </div>
                </div>
                <div className='reason-field'>
                    <label>REASON FOR OVERTIME :</label>
                </div>
                <div>
                    <div style={{ flex: '100%', display: 'flex', alignItems: 'center', borderBottom: '1px solid black' }}>
                        d
                    </div>
                    <div style={{ flex: '100%', display: 'flex', alignItems: 'center', borderBottom: '1px solid black' }}>
                    .
                    </div>
                </div>
                <div style={{ flex: '44%', display: 'flex', alignItems: 'center', textAlign: 'center', marginTop: "80px" }}>
                    <label>SUBMITTED BY:</label>
                    <label style={{ flex: '1', borderBottom: '1px solid black' }}>24hr</label>
                    <label>NOTED BY:</label>
                    <label style={{ flex: '1', borderBottom: '1px solid black' }}>24hr</label>
                    <label>APPROVED BY:</label>
                    <label style={{ flex: '1', borderBottom: '1px solid black' }}>24hr</label>
                </div>

            </div>
            <button onClick={exportAsPDF}>Export as PDF</button>
            {/* <button onClick={exportAsImage}>Export as Image</button> */}
        </div>
    );
}

export default PDFExport;
