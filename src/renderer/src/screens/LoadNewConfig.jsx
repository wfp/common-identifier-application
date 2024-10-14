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

function LoadNewConfig() {
    return (<div className="LoadNewConfig appScreen progressIndicator">
        <div className="loaderWrapper">
            <span class="loader"></span>
        </div>
        <div className="help">
            Loading new configuration from file...
        </div>
    </div>)
}

export default LoadNewConfig;