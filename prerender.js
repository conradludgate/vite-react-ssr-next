// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.

const FastGlob = require("fast-glob")
const path = require("path")
const fs = require("fs/promises")
const { render } = require('./dist/server/server.js')


async function getStaticPaths(file) {
  try {
    const getStaticPaths = require("./static_pages/" + file.replace(/.tsx$/, ".js"));
    return getStaticPaths()
  } catch {
    return { paths: [], fallback: true }
  }
}

async function main() {
  const toAbsolute = (p) => path.resolve(__dirname, p)
  const template = await fs.readFile(toAbsolute('dist/static/index.html'), 'utf-8')
  const stream = FastGlob.stream("**/*.tsx", { cwd: toAbsolute("src/pages") })

  for await (const entry of stream) {
    let path = "/" + entry
      .replace(/.tsx$/, "")
      .replace(/\/index$/, "");

    const sections = path.split("/")
      .map((section, i) => [section, i])
      .filter(([section]) => section.startsWith(":"))
      .map(([section, i]) => [section.slice(1), i]);

    console.log({sections, entry})

    let paths = [];
    if (sections.length > 0) {
      const p = await getStaticPaths(entry);
      console.log({p})
      paths = p.paths.map(({ params }) => {
        let p = entry;
        Object.entries(params).forEach(([key, value]) => {
          p = p.replace(`:${key}`, value)
        });
        return p;
      });
    } else {
      paths = [entry];
    }

    console.log({paths})

    for (const path of paths) {
      console.log('pre-rendering:', path)

      let url = "/" + path
        .replace(/.tsx$/, "")
        .replace(/\/index$/, "");

      const context = {}
      const appHtml = await render(url, context)

      const html = template.replace(`<!--app-html-->`, appHtml)

      const filePath = `dist/static/${path.replace(/.tsx$/, "")}.html`

      const sections = filePath.split("/");
      await fs.mkdir(sections.slice(0, sections.length - 1).join("/"), { recursive: true });

      await fs.writeFile(toAbsolute(filePath), html)
      console.log('pre-rendered:', filePath)
    }
  }
}

main()
