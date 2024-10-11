
function EmptyTable() {
    return (<div className="EmptyTable">No data in the table</div>)
}


function TableRow({rowData, keys}) {
    const rowCells = keys.map(k => (<td  className={'td-' + k} key={k}>{ rowData[k] }</td>))

    return (<tr className="TableRow">
        { rowCells }
    </tr>)
}

function PreviewTable({tableData, columnsConfig}) {
    // empty data is an empty table
    if (tableData.length === 0) {
        return <EmptyTable/>;
    }

    // the first row is the header
    const headerRow = tableData[0];

    // the header will be the field names
    const headerKeys = columnsConfig.map(c => c.alias);
    const headerLabels = columnsConfig.map(c => c.name);
    // TODO: this needs to be re-mapped to human names + in the specified order based on the config
    // const headerKeys = Object.keys(headerRow);

    // build the header row
    const tableHeader = (<thead>
        <tr>
            {/* {headerKeys.map(k => (<th className={'th-' + k} key={k}>{k}</th>))} */}
            {headerKeys.map((k, i) => (<th className={'th-' + k} key={k}>{headerLabels[i]}</th>))}
        </tr>
    </thead>);

    // Limit the amount of data displayed (adds significant memory)
    const previewDataRange = tableData.slice(0, 200);

    // build the body
    const tableBody = (<tbody>
        { previewDataRange.map((row,i) => <TableRow key={i} rowData={row} keys={headerKeys} />) }
    </tbody>)

    //
    return (
        <div className="preview-table-wrapper">
            <div className="preview-table-scroll">
                <table className="preview-table">
                    { tableHeader }
                    { tableBody }
                </table>
            </div>
        </div>
    )
}

export default PreviewTable;