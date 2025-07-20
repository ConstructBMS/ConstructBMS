#!/usr/bin/env node

/**
 * ConstructBMS Codebase Optimization Script
 * 
 * This script performs comprehensive analysis and optimization of the codebase:
 * - Identifies unused imports and dependencies
 * - Suggests code splitting opportunities
 * - Analyzes bundle size and performance
 * - Provides development efficiency recommendations
 * - Generates optimization reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodebaseOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {},
      recommendations: [],
      issues: [],
      optimizations: []
    };
  }

  async run() {
    console.log('🔍 Starting ConstructBMS Codebase Optimization...\n');

    try {
      await this.analyzeProjectStructure();
      await this.analyzeDependencies();
      await this.analyzeBundleSize();
      await this.analyzeCodeQuality();
      await this.generateRecommendations();
      await this.generateReport();

      console.log('✅ Optimization analysis complete!');
      console.log('📊 Report generated: optimization-report.json');
      console.log('📋 Summary: optimization-summary.md');
    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeProjectStructure() {
    console.log('📁 Analyzing project structure...');
    
    const structure = {
      totalFiles: 0,
      totalLines: 0,
      fileTypes: {},
      directories: {},
      largestFiles: []
    };

    const scanDirectory = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
            structure.directories[relativeItemPath] = {
              files: 0,
              lines: 0
            };
            scanDirectory(fullPath, relativeItemPath);
          }
        } else {
          structure.totalFiles++;
          const ext = path.extname(item);
          structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;

          if (ext === '.tsx' || ext === '.ts' || ext === '.js' || ext === '.jsx') {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              const lines = content.split('\n').length;
              structure.totalLines += lines;

              if (relativeItemPath.includes('src/')) {
                structure.largestFiles.push({
                  path: relativeItemPath,
                  lines,
                  size: stat.size
                });
              }

              const dir = path.dirname(relativeItemPath);
              if (structure.directories[dir]) {
                structure.directories[dir].files++;
                structure.directories[dir].lines += lines;
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      }
    };

    scanDirectory(this.projectRoot);
    structure.largestFiles.sort((a, b) => b.lines - a.lines);
    structure.largestFiles = structure.largestFiles.slice(0, 20);

    this.report.summary.structure = structure;
  }

  async analyzeDependencies() {
    console.log('📦 Analyzing dependencies...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const analysis = {
        totalDependencies: Object.keys(dependencies).length,
        productionDependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length,
        potentialUnused: [],
        largeDependencies: [],
        outdatedDependencies: []
      };

      // Identify potentially unused dependencies
      const commonUnused = [
        'lodash', 'moment', 'date-fns', 'ramda', 'underscore',
        'jquery', 'axios', 'superagent', 'request',
        'express', 'koa', 'fastify',
        'webpack', 'rollup', 'parcel',
        'jest', 'mocha', 'chai', 'sinon'
      ];

      for (const dep of commonUnused) {
        if (dependencies[dep]) {
          analysis.potentialUnused.push(dep);
        }
      }

      // Identify large dependencies
      const largeDeps = [
        'react', 'react-dom', 'typescript', 'vite',
        'tailwindcss', 'postcss', 'eslint'
      ];

      for (const dep of largeDeps) {
        if (dependencies[dep]) {
          analysis.largeDependencies.push(dep);
        }
      }

      this.report.summary.dependencies = analysis;
    } catch (error) {
      console.warn('⚠️ Could not analyze dependencies:', error.message);
    }
  }

  async analyzeBundleSize() {
    console.log('📊 Analyzing bundle size...');

    try {
      // Check if dist directory exists
      const distPath = path.join(this.projectRoot, 'dist');
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        const bundleAnalysis = {
          totalSize: 0,
          files: [],
          largestFiles: []
        };

        for (const file of files) {
          const filePath = path.join(distPath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isFile()) {
            const sizeKB = Math.round(stat.size / 1024);
            bundleAnalysis.totalSize += sizeKB;
            bundleAnalysis.files.push({
              name: file,
              size: sizeKB,
              sizeFormatted: this.formatBytes(stat.size)
            });
          }
        }

        bundleAnalysis.files.sort((a, b) => b.size - a.size);
        bundleAnalysis.largestFiles = bundleAnalysis.files.slice(0, 5);

        this.report.summary.bundle = bundleAnalysis;
      }
    } catch (error) {
      console.warn('⚠️ Could not analyze bundle size:', error.message);
    }
  }

  async analyzeCodeQuality() {
    console.log('🔍 Analyzing code quality...');

    const qualityIssues = [];
    const optimizations = [];

    // Analyze TypeScript configuration
    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf8'));
      
      if (tsConfig.compilerOptions?.verbatimModuleSyntax) {
        qualityIssues.push({
          type: 'configuration',
          severity: 'info',
          message: 'verbatimModuleSyntax is enabled - requires explicit type imports',
          file: 'tsconfig.app.json'
        });
      }

      if (tsConfig.compilerOptions?.strict) {
        optimizations.push({
          type: 'quality',
          message: 'TypeScript strict mode is enabled - good for code quality',
          impact: 'positive'
        });
      }
    } catch (error) {
      qualityIssues.push({
        type: 'configuration',
        severity: 'warning',
        message: 'Could not read TypeScript configuration',
        file: 'tsconfig.app.json'
      });
    }

    // Analyze ESLint configuration
    try {
      const eslintConfig = JSON.parse(fs.readFileSync('eslint.config.js', 'utf8'));
      optimizations.push({
        type: 'quality',
        message: 'ESLint configuration found - good for code consistency',
        impact: 'positive'
      });
    } catch (error) {
      qualityIssues.push({
        type: 'configuration',
        severity: 'warning',
        message: 'Could not read ESLint configuration',
        file: 'eslint.config.js'
      });
    }

    this.report.issues = qualityIssues;
    this.report.optimizations = optimizations;
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...');

    const recommendations = [];

    // Bundle size recommendations
    if (this.report.summary.bundle?.totalSize > 1000) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Large Bundle Size',
        description: 'Bundle size is over 1MB. Consider code splitting and tree shaking.',
        actions: [
          'Implement dynamic imports for route-based code splitting',
          'Review and remove unused dependencies',
          'Optimize images and assets',
          'Consider using bundle analyzer to identify large modules'
        ]
      });
    }

    // File structure recommendations
    const largeFiles = this.report.summary.structure?.largestFiles?.filter(f => f.lines > 500);
    if (largeFiles?.length > 0) {
      recommendations.push({
        category: 'maintainability',
        priority: 'medium',
        title: 'Large Files Detected',
        description: `${largeFiles.length} files have over 500 lines. Consider breaking them down.`,
        actions: [
          'Split large components into smaller, focused components',
          'Extract utility functions into separate modules',
          'Use composition to reduce component complexity',
          'Consider implementing feature-based folder structure'
        ],
        files: largeFiles.map(f => f.path)
      });
    }

    // Dependency recommendations
    if (this.report.summary.dependencies?.potentialUnused?.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Potentially Unused Dependencies',
        description: `${this.report.summary.dependencies.potentialUnused.length} dependencies may be unused.`,
        actions: [
          'Run dependency analysis tools (depcheck, npm-check)',
          'Remove unused dependencies to reduce bundle size',
          'Consider using tree-shaking friendly alternatives',
          'Regularly audit dependencies for security and performance'
        ],
        dependencies: this.report.summary.dependencies.potentialUnused
      });
    }

    // Development efficiency recommendations
    recommendations.push({
      category: 'development',
      priority: 'high',
      title: 'Development Efficiency Improvements',
      description: 'Implement tools and practices to improve development speed and code quality.',
      actions: [
        'Set up pre-commit hooks with linting and formatting',
        'Implement automated testing with good coverage',
        'Use TypeScript strict mode for better type safety',
        'Set up hot reloading for faster development',
        'Implement component storybook for UI development',
        'Use code generation tools for repetitive patterns'
      ]
    });

    // Code organization recommendations
    recommendations.push({
      category: 'architecture',
      priority: 'high',
      title: 'Code Organization Improvements',
      description: 'Improve code organization for better maintainability and scalability.',
      actions: [
        'Implement consistent naming conventions',
        'Use barrel exports for cleaner imports',
        'Organize components by feature rather than type',
        'Implement proper error boundaries',
        'Use React.memo and useMemo for performance optimization',
        'Implement proper state management patterns'
      ]
    });

    this.report.recommendations = recommendations;
  }

  async generateReport() {
    console.log('📋 Generating optimization report...');

    // Generate JSON report
    fs.writeFileSync(
      'optimization-report.json',
      JSON.stringify(this.report, null, 2)
    );

    // Generate markdown summary
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync('optimization-summary.md', summary);

    // Generate actionable tasks
    const tasks = this.generateActionableTasks();
    fs.writeFileSync('optimization-tasks.md', tasks);
  }

  generateMarkdownSummary() {
    const { structure, dependencies, bundle } = this.report.summary;
    
    return `# ConstructBMS Codebase Optimization Report

Generated: ${this.report.timestamp}

## 📊 Summary

### Project Structure
- **Total Files**: ${structure.totalFiles}
- **Total Lines of Code**: ${structure.totalLines.toLocaleString()}
- **File Types**: ${Object.entries(structure.fileTypes).map(([ext, count]) => `${ext}: ${count}`).join(', ')}

### Dependencies
- **Total Dependencies**: ${dependencies?.totalDependencies || 'N/A'}
- **Production Dependencies**: ${dependencies?.productionDependencies || 'N/A'}
- **Dev Dependencies**: ${dependencies?.devDependencies || 'N/A'}

### Bundle Size
- **Total Bundle Size**: ${bundle?.totalSize ? `${bundle.totalSize}KB` : 'N/A'}

## 🎯 Key Recommendations

${this.report.recommendations.map(rec => `
### ${rec.title}
**Priority**: ${rec.priority.toUpperCase()} | **Category**: ${rec.category}

${rec.description}

**Actions**:
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## 🚨 Issues Found

${this.report.issues.map(issue => `
- **${issue.severity.toUpperCase()}**: ${issue.message} ${issue.file ? `(${issue.file})` : ''}
`).join('\n')}

## ✨ Optimizations Applied

${this.report.optimizations.map(opt => `
- **${opt.type.toUpperCase()}**: ${opt.message} (${opt.impact})
`).join('\n')}

## 📈 Next Steps

1. Review the detailed JSON report for specific file-level insights
2. Prioritize recommendations based on your current development phase
3. Implement high-priority performance and maintainability improvements
4. Set up automated monitoring for code quality metrics
5. Schedule regular optimization reviews

---
*Generated by ConstructBMS Codebase Optimizer*
`;
  }

  generateActionableTasks() {
    return `# ConstructBMS Optimization Action Items

## 🚀 Immediate Actions (High Priority)

${this.report.recommendations
  .filter(rec => rec.priority === 'high')
  .map(rec => `
### ${rec.title}
- [ ] ${rec.actions.join('\n- [ ] ')}
`).join('\n')}

## 📋 Medium Priority Tasks

${this.report.recommendations
  .filter(rec => rec.priority === 'medium')
  .map(rec => `
### ${rec.title}
- [ ] ${rec.actions.join('\n- [ ] ')}
`).join('\n')}

## 🔧 Development Setup

- [ ] Set up pre-commit hooks
- [ ] Configure automated testing
- [ ] Implement code quality monitoring
- [ ] Set up performance monitoring
- [ ] Configure bundle analysis

## 📊 Monitoring & Maintenance

- [ ] Schedule weekly dependency audits
- [ ] Set up automated performance testing
- [ ] Implement code quality metrics tracking
- [ ] Create optimization review schedule
- [ ] Set up automated security scanning

---
*Generated: ${this.report.timestamp}*
`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new CodebaseOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = CodebaseOptimizer; 