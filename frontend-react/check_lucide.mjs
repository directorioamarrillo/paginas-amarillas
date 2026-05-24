import * as icons from 'lucide-react';
const requested = ['LineChart', 'Building2', 'Tags', 'Store', 'Heart', 'Search', 'MessageCircle', 'Star', 'Receipt', 'BarChart', 'Megaphone', 'Radio', 'Bell', 'UserCog', 'Shield', 'Users', 'ClipboardList', 'MessageSquare', 'User', 'ChevronLeft', 'ChevronRight', 'Home', 'LifeBuoy', 'Database'];
let missing = 0;
requested.forEach(i => {
  if (!icons[i]) {
    console.log('MISSING IN LUCIDE-REACT:', i);
    missing++;
  }
});
if (missing === 0) console.log('All icons found!');
