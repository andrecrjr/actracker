const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.vscode',
  'dist',
  'build',
  'ui',
]);
const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.css']);

// Minification functions
const minifiers = {
  default: content => content.replace(/\s+/g, ' ').trim(),
  js: content =>
    content
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/([^=])==+/g, '$1') // Remove sequence of = (careful with === operators)
      .trim(),
  html: content =>
    content
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim(),
  css: content =>
    content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;/g, ';') // Normalize semicolons
      .trim(),
};

function getMinifier(ext) {
  return minifiers[ext.slice(1)] || minifiers.default;
}

async function getCodeFiles(rootDir) {
  const results = [];
  async function traverse(currentPath) {
    const stats = await stat(currentPath);
    if (stats.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(currentPath))) return;
      const files = await readdir(currentPath, { withFileTypes: true });
      for (const file of files)
        await traverse(path.join(currentPath, file.name));
    } else if (CODE_EXTENSIONS.has(path.extname(currentPath).toLowerCase())) {
      results.push(currentPath);
    }
  }
  await traverse(rootDir);
  return results;
}

async function createCombinedFile(files, outputPath) {
  let outputContent = '';
  for (const filePath of files) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const content = await readFile(filePath, 'utf8');
      const minify = getMinifier(ext);
      const minified = minify(content);

      outputContent += `\n\n=== FILE: ${filePath} ===\n`;
      outputContent += minified;
    } catch (error) {
      console.error(`Skipped ${filePath}: ${error.message}`);
    }
  }
  await writeFile(outputPath, outputContent);
  const stats = fs.statSync(outputPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`Created minified combined file at: ${outputPath}`);
  console.log(`Final size: ${fileSizeKB} KB`);
}

// Usage
(async () => {
  const rootDir = process.argv[2] || '.';
  const outputFile = process.argv[3] || 'combined.min.txt';
  try {
    const codeFiles = await getCodeFiles(path.resolve(rootDir));

    console.log(`Found ${codeFiles.length} code files`);
    await createCombinedFile(codeFiles, outputFile);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
