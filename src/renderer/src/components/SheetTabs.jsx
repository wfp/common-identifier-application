import PreviewTable from "../components/PreviewTable";

function SheetTabs({documentData, columnsConfig}) {

    function header(name) {
        return (documentData.sheets.length > 1) ? (<h3>{ name }</h3>) : (<></>)
    }
    console.log("COLUMNS CONFIG:", columnsConfig);

    const sheetTabs = documentData.sheets.map(({name, data}) => (
        <div key={name} className="SheetTab">
            { header(name) }
            <PreviewTable tableData={data} columnsConfig={columnsConfig}/>
        </div>
    ))

    return (
        <div className="SheetTabs">
            { sheetTabs }
        </div>
    )
}


export default SheetTabs;