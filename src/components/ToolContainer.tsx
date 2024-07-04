import { useState } from 'react';

import { TOOL } from '../constants';
import { classnames } from '../utils';

export const ToolContainer = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="menu">
      <div className={classnames('menu-ico', open && 'active')} onClick={() => setOpen((s) => !s)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 256 256"
          className={classnames('scale-[1.75] transition-transform', open && '-rotate-180')}
        >
          <g fill="currentColor">
            <path d="M40 128h88v88H48a8 8 0 0 1-8-8Zm168-88h-80v88h88V48a8 8 0 0 0-8-8" opacity=".2"></path>
            <path d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 88h-72V48h72Zm-88-72v72H48V48Zm-72 88h72v72H48Zm160 72h-72v-72h72z"></path>
          </g>
        </svg>
      </div>
      <div className="menu-tool">
        <div className="tool-container" onDoubleClick={() => setOpen((s) => !s)}>
          {TOOL.map((_) => (
            <div
              key={_.id}
              id={_.id}
              className={`tool-btn ${_.change ? 'btn--change' : ''}`}
              dangerouslySetInnerHTML={{ __html: `<span class="tool-label">${_.label}</span>` + _.content }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
