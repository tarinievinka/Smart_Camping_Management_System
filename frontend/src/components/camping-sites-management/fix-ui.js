const fs = require('fs');

const path = '/Users/inesh/Desktop/Smart_Camping_Management_System-dev/frontend/src/components/camping-sites-management/CampsiteOwnerDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace blue with green
content = content.replace(/blue-900/g, 'green-900');
content = content.replace(/indigo-900/g, 'emerald-900');
content = content.replace(/blue-200/g, 'green-200');
content = content.replace(/indigo-100/g, 'emerald-100');
content = content.replace(/blue-100/g, 'green-100');
content = content.replace(/blue-50/g, 'green-50');
content = content.replace(/blue-600/g, 'green-700');
content = content.replace(/blue-500/g, 'green-600');
content = content.replace(/blue-800/g, 'green-800');
content = content.replace(/blue-700/g, 'green-700');
content = content.replace(/indigo-500/g, 'emerald-500');
content = content.replace(/rgba\(37,99,235/g, 'rgba(21,128,61'); // Green shadow color

// Replace user.username with user.name
content = content.replace(/b\.user\?\.username/g, 'b.user?.name');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated styles and bindings!');
