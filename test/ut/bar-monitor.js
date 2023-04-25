QUnit.module('basic tests', {
  beforeEach: function() {
    const scene = createScene();
    scene.setAttribute('bar-position', '');
    scene.setAttribute('bar-monitor', '');
    setCameraPosition(scene, 0, 1.6, 1);
  },
  afterEach: function() {
    const scene = document.querySelector('a-scene');
    scene.parentNode.removeChild(scene)

  }
})

QUnit.test('lifter starts inside rack - received entered-rack event', function(assert) {

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  scene.addEventListener('entered-rack', () => {
    done()
    assert.expect(0)
  }, {once: true})

  nextTick(scene)
})

QUnit.test('lifter moves out of rack - received exited-rack event', function(assert) {

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  // wait for entered-rack event before moving out of rack, or we won't get an exited rack event.
  scene.addEventListener('entered-rack', () => {
    scene.addEventListener('exited-rack', () => {
      done()
      assert.expect(0)
    }, {once: true})

    scene.camera.position.set(0, 1.6, -2)
    nextTick(scene)
  }, {once: true})

  nextTick(scene)
})

QUnit.test('full sequence: lifter lifts bar, squats and puts bar back onto hooks', function(assert) {

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  setCameraPosition(scene, 0, 1.6, 1) 

  // enter rack, then move to reach hooks.
  scene.addEventListener('entered-rack', () => {

    scene.camera.parent.position.set(0, 1.6, 1.7)

    scene.addEventListener('reached-hooks', () => {
      done()
      assert.expect(0)
    }, {once: true})

    nextTick(scene)
  }, {once: true})

  nextTick(scene)
})

