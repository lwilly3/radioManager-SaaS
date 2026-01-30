import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le CHANGELOG.md
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const changelogContent = fs.readFileSync(changelogPath, 'utf-8');

// Parser le CHANGELOG pour extraire les versions
function parseChangelog(content) {
  const versions = [];
  const lines = content.split('\n');
  
  let currentVersion = null;
  let currentSection = null;
  let insideVersion = false;
  let skipNextDescription = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Détecter une nouvelle version
    const versionMatch = trimmedLine.match(/^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/);
    if (versionMatch) {
      // Sauvegarder la version précédente si elle existe
      if (currentVersion) {
        versions.push(currentVersion);
      }
      
      // Initialiser une nouvelle version
      currentVersion = {
        version: versionMatch[1],
        releaseDate: versionMatch[2],
        description: '',
        features: [],
        bugfixes: [],
        improvements: [],
      };
      insideVersion = true;
      currentSection = null;
      skipNextDescription = false;
      continue;
    }
    
    // Arrêter si on rencontre [Non publié] ou une ligne de séparation majeure
    if (trimmedLine.includes('[Non publié]') || trimmedLine === '---') {
      if (currentVersion && insideVersion) {
        versions.push(currentVersion);
        currentVersion = null;
      }
      insideVersion = false;
      continue;
    }
    
    // Si on n'est pas dans une version, ignorer
    if (!insideVersion || !currentVersion) {
      continue;
    }
    
    // Détecter les sections avec emojis
    if (trimmedLine.startsWith('### ')) {
      const sectionTitle = trimmedLine.substring(4).trim();
      
      // Mapping des sections
      if (sectionTitle.match(/🐛|Corrigé|Corrections|Bugfixes/i)) {
        currentSection = 'bugfixes';
      } else if (sectionTitle.match(/✨|Ajouté|Features|Fonctionnalités/i)) {
        currentSection = 'features';
      } else if (sectionTitle.match(/📝|Documentation/i)) {
        currentSection = 'improvements'; // Documentation -> improvements
      } else if (sectionTitle.match(/🔧|Technique|Améliorations|Improvements|🔄|Modifié/i)) {
        currentSection = 'improvements';
      } else {
        currentSection = null;
      }
      continue;
    }
    
    // Extraire la description (première ligne de texte, pas vide, pas section, pas liste)
    if (currentVersion && !currentVersion.description && trimmedLine && 
        !trimmedLine.startsWith('###') && !trimmedLine.startsWith('-') && 
        !trimmedLine.startsWith('```') && !trimmedLine.startsWith('>')) {
      currentVersion.description = trimmedLine;
      continue;
    }
    
    // Extraire les items de premier niveau (- sans indentation ou avec indentation minimale)
    if (currentVersion && currentSection && trimmedLine.startsWith('- ')) {
      let item = trimmedLine.substring(2).trim();
      
      // Nettoyer le formatage markdown
      item = item
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Gras
        .replace(/`([^`]+)`/g, '$1')        // Code inline
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Liens
        .trim();
      
      // Ajouter seulement si ce n'est pas un sous-item vide
      if (item && currentVersion[currentSection]) {
        currentVersion[currentSection].push(item);
      }
    }
  }
  
  // Ajouter la dernière version
  if (currentVersion && insideVersion) {
    versions.push(currentVersion);
  }
  
  // Filtrer les versions invalides et garder les 10 dernières
  return versions.filter(v => v.version && v.releaseDate).slice(0, 10);
}

// Générer le fichier TypeScript
function generateVersionsFile(versions) {
  const content = `// Ce fichier est généré automatiquement depuis CHANGELOG.md
// Ne pas modifier manuellement - Utilisez 'npm run generate-versions'

import type { Version } from '../types/version';

export const defaultVersions: Version[] = ${JSON.stringify(versions, null, 2)
    .replace(/"version":/g, 'version:')
    .replace(/"releaseDate":/g, 'releaseDate:')
    .replace(/"description":/g, 'description:')
    .replace(/"features":/g, 'features:')
    .replace(/"bugfixes":/g, 'bugfixes:')
    .replace(/"improvements":/g, 'improvements:')};
`;
  
  const outputPath = path.join(__dirname, '../src/store/defaultVersions.ts');
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ Fichier généré: ${outputPath}`);
  console.log(`📦 ${versions.length} versions extraites du CHANGELOG.md`);
  
  // Afficher les versions extraites
  versions.forEach(v => {
    console.log(`   - ${v.version} (${v.releaseDate}): ${v.features.length} features, ${v.bugfixes.length} bugfixes, ${v.improvements.length} improvements`);
  });
}

// Exécuter
try {
  const versions = parseChangelog(changelogContent);
  
  if (versions.length === 0) {
    console.warn('⚠️  Aucune version trouvée dans CHANGELOG.md');
    process.exit(1);
  }
  
  generateVersionsFile(versions);
} catch (error) {
  console.error('❌ Erreur lors de la génération des versions:', error);
  process.exit(1);
}
