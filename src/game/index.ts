import {
  createGame,
  createBoardClasses,
  Player,
  Board,
  Do,
  union,
} from '@boardzilla/core';
import { cards } from './cards.js';

export class CursedPlayer extends Player<CursedPlayer, CursedBoard> {
};

class CursedBoard extends Board<CursedPlayer, CursedBoard> {
  traitTriggered: boolean = false;
  treasureEarned: boolean = false;
  shielded: number = 0;

  currentDamage() {
    return $.encounter.all(Card, {orientation: 'weapon'}).sum('actualDamage')
  }

  currentMonster() {
    return $.encounter.first(Card, {orientation: 'monster'}) || $.encounter.first(Card, {itemName: 'Mimic!', orientation: 'item'});
  }

  currentMonsterAttack() {
    const monster = this.currentMonster();
    if (monster?.orientation === 'item') return 4;
    return monster?.attack ?? 0;
  }

  pendingDamage() {
    return Math.max(0, this.currentMonsterAttack() - this.currentDamage() - this.shielded);
  }

  haveBust() {
    return this.currentDamage() > this.currentMonsterAttack() && $.encounter.all(Card, {orientation: 'weapon'}).length > 1;
  }
}

const { Space, Piece } = createBoardClasses<CursedPlayer, CursedBoard>();

export class Card extends Piece {
  orientation: 'item' | 'weapon' | 'monster';
  image: string;

  // item properites
  itemName: string;
  description: string;

  // weapon properites
  damage: number;
  weaponType: 'melee' | 'ranged';
  versatile: boolean = false;
  damageChoices: number[];
  actualDamage: number
  ignoreTraits: boolean = false;

  // monster properites
  monsterName: string;
  attack: number;
  trait?: string;
  traitDescription: string;
  treasure: boolean;
  tookDamage: boolean;

  isPlayableItem() {
    if (this.orientation !== 'item') return false;
    if (this.itemName === 'Frenzy Potion') {
      return $.encounter.all(Card, {orientation: 'weapon'}).length === 1 && !this.board.haveBust();
    }
    if (this.itemName === 'Bewitching Relic' || this.itemName === 'Whetstone') {
      return $.encounter.has(Card, {orientation: 'weapon'}) && !this.board.haveBust();
    }
    if (this.itemName === 'Soul Crystal') {
      return this.board.haveBust();
    }
    if (this.itemName === 'Shield' || this.itemName === 'Big Turkey Dinner') {
      return !this.board.haveBust();
    }
    if (this.itemName === 'Large Backpack') {
      return !this.board.haveBust() && $.discard.has(Card);
    }
    if (this.itemName === 'Scroll of Purge Life' || this.itemName === 'Smoke Bomb') {
      return !!this.board.currentMonster();
    }
    return true;
  }

  doItemEffect() {
    if (this.itemName === 'Scroll of Purge Life' || this.itemName === 'Soul Crystal') {
      this.board.currentMonster()?.defeat();
    }
    if (this.itemName === 'Frenzy Potion') {
      const firstWeapon = $.encounter.first(Card, {orientation: 'weapon'})!;
      firstWeapon.actualDamage = firstWeapon.damage * 2;
      firstWeapon.ignoreTraits = true;
    }
    if (this.itemName === 'Whetstone') {
      const lastWeapon = $.encounter.last(Card, {orientation: 'weapon'})!;
      lastWeapon.actualDamage = lastWeapon.damage + 3;
    }
    if (this.itemName === 'Bewitching Relic') {
      const lastWeapon = $.encounter.last(Card, {orientation: 'weapon'})!;
      lastWeapon.actualDamage = lastWeapon.attack;
      lastWeapon.ignoreTraits = true;
    }
    if (this.itemName === 'Smoke Bomb') {
      $.encounter.all(Card).putInto($.draw);
      $.draw.shuffle();
    }
    if (this.itemName === 'Shield') this.board.shielded = 3;
    if (this.itemName === 'Big Turkey Dinner') {
      $.discard.shuffle();
      $.discard.firstN(3, Card).putInto($.draw, {fromBottom: 0});
    }
    if (this.itemName === 'Large Backpack') return this.game.followUp({ name: 'backup', args: { item: this } });
    this.putInto($.discard);
  }

  defeat() {
    this.putInto($.souls);
    if (this.treasure && this.orientation === 'monster') this.board.treasureEarned = true;
  }

  toString() {
    if (this.orientation === 'item') return this.itemName;
    if (this.orientation === 'monster') return this.monsterName;
    return super.toString();
  }
}

export default createGame(CursedPlayer, CursedBoard, game => {

  const { board, action } = game;
  const { playerActions, loop, whileLoop } = game.flowCommands;

  board.registerClasses(Card);

  board.create(Space, 'items');
  board.create(Space, 'souls');
  board.create(Space, 'discard');
  board.create(Space, 'draw');
  board.create(Space, 'encounter');

  $.draw.setOrder('stacking');

  $.draw.onEnter(Card, card => {
    card.hideFromAll();
    card.orientation = 'monster';
  });
  $.items.onEnter(Card, card => {
    card.showToAll();
  });
  $.encounter.onEnter(Card, card => {
    card.actualDamage = card.damage;
    card.showToAll();
  });
  $.discard.onEnter(Card, card => {
    card.showToAll();
    card.orientation = 'weapon';
  });

  for (const card of cards) {
    $.draw.createMany(3, Card, card.name!, card);
  }

  game.defineActions({
    drawItem: () => action({
      prompt: 'Draw your starting item'
    }).chooseOnBoard(
      'item', [$.draw.first(Card)!],
      { skipIf: 'never' }
    ).do(
      ({ item }) => {
        item.putInto($.items)
        item.orientation = 'item';
        if (item.itemName === 'Mimic!') item.putInto($.encounter);
      }
    ).message(
      'Your starting item is {{item}}'
    ),

    drawMonster: () => action({
      prompt: 'Face a monster'
    }).chooseOnBoard(
      'monster', [$.draw.first(Card)!],
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
      prompt: 'Draw a weapon',
      condition: !board.haveBust() && (board.currentMonster()?.trait !== 'Explodes' || !board.traitTriggered)
    }).chooseOnBoard(
      'weapon', union($.draw.first(Card), $.items.all(Card, {orientation: 'weapon'}))
    ).do(
      ({ weapon }) => {
        weapon.putInto($.encounter);
        if (weapon.damageChoices) {
          game.followUp({ name: 'daggerDamage', args: { weapon } });
        }
        if (weapon.versatile) {
          game.followUp({ name: 'versatileChoice', args: { weapon } });
        }
        weapon.orientation = 'weapon';
      }
    ).message(
      'You have drawn a {{weapon}}'
    ),

    daggerDamage: () => action<{weapon: Card}>({
      prompt: "Choose damage"
    }).chooseFrom(
      'damage', ({ weapon }) => weapon.damageChoices!
    ).do(
      ({ damage, weapon }) => {
        weapon.damage = damage;
        weapon.actualDamage = damage;
      }
    ),

    versatileChoice: () => action<{weapon: Card}>({
      prompt: "Choose melee or ranged"
    }).chooseFrom(
      'type', ['melee', 'ranged']
    ).do(
      ({ type, weapon }) => weapon.weaponType = type
    ),

    useItem: () => {
      return action().chooseOnBoard(
        'item',
        $.items.all(Card, c => c.isPlayableItem()),
      ).do(
        ({ item }) => item.doItemEffect()
      );
    },

    backup: () => action<{ item: Card }>({
      prompt: 'Choose a weapon from your backpack'
    }).chooseOnBoard(
      'weapon', $.discard.all(Card),
      { confirm: 'Select {{weapon}}' }
    ).do(
      ({ weapon, item }) => {
        item.putInto($.discard);
        weapon.putInto($.items);
        weapon.orientation = 'weapon';
      }
    ),

    finish: () => action({
      prompt: `Finish the fight (taking ${board.currentMonsterAttack() - board.currentDamage() - board.shielded} damage)`,
      condition: !board.haveBust(),
    }),

    bust: () => action({
      prompt: 'Discard useless weapon',
      condition: board.haveBust(),
    }).do(
      () => $.encounter.last(Card)?.putInto($.discard)
    ),
  });

  game.defineFlow(
    () => {
      $.draw.shuffle();
      game.announce('intro');
    },

    playerActions({ actions: ['drawItem'] }),

    loop(
      whileLoop({
        while: () => !board.currentMonster(),
        do: playerActions({ actions: ['drawMonster', 'useItem'] }),
      }),

      () => {
        board.traitTriggered = false;
        board.shielded = 0;
      },

      loop(
        () => board.currentMonster()!.tookDamage = false,

        playerActions({
          name: 'draw',
          prompt: 'Use weapons or items',
          actions: [
            'drawWeapon',
            'useItem',
            'bust',
            { name: 'finish', do: Do.break }
          ]
        }),

        () => {
          if (!board.currentMonster()) return Do.break();

          game.message(
            "{{damage}} damage vs monster {{attack}}",
            { damage: board.currentDamage(), attack: board.currentMonsterAttack() }
          );

          const lastWeapon = $.encounter.last(Card, {orientation: 'weapon'});
          const currentMonster = board.currentMonster()!;

          if (!board.traitTriggered) {
            const trait = currentMonster.trait;
            if (lastWeapon && !lastWeapon.ignoreTraits) {

              if (trait === 'Explodes') {
                board.traitTriggered = true;
                game.message('Monster explodes!');
              }

              if (trait === 'Flying' && lastWeapon.weaponType === 'melee') {
                board.traitTriggered = true;
                lastWeapon.actualDamage = 0;
                game.message('{{lastWeapon}} does no damage vs Flying monster', {lastWeapon});
              }

              if (trait === 'Tough Skin' && lastWeapon.weaponType === 'ranged') {
                board.traitTriggered = true;
                lastWeapon.actualDamage = 0;
                game.message('{{lastWeapon}} does no damage vs monster with Tough Skin', {lastWeapon});
              }

              if (trait === 'Evasive' && lastWeapon.actualDamage % 2 === 0) {
                board.traitTriggered = true;
                lastWeapon.actualDamage = 0;
                game.message('{{lastWeapon}} does no damage vs Evasive monster', {lastWeapon});
              }

              if (trait === 'Ethereal' && lastWeapon.actualDamage % 2 === 1) {
                board.traitTriggered = true;
                lastWeapon.actualDamage = 0;
                game.message('{{lastWeapon}} does no damage vs Ethereal monster', {lastWeapon});
              }
            }
          }

          if (!board.currentMonster()) {
            return Do.break();
          }

          if (board.haveBust()) {
            game.message("You have gone over!");
          } else {
            if (lastWeapon && lastWeapon.actualDamage > 0 && currentMonster) currentMonster.tookDamage = true;

            if (board.pendingDamage() === 0) return Do.break();
          }
        }
      ), // end fight loop

      () => {
        const monster = board.currentMonster();
        if (monster) {
          const damage = board.pendingDamage();
          const hp = $.draw.all(Card).length;
          game.message(damage === 0 ? "Perfect kill!" : `You take ${damage} damage`);
          $.draw.firstN(damage, Card).putInto($.discard);
          if (damage > hp) return game.finish();
          game.addDelay();
          monster.defeat();
        }
        $.encounter.all(Card).putInto($.discard);

        const souls = $.souls.all(Card).length;
        game.message(`You have ${souls} souls`);
        if (souls >= 8) return game.finish(game.players[0]);

        if (board.treasureEarned) {
          game.addDelay();
          $.discard.shuffle();
          const treasure = $.discard.first(Card);
          if (treasure) {
            treasure.putInto($.items);
            treasure.orientation = 'item';
            if (treasure.itemName === 'Mimic!') {
              treasure.putInto($.encounter);
            } else {
              game.message("You got a {{treasure}}", {treasure});
            }
          }
          board.treasureEarned = false;
        }
      },
    )
  )
});
