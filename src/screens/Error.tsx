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
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import ErrorWrapper from '../components/ErrorWrapper';
import { DeveloperInformation } from '../components/DeveloperInformation';
import { backToMain } from '../store/actions/workflow.action';

function Error() {
  const config = useAppStore(s => s.config);
  const isRuntimeError = useAppStore(s => s.isRuntimeError) ?? false;
  const errorMessage = useAppStore(s => s.errorMessage);
  const { t } = useTranslation();

  return (
    <div className="error-screen">
      <div className="help">
        <h3 className="titleText">{t("error title")}</h3>
        <ErrorWrapper
          config={config}
          errorMessage={errorMessage}
          isRuntimeError={isRuntimeError}
        />
      </div>

      <div className="cid-button-row">
        <button
          className="cid-button cid-button-lg cid-button-alert"
          onClick={backToMain}
        >
          {t("error backButton")}
        </button>
      </div>

      <DeveloperInformation errorMessage={errorMessage} />
    </div>
  );
}

export default Error;
