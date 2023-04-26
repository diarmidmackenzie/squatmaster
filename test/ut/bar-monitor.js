QUnit.module('basic tests', {
  beforeEach: function() {
    const scene = createScene();
    scene.setAttribute('bar-position', '');
    scene.setAttribute('bar-monitor', '');
    setCameraPosition(scene, 0, 1.6, -1);

    scene.insertAdjacentHTML('afterBegin', 
    `<a-entity id="rack" squat-rack position="0 0 -1"></a-entity>`
    )

  },
  afterEach: function() {
    const scene = document.querySelector('a-scene');
    scene.parentNode.removeChild(scene)
  }
})

QUnit.test('lifter starts inside rack - received entered-rack event', function(assert) {

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  scene.addEventListener('loaded', () => {

    scene.addEventListener('entered-rack', () => {
      done()
      assert.expect(0)
    }, {once: true})
  })

})

QUnit.test('lifter moves out of rack - received exited-rack event', function(assert) {

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  scene.addEventListener('loaded', () => {

    // wait for entered-rack event before moving out of rack, or we won't get an exited rack event.
    scene.addEventListener('entered-rack', () => {
      scene.addEventListener('exited-rack', () => {
        done()
        assert.expect(0)
      }, {once: true})

      scene.camera.position.set(0, 1.6, 2)
    }, {once: true})
  })
})

QUnit.test('full sequence: lifter lifts bar, squats and puts bar back onto hooks', function(assert) {

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  scene.addEventListener('loaded', () => {

    // enter rack, then move to reach hooks.
    scene.addEventListener('entered-rack', () => {

      scene.camera.parent.position.set(0, 1.6, -1.7)
      assert.false(scene.components['bar-monitor'].state.barOnShoulders) 

      scene.addEventListener('reached-hooks', () => {

        scene.camera.parent.position.set(0, 1.7, -1.6)

        scene.addEventListener('left-hooks', () => {

          assert.true(scene.components['bar-monitor'].state.barOnShoulders) 
          scene.camera.parent.position.set(0, 1.8, -1)

          scene.addEventListener('hit-top', () => {

            assert.true(scene.components['bar-monitor'].state.barOnShoulders) 
            scene.camera.parent.position.set(0, 0.59, -1)

            scene.addEventListener('hit-target-depth', () => {

              scene.camera.parent.position.set(0, 1.8, -1)
              scene.addEventListener('hit-top', () => {

                assert.true(scene.components['bar-monitor'].state.barOnShoulders) 
                scene.camera.parent.position.set(0, 1.6, -1.7)

                scene.addEventListener('reached-hooks', () => {
                  assert.true(scene.components['bar-monitor'].state.barOnShoulders) 
                  scene.camera.parent.position.set(0, 1.4, -1.5)

                  scene.addEventListener('left-hooks', () => {
                    assert.false(scene.components['bar-monitor'].state.barOnShoulders)
                    done()
                  }, {once: true})
                }, {once: true})
              }, {once: true})
            }, {once: true})
          }, {once: true})
        }, {once: true})
      }, {once: true})
    }, {once: true})
  })
})

