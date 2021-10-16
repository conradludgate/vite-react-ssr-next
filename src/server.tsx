import ReactDOMServer from 'react-dom/server'
import { StaticRouterContext } from 'react-router'
import { StaticRouter } from 'react-router-dom'
import App from './App'
// import { GetStaticPathsResponse } from './lib/next'

export function render(url?: string | object | undefined, context?: StaticRouterContext) {
    return ReactDOMServer.renderToString(
        <StaticRouter location={url} context={context}>
            <App />
        </StaticRouter>
    )
}

// export async function getStaticPaths(file: string): Promise<GetStaticPathsResponse> {
//     file = file.replace(/\.tsx$/, "")
//     const { getStaticPaths } = await import(`./pages/${file}.tsx`);
//     return getStaticPaths ? getStaticPaths() : { paths: [], fallback: true }
// }
