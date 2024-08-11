
function EmptyTable() {
    return (<div className="EmptyTable">No data in the table</div>)
}


function TableRow({rowData, keys}) {
    const rowCells = keys.map(k => (<td key={k}>{ rowData[k] }</td>))

    return (<tr className="TableRow">
        { rowCells }
    </tr>)
}

function PreviewTable({tableData}) {
    // empty data is an empty table
    if (tableData.length === 0) {
        return <EmptyTable/>;
    }

    // the first row is the header
    const headerRow = tableData[0];

    // the header will be the field names
    // TODO: this needs to be re-mapped to human names + in the specified order based on the config
    const headerKeys = Object.keys(headerRow);

    // build the header row
    const tableHeader = (<thead>
        <tr>
            {headerKeys.map(k => (<th key={k}>{k}</th>))}
        </tr>
    </thead>);

    // build the body
    const tableBody = (<tbody>
        { tableData.slice(1).map((row,i) => <TableRow key={i} rowData={row} keys={headerKeys} />) }
    </tbody>)

    //
    return (
        <div className="PreviewTable">
            <table className="PreviewTableMain">
                { tableHeader }
                { tableBody }
            </table>
        </div>
    )
}

export default PreviewTable;