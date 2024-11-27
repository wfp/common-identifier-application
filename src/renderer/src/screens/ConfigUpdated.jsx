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

import { useAppStore } from '../store';

function ConfigUpdated({ config }) {
  const showTermsAndConditions = useAppStore(
    (store) => store.showTermsAndConditions,
  );

  const { meta } = config.data;

  return (
    <div className="config-change config-updated">
      <h3 className="titleText">Configuration Updated</h3>
      <h2>
        Configuration successfully updated to
        <span className="version">
          {meta.version}-{meta.region}
        </span>
      </h2>

      <div className="cid-button-row">
        <button
          className="cid-button cid-button-lg cid-button-primary"
          onClick={showTermsAndConditions}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default ConfigUpdated;
