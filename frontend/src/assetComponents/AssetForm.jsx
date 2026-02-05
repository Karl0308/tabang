import React, { useState, useEffect } from 'react'
import { Form, Button, ListGroup } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Link, useParams, useNavigate } from 'react-router-dom'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import axios from "axios"
import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { APIURLS } from "../APIURLS";
import { toast } from 'react-toastify';
const axiosInstanceGet = axios.create({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem("token")}`
  }
});
// const getAssetById = async (assetid) => {
//   if (!assetid || isNaN(assetid)) { assetid = "0"; }
//   axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
//   const response = await axiosInstanceGet.get(
//     APIURLS.asset.getAssetById + assetid.toString()
//   );
//   response.data.id = assetid;
//   return response.data;
// };

// const addAsset = (asset) => {
//   asset.id = 0
//   axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
//   return axiosInstanceGet.post(APIURLS.asset.addAsset, asset);
// };

// const editAsset = (asset) => {
//   axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
//   return axiosInstanceGet.put(APIURLS.asset.editAsset, asset);
// }
const AssetForm = () => {
  const initialState = {
    id: 0,
    code: "",
    name: "",
    equipment: "",
};
  const navigate = useNavigate();
  const [currentAsset, setCurrentAsset] = useState(initialState);
   let { assetid } = useParams();

  const [suggestions, setSuggestions] = useState([]);
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!assetid || isNaN(assetid)) { assetid = "0"; }
    axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
    const response = await axiosInstanceGet.get(
      APIURLS.asset.getAssetById() + assetid.toString()
    );
    setCurrentAsset(response.data);
};

  const handleChange = (event) => {
    const value = event.target.value;
    setCurrentAsset({ ...currentAsset, 'equipment': value});

    const searchTermParam = value !== null ? value : "";

    axiosInstanceGet.get(`${APIURLS.ticket.ticketBase()}GetAssets?searchTerm=${searchTermParam}`)
      .then((response) => {
        const allSuggestions = [];
        response.data.forEach((asset) => {
          allSuggestions.push(asset.equipment);
        });

        const filteredSuggestions = allSuggestions.filter((item) =>
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      })
      .catch((error) => {
      });
  };



  const handleSuggestionClick = (suggestion) => {
    setCurrentAsset({ ...currentAsset, 'equipment': suggestion });
    setSuggestions([]);
  };


  const onChange = (e) => {
    setCurrentAsset({ ...currentAsset, [e.target.name]: e.target.value });
  };

  
  const submitFormAdd = async (e) => {
    e.preventDefault(); 
    if (currentAsset.code === "" || currentAsset.code === null || currentAsset.code === undefined ||
      currentAsset.equipment === "" || currentAsset.equipment === null || currentAsset.equipment === undefined ||
      currentAsset.name === "" || currentAsset.name === null || currentAsset.name === undefined ||
      currentAsset.branch === "" || currentAsset.branch === null || currentAsset.branch === undefined
    ) {
      alert('Please fill all details');
      return;
    } 
    if(currentAsset.id == 0)
    {
     await axiosInstanceGet.post(APIURLS.asset.addAsset, currentAsset)
    }
    else
    { await axiosInstanceGet.put(APIURLS.asset.editAsset, currentAsset)}
    navigate('/assets');
};


  return (
    <div>
      <h3>Asset</h3>
      <hr className='my-1' />
      <Form onSubmit={submitFormAdd}>
      <Form.Group className="mb-3 text-start">
          <Form.Label className="text-start">Asset Tag</Form.Label>
          <Form.Control
            name='code'
            type="text"
            value={currentAsset.code}
            onChange={onChange}
            placeholder="Enter Asset Tag"
          />
        </Form.Group>
        <Form.Group className="mb-3 text-start">
          <Form.Label className="text-start">Description</Form.Label>
          <Form.Control
            name='name'
            type="text"
            value={currentAsset.name}
            onChange={onChange}
            placeholder="Enter Description"
          />
        </Form.Group>
        <Form.Group className="mb-3 text-start">
          <Form.Label className="text-start">Section</Form.Label>
          <Form.Control
            name='branch'
            type="text"
            value={currentAsset.branch}
            onChange={onChange}
            placeholder="Enter Section"
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start">
          <Form.Label className="text-start">Category</Form.Label>
          <Form.Control
            name='equipment'
            type="text"
            value={currentAsset.equipment}
            onChange={handleChange}
            placeholder="Enter Category"
          />
          {suggestions.length > 0 && (
            <ListGroup>
              {suggestions.map((suggestion, index) => (
                <ListGroup.Item
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ cursor: 'pointer' }}
                >
                  {suggestion}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Form.Group>


        <Form.Group className='text-end'>
          <Button variant="success" type="submit">
            Save Changes
          </Button>
          <Link to={"/assets"} className='btn btn-secondary ms-1'>Cancel</Link>
        </Form.Group>
      </Form>
    </div>
  )
}

export default AssetForm