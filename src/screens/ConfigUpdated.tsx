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

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import type { BaseAppState } from '../store';

function ConfigUpdated({ config }: Pick<BaseAppState, "config">) {
  const { t } = useTranslation();
  const showTermsAndConditions = useAppStore(
    (store) => store.showTermsAndConditions,
  );

  const { meta } = config.data;

  return (
    <div className="config-change config-updated">
      <h3 className="titleText">{t("configUpdated title")}</h3>
      <h2>
        {t("configUpdated subtitle")}
        <span className="version">
          {meta.version}-{meta.id}
        </span>
      </h2>

      <div className="cid-button-row">
        <button
          className="cid-button cid-button-lg cid-button-primary"
          onClick={showTermsAndConditions}
        >
          {t("configUpdated confirm")}
        </button>
      </div>
    </div>
  );
}

export default ConfigUpdated;
