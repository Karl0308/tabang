import React, { useEffect, useState } from 'react'
import Table from "../common/Table"
import RPaginate from '../common/RPaginate';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom"
import { confirmAlert } from 'react-confirm-alert';
import axios from "axios"
import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { APIURLS } from "../APIURLS";
import { toast } from 'react-toastify';
const axiosInstanceGet = axios.create({
  headers: {
      'Authorization': `Bearer ${localStorage.getItem("token")}`
  }
});
const getAssets = async (params) => {   
  axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
  const response = await axiosInstanceGet.get(
    APIURLS.asset.getAssets(),{ params}
  );  
  return response.data;
};

const deleteAsset = (assetId) => {
  axiosInstanceGet.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
  return axiosInstanceGet.delete(APIURLS.asset.deleteAsset() + assetId);    
}

const  AssetList = () => {    
  const queryClient = useQueryClient()

  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [sortColumn, setSortColumn] = useState({
      path: "code",
      order: "asc",
    });    

    const requery = () => {
      queryClient.invalidateQueries({ queryKey: ['getAssets'] });
    };

    useEffect(() => {
      requery();
    },[searchTerm, currentPage,sortColumn]);
    const deleteAssetMutation = useMutation({
      mutationFn: deleteAsset,
      onSuccess: (data, variables, context) => {
        toast("Asset Deleted!");
        requery();
      }
    });

  const queryObject = {
    searchTerm: searchTerm,
    totalCount: totalCount,
    currentPage: currentPage,
    pageSize: pageSize,
    sortColumnPath: sortColumn.path,
    sortColumnOrder: sortColumn.order    
  };

  const {
    data: dataFromAPI,
    isError,
    error,    
    isPending,
    status,
  } =  useQuery({ queryKey: ['getAssets', queryObject], 
                  queryFn: () => getAssets(queryObject),
                  placeholderData: keepPreviousData,
                  refetchOnWindowFocus: false,
                  staleTime: 0,             
                });  

                useEffect(() => {
                  if(status === "success"){
                    setSearchTerm(dataFromAPI.searchTerm);
                    setTotalCount(dataFromAPI.totalCount);
                    setCurrentPage(dataFromAPI.currentPage);
                    setPageSize(dataFromAPI.pageSize);
                    setSortColumn({
                      path: dataFromAPI.sortColumnPath,
                      order: dataFromAPI.sortColumnOrder
                    });
                  }
                }, [dataFromAPI]);                
  if (isPending) return <div>Fetching data...</div>;
  if (isError) return <div>An error occurred: {error.message}</div>;  
          
  

      const columns = [        
        { path: "code", label: "Asset Tag" },
        { path: "name", label: "Description" },
        { path: "branch", label: "Branch" },
        { path: "equipment", label: "Category" },        
        {key:"Actions", label: "Actions", content: (e) => {            
            return <div><Link to={"/asset/" + e.id} className='btn btn-warning btn-sm'>Edit</Link><Button onClick={() => handleRemoveAsset(e)} className="m-2" variant="danger" size="sm">Remove</Button></div>
        }}
      ];

      const handleRemoveAsset = (asset) => {
        confirmAlert({
            title: 'Confirm remove',
            message: 'Are you sure to do remove asset ' + asset.code + "?",
            buttons: [
              {
                label: 'Yes',
                onClick: () => {
                  deleteAssetMutation.mutate(asset.id);
                }
              },
              {
                label: 'No'                
              }
            ]
          });
      };

      const handleSort = (pSortColumn) => {
        setSortColumn(pSortColumn);
      };

      const handlePageChange = (event) => {
        setCurrentPage(event.selected + 1);           
      };

      const handleFilter = (event) => {
          if(internalSearchTerm){
            setSearchTerm(internalSearchTerm);
          }          
          else {
            requery();
          }
      };

      const handleRefresh = (event) => {
         setInternalSearchTerm("");
         setSearchTerm("");        
      };

      
          
      /* Remove if server side: */
      /*
      let offset = (currentPage - 1) * pageSize;
      let pagedItems = _.drop(dataFromAPI.assets, offset).slice(0, pageSize);

      const sorted = _.orderBy(
        pagedItems,
        [sortColumn.path],
        [sortColumn.order]
      );

      const dataList = sorted.map((row) => ({ ...row, _id: row.code }));
      */
      /**********/
  return (
    <div className='mt-3'>
        <h3 className="text-start">Assets</h3>
        <Form className='my-2'>
            <Row>                
                <Col>                
                <Form.Control value={internalSearchTerm} onChange={(e) => setInternalSearchTerm(e.target.value)} type="text" maxLength={50} placeholder="Search..." />                                    
                </Col>
                <Col>
                  <div className="d-flex justify-content-start">
                    <Button style={{ position: "relative", top: "5px"}} onClick={handleFilter} variant="primary" type="button" size="sm">
                        Filter
                    </Button>
                    <Button style={{ position: "relative", top: "5px"}} onClick={handleRefresh} className='ms-2' variant="success" type="button" size="sm">
                        Refresh
                    </Button>
                    </div>
                </Col>                
            </Row>        
        </Form>
        <div className="d-flex justify-content-start">
          <Link to={"/asset/"} className='btn btn-success my-1'>Create New</Link>
        </div>
        <Table columns={columns} sortColumn={sortColumn} onSort={handleSort} data={dataFromAPI.assets} />
        <br />
        <RPaginate onPageChange={handlePageChange} totalCount={totalCount} currentPage={currentPage - 1} pageSize={pageSize} />
    </div>
  )
}

export default AssetList