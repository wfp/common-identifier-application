// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
import type { Config, MappedData } from '../types';

function EmptyTable() {
  return <div className="EmptyTable">No data in the table</div>;
}

function TableRow({ rowData, keys }: { rowData: MappedData, keys: string[] }) {
  const rowCells = keys.map((k) => (
    <td className={'td-' + k} key={k}>
      {k in rowData ? rowData[k] : ""}
    </td>
  ));

  return <tr className="TableRow">{rowCells}</tr>;
}

function PreviewTable({ tableData, columnsConfig }: { tableData: MappedData[], columnsConfig: Config.Column[] }) {
  // empty data is an empty table
  if (tableData.length === 0) {
    return <EmptyTable />;
  }

  // Limit the amount of data displayed (adds significant memory), this should be done on the backend, but redo here
  const previewDataRange: MappedData[] = tableData.slice(0, 500);
  const headerKeys = columnsConfig.map((c) => c.alias);
  const headerLabels = columnsConfig.map((c) => c.name);

  // build the header row
  const tableHeader = (
    <thead>
      <tr>
        {headerKeys.map((k, i) => (
          <th className={'th-' + k} key={k}>
            {headerLabels[i]}
          </th>
        ))}
      </tr>
    </thead>
  );

  // build the body
  const tableBody = (
    <tbody>
      {previewDataRange.map((row, i: number) => (
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
