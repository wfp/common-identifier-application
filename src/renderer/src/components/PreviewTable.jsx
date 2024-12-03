/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

function EmptyTable() {
  return <div className="EmptyTable">No data in the table</div>;
}

function TableRow({ rowData, keys }) {
  const rowCells = keys.map((k) => (
    <td className={'td-' + k} key={k}>
      {rowData[k]}
    </td>
  ));

  return <tr className="TableRow">{rowCells}</tr>;
}

function PreviewTable({ tableData, columnsConfig }) {
  // empty data is an empty table
  if (tableData.length === 0) {
    return <EmptyTable />;
  }

  // the header will be the field names
  const headerKeys = columnsConfig.map((c) => c.alias);
  const headerLabels = columnsConfig.map((c) => c.name);
  // TODO: this needs to be re-mapped to human names + in the specified order based on the config
  // const headerKeys = Object.keys(headerRow);

  // build the header row
  const tableHeader = (
    <thead>
      <tr>
        {/* {headerKeys.map(k => (<th className={'th-' + k} key={k}>{k}</th>))} */}
        {headerKeys.map((k, i) => (
          <th className={'th-' + k} key={k}>
            {headerLabels[i]}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Limit the amount of data displayed (adds significant memory), this should be done on the backend, but redo here
  const previewDataRange = tableData.slice(0, 500);

  // build the body
  const tableBody = (
    <tbody>
      {previewDataRange.map((row, i) => (
        <TableRow key={i} rowData={row} keys={headerKeys} />
      ))}
    </tbody>
  );

  //
  return (
    <div className="preview-table-wrapper">
      <div className="preview-table-scroll">
        <table className="preview-table">
          {tableHeader}
          {tableBody}
        </table>
      </div>
    </div>
  );
}

export default PreviewTable;
