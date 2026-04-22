const fs = require('fs');
const files = [
  '/Users/inesh/Desktop/Smart_Camping_Management_System-dev/frontend/src/components/admin/AdminOwnerManagement.jsx',
  '/Users/inesh/Desktop/Smart_Camping_Management_System-dev/frontend/src/components/camping-sites-management/CampsiteOwnerDashboard.jsx'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // the string to replace is \${
  const newContent = content.replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, newContent, 'utf8');
});
