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
import { useAppStore } from '../store';
import { useTranslation } from 'react-i18next';
import { SCREENS } from '../../common/screens';

function ProcessingFinished() {
  const config = useAppStore(s => s.config);
  const isMappingDocument = useAppStore(s => s.isMappingDocument);
  const document = useAppStore(s => s.document) ?? { data: [], name: "" };

  const { t } = useTranslation();

  // if this was a mapping-only document
  const columnsConfig = isMappingDocument
    ? config.data.destination_map.columns
    : config.data.destination.columns;

  return (
    <div className="ProcessingFinished">
      <h2 className="titleText">{t("processingFinished title")}</h2>

      <PreviewTable tableData={document.data} columnsConfig={columnsConfig} />

      <BottomButtons
        r_onClick={() => useAppStore.getState().go(SCREENS.PROCESSING_SUMMARY)}
        r_content={t("processingFinished rightButton")}
        side='right'
      />
    </div>
  );
}

export default ProcessingFinished;
