import {
  createGame,
  createBoardClasses,
  Player,
  Board,
  playerActions,
  loop,
  eachPlayer,
} from '@boardzilla/core';

export class CursedPlayer extends Player<CursedPlayer, CursedBoard> {
};

class CursedBoard extends Board<CursedPlayer, CursedBoard> {
}

const { Space, Piece } = createBoardClasses<CursedPlayer, CursedBoard>();

export { Space };

export default createGame(CursedPlayer, CursedBoard, game => {

  const { board, action } = game;

  board.registerClasses();

  game.defineActions({
    wait: () => action({}),
    // drawWeapon
    // followup for dagger
    // followup for spear
    // useItem
  });

  game.defineFlow(loop(
    playerActions({
      actions: ['wait']
    })
  ))
});
