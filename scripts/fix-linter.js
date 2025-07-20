import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to sort interface keys
function sortInterfaceKeys(content) {
  // Match interface definitions and sort their keys
  return content.replace(
    /interface\s+(\w+)\s*\{([^}]+)\}/g,
    (match, interfaceName, interfaceBody) => {
      const lines = interfaceBody.split('\n').filter(line => line.trim());
      const sortedLines = lines.sort((a, b) => {
        const keyA = a.match(/^\s*(\w+)/)?.[1] || '';
        const keyB = b.match(/^\s*(\w+)/)?.[1] || '';
        return keyA.localeCompare(keyB);
      });
      
      return `interface ${interfaceName} {\n${sortedLines.join('\n')}\n}`;
    }
  );
}

// Function to sort enum members
function sortEnumMembers(content) {
  // Match enum definitions and sort their members
  return content.replace(
    /enum\s+(\w+)\s*\{([^}]+)\}/g,
    (match, enumName, enumBody) => {
      const lines = enumBody.split('\n').filter(line => line.trim());
      const sortedLines = lines.sort((a, b) => {
        const memberA = a.match(/^\s*(\w+)/)?.[1] || '';
        const memberB = b.match(/^\s*(\w+)/)?.[1] || '';
        return memberA.localeCompare(memberB);
      });
      
      return `enum ${enumName} {\n${sortedLines.join('\n')}\n}`;
    }
  );
}

// Function to process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    
    // Apply fixes
    modifiedContent = sortInterfaceKeys(modifiedContent);
    modifiedContent = sortEnumMembers(modifiedContent);
    
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find TypeScript files
function findTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

for (const file of tsFiles) {
  processFile(file);
}

console.log('Linter fixes completed!'); 