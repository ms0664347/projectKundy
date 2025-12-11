import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

const UtilsDailyWorkReport = Loadable(lazy(() => import('views/pages/DailyWorkReport')));
const UtilsAllWorkReport = Loadable(lazy(() => import('views/pages/AllWorkReport')));
const UtilsCompany = Loadable(lazy(() => import('views/pages/Company')));
const UtilsTool = Loadable(lazy(() => import('views/pages/Tool')));

// page routing
const DailyCostReport = Loadable(lazy(() => import('views/pages/DailyCostReport')));
const AllCostReport = Loadable(lazy(() => import('views/pages/AllCostReport')));
const Category = Loadable(lazy(() => import('views/pages/Category')));
const Method = Loadable(lazy(() => import('views/pages/Method')));

// page
const TalkToAI = Loadable(lazy(() => import('views/pages/TalkToAI')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'dailyWorkReport',
      element: <UtilsDailyWorkReport />
    },
    {
      path: 'allWorkReport',
      element: <UtilsAllWorkReport />
    },
    {
      path: 'company',
      element: <UtilsCompany />
    },
    {
      path: 'tool',
      element: <UtilsTool />
    },
    {
      path: 'dailyCostReport',
      element: <DailyCostReport />
    },
    {
      path: 'allCostReport',
      element: <AllCostReport />
    },
    {
      path: 'category',
      element: <Category />
    },
    {
      path: 'method',
      element: <Method />
    },
    {
      path: 'talkToAI',
      element: <TalkToAI />
    }
  ]
};

export default MainRoutes;
