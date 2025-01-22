import { useState } from 'react';

import { TOOL } from '../constants';
import { classnames } from '../utils';

export const ToolContainer = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="menu">
      <div className={classnames('menu-ico', open && 'active')} />
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
