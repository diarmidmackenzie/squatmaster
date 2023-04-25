AFRAME.registerComponent('bar-position', {
  
  init() {
    // called once when component is added to an entity

    // create objects here, rather than in tick to save on garbage collection.
    // See: https://aframe.io/docs/1.4.0/introduction/best-practices.html#tick-handlers
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.euler = new THREE.Euler();

  },

  update() {
    // called whenever component properties are updated

  },

  tick() {

    const { position, quaternion, euler } = this
    
    this.el.object3D.getWorldPosition(position);
    this.el.object3D.getWorldQuaternion(quaternion);
    // position and rotation now contain vector and quaternion in world space.

    euler.setFromQuaternion(quaternion)

    console.log("Headset World Position", position)
    console.log("Headset World Quaternion", quaternion)
    console.log("Headset World Euler", euler)
  
  }
})