import React, { Component } from 'react'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'

class IntervalSlider extends Component {
  /**
   * Constructs a new instance.
   * State Params:
   *  value: default selected 'interval' (minutes)
   *
   */
  constructor (props, context) {
    super(props, context)
    this.updateInterval = this.updateInterval.bind(this);
    this.state = {
      value: 10
    }
  }
  /**
   * Pre:
   *  The component did mount.
   *  The react-rangeslider is being moved
   * Post:
   *  
   */
  handleChangeStart = () => {
    //console.log('Change event started')
  };
  /**
   * Pre:
   *  The component did mount.
   *  The react-rangeslider has been moved, that is, a call to handleChangeStart has been made.
   * Post:
   *  The class state: value is updated based on the rangeslider position
   *
   * param: value The rangeslider position
   */
  handleChange = value => {
    this.setState({
      value: value
    })
  };
  /**
   * Pre:
   *  The component did mount.
   *  The react-rangeslider move is complete, that is, a call to handleChange has been made.
   * Post:
   *  Call to props is made to pass the updated value to the parent
   *
   * param: value The rangeslider position
   */
  handleChangeComplete = () => {
    //console.log('Change event completed')
    this.updateInterval();
  };
  /**
   * Post:
   *  Renders the interval-rangeslider components
   *
   * return: html for an <IntervalSlider /> object.
   */
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
  /**
   * Pre:
   *  The component did mount.
   *  The react-rangeslider move is complete, that is, a call to handleChange has been made.
   * Post:
   *  Call to props is made to pass the updated value to the parent
   */
  updateInterval() {
    this.props.updateInterval(this.state.value);
  }
}

export default IntervalSlider

