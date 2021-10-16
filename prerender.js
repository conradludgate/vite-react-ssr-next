// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.

const FastGlob = require("fast-glob")
const path = require("path")
const fs = require("fs/promises")
const { createWriteStream } = require("fs")
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
  const template = await fs.readFile(toAbsolute('dist/index.html'), 'utf-8')
  const stream = FastGlob.stream("**/*.tsx", { cwd: toAbsolute("src/pages") })

  for await (const entry of stream) {
    let path = "/" + entry
      .replace(/.tsx$/, "")
      .replace(/\/index$/, "");

    const sections = path.split("/")
      .map((section, i) => [section, i])
      .filter(([section]) => section.startsWith(":"))
      .map(([section, i]) => [section.slice(1), i]);

    let paths = [];
    if (sections.length > 0) {
      const p = await getStaticPaths(entry);
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

    for (const path of paths) {
      let url = "/" + path
        .replace(/.tsx$/, "")
        .replace(/\/index$/, "");

      const filePath = `dist/static${url}.html`

      const sections = filePath.split("/");
      await fs.mkdir(sections.slice(0, sections.length - 1).join("/"), { recursive: true });
      const file = createWriteStream(toAbsolute(filePath))

      const context = {}
      const stream = await render(url, context)

      const [first, last] = template.split("<!--app-html-->", 2);
      file.write(first)
      stream.pipe(file, { end: false });
      stream.on('end', () => {
        file.write(last);
        file.end();
        console.log('pre-rendered:', filePath)
      });
    }
  }
}

main()
