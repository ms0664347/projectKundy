Kundy — React + Tauri Windows 桌面應用程式

Kundy 是一套以 React + Vite 開發，並透過 Tauri 打包成 Windows 桌面應用程式的
本地端記帳與工作日誌管理工具。本專案完全離線運作，所有資料（JSON）皆儲存在使用者電腦的本地檔案系統，無需任何後端服務或資料庫。

本專案著重於：

本地資料儲存架構設計

桌面應用的狀態管理與 UI Layout

使用 Tauri 實作檔案系統存取

視覺化儀表板、列表查詢與多條件篩選

系統參數管理（工具、公司、支出類別…）

📊 主要功能
Dashboard 儀表板

月收入、年收入統計

    常用項目統計

    圖表視覺化呈現（Recharts）

工作日誌管理

    每日工作記錄

    所有工作日誌查詢（年份、公司、工具、關鍵字）

    分頁、統計合計、自動計算金額

支出管理

    每日支出記錄

    全部支出列表

    支出類別、付款方式設定

系統設定

    常用公司設定

    常用工具設定

    支出分類管理

本地端資料儲存架構

    透過 Tauri FS API 完整讀寫 JSON

    Offline-first 設計，無需網路即可運作



🛠️ 技術架構

    技術	               說明

React + Vite	    前端框架與建構工具
Material UI /   Tailwind	UI Layout 與設計
Recharts	            圖形統計呈現
Tauri (Rust)	打包成 Windows EXE、與本地檔案互動
Tauri FS API	        JSON本地存取


🚀 開發方式（給開發者）

啟動開發模式（需 Rust + Tauri build tools）：

npx tauri dev

打包 Windows EXE：

npx tauri build

打包後的執行檔會位於：

src-tauri/target/release/bundle/nsis


📁 專案結構（簡略）
src/
 ├─ api/
 ├─ assets/
 ├─ contexts/
 ├─ hooks/
 ├─ layout/
 ├─ routes/
 ├─ store/
 ├─ themes/
 ├─ ui-component/
 ├─ views/
 ├─ App.jsx
 └─ config.js


📝 Copyright Notice
（依規定保留 Create React App 版權段落）

This project was bootstrapped with
👉 Create React App (https://github.com/facebook/create-react-app
)