import { readFile, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const dist = new URL('../dist/', import.meta.url)
const ssrDir = new URL('../dist-ssr/', import.meta.url)

const { render } = (await import(
  pathToFileURL(new URL('entry-server.js', ssrDir).pathname).href
))

const htmlUrl = new URL('index.html', dist)
const template = await readFile(htmlUrl, 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('root marker missing in dist/index.html')

await writeFile(htmlUrl, template.replace(marker, `<div id="root">${render()}</div>`))
await rm(ssrDir, { recursive: true, force: true })
console.log('prerendered /')
