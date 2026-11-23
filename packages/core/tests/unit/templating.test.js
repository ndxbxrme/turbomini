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

test('template: nested loops inherit controller and enclosing item names', () => {
  const app = TurboMini('/');
  app.template('row', '{{title}}/{{group.name}}/{{value}}/{{name}};');
  app.template('list', '{{#each groups as group}}{{#each group.rows}}{{#if show}}{{> row .}}{{/if}}{{/each}}{{/each}}');
  const out = app.$t('list', {
    title: 'Outer',
    value: 'fallback',
    show: true,
    groups: [{ name: 'Group', rows: [{ name: 'A', value: null }, { name: 'B' }] }],
  });
  assert.equal(out, 'Outer/Group//A;Outer/Group/fallback/B;');
});

test('template: chained bracket keys resolve in the active scope', () => {
  const app = TurboMini('/');
  app.registerHelper('upper', (value) => value.toUpperCase());
  app.template('list', '{{api.tables[0]}} {{#each api.fields as field}}' +
    '{{upper api.data[api.cursors[api.active]][field]}} ' +
    '{{{api.data[0]["raw.html ]"]}}} {{api.data[5][field]}}{{/each}}');
  const out = app.$t('list', {
    api: {
      tables: ['users'],
      fields: ['name'],
      cursors: { current: 1 },
      active: 'current',
      data: [{ 'raw.html ]': '<b>raw</b>' }, { name: 'Alice' }],
    },
  });
  assert.equal(out, 'users ALICE <b>raw</b> ');
});
