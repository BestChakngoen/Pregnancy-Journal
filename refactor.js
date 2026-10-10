const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');

const groups = {
  'ui': ['AnimatedCard.tsx', 'AnimatedRing.tsx', 'FloatingParticles.tsx', 'PopupAlert.tsx', 'RedFlagAlert.tsx'],
  'modals': ['EditProfileModal.tsx', 'HealthHistoryModal.tsx', 'TrackingModals.tsx'],
  'loggers': ['BloodPressureLogger.tsx', 'SymptomLogger.tsx'],
  'layout': ['BottomNav.tsx'],
  'quiz': ['Quiz.tsx']
};

// 1. Create directories
Object.keys(groups).forEach(dir => {
  const dirPath = path.join(COMPONENTS_DIR, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// 2. Move files
const fileMoves = {};
Object.entries(groups).forEach(([dir, files]) => {
  files.forEach(file => {
    const oldPath = path.join(COMPONENTS_DIR, file);
    const newPath = path.join(COMPONENTS_DIR, dir, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      fileMoves[file] = `@/components/${dir}/${file.replace('.tsx', '')}`;
    }
  });
});

console.log("Moved files:", fileMoves);

// 3. Update imports in all .tsx and .ts files
function updateImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      updateImports(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // We look for imports like "@/components/BottomNav" or "@/components/PopupAlert"
      Object.entries(fileMoves).forEach(([fileName, newImport]) => {
        const componentName = fileName.replace('.tsx', '');
        
        // Regex to match exact import path, e.g. "@/components/BottomNav" or "@/components/BottomNav.tsx"
        // and replace it with the new path
        const regex = new RegExp(`@/components/${componentName}(?!/)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, newImport);
          changed = true;
        }
      });
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  }
}

updateImports(PROJECT_ROOT);
console.log("Refactoring complete.");
