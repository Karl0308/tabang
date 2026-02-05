import React from "react";
import formatNumber from "../Services/NumberFormatter";

// Helper function to get nested object property
const getNestedProperty = (obj, path) => {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

const TableBody = ({ data, columns }) => {
  const renderCell = (item, column) => {
    if (column.content) return column.content(item);

    let cellValue = getNestedProperty(item, column.path);
    if (cellValue != null && !isNaN(cellValue) && column.path != "code") {
        cellValue = formatNumber(cellValue);
    } else if (cellValue != null && cellValue instanceof Date) {
      cellValue = cellValue
        ? new Date(cellValue).toLocaleDateString("en-PH")
        : "";
    }
    return cellValue;
  };

  const createKey = (item, column) => {
    return item.id + (column.path || column.key);
  };

  return (
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          {columns.map((column) => (
            <td className={ !isNaN(getNestedProperty(item, column.path)) ? "textRight" : ""} key={createKey(item, column)}>{renderCell(item, column)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
