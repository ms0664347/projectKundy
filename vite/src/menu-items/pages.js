// assets
import { IconKey, IconMessageChatbot } from '@tabler/icons-react';
// constant
const icons = {
  IconKey,
  IconMessageChatbot
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'AI與你聊天',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'dailyCostReport',
      title: '與AI聊聊',
      type: 'item',
      url: '/talkToAI',
      icon: icons.IconMessageChatbot,
      breadcrumbs: false
    },
  ]
};

export default pages;
