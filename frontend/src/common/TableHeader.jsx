import React from "react";
import { FaSortUp, FaSortDown } from "react-icons/fa";

const tableHeader = ({ sortColumn, columns, onSort }) => {
  const raiseSort = (path) => {
    if (!path) {
      return;
    }
    let sortColumnObj = { ...sortColumn };
    if (sortColumnObj.path === path)
      sortColumnObj.order = sortColumnObj.order === "asc" ? "desc" : "asc";
    else {
      sortColumnObj.path = path;
      sortColumnObj.order = "asc";
    }
    onSort(sortColumnObj);
  };

  const renderSortIcon = (column) => {
    if (column.path === undefined || column.path === null) {
      return null;
    }
    if (column.path && column.path !== sortColumn.path) return null;
    if (sortColumn.order === "asc") return <FaSortUp />;
    return <FaSortDown />;
  };

  const renderContent = (column) => {
    if (column.label) {
      return column.label;
    } else if (column.content) {
      return column.content;
    }
    return null;
  };

  return (
    <thead>
      <tr>
        {columns
          .filter((column) => !column.hidden)
          .map((column) => (
            <th
              className="clickable"
              key={column.path || column.key}
              style={column.style ? column.style : {}}
              onClick={() => raiseSort(column.path)}
            >
              {renderContent(column)} {renderSortIcon(column)}
            </th>
          ))}
      </tr>
    </thead>
  );
};

export default tableHeader;
