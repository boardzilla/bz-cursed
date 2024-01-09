import { Card } from "./index.js";

export const cards: Partial<Card>[] = [{
  monsterName: 'Corpuscle',
  attack: 5,
  trait: 'Explodes',
  traitDescription: 'You are only able to land a single attack.',
  treasure: false,
  name: 'Greatsword',
  damage: 5,
  weaponType: 'melee',
  itemName: 'Soul Crystal',
  description: 'Take no additional damage if you attack over a monster’s power. Ignores any traits.'
}, {
  monsterName: 'Giant Bat',
  attack: 7,
  trait: 'Flying',
  traitDescription: 'First melee attack deals no damage.',
  treasure: false,
  name: 'Fireball Spell',
  damage: 5,
  weaponType: 'ranged',
  itemName: 'Big Turkey Dinner',
  description: 'Yum! Shuffle discard pile, take 3 cards, place them at the bottom of your draw pile.'
}, {
  monsterName: 'Wraith',
  attack: 8,
  trait: 'Ethereal',
  traitDescription: 'First odd value weapon attack deals no damage.',
  treasure: false,
  name: 'Sword',
  damage: 4,
  weaponType: 'melee',
  itemName: 'Smoke Bomb',
  description: 'Place all cards in the current encounter into the draw deck and shuffle.'
}, {
  monsterName: 'Bullywug',
  attack: 8,
  treasure: false,
  name: 'Staff',
  damage: 4,
  weaponType: 'ranged',
  itemName: 'Bewitching Relic',
  description: 'Use the monster side of a drawn weapon card to attack. Ignores monster traits.'
}, {
  monsterName: 'Bullywug',
  attack: 9,
  treasure: false,
  name: 'Spear',
  damage: 3,
  weaponType: 'either',
  itemName: 'Scroll of Purge Life',
  description: 'Instantly capture a monster’s soul when used. Ignores monster traits.'
}, {
  monsterName: 'Skeletal Knight',
  attack: 9,
  trait: 'Evasive',
  traitDescription: 'First even value weapon attack deals no damage.',
  treasure: false,
  name: 'Mace',
  damage: 3,
  weaponType: 'melee',
  itemName: 'Shield',
  description: 'Blocks up to 3 damage.'
}, {
  monsterName: 'Kobold',
  attack: 10,
  trait: 'Tough Skin',
  traitDescription: 'First range attack deals no damage.',
  treasure: false,
  name: 'Axe',
  damage: 2,
  weaponType: 'melee',
  itemName: 'Whetstone',
  description: '+3 damage to a single weapon.'
}, {
  monsterName: 'Jackalwere',
  attack: 10,
  treasure: true,
  name: 'Short Bow',
  damage: 2,
  weaponType: 'ranged',
  itemName: 'Frenzy Potion',
  description: 'Your initial weapon strike hits for double damage and ignores monster traits. '
}, {
  monsterName: 'Werecrocodile',
  attack: 11,
  treasure: true,
  name: 'Throwing Daggers',
  damage: 1,
  weaponType: 'ranged',
  itemName: 'Large Backpack',
  description: 'Take a weapon card from the discard pile and keep it with your items for use when needed.'
}, {
  monsterName: 'Blood Cleric',
  attack: 11,
  treasure: true,
  name: 'Dagger',
  damage: 1,
  weaponType: 'melee',
  itemName: 'Mimic!',
  description: 'When drawn as an item immediately treat the Mimic as a monster with a power of 4.'
}];