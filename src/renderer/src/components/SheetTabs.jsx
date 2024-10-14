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