import { createRoot } from 'react-dom/client';

// project imports
import { ConfigProvider } from 'contexts/ConfigContext';
import * as serviceWorker from 'serviceWorker';
import App from './App';

// style + assets
import 'assets/scss/style.scss';

// google-fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// ==============================|| REACT DOM RENDER ||============================== //
// console.log("✅ App started loading");
// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(
//   <ConfigProvider>
//     <App />
//   </ConfigProvider>
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

// ==============================|| REACT DOM RENDER ||============================== //
// console.log("✅ App started loading");

try {
  const container = document.getElementById('root');
  if (!container) {
    console.error("❌ Cannot find #root element");
  } else {
    const root = createRoot(container);
    root.render(
      <ConfigProvider>
        <App />
      </ConfigProvider>
    );
    // console.log("✅ React DOM rendered");
  }
} catch (e) {
  console.error("💥 React initialization failed:", e);
}

serviceWorker.unregister();

