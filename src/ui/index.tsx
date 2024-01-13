import React from 'react';
import { render } from '@boardzilla/core';
import { Card, default as setup } from '../game/index.js';

import './style.scss';
import '@boardzilla/core/index.css';

render(setup, {
  boardSizes: (_screenX, _screenY, mobile) => mobile ? {
    name: 'mobile',
    aspectRatio: 2.2,
  } : {
    name: 'desktop',
    aspectRatio: 8 / 5,
  },

  settings: {
  },

  layout: board => {
    board.disableDefaultAppearance();

    board.layout($.items, {
      area: { left: 3, top: 2, width: 45, height: 45 },
    });

    board.layout($.souls, {
      area: { left: 52, top: 2, width: 45, height: 45 },
    });

    board.layout($.draw, {
      area: { left: 3, top: 52, width: 30, height: 45 },
    });

    board.layout($.encounter, {
      area: { left: 35, top: 52, width: 30, height: 45 },
    });

    board.layout($.discard, {
      area: { left: 70, top: 52, width: 28, height: 45 },
    });

    $.draw.layout(Card, {
      columns: 1,
      offsetRow: { x: 4, y: 2 },
      scaling: 'fit',
      limit: 10,
    });

    $.items.layout($.items.all(Card, {orientation: 'weapon'}), {
      area: { left: 50, top: 0, width: 50, height: 100 },
      columns: 1,
      offsetRow: { x: 0, y: 23 },
      scaling: 'fit',
    });

    $.items.layout($.items.all(Card, {orientation: 'item'}), {
      area: { left: 0, top: 0, width: 50, height: 100 },
      columns: 1,
      offsetRow: { x: 0, y: 23 },
      scaling: 'fit',
    });

    $.souls.layout(Card, {
      columns: 2,
      rows: 4,
      offsetColumn: { x: 120, y: 0 },
      offsetRow: { x: 0, y: 20 },
      direction: 'ttb',
      scaling: 'fill',
      alignment: 'right',
    });

    $.discard.layout(Card, {
      columns: 1,
      area: { left: 20, top: -20, width: 60, height: 140 },
      offsetRow: { x: 0, y: 23 },
      scaling: 'fill',
      alignment: 'top',
    });

    $.encounter.layout($.encounter.all(Card, {orientation: 'weapon'}), {
      columns: 1,
      area: { left: 20, top: 0, width: 60, height: 140 },
      offsetRow: { x: 0, y: 23 },
      scaling: 'fill',
      alignment: 'top',
    });

    board.all(Card).appearance({
      aspectRatio: 3 / 5,
      render: () => (
        <div>
          <div className="front"/>
          <div className="back"/>
        </div>
      ),
    });

    $.encounter.all(Card).appearance({
      effects: [
        {
          attributes: { tookDamage: true },
          className: 'shake'
        }
      ]
    });

    $.draw.appearance({
      render: draw => <div className={'hp' + (draw.all(Card).length <= 5 ? ' hurt' : '')}>{draw.all(Card).length}</div>
    });

    board.layoutStep('draw', {
      element: board,
      left: 40,
      width: 20,
      top: 0
    });
  }
});
