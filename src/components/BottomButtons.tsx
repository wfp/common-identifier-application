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
import React from 'react';

interface ButtonPropsBase {
  l_disabled?: boolean;
  r_disabled?: boolean;
  l_content?: string;
  r_content?: string;
}

type Side = 'both' | 'left' | 'right';

interface ButtonProps extends ButtonPropsBase {
  l_onClick?: React.MouseEventHandler<HTMLElement>;
  r_onClick?: React.MouseEventHandler<HTMLElement>;
  side?: Side;
}

const ButtonRow: React.FC<ButtonProps> = ({
  l_onClick,
  l_content,
  l_disabled = false,
  r_onClick,
  r_content,
  r_disabled = false,
  side = 'both',
}) => {
  if (side === 'left') {
    return (
      <div className="cid-button-row cid-button-row-horiz">
        <button
          className="cid-button cid-button-lg cid-button-secondary cid-button--pos-left"
          onClick={l_onClick}
          disabled={l_disabled}
        >
          {l_content}
        </button>
      </div>
    );
  }

  if (side === 'right') {
    return (
      <div className="cid-button-row cid-button-row-horiz">
        <button
          className="cid-button cid-button-lg cid-button-primary cid-button--pos-right"
          onClick={r_onClick}
          disabled={r_disabled}
        >
          {r_content}
        </button>
      </div>
    );
  }

  // both
  return (
    <div className="cid-button-row cid-button-row-horiz">
      <button
        className="cid-button cid-button-lg cid-button-secondary cid-button--pos-left"
        onClick={l_onClick}
        disabled={l_disabled}
      >
        {l_content}
      </button>
      <button
        className="cid-button cid-button-lg cid-button-primary cid-button--pos-right"
        onClick={r_onClick}
        disabled={r_disabled}
      >
        {r_content}
      </button>
    </div>
  );
};

export default ButtonRow;
