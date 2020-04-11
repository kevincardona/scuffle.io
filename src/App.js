import React from 'react';
import {HashRouter, Switch, Route} from 'react-router-dom';
import Menu from './pages/Menu';
import Room from './pages/Room';
import './App.scss'

function App() {
  return(
    <HashRouter>
      <Switch>
        <Route exact path='/room/:room' component={Room}/>
        <Route path={['/invite/:room','*']} component={Menu}/>
      </Switch>
    </HashRouter>
  );
}

export default App;
