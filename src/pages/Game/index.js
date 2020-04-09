import React, {Component} from 'react';
import {socket, joinRoom} from '../../util/api';
import { useParams } from 'react-router-dom';
import './game.css';
import Loader from '../../assets/loader.svg';

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    }
  }

  componentDidMount() {
  }

  render() {
    const {loading} = this.state
    if (loading) {
      return (
        <div id="loading">
          <h3 className="text-muted font-weight-bold">LOADING</h3>
          <object type="image/svg+xml" id="loader" data={Loader}/>
        </div> 
      )
    }
    return (
      <div id='Game'>
      </div>
    )
  }
}