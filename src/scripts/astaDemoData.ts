// Demo Asta data for testing import/export functionality

export const astaDemoCSV = `Task ID,Task Name,Start Date,Finish Date,Duration,Percent Complete,Is Milestone,Dependencies,Calendar ID,Structure Level
1,Project Setup,2024-01-01,2024-01-05,5,100,false,,1,1
2,Design Phase,2024-01-06,2024-01-20,15,80,false,1,1,1
3,Development Phase,2024-01-21,2024-02-15,26,60,false,2,1,1
4,Testing Phase,2024-02-16,2024-02-28,13,30,false,3,1,1
5,Deployment,2024-03-01,2024-03-05,5,0,true,4,1,1
6,Requirements Analysis,2024-01-06,2024-01-10,5,100,false,1,1,2
7,UI Design,2024-01-11,2024-01-15,5,90,false,6,1,2
8,Backend Development,2024-01-21,2024-02-10,21,70,false,2,1,2
9,Frontend Development,2024-01-21,2024-02-10,21,65,false,2,1,2
10,Integration Testing,2024-02-16,2024-02-25,10,40,false,8;9,1,2`;

export const astaDemoJSON = {
  projectName: "Demo Asta Project",
  taskCount: 10,
  tasks: [
    {
      id: "1",
      name: "Project Setup",
      startDate: "2024-01-01",
      finishDate: "2024-01-05",
      duration: 5,
      percentComplete: 100,
      isMilestone: false,
      dependencies: [],
      calendarId: "1",
      structureLevel: 1,
      originalId: "1",
      originalStructure: "1",
      sourceFileName: "demo_asta_project.json",
      importedAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Design Phase",
      startDate: "2024-01-06",
      finishDate: "2024-01-20",
      duration: 15,
      percentComplete: 80,
      isMilestone: false,
      dependencies: ["1"],
      calendarId: "1",
      structureLevel: 1,
      originalId: "2",
      originalStructure: "1",
      sourceFileName: "demo_asta_project.json",
      importedAt: new Date().toISOString()
    },
    {
      id: "3",
      name: "Development Phase",
      startDate: "2024-01-21",
      finishDate: "2024-02-15",
      duration: 26,
      percentComplete: 60,
      isMilestone: false,
      dependencies: ["2"],
      calendarId: "1",
      structureLevel: 1,
      originalId: "3",
      originalStructure: "1",
      sourceFileName: "demo_asta_project.json",
      importedAt: new Date().toISOString()
    },
    {
      id: "4",
      name: "Testing Phase",
      startDate: "2024-02-16",
      finishDate: "2024-02-28",
      duration: 13,
      percentComplete: 30,
      isMilestone: false,
      dependencies: ["3"],
      calendarId: "1",
      structureLevel: 1,
      originalId: "4",
      originalStructure: "1",
      sourceFileName: "demo_asta_project.json",
      importedAt: new Date().toISOString()
    },
    {
      id: "5",
      name: "Deployment",
      startDate: "2024-03-01",
      finishDate: "2024-03-05",
      duration: 5,
      percentComplete: 0,
      isMilestone: true,
      dependencies: ["4"],
      calendarId: "1",
      structureLevel: 1,
      originalId: "5",
      originalStructure: "1",
      sourceFileName: "demo_asta_project.json",
      importedAt: new Date().toISOString()
    }
  ],
  constraints: [],
  calendars: [],
  resources: [],
  importedFrom: "Asta" as const,
  demo: true
};

export const astaDemoMPX = `Microsoft Project
Version,14
ProjectName,Demo Asta Project
StartDate,2024-01-01
EndDate,2024-03-05
Tasks
1,Project Setup,2024-01-01,2024-01-05,5,100,false
2,Design Phase,2024-01-06,2024-01-20,15,80,false
3,Development Phase,2024-01-21,2024-02-15,26,60,false
4,Testing Phase,2024-02-16,2024-02-28,13,30,false
5,Deployment,2024-03-01,2024-03-05,5,0,true
6,Requirements Analysis,2024-01-06,2024-01-10,5,100,false
7,UI Design,2024-01-11,2024-01-15,5,90,false
8,Backend Development,2024-01-21,2024-02-10,21,70,false
9,Frontend Development,2024-01-21,2024-02-10,21,65,false
10,Integration Testing,2024-02-16,2024-02-25,10,40,false`;

// Function to create demo files for testing
export const createDemoFiles = () => {
  const csvBlob = new Blob([astaDemoCSV], { type: 'text/csv' });
  const jsonBlob = new Blob([JSON.stringify(astaDemoJSON, null, 2)], { type: 'application/json' });
  const mpxBlob = new Blob([astaDemoMPX], { type: 'text/plain' });

  return {
    csv: new File([csvBlob], 'demo_asta_project.csv', { type: 'text/csv' }),
    json: new File([jsonBlob], 'demo_asta_project.json', { type: 'application/json' }),
    mpx: new File([mpxBlob], 'demo_asta_project.mpx', { type: 'text/plain' })
  };
};

// Function to download demo files
export const downloadDemoFiles = () => {
  const files = createDemoFiles();
  
  Object.entries(files).forEach(([format, file]) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}; 