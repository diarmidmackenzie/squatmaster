AFRAME.registerComponent('in-rack-ui', {

  schema: {
    repsToGo: {default: 5},
    message: {default: ''}
  },

  init() {
    this.circle = document.createElement('a-circle')
    this.circle.setAttribute('radius', 0.5)
    this.el.appendChild(this.circle)

    this.text = document.createElement('a-entity')
    this.text.setAttribute('text', {color:  'black',
                                    wrapCount: 15,
                                    align: 'center'})
    this.circle.appendChild(this.text)
  },

  update() {

    this.text.setAttribute('text', `value: ${this.data.message}\n${this.data.repsToGo} reps to go`)

  }
});
