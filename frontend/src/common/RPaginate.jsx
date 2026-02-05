import React from "react";
import ReactPaginate from "react-paginate";
const RPaginate = ({ onPageChange, totalCount, currentPage, pageSize }) => {
  const pagesCount = Math.ceil(totalCount / pageSize);
  if (pagesCount === 1) return null;
  //console.log("Total Count: " + totalCount);
  return (
    <ReactPaginate
      nextLabel="next >"
      onPageChange={onPageChange}
      pageRangeDisplayed={pageSize}
      pageCount={totalCount}
      previousLabel="< previous"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      breakLabel="..."
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="pagination"
      activeClassName="active"
      forcePage={currentPage}
      renderOnZeroPageCount={null}
    />
  );
};

export default RPaginate;
