/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */
import BottomButtons from '../components/BottomButtons';
import PreviewTable from '../components/PreviewTable';
import { keepOutputColumns } from '../util';
import { useTranslation } from 'react-i18next';
import { startValidation, startProcessing } from '../store/actions/workflow.action';
import { useAppStore } from '../store';

function ValidationSuccess() {
    const { t } = useTranslation();
    // TODO: provide sensible defaults for these props if undefined
    const config = useAppStore.getState().config;
    const document = useAppStore(s => s.document) ?? { data: [], name: "" };
    const inputFilePath = useAppStore(s => s.inputFilePath) ?? "";
    const isMappingDocument = useAppStore(s => s.isMappingDocument);

    // The schema for displaying the table
    let columnsConfig = config.data.source.columns;

    // if this is a mapping document we need to clean the schema
    if (isMappingDocument) {
      columnsConfig = keepOutputColumns(config.data, { columns: columnsConfig }).columns;
    }

    return (
      <div className="ValidationSuccess">
        <h2 className="titleText">{t("validationSuccess title")}</h2>

        <PreviewTable tableData={document.data} columnsConfig={columnsConfig} />

        <div className="validationResult ok">
          <div className="validationState">
            {t("validationSuccess summaryTitle")}
            <div className="help">
              {isMappingDocument
                ? t("validationSuccess subtitleMapping")
                : t("validationSuccess subtitleAssistance")}
            </div>
          </div>
        </div>

        <BottomButtons
          l_content={t("validationSuccess leftButton")}
          l_onClick={() => startValidation()}
          r_onClick={() => startProcessing(inputFilePath)}
          r_content={t("validationSuccess rightButton")}
        />
      </div>
    );
}

export default ValidationSuccess;
