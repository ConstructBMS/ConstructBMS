#!/usr/bin/env node

/**
 * Component Generator Script
 *
 * Generates React components with proper TypeScript, testing, and styling setup
 * Usage: node scripts/generate-component.js ComponentName [--page] [--with-test]
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const componentName = args[0];
const isPage = args.includes('--page');
const withTest = args.includes('--with-test');

if (!componentName) {
  console.error('❌ Please provide a component name');
  console.log(
    'Usage: node scripts/generate-component.js ComponentName [--page] [--with-test]'
  );
  process.exit(1);
}

// Validate component name
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error('❌ Component name must be PascalCase (e.g., MyComponent)');
  process.exit(1);
}

// Determine file paths
const baseDir = isPage ? 'frontend/src/pages' : 'frontend/src/components';
const componentDir = path.join(baseDir, componentName);
const componentFile = path.join(componentDir, `${componentName}.tsx`);
const indexFile = path.join(componentDir, 'index.ts');
const testFile = path.join(componentDir, `${componentName}.test.tsx`);

// Create directory
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
  console.log(`📁 Created directory: ${componentDir}`);
}

// Generate component template
const componentTemplate = `import React from 'react';
${isPage ? `import { Page } from '../layout/Page';` : ''}
${
  withTest
    ? `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';`
    : ''
}

${
  isPage
    ? `export default function ${componentName}() {
  return (
    <Page title="${componentName}">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">${componentName}</h1>
          <p className="text-muted-foreground">
            This is the ${componentName} page.
          </p>
        </div>

        {/* Add your content here */}
        <div className="rounded-lg border p-6">
          <p>Start building your ${componentName} component!</p>
        </div>
      </div>
    </Page>
  );
}`
    : `interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${componentName}({ className, children, ...props }: ${componentName}Props) {
  return (
    <div className={className} {...props}>
      {children || (
        <div className="p-4">
          <h3 className="text-lg font-semibold">${componentName}</h3>
          <p className="text-muted-foreground">
            This is the ${componentName} component.
          </p>
        </div>
      )}
    </div>
  );
}`
}

${
  withTest
    ? `
// Tests
describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const customClass = 'custom-class';
    render(<${componentName} className={customClass} />);
    expect(screen.getByText('${componentName}').closest('div')).toHaveClass(customClass);
  });
});`
    : ''
}
`;

// Generate index file
const indexTemplate = `export { ${componentName} } from './${componentName}';
${isPage ? `export { default } from './${componentName}';` : ''}
`;

// Write files
fs.writeFileSync(componentFile, componentTemplate);
console.log(`✅ Created component: ${componentFile}`);

fs.writeFileSync(indexFile, indexTemplate);
console.log(`✅ Created index: ${indexFile}`);

if (withTest) {
  fs.writeFileSync(testFile, componentTemplate);
  console.log(`✅ Created test: ${testFile}`);
}

// Update main index file if it exists
const mainIndexFile = path.join(baseDir, 'index.ts');
if (fs.existsSync(mainIndexFile)) {
  const content = fs.readFileSync(mainIndexFile, 'utf8');
  const exportLine = `export { ${componentName} } from './${componentName}';`;

  if (!content.includes(exportLine)) {
    fs.appendFileSync(mainIndexFile, `\n${exportLine}`);
    console.log(`✅ Updated main index: ${mainIndexFile}`);
  }
}

console.log(`\n🎉 Successfully generated ${componentName} component!`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Import and use the component in your app`);
console.log(`   2. Add your component logic and styling`);
console.log(
  `   3. ${withTest ? 'Run tests with: npm run test' : 'Add tests if needed'}`
);
console.log(`   4. Commit your changes`);

if (isPage) {
  console.log(`\n🔗 Don't forget to add the route in routes.tsx:`);
  console.log(
    `   { path: '/${componentName.toLowerCase()}', element: <${componentName} /> }`
  );
}
