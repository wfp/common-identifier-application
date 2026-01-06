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
import FileInfo from '../components/FileInfo';
import PreviewTable from '../components/PreviewTable';
import { useAppStore } from '../store';
import { keepOutputColumns } from '../util';
import type { IValidationSuccess } from '../../common/types';
import { useTranslation } from 'react-i18next';

function ValidationSuccess({ config, document, inputFilePath, isMappingDocument }: Omit<IValidationSuccess, "screen">) {
    const { t } = useTranslation();
  
    const preProcessFileOpenDialog = useAppStore(
      (store) => store.preProcessFileOpenDialog,
    );
    const startProcessingFile = useAppStore((store) => store.startProcessingFile);
    const processTheFile = (_: React.UIEvent) => startProcessingFile(inputFilePath, '/tmp');

    // The schema for displaying the table
    let columnsConfig = config.data.source.columns;

    // if this is a mapping document we need to clean the schema
    if (isMappingDocument) {
      columnsConfig = keepOutputColumns(config.data, { columns: columnsConfig }).columns;
    }

    return (
      <div className="ValidationSuccess">
        <FileInfo filePath={inputFilePath} helpText={t("validationSuccess fileInfo")} />

        <PreviewTable tableData={document.data} columnsConfig={columnsConfig} />

        <div className="validationResult ok">
          <div className="validationState">
            {t("validationSuccess title")}
            <div className="help">
              {isMappingDocument
                ? t("validationSuccess subtitleMapping")
                : t("validationSuccess subtitleAssistance")}
            </div>
          </div>
        </div>

        <BottomButtons
          l_content={t("validationSuccess leftButton")}
          l_onClick={preProcessFileOpenDialog}
          r_onClick={processTheFile}
          r_content={t("validationSuccess rightButton")}
        />
      </div>
    );
}

export default ValidationSuccess;
