import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Room from './pages/Room';

function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path='/room/:room' component={Room} />
        <Route exact path={['/invite/:room', '/play']} component={Menu} />
        <Route exact path={['/about', '/home', '*']} component={Home} />
      </Switch>
    </Router>
  );
}

export default Routes;
