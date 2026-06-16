// @flow

import * as React from 'react';

import Icon from './Icon.js';

type Action = 'insert-above' | 'insert-below' | 'add-notes' | 'delete';

type Props = {
  onAction: (action: Action) => void,
};

const MENU_ITEMS: Array<{ action: Action, icon: string, label: string }> = [
  {
    action: 'insert-above',
    icon: 'north',
    label: 'Insert Paragraph Above',
  },
  {
    action: 'insert-below',
    icon: 'south',
    label: 'Insert Paragraph Below',
  },
  { action: 'delete', icon: 'delete', label: 'Delete' },
];

export default class TableContextMenu extends React.PureComponent<Props> {
  render(): React.Element<any> {
    return (
      <div className="czi-table-context-menu">
        {MENU_ITEMS.map((item) => (
          <button
            className="czi-table-context-menu-item"
            key={item.action}
            onClick={(event) => this._onClick(event, item.action)}
            type="button"
          >
            {Icon.get(item.icon)}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  _onClick = (event: SyntheticEvent<>, action: Action): void => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onAction(action);
  };
}
