// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill, IconReport, IconTool, IconBuilding } from '@tabler/icons-react';
import BorderColorIcon from '@mui/icons-material/BorderColor';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  IconReport,
  IconTool,
  IconBuilding
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: '功能頁面',
  type: 'group',
  children: [
    {
      id: 'util-dailyWorkReport',
      title: '每日工作紀錄',
      type: 'item',
      url: '/dailyWorkReport',
      icon: BorderColorIcon,
      breadcrumbs: false
    },
    {
      id: 'util-allWorkReport',
      title: '所有工作紀錄',
      type: 'item',
      url: '/allWorkReport',
      icon: icons.IconReport,
      breadcrumbs: false
    },
    {
      id: 'util-company',
      title: '常用公司設定',
      type: 'item',
      url: '/company',
      icon: icons.IconBuilding,
      breadcrumbs: false
    },
    {
      id: 'util-tool',
      title: '常用工具設定',
      type: 'item',
      url: '/tool',
      icon: icons.IconTool,
      breadcrumbs: false
    }
  ]
};

export default utilities;
