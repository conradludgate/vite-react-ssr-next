import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom'
import { Router } from 'react-router-dom'
import { Route, Switch } from 'react-router-dom';
import { clientRoutes } from './routes';
import { createBrowserHistory } from 'history';

// @ts-ignore
ReactDOM.hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <Client />
  </React.StrictMode>
)

function Client() {
  const history = createBrowserHistory();
  useEffect(() => {
    return history.listen(event => {
      console.log(event)
    });
  }, [history])

  return <Router history={history}>
    <Suspense fallback={"loading"}>
      <Switch>
        {clientRoutes.map(({ path, load }) => {
          const RouteComp = React.lazy(load);
          return (
            <Route exact key={path} path={path}>
              <RouteComp />
            </Route>
          )
        })}
      </Switch>
    </Suspense>
  </Router>
}
