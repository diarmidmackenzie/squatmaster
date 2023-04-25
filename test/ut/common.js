const createScene = () => {
  const scene = document.createElement('a-scene')
  document.body.appendChild(scene)

  return scene
}

const nextTick = (scene) => {

  if (scene.hasLoaded) {
    scene.tick()
  }
  else {
    scene.addEventListener('loaded', () => {
      scene.tick()
    })
  }
}

const setCameraPosition = (scene, x, y, z) => {

  if (scene.camera) {
    scene.camera.parent.position.set(x, y, z)
  }
  else {
    scene.addEventListener('loaded', () => {
      scene.camera.parent.position.set(x, y, z)
    })
  }
}
