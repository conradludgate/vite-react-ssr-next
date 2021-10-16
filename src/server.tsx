import ReactDOMServer from 'react-dom/server'
import { StaticRouterContext } from 'react-router'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { GetServerSidePropsResponse, PageComponent } from './lib/next';

const pages = import.meta.glob('./pages/**/*.tsx');
const routes = Object.entries(pages).map(([filepath, component]) => {
    const route = filepath
        .replace(/^\.\/pages/, "")
        .replace(/.tsx$/, "")
        .replace(/\/index$/, "");

    return {
        route,
        component,
    }
})

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
    params: Record<string, string>,
    component: () => Promise<{[key: string]: any;}>,
}
interface MaybeMatchedRoute {
    params: Record<string, string> | undefined,
    component: () => Promise<{[key: string]: any;}>,
}

function isMatchedRoute(m: MaybeMatchedRoute): m is MatchedRoute {
    return m.params !== undefined
}

function matchRoutes(url: string): MatchedRoute | undefined {
    const matchedRoutes = routes.map(({ route, component }) => ({
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

export async function render(url: string, context?: StaticRouterContext): Promise<string> {
    const match = matchRoutes(url);
    if (!match) { throw "not found" }
    const { params, component } = match

    const { default: Component, getServerSideProps, getStaticProps } = await component() as PageComponent<any>;

    const props = getStaticProps
        ? await getStaticProps({ params })
        : getServerSideProps
            ? await getServerSideProps({ params })
            : undefined;

    return ReactDOMServer.renderToString(
        <StaticRouter location={url} context={context}>
            <App Component={Component} pageProps={props?.props} />
        </StaticRouter>
    )
}

// export async function getStaticPaths(file: string): Promise<GetStaticPathsResponse> {
//     file = file.replace(/\.tsx$/, "")
//     const { getStaticPaths } = await import(`./pages/${file}.tsx`);
//     return getStaticPaths ? getStaticPaths() : { paths: [], fallback: true }
// }
