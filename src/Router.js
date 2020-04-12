import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Room from './pages/Room';

function Router() {
  return (
    <HashRouter>
      <Switch>
        <Route exact path='/room/:room' component={Room} />
        <Route exact path={['/about']} component={Home} />
        <Route exact path={['/invite/:room', '/menu', '*']} component={Menu} />
      </Switch>
    </HashRouter>
  );
}

export default Router;
