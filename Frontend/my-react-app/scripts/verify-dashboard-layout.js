import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('--- Running Samvidhan Dashboard & Mascot Regression Test ---')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`)
    passed++
  } else {
    console.error(`[FAIL] ${message}`)
    failed++
  }
}

// 1. Check dashboard layout CSS
const dashboardCss = fs.readFileSync(path.join(rootDir, 'src/styles/pages/dashboard.css'), 'utf8')
assert(dashboardCss.includes('--sidebar-w: 260px'), 'CSS declares --sidebar-w: 260px')
assert(dashboardCss.includes('grid-template-columns: var(--sidebar-w, 260px)'), 'app-shell-layout defines two-column grid')
assert(dashboardCss.includes('--sidebar-w-collapsed: 72px'), 'CSS declares collapsed width 72px')

// 2. Check Mor Mascot exists with all poses
const morMascotCode = fs.readFileSync(path.join(rootDir, 'src/components/mascot/MorMascot.tsx'), 'utf8')
assert(morMascotCode.includes('waving'), 'Mor mascot supports waving pose')
assert(morMascotCode.includes('celebrating'), 'Mor mascot supports celebrating pose')
assert(morMascotCode.includes('thinking'), 'Mor mascot supports thinking pose')
assert(morMascotCode.includes('encouraging'), 'Mor mascot supports encouraging pose')
assert(morMascotCode.includes('sleeping'), 'Mor mascot supports sleeping pose')
assert(morMascotCode.includes('head-only'), 'Mor mascot supports head-only badge')

// 3. Check lion is removed from active components
const filesWithLion = []
function checkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file)
    if (fs.statSync(full).isDirectory() && !full.includes('node_modules') && !full.includes('.git') && !full.includes('dist')) {
      checkDir(full)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8')
      if (content.includes('lion-cub') || content.includes('maneGrad')) {
        filesWithLion.push(full)
      }
    }
  })
}
checkDir(path.join(rootDir, 'src'))
assert(filesWithLion.length === 0, 'No lion-cub SVG or assets remain in source code')

// 4. Check Plume assets exist
const plumeAssets = [
  'public/assets/brand/plume-emblem-1x.png',
  'public/assets/brand/plume-emblem-2x.png',
  'public/assets/brand/plume-emblem-full.png'
]
plumeAssets.forEach(p => {
  assert(fs.existsSync(path.join(rootDir, p)), `Asset exists: ${p}`)
})

// 5. Check ChatLauncher is single unified button
const chatLauncherCode = fs.readFileSync(path.join(rootDir, 'src/components/chatbot/ChatLauncher.tsx'), 'utf8')
assert(chatLauncherCode.includes('ask-unified-launcher-pill'), 'ChatLauncher uses unified sliding pill')
assert(chatLauncherCode.includes('launcher-online-dot'), 'ChatLauncher has online indicator dot')

console.log(`\nResults: ${passed} passed, ${failed} failed.`)
if (failed > 0) {
  process.exit(1)
} else {
  console.log('All regression layout and brand tests passed!\n')
}
