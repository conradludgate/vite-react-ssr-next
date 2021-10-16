import React, { Suspense } from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Route, Switch } from 'react-router-dom';
import { clientRoutes } from './routes';

// @ts-ignore
ReactDOM.hydrateRoot(
  document.getElementById('root'),
  // <App Component={SSGPage} pageProps={{text: "foobar baz"}} />
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={"loading"}>
        <Switch>
          {clientRoutes.map(({ path, load }) => {
            const RouteComp = React.lazy(load);
            return (
              <Route key={path} path={path}>
                <RouteComp />
              </Route>
            )
          })}
        </Switch>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
)
