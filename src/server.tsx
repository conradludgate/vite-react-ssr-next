import ReactDOMServer from 'react-dom/server'
import { StaticRouterContext } from 'react-router'
import { StaticRouter } from 'react-router-dom'
import { Route, Switch } from 'react-router-dom';
import App from './App'
import { GetServerSidePropsResponse, PageComponent } from './lib/next';
import React, { Suspense } from 'react';
import { clientRoutes, routes } from './routes';


function matches(route: string, path: string): Record<string, string> | undefined {
    const routeSections = route.split("/");
    const pathSections = path.split("/");

    const output: Record<string, string> = {};

    if (routeSections.length !== pathSections.length) {
        return undefined
    }

    for (let i = 0; i < routeSections.length; i++) {
        const routeSection = routeSections[i];
        const pathSection = pathSections[i];

        if (routeSection.startsWith(":")) {
            output[routeSection.slice(1)] = pathSection;
        } else if (routeSection !== pathSection) {
            return undefined
        }
    }

    return output
}

interface MatchedRoute {
    route: string,
    params: Record<string, string>,
    component: () => Promise<{[key: string]: any;}>,
}
interface MaybeMatchedRoute {
    route: string,
    params: Record<string, string> | undefined,
    component: () => Promise<{[key: string]: any;}>,
}

function isMatchedRoute(m: MaybeMatchedRoute): m is MatchedRoute {
    return m.params !== undefined
}

function matchRoutes(url: string): MatchedRoute | undefined {
    const matchedRoutes = routes.map(({ route, component }) => ({
        route,
        params: matches(route, url),
        component,
    })).filter(isMatchedRoute);

    matchedRoutes.sort((a, b) =>
        Object.keys(a).length - Object.keys(b).length
    )

    return matchedRoutes[0]
}

export async function getServerSideProps<Props>(url: string): Promise<GetServerSidePropsResponse<Props>> {
    const match = matchRoutes(url);
    if (!match) { throw "not found" }
    const { params, component } = match

    const { getServerSideProps } = await component() as PageComponent<Props>;

    if (!getServerSideProps) {
        throw "no server side props"
    }

    return getServerSideProps({ params })
}

export async function render(url: string, context?: StaticRouterContext): Promise<NodeJS.ReadableStream> {
    const match = matchRoutes(url);
    if (!match) { throw "not found" }
    const { route, params, component } = match

    const { default: Component, getServerSideProps, getStaticProps } = await component() as PageComponent<any>;

    const props = getStaticProps
        ? await getStaticProps({ params })
        : getServerSideProps
            ? await getServerSideProps({ params })
            : undefined;

    return ReactDOMServer.renderToNodeStream(
        // <StaticRouter location={url} context={context}>
        //     <App Component={Component} pageProps={props?.props} />
        // </StaticRouter>

        <React.StrictMode>
            <StaticRouter location={url} context={context}>
                <Suspense fallback={"loading"}>
                    <Switch>
                        {clientRoutes.map(({ path, load }) => {
                            if (path === route) {
                                return (
                                    <Route key={path} path={path}>
                                        <App Component={Component} pageProps={props?.props} />
                                    </Route>
                                )
                            }
                            const RouteComp = React.lazy(load);
                            return (
                                <Route key={path} path={path}>
                                    <RouteComp />
                                </Route>
                            )
                        })}
                    </Switch>
                </Suspense>
            </StaticRouter>
        </React.StrictMode>
    )
}

// export async function getStaticPaths(file: string): Promise<GetStaticPathsResponse> {
//     file = file.replace(/\.tsx$/, "")
//     const { getStaticPaths } = await import(`./pages/${file}.tsx`);
//     return getStaticPaths ? getStaticPaths() : { paths: [], fallback: true }
// }
