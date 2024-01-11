import {
  createGame,
  createBoardClasses,
  Player,
  Board,
  Do,
} from '@boardzilla/core';
import { cards } from './cards.js';

export class CursedPlayer extends Player<CursedPlayer, CursedBoard> {
};

class CursedBoard extends Board<CursedPlayer, CursedBoard> {

  currentDamage() {
    return $.encounter.all(Card, {orientation: 'weapon'}).sum('damage')
  }

  currentMonster() {
    return $.encounter.first(Card, {orientation: 'monster'});
  }

  currentMonsterAttack() {
    return this.currentMonster()?.attack ?? 0;
  }

  pendingDamage() {
    return Math.max(0, this.currentMonsterAttack() - this.currentDamage());
  }

  haveBust() {
    return this.currentDamage() > this.currentMonsterAttack() && $.encounter.all(Card, {orientation: 'weapon'}).length > 1;
  }
}

const { Space, Piece } = createBoardClasses<CursedPlayer, CursedBoard>();

export class Card extends Piece {
  orientation: 'item' | 'weapon' | 'monster' = 'weapon';

  // item properites
  itemName: string;
  description: string;

  // weapon properites
  damage: number;
  weaponType: 'melee' | 'ranged';
  versatile: boolean = false;
  damageChoices: number[];

  // monster properites
  monsterName: string;
  attack: number;
  trait?: string;
  traitDescription: string;
  treasure: boolean;

  toString() {
    if (this.orientation === 'item') return this.itemName;
    if (this.orientation === 'monster') return this.monsterName;
    return super.toString();
  }
}

export default createGame(CursedPlayer, CursedBoard, game => {

  const { board, action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  board.registerClasses(Card);

  board.create(Space, 'items');
  board.create(Space, 'souls');
  board.create(Space, 'discard');
  board.create(Space, 'draw');
  board.create(Space, 'encounter');

  for (const card of cards) {
    $.draw.createMany(3, Card, card.name!, card);
  }

  game.defineActions({
    drawItem: () => action({
      prompt: 'Draw your starting item'
    }).chooseOnBoard(
      'item', $.draw.all(Card),
      { skipIf: 'never' }
    ).do(
      ({ item }) => {
        item.putInto($.items);
        item.orientation = 'item';
      }
    ).message(
      'Your starting item is {{item}}'
    ),

    drawMonster: () => action({
      prompt: 'Face a monster'
    }).chooseOnBoard(
      'monster', $.draw.all(Card),
      { skipIf: 'never' }
    ).do(
      ({ monster }) => {
        monster.putInto($.encounter);
        monster.orientation = 'monster';
      }
    ).message(
      'You face a {{monster}}'
    ),

    drawWeapon: () => action({
      prompt: 'Draw a weapon'
    }).chooseOnBoard(
      'weapon', $.draw.all(Card),
      { skipIf: 'never' }
    ).do(
      ({ weapon }) => {
        weapon.putInto($.encounter);
        weapon.orientation = 'weapon';
        if (weapon.damageChoices) game.followUp(
          { name: 'daggerDamage', args: { weapon } }
        );
        if (weapon.versatile) game.followUp(
          { name: 'versatileChoice', args: { weapon } }
        );
      }
    ).message(
      'You have drawn a {{weapon}}'
    ),

    daggerDamage: () => action<{weapon: Card}>({
      prompt: "Choose damage"
    }).chooseFrom(
      'damage', ({ weapon }) => weapon.damageChoices!
    ).do(
      ({ damage, weapon }) => weapon.damage = damage
    ),

    versatileChoice: () => action<{weapon: Card}>({
      prompt: "Choose melee or ranged"
    }).chooseFrom(
      'type', ['melee', 'ranged']
    ).do(
      ({ type, weapon }) => weapon.weaponType = type
    ),

    finish: () => action({
      prompt: 'Finish the battle'
    }),

    bust: () => action({
      prompt: 'Discard useless weapon'
    }).do(
      () => $.encounter.last(Card)?.putInto($.discard)
    ),
  });

  game.defineFlow(
    () => $.draw.shuffle(),
    playerActions({ actions: ['drawItem'] }),

    loop(
      playerActions({ actions: ['drawMonster'] }),

      loop(
        playerActions({
          actions: [
            'drawWeapon',
            { name: 'finish', do: Do.break }
          ]
        }),

        () => {
          game.message(
            "{{damage}} damage vs monster {{attack}}",
            { damage: board.currentDamage(), attack: board.currentMonsterAttack() }
          );
          if (board.pendingDamage() === 0) return Do.break();
          if (!board.haveBust()) return Do.repeat();
          game.message("You have gone over!");
        },

        playerActions({ actions: ['bust'] })
      ),

      () => {
        const damage = board.pendingDamage();
        game.message(damage === 0 ? "Perfect kill!" : `You take ${damage} damage`);
        const monster = $.encounter.first(Card, {orientation: 'monster'});
        monster?.putInto($.souls);
        game.addDelay();
        $.encounter.all(Card).putInto($.discard);
        game.addDelay();
        $.draw.firstN(damage, Card).putInto($.discard);
        const souls = $.souls.all(Card).length;
        game.message(`You have ${souls} souls`);
        if (souls >= 8) game.finish(game.players[0]);

        if (monster?.treasure) {
          $.discard.shuffle();
          const treasure = $.discard.first(Card);
          if (treasure) {
            treasure.putInto($.items);
            treasure.orientation = 'item';
            game.message(`You got a ${treasure}!`);
          }
        }
      },
    )
  )
});
