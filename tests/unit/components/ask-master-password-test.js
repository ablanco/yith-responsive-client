import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('ask-master-password', 'Unit | Component | ask master password', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test('it renders', function(assert) {
  var component;
  assert.expect(2);

  // Creates the component instance
  component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});
