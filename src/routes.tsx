import App from './App'
import { GetServerSidePropsResponse, PageComponent } from './lib/next';

function getParams(sections: Record<string, number>): Record<string, string> {
    const parts = window.location.pathname.split("/");
    return Object.fromEntries(
        Object.entries(sections).map(([section, i]) => [section, parts[i]])
    );
}

const pages = import.meta.glob('./pages/**/*.tsx');
export const routes = Object.entries(pages).map(([filepath, component]) => {
    const route = filepath
        .replace(/^\.\/pages/, "")
        .replace(/.tsx$/, "")
        .replace(/\/index$/, "");

    return {
        route,
        component,
    }
})

async function serverSideProps<Props>(): Promise<GetServerSidePropsResponse<Props>> {
    let path = window.location.pathname;
    if (path.endsWith("/")) { path = path.slice(0, path.length - 1) }
    const response = await fetch(`/_next/data${path}.json`);
    return response.json()
}

export const clientRoutes = routes.map(({ route, component }) => {
    const sections = Object.fromEntries(
        route.split("/")
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
            default: () => <App Component={Component} pageProps={props?.props} />
        }
    }

    return {
        path: route,
        load,
    }
})
