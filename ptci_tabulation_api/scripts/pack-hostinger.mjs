/**
 * Build a clean upload archive for Hostinger's "Node.js web app → Upload your files" flow
 * (or for dropping into File Manager):
 *
 *   npm run pack:hostinger        →  deploy/ic2-tabulation-api.zip
 *
 * Contents: package.json, package-lock.json, src/, dist/ (freshly built), scripts/, docs/,
 * .env.example, README.md. Excludes node_modules, .git, .env, test/, deploy/ — Hostinger runs
 * `npm install` itself and must never receive your real .env inside a zip.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outDir = join(root, 'deploy')
const outFile = join(outDir, 'ic2-tabulation-api.zip')
const include = ['package.json', 'package-lock.json', 'src', 'dist', 'scripts', 'docs', '.env.example', 'README.md', 'tsconfig.json']

console.log('▶ building dist/ ...')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

mkdirSync(outDir, { recursive: true })
if (existsSync(outFile)) rmSync(outFile)

const present = include.filter((p) => existsSync(join(root, p)))
console.log(`▶ zipping: ${present.join(', ')}`)

if (process.platform === 'win32') {
  const list = present.map((p) => `'${join(root, p)}'`).join(',')
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path ${list} -DestinationPath '${outFile}' -CompressionLevel Optimal"`, {
    stdio: 'inherit',
  })
} else {
  execSync(`zip -qr '${outFile}' ${present.map((p) => `'${p}'`).join(' ')} -x '*.DS_Store'`, { cwd: root, stdio: 'inherit' })
}

console.log(`✔ ${outFile}`)
console.log('  Upload it in hPanel → Websites → Add Website → Node.js web app → Upload your files.')
console.log('  Settings: build command "npm run build", entry file "dist/index.js". Then add the environment variables (see docs/HOSTINGER.md).')
