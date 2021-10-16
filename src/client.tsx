import React, { Suspense } from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Route, Switch } from 'react-router-dom';
import { GetServerSidePropsResponse, PageComponent } from './lib/next';
import App from './App'

function getParams(sections: Record<string, number>): Record<string, string> {
  const parts = window.location.pathname.split("/");
  return Object.fromEntries(
    Object.entries(sections).map(([section, i]) => [section, parts[i]])
  );
}

async function serverSideProps<Props>(): Promise<GetServerSidePropsResponse<Props>> {
  let path = window.location.pathname;
  if (path.endsWith("/")) { path = path.slice(0, path.length - 1) }
  const response = await fetch(`/_next/data${path}.json`);
  return response.json()
}

const pages = import.meta.glob('./pages/**/*.tsx')
const routes = Object.entries(pages).map(([filepath, component]) => {
  const path = filepath
    .replace(/^\.\/pages/, "")
    .replace(/.tsx$/, "")
    .replace(/\/index$/, "");

  const sections = Object.fromEntries(
    path.split("/")
      .map<[string, number]>((section, i) => [section, i])
      .filter(([section]) => section.startsWith(":"))
      .map(([section, i]) => [section.slice(1), i])
  );

  async function load() {
    const { default: Component, getServerSideProps, getStaticProps } = await component() as PageComponent<any>;
    const params = getParams(sections);

    const props = getStaticProps
      ? await getStaticProps({ params })
      : getServerSideProps
        ? await serverSideProps()
        : undefined;
    return {
      default: () => App({ Component, pageProps: props?.props })
    }
  }

  return {
    path,
    load,
  }
})

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={"loading"}>
        <Switch>
          {routes.map(({ path, load }) => {
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
  </React.StrictMode>,
  document.getElementById('root')
)
