import { programmeCustomFieldsService } from '../services/programmeCustomFieldsService';

export async function initializeCustomFieldsDemo() {
  console.log('Initializing demo custom fields...');

  const demoProjectId = 'demo';
  const demoUserId = 'demo-user';

  try {
    // Create demo custom fields
    const demoFields = [
      {
        projectId: demoProjectId,
        label: 'Tender Ref',
        type: 'text' as const,
        options: [],
        createdBy: demoUserId,
        isRequired: false,
        isVisibleInGrid: true,
        isVisibleInModal: true,
        demo: true
      },
      {
        projectId: demoProjectId,
        label: 'Risk Level',
        type: 'dropdown' as const,
        options: ['Low', 'Medium', 'High', 'Critical'],
        createdBy: demoUserId,
        isRequired: false,
        isVisibleInGrid: true,
        isVisibleInModal: true,
        demo: true
      }
    ];

    for (const field of demoFields) {
      const result = await programmeCustomFieldsService.createCustomField(field);
      if (result.success) {
        console.log(`Created demo field: ${field.label}`);
      } else {
        console.error(`Failed to create demo field ${field.label}:`, result.error);
      }
    }

    console.log('Demo custom fields initialization completed');
  } catch (error) {
    console.error('Error initializing demo custom fields:', error);
  }
}

// Export for use in other scripts
export default initializeCustomFieldsDemo; 