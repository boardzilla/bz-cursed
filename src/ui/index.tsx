import React from 'react';
import { render } from '@boardzilla/core';
import { Card, default as setup } from '../game/index.js';

import './style.scss';
import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: board => {
    board.all(Card).appearance({
      render: card => (
        <>
          {card.orientation === 'item' && <div>{card.itemName}</div>}
          {card.orientation === 'monster' && <div>{card.monsterName}<br/>{card.attack}<br/>{card.trait}</div>}
          {card.orientation === 'weapon' && <div>{card.name}<br/>{card.damage}</div>}
        </>
      )
    });
  }
});
