import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Menu from './pages/Menu';
import Game from './pages/Game';
import './App.css'

function App() {
  return(
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path='/room/:room' component={Game}/>
          <Route path={['/invite/:room','*']} component={Menu}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
