// @ts-check
const fs = require('fs/promises')
const path = require('path')
const express = require('express')

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production'
) {
  const resolve = (p) => path.resolve(__dirname, p)

  const indexProd = isProd
    ? await fs.readFile(resolve('dist/index.html'), 'utf-8')
    : ''

  const app = express()

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite
  if (!isProd) {
    vite = await require('vite').createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100
        }
      }
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(require('compression')())
    app.use(
      require('serve-static')(resolve('dist/static'), {
        index: false
      })
    )
  }

  app.get("/_next/data/*.json", async (req, res) => {
    let ssp;
    if (!isProd) {
      ssp = (await vite.ssrLoadModule('/src/server.tsx')).getServerSideProps
    } else {
      ssp = require('./dist/server/server.js').getServerSideProps
    }

    const json = await ssp(req.url.slice(11, req.url.length - 5))
    res.status(200).set({ 'Content-Type': 'application/json' }).end(JSON.stringify(json))
  })

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        // always read fresh template in dev
        template = await fs.readFile(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/server.tsx')).render
      } else {
        template = indexProd
        render = require('./dist/server/server.js').render
      }

      const context = {}
      const stream = await render(url, context)

      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url)
      }

      res.status(200).set({ 'Content-Type': 'text/html' })

      const [first, last] = template.split("<!--app-html-->", 2);
      res.write(first)
      stream.pipe(res, { end: false });
      stream.on('end', () => {
        res.write(last);
        res.end();
      });
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000')
    })
  )
}

// for test use
exports.createServer = createServer
