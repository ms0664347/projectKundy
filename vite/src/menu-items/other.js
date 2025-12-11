// assets
import { IconBrandChrome, IconHelp, IconCategory2, IconCreditCard, IconMoneybag, IconReportMoney } from '@tabler/icons-react';

// constant
const icons = { IconBrandChrome, IconHelp, IconCategory2, IconCreditCard, IconMoneybag, IconReportMoney };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'sample-docs-roadmap',
  title: '支出頁面',
  type: 'group',
  children: [
    {
      id: 'dailyCostReport',
      title: '每日支出紀錄',
      type: 'item',
      url: '/dailyCostReport',
      icon: icons.IconMoneybag,
      breadcrumbs: false
    },
    {
      id: 'allCostReport',
      title: '全部支出紀錄',
      type: 'item',
      url: '/allCostReport',
      icon: icons.IconReportMoney,
      breadcrumbs: false
    },
    {
      id: 'category',
      title: '支出類別設定',
      type: 'item',
      url: '/category',
      icon: icons.IconCategory2,
      breadcrumbs: false
    },
    {
      id: 'method',
      title: '支出方式設定',
      type: 'item',
      url: '/method',
      icon: icons.IconCreditCard,
      breadcrumbs: false
    }
  ]
};

export default other;
