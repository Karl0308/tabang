import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Label, Input, FormText, Modal } from 'reactstrap';
import logo from './img/logo.svg';
import axios from 'axios';
import LoadingSpinner from "./LoadingSpinner";
import { APIURLS } from "./APIURLS";
import Select from 'react-select';
import FlyingMessage from "./components/FlyingMessage";

const AppSettings = () => {

    const [save, setSave] = useState(false);

    const [appSetting, setAppSetting] = useState({
        id:0,
        newFrom : '',
        newTo : '',
        warningFrom : '',
        warningTo : '',
        severeFrom : '',
        severeTo: '',

        newColor : '',
        warningColor : '',
        severeColor : '',
    });

    const [newFromValue, setNewFromValue] = useState(null);
    const [newToValue, setNewToValue] = useState(null);
    const [newColor, setNewColor] = useState(null);

    const [warningFromValue, setWarningFromValue] = useState(null);
    const [warningToValue, setWarningToValue] = useState(null);
    const [warningColor, setWarningColor] = useState(null);

    const [severFromValue, setSeverFromValue] = useState(null);
    const [severColor, setSeverColor] = useState(null);

    const [isOpenProcessing, setisOpenProcessing] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const axiosInstanceAdd = axios.create({
        baseURL: APIURLS.ticket.saveTicket(),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });


    const submitFormAdd = (e) => {
        if (isOpenProcessing) {
            return;
        }

        e.preventDefault();
        setisOpenProcessing(true);
        setSave(false);
        setErrorMessage("");

        appSetting.newFrom = newFromValue.value;
        appSetting.newTo = newToValue.value;
        appSetting.warningFrom = warningFromValue.value;
        appSetting.warningTo = warningToValue.value;
        appSetting.severeFrom = severFromValue.value;

        appSetting.newColor = newColor.value;
        appSetting.warningColor = warningColor.value;
        appSetting.severeColor = severColor.value;

        axiosInstanceAdd.post(APIURLS.appsetting.saveAppSetting(), appSetting)
            .then(res => res.data)
            .then((res) => {

                setSave(true);
                setisOpenProcessing(false);
            })
            .catch((error) => {
                setErrorMessage(error.response.data);
                setisOpenProcessing(false);
            });

        // axiosInstanceAdd.post(APIURLS.ticket.saveTicket, formData)
        //   .then(res => res.data)
        //   .then((res) => {
        //     setisConfirmSave(true);
        //     setticketId(res.ticketNumber);
        //     // document.getElementById("description").value = '';
        //     // document.getElementById("title").value = '';
        //     setTicket(initialTicketState)

        //     // Reset the file input to its natural state
        //     if (document.getElementById("attachment")) {
        //       document.getElementById("attachment").value = '';
        //     }

        //     setSelectedFiles([]);
        //     setisOpenProcessing(false);
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //     setisOpenProcessing(false);
        //   });
    };


    const hoursOptions = [];


    // Generate options for hours (0-23) and minutes (0-59)
    for (let hour = 0; hour < 24; hour++) {
        const time = hour.toString().padStart(2, '0');
        hoursOptions.push({ value: time, label: time });
    }


    const colorOptions = [
        { value: 'red', label: 'Red', color: '#FF0000' },
        { value: 'blue', label: 'Blue', color: '#0000FF' },
        { value: 'green', label: 'Green', color: '#00FF00' },
        { value: 'yellow', label: 'Yellow', color: '#FFFF00' },
        { value: 'orange', label: 'Orange', color: '#FFA500' },
    ];

    useEffect(() => {
        setisOpenProcessing(true);
        axiosInstanceAdd.get(APIURLS.appsetting.getAppSettings())
            .then(res => res.data)
            .then((res) => {

                const newFromData = [res.newFrom];
                const newToData = [res.newTo];


                const warningFromData = [res.warningFrom];
                const warningToData = [res.warningTo];


                const severFromData = [res.severeFrom];

                const newFromOptions = newFromData.map(hour => ({
                    value: hour,
                    label: hour,
                }));

                const newToOptions = newToData.map(hour => ({
                    value: hour,
                    label: hour,
                }));

                const warningFomOptions = warningFromData.map(hour => ({
                    value: hour,
                    label: hour,
                }));

                const warningToOptions = warningToData.map(hour => ({
                    value: hour,
                    label: hour,
                }));

                const severFromOptions = severFromData.map(hour => ({
                    value: hour,
                    label: hour,
                }));

                setNewFromValue(newFromOptions[0]);
                setNewToValue(newToOptions[0]);

                setWarningFromValue(warningFomOptions[0]);
                setWarningToValue(warningToOptions[0]);

                setSeverFromValue(severFromOptions[0]);


                const newColor = res.newColor;
                const warningColor = res.warningColor;
                const severeColor = res.severeColor;

                const colorOptions = [
                  { value: 'red', label: 'Red', color: '#FF0000' },
                  { value: 'blue', label: 'Blue', color: '#0000FF' },
                  { value: 'green', label: 'Green', color: '#00FF00' },
                  { value: 'yellow', label: 'Yellow', color: '#FFFF00' },
                  { value: 'orange', label: 'Orange', color: '#FFA500' },
                ];
                
                const newColorOption = colorOptions.find(option => option.value === newColor);
                const warningColorOption = colorOptions.find(option => option.value === warningColor);
                const severeColorOption = colorOptions.find(option => option.value === severeColor);
                

                setNewColor(newColorOption);
                setWarningColor(warningColorOption);
                setSeverColor(severeColorOption);
                setisOpenProcessing(false);

            })
            .catch((error) => {
                setisOpenProcessing(false);
            });


    }, []);


    return (
        <div>
            <div>
                <div>
                    <Form onSubmit={submitFormAdd} encType="multipart/form-data">
                        <div style={{ marginTop: "18px", fontSize: "30px" }}>Application Settings</div>
                        <FormGroup className="ticket-form" style={{ border: '1px solid black', padding: '8px' }}>
                            <div style={{ fontWeight: 'bold' }}>NEW TICKET</div>

                            <Label>Time From:</Label>
                            <Select
                                options={hoursOptions}
                                value={newFromValue}
                                onChange={setNewFromValue}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                                isDisabled={true}
                            />

                            <Label>Time To:</Label>
                            <Select
                                options={hoursOptions}
                                value={newToValue}
                                onChange={x => { setNewToValue(x); setWarningFromValue(x); }}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                            />

                            <Label>Color:</Label>
                            <Select
                                options={colorOptions}
                                value={newColor}
                                onChange={setNewColor}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                            />
                        </FormGroup>

                        <FormGroup className="ticket-form" style={{ border: '1px solid black', padding: '8px' }}>
                            <div style={{ fontWeight: 'bold' }}>WARNING TICKET</div>

                            <Label>Time From:</Label>
                            <Select
                                options={hoursOptions}
                                value={warningFromValue}
                                onChange={setWarningFromValue}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                                isDisabled={true}
                            />

                            <Label>Time To:</Label>
                            <Select
                                options={hoursOptions}
                                value={warningToValue}
                                onChange={x => {
                                    setWarningToValue(x); setSeverFromValue(x);
                                }}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                            />

                            <Label>Color:</Label>
                            <Select
                                options={colorOptions}
                                value={warningColor}
                                onChange={setWarningColor}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                            />
                        </FormGroup>

                        <FormGroup className="ticket-form" style={{ border: '1px solid black', padding: '8px' }}>
                            <div style={{ fontWeight: 'bold' }}>SEVERE TICKET</div>

                            <Label>Time From:</Label>
                            <Select
                                options={hoursOptions}
                                value={severFromValue}
                                onChange={setSeverFromValue}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                                isDisabled={true}
                            />
                            <Label>Color:</Label>
                            <Select
                                options={colorOptions}
                                value={severColor}
                                onChange={setSeverColor}
                                isSearchable={false}
                                styles={{ fontSize: "6px" }}
                            />
                        </FormGroup>
                        <div style={{color:'red'}}>{errorMessage}</div>

                        <div className="text-center">
                            <Button className="custom-btn">Save</Button>
                        </div>
                    </Form>
                    {isOpenProcessing ? <LoadingSpinner /> : <div />}
                    
                    {save ? <FlyingMessage message="Successfully saved!" /> : ""}
                </div>
            </div>
        </div>
    )
}
export default AppSettings;


