import React from 'react';

interface ButtonProps {
  l_onClick: React.MouseEventHandler<HTMLElement>;
  r_onClick: React.MouseEventHandler<HTMLElement>;
  l_disabled?: boolean;
  r_disabled?: boolean;
  l_content: string;
  r_content: string;
}

export default ({
  l_onClick,
  l_content,
  l_disabled = false,
  r_onClick,
  r_content,
  r_disabled = false,
}: ButtonProps) => (
  <div className="cid-button-row cid-button-row-horiz">
    <button
      className="cid-button cid-button-lg cid-button-secondary"
      onClick={l_onClick}
      disabled={l_disabled}
    >
      {l_content}
    </button>
    <button
      className="cid-button cid-button-lg cid-button-primary"
      onClick={r_onClick}
      disabled={r_disabled}
    >
      {r_content}
    </button>
  </div>
);
