import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { GetServerSideProps, GetServerSidePropsResponse, PageComponent } from './lib/next';

let params: Record<string, string> = {}; // Set by SSR framework
function getParams(sections: Record<string, number>): Record<string, string> {
  if (window === undefined) {
    return params // SSR
  }
  const parts = window.location.pathname.split("/");
  return Object.fromEntries(
    Object.entries(sections).map(([section, i]) => [section, parts[i]])
  );
}

async function serverSideProps<Props>(getServerSideProps: GetServerSideProps<Props>, params: Record<string, string>): Promise<GetServerSidePropsResponse<Props>> {
  if (window === undefined) {
    return getServerSideProps({ params })
  }
  let path = window.location.pathname;
  if (path.endsWith("/")) { path = path.slice(0, path.length-1) }
  const response = await fetch(`/_next/data${path}.json`);
  return response.json()
}

const pages = import.meta.glob('./pages/**/*.tsx')
const routes = Object.entries(pages).map(([filepath, component]) => {
  let path = filepath
    .replace("./pages", "")
    .replace(".tsx", "")
    .replace("/index", "");

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
        ? await serverSideProps(getServerSideProps, params)
        : undefined;
    return {
      default: () => <Component {...props?.props} />
    }
  }

  return {
    path,
    component: React.lazy(load),
  }
})

export default function App() {
  return (
    <div>
      <Switch>
        {routes.map(({ path, component: RouteComp }) => {
          return (
            <Route key={path} path={path}>
              <Suspense fallback={"loading"}>
                <RouteComp />
              </Suspense>
            </Route>
          )
        })}
      </Switch>
    </div>
  )
}
