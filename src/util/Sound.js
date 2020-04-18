import { Component } from 'react'

class Sound extends Component {
  constructor(props) {
    super(props)
    this.state = {
      play: false
    }
    this.audio = new Audio(this.props.url)
  }
  componentDidMount() {
    setTimeout(() => {
      this.audio.volume = this.props.volume || 0.3
      this.audio.play()
    }, this.props.delay)
  }
  render() {
    return null;
  }
}

export default Sound;