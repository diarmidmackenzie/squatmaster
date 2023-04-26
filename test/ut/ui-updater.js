QUnit.module('UI updater', {
  beforeEach: function() {
    const scene = createScene();
    scene.setAttribute('ui-updater', '')

    scene.insertAdjacentHTML('afterBegin', 
    `<a-entity id="inside-rack-ui" position="0 1 -2" in-rack-ui visible="false">
     </a-entity>`
    )
  },
  afterEach: function() {
    const scene = document.querySelector('a-scene');
    scene.parentNode.removeChild(scene)
  }
})

QUnit.test('full squat sequence', function(assert) {

  const checkRepsToGo = (n) => {
    const repsToGo = ui.getAttribute('in-rack-ui').repsToGo
    assert.equal(repsToGo, n)
  }

  // TO DO - explicitly check messages.  For now just console log them for a quick sanity check.
  const logMessage = () => {
    const message = ui.getAttribute('in-rack-ui').message
    console.log(message)
  }

  const scene = document.querySelector('a-scene')
  const done = assert.async();

  scene.addEventListener('loaded', () => {

    ui = document.querySelector('#inside-rack-ui')
    let visible = ui.getAttribute('visible')
    assert.false(visible)

    scene.emit('entered-rack')
    visible = ui.getAttribute('visible')
    assert.true(visible)

    scene.emit('reached-hooks')

    scene.emit('shouldered-bar')
    scene.emit('left-hooks')
    scene.emit('hit-top')
    checkRepsToGo(5)
    
    // ready - rep 1
    scene.emit('lowered-from-top')
    logMessage()
    scene.emit('hit-target-depth')
    logMessage()
    scene.emit('upwards-from-target-depth')
    logMessage()
    scene.emit('hit-top')
    logMessage()
    checkRepsToGo(4)
    logMessage()

    // rep 2
    scene.emit('lowered-from-top')
    scene.emit('hit-target-depth')
    scene.emit('upwards-from-target-depth')
    scene.emit('hit-top')
    checkRepsToGo(3)

    // rep 3
    scene.emit('lowered-from-top')
    scene.emit('hit-target-depth')
    scene.emit('upwards-from-target-depth')
    scene.emit('hit-top')
    checkRepsToGo(2)

    // rep 4
    scene.emit('lowered-from-top')
    scene.emit('hit-target-depth')
    scene.emit('upwards-from-target-depth')
    scene.emit('hit-top')
    checkRepsToGo(1)

    // rep 5
    scene.emit('lowered-from-top')
    scene.emit('hit-target-depth')
    scene.emit('upwards-from-target-depth')
    scene.emit('hit-top')
    logMessage()
    checkRepsToGo(0)

    // re-rack
    scene.emit('reached-hooks')
    logMessage()
    scene.emit('returned-bar')
    logMessage()
    scene.emit('left-hooks')
    logMessage()
    scene.emit('exited-rack')
    logMessage()

    done()
  })

})


