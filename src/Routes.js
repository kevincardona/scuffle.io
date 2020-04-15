import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Menu from './pages/Menu';

function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path={['/invite/:room', '/play']} component={Menu} />
        <Route path={['/about', '/home', '*']} component={Home} />
      </Switch>
    </Router>
  );
}

export default Routes;
