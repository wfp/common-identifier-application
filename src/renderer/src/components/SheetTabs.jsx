import PreviewTable from "../components/PreviewTable";

function SheetTabs({inputData}) {

    const sheetTabs = inputData.sheets.map(({name, data}) => (
        <div key={name} className="SheetTab">
            <h3>{ name }</h3>
            <PreviewTable tableData={data} />
        </div>
    ))

    return (
        <div className="SheetTabs">
            { sheetTabs }
        </div>
    )
}


export default SheetTabs;