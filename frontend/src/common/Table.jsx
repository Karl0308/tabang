import React from "react";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

const Table = ({ columns, sortColumn, onSort, data }) => {
  return (
    <table
      className="table table-bordered table-sm table-hover"
      style={{ fontSize: "9pt", margin: "1px" }}
    >
      <TableHeader columns={columns} sortColumn={sortColumn} onSort={onSort} />
      <TableBody columns={columns} data={data} />
    </table>
  );
};

export default Table;
