import React, { Component } from 'react'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'

class IntervalSlider extends Component {
  constructor (props, context) {
    super(props, context)
    this.updateInterval = this.updateInterval.bind(this);
    this.state = {
      value: 10
    }
  }

  handleChangeStart = () => {
    //console.log('Change event started')
  };

  handleChange = value => {
    this.setState({
      value: value
    })
  };

  handleChangeComplete = () => {
    //console.log('Change event completed')
    this.updateInterval();
  };

  render () {
    const { value } = this.state
    return (
      <div className='slider'>
        <Slider
          min={5}
          max={60}
          value={value}
          onChangeStart={this.handleChangeStart}
          onChange={this.handleChange}
          onChangeComplete={this.handleChangeComplete}
        />
      </div>
    )
  }
  updateInterval() {
    this.props.updateInterval(this.state.value);
  }
}

export default IntervalSlider

