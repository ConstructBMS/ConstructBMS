# CHANGELOG

## [2024-12-19 16:00] - System-wide rebranding from Archer to ConstructBMS and comprehensive changelog update

**Changed Files:**
- CHANGELOG.md: Completely restructured with comprehensive file paths and detailed descriptions
- Git Configuration: Updated user.name from 'Archer Auto-Save' to 'ConstructBMS'
- Git Configuration: Updated user.email from 'auto-save@archer-project.local' to 'Constructbms@gmail.com'
- src/styles/design-system.css: Updated color palette theme from 'Archer Neon Green' to 'ConstructBMS Neon Green'
- src/services/demoData.ts: Changed company name from 'Archer Construction Group' to 'ConstructBMS Construction Group'
- src/components/auth/LoginForm.tsx: Updated login form branding from 'Archer' to 'ConstructBMS'
- src/components/email/EmailHelpModal.tsx: Updated email client branding from 'Archer Email Client' to 'ConstructBMS Email Client'
- src/components/email/EmailSettingsModal.tsx: Updated email domains from 'archer.com' to 'constructbms.com'
- src/components/modules/DocumentEditor.tsx: Updated admin email from 'admin@archer.com' to 'Constructbms@gmail.com'
- src/components/modules/EmailClient.tsx: Updated user email from 'john@archer.com' to 'john@constructbms.com'
- src/components/modules/CRMConsultantManagement.tsx: Updated company references from 'Archer' to 'ConstructBMS'
- src/components/modules/Projects.tsx: Updated email domain from 'archerbusiness.co.uk' to 'constructbms.com'
- src/components/modules/RolesPermissionsMatrix.tsx: Updated all email addresses and system references from 'Archer' to 'ConstructBMS'
- src/components/modules/Users.tsx: Updated user email addresses from 'archer.com' domain to 'constructbms.com'
- scripts/auto-save.js: Updated Git configuration from 'Archer Auto-Save' to 'ConstructBMS Auto-Save'
- src/components/email/AddressBookModal.tsx: Updated localStorage key from 'archerbms-demo-data' to 'constructbms-demo-data'

**Description:**
Comprehensive system-wide rebranding initiative to replace all Archer references with ConstructBMS. This includes updating the Git configuration to use the official ConstructBMS account (Constructbms@gmail.com) as the super admin, changing all email domains from archer.com to constructbms.com, updating company names and branding throughout the application, and restructuring the CHANGELOG.md to provide more detailed file paths and comprehensive descriptions of changes. The rebranding affects authentication systems, email configurations, user management, document creation, and all UI elements that previously referenced Archer. This ensures consistent branding across the entire ConstructBMS platform.

**Tags:** [rebranding] [configuration] [admin] [email] [UI] [system] [git]

---

## [2024-12-19 15:30] - Implemented TimelinePane with scroll and zoom controls for Gantt timeline navigation

**Changed Files:**
- src/components/modules/Timeline/TimelinePane.jsx: Created main TimelinePane component with integrated scroll/zoom functionality and mouse event handling for drag-to-pan and wheel scrolling
- src/components/modules/Timeline/TimelineControls.jsx: Built comprehensive control panel with zoom in/out buttons, fit to view, scroll to today, and keyboard shortcuts (Ctrl+Plus, Ctrl+Minus, Ctrl+0)
- src/components/modules/Timeline/GanttGrid.jsx: Implemented dynamic grid rendering system with date labels, today marker, and adaptive spacing based on zoom levels
- src/components/modules/Timeline/GanttBars.jsx: Created task bar visualization with progress indicators, milestone markers, and interactive selection capabilities
- src/components/modules/Timeline/TimelinePaneDemo.jsx: Added standalone demo component with sample task data and comprehensive usage instructions for testing and showcasing
- src/components/modules/Timeline/index.js: Created centralized export file for all Timeline components to simplify imports
- src/config/modules.ts: Registered TimelinePane as an additional module with active status for immediate availability
- src/App.tsx: Added routing support and case handling for TimelinePane module integration

**Description:**
Implemented a comprehensive TimelinePane module for advanced Gantt chart navigation with sophisticated scroll and zoom controls. The system integrates the existing useScrollZoom hook with custom mouse event handlers to provide smooth horizontal scrolling, zoom in/out functionality, and synchronized scrolling across all timeline components (task list, grid, and bars). The implementation includes a responsive control panel with keyboard shortcuts, a dynamic grid system that adapts to zoom levels, task bar visualization with progress tracking, and comprehensive mouse interaction support including drag-to-pan and wheel scrolling. The module supports real-time navigation with scroll position synchronization and maintains smooth UX across all sections of the Gantt chart.

**Tags:** [feature] [UI] [component] [timeline] [gantt] [navigation] [zoom] [scroll] [interaction]

---
