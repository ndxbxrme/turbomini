import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

test('template: escapes HTML and renders raw HTML', () => {
  const app = TurboMini('/');
  app.template('tpl', '<p>{{name}}</p><p>{{{html}}}</p>');
  const out = app.$t('tpl', { name: '<b>Bob</b>', html: '<i>Ted</i>' });
  assert.equal(out, '<p>&lt;b&gt;Bob&lt;/b&gt;</p><p><i>Ted</i></p>');
});

test('template: conditional sections', () => {
  const app = TurboMini('/');
  app.template('cond', '{{#if show}}<span>{{msg}}</span>{{/if}}');
  assert.equal(app.$t('cond', { show: true, msg: 'Hi' }), '<span>Hi</span>');
  assert.equal(app.$t('cond', { show: false, msg: 'Hi' }), '');
});

test('template: loops with alias and index', () => {
  const app = TurboMini('/');
  app.template('list', '{{#each items as item}}<p>{{item}}-{{index}}</p>{{/each}}');
  const out = app.$t('list', { items: ['a', 'b'] });
  assert.equal(out, '<p>a-0</p><p>b-1</p>');
});

test('template: loops without alias use item as context', () => {
  const app = TurboMini('/');
  app.template('list', '{{#each items}}<p>{{this}}</p>{{/each}}');
  const out = app.$t('list', { items: ['a', 'b'] });
  assert.equal(out, '<p>a</p><p>b</p>');
});

test('template: partials with params', () => {
  const app = TurboMini('/');
  app.template('item', '<li>{{user.name}}</li>');
  app.template('list', '<ul>{{#each users as u}}{{> item user=u}}{{/each}}</ul>');
  const out = app.$t('list', { users: [{ name: 'A' }, { name: 'B' }] });
  assert.equal(out, '<ul><li>A</li><li>B</li></ul>');
});

test('template: unknown partial throws', () => {
  const app = TurboMini('/');
  app.template('main', '{{> missing}}');
  assert.throws(() => app.$t('main', {}), /Partial "missing" not found/);
});

test('template: custom helper and unknown helper', () => {
  const app = TurboMini('/');
  app.registerHelper('upper', (v) => String(v).toUpperCase());
  app.template('t', '{{upper name}} {{lower name}}');
  const out = app.$t('t', { name: 'Bob' }, { helpers: { lower: (v) => v.toLowerCase() } });
  assert.equal(out, 'BOB bob');
  app.template('bad', '{{nope x}}');
  assert.throws(() => app.$t('bad', { x: 1 }), /Unknown helper: nope/);
});
