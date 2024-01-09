import {
  createGame,
  createBoardClasses,
  Player,
  Board,
} from '@boardzilla/core';

export class CursedPlayer extends Player<CursedPlayer, CursedBoard> {
};

class CursedBoard extends Board<CursedPlayer, CursedBoard> {
}

const { Space, Piece } = createBoardClasses<CursedPlayer, CursedBoard>();

export default createGame(CursedPlayer, CursedBoard, game => {

  const { board, action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  board.registerClasses();

  game.defineActions({
  });

  game.defineFlow(loop(
    playerActions({ actions: [] })
  ))
});
