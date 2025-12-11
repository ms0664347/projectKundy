import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid2';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../../ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../../ui-component/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';

import { gridSpacing } from 'store/constant';
import 'dayjs/locale/zh-tw';
import dayjs from 'dayjs';
import { mkdir, readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import Swal from 'sweetalert2';
// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
    const [isLoading, setLoading] = useState(true);
    const [date, setDate] = useState(dayjs());
    const [loadedData, setLoadedData] = useState([]);
    const [loadedExpenseData, setLoadedExpenseData] = useState([]);

    // 📊 統計資料
    const [monthIncome, setMonthIncome] = useState(0);
    const [yearIncome, setYearIncome] = useState(0);
    const [topTool, setTopTool] = useState({ name: '', count: 0 });
    const [topCompany, setTopCompany] = useState({ name: '', total: 0 });
    const [monthWorkDays, setMonthWorkDays] = useState(0);
    const [yearWorkDays, setYearWorkDays] = useState(0);
    const [totalDaysInMonth, setTotalDaysInMonth] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY/MM'));
    const [currentYear, setCurrentYear] = useState(dayjs().format('YYYY'));
    const [averageMonIncome, setAverageMonIncome] = useState(0);
    const [averageMonExpense, setAverageMonExpense] = useState(0);

    // 📉 支出統計
    const [monthExpense, setMonthExpense] = useState(0);
    const [monthExpenseDays, setMonthExpenseDays] = useState(0);
    const [yearExpense, setYearExpense] = useState(0);
    const [yearExpenseDays, setYearExpenseDays] = useState(0);
    const [topExpense, setTopExpense] = useState({ category: '', total: 0 });


    const dirName = 'data';
    const fileName = `${dirName}/DailyWorkReport.json`;
    const expenseFile = `${dirName}/DailyCostReport.json`;

    const showAlert = (icon, title, text) => {
        Swal.fire({
            icon,
            title,
            text,
            confirmButtonColor: '#3085d6',
        });
    };

    // ✅ 讀取全部資料
    // 小工具：安全解析
    const safeParseJson = (text) => {
        if (!text || !text.trim()) return [];
        try {
            const obj = JSON.parse(text);
            return Array.isArray(obj) ? obj : [];
        } catch {
            return [];
        }
    };

    const handleLoad = async () => {
        try {
            await mkdir(dirName, { baseDir: BaseDirectory.AppData, recursive: true });

            let content = '';
            let expenseContent = '';

            try {
                content = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
            } catch (e) {
                // 不存在就建立為 []
                await writeTextFile(fileName, '[]', { baseDir: BaseDirectory.AppData });
                content = '[]';
            }

            try {
                expenseContent = await readTextFile(expenseFile, { baseDir: BaseDirectory.AppData });
            } catch (e) {
                await writeTextFile(expenseFile, '[]', { baseDir: BaseDirectory.AppData });
                expenseContent = '[]';
            }

            // ✅ 不要 return，空就當 []
            const jsonData = safeParseJson(content);
            const expenseJsonData = safeParseJson(expenseContent);

            // ✅ 一律 set（就算是空陣列也可）
            setLoadedData(jsonData);
            setLoadedExpenseData(expenseJsonData);

            // === 以下照舊計算（空陣列也能正確得到 0） ===
            const now = dayjs();
            const currentMonthStr = now.format('YYYY/MM');
            const currentYearStr = now.format('YYYY');

            const filteredData = jsonData
                .filter((item) => item.date?.startsWith(currentMonthStr))
                .sort((a, b) => dayjs(b.date, 'YYYY/MM/DD').diff(dayjs(a.date, 'YYYY/MM/DD')));

            const filteredExpenseData = expenseJsonData
                .filter((item) => item.date?.startsWith(currentMonthStr))
                .sort((a, b) => dayjs(b.date, 'YYYY/MM/DD').diff(dayjs(a.date, 'YYYY/MM/DD')));

            // 本月總收入 / 支出
            const monthTotal = filteredData.reduce((sum, it) =>
                sum + (Number(it.amount) || 0) + (Number(it.overtimePay) || 0), 0);

            const monthExpenseTotal = filteredExpenseData.reduce((sum, it) =>
                sum + (Number(it.amount) || 0), 0);

            // 年度總收入 / 支出
            const yearData = jsonData.filter((it) => it.date?.startsWith(currentYearStr));
            const yearTotal = yearData.reduce((sum, it) =>
                sum + (Number(it.amount) || 0) + (Number(it.overtimePay) || 0), 0);

            const yearExpenseData = expenseJsonData.filter((it) => it.date?.startsWith(currentYearStr));
            const yearExpenseTotal = yearExpenseData.reduce((sum, it) =>
                sum + (Number(it.amount) || 0), 0);

            // 本月最常用工具
            const toolCount = {};
            for (const it of filteredData) {
                const k = it.tool || '未填寫';
                toolCount[k] = (toolCount[k] || 0) + 1;
            }
            const topToolEntry = Object.entries(toolCount).sort((a, b) => b[1] - a[1])[0] || ['', 0];

            // 本月支出最高類別
            const expenseTypeSum = {};
            for (const it of filteredExpenseData) {
                const k = it.category || '未填寫';
                expenseTypeSum[k] = (expenseTypeSum[k] || 0) + (Number(it.amount) || 0);
            }
            const [topExpenseCategory = '', topExpenseAmount = 0] =
                (Object.entries(expenseTypeSum).sort((a, b) => b[1] - a[1])[0] || ['', 0]);

            // 今年收入最高公司
            const companySum = {};
            for (const it of yearData) {
                const k = it.company || '未填寫';
                companySum[k] = (companySum[k] || 0) +
                    (Number(it.amount) || 0) + (Number(it.overtimePay) || 0);
            }
            const topCompanyEntry = Object.entries(companySum).sort((a, b) => b[1] - a[1])[0] || ['', 0];

            // 天數
            const uniqueDays = new Set(filteredData.map(it => it.date)).size;
            const uniqueExpenseDays = new Set(filteredExpenseData.map(it => it.date)).size;
            const totalDaysInMonth = now.daysInMonth();
            const yearWorkDays = new Set(yearData.map(it => it.date)).size;
            const yearExpenseDays = new Set(yearExpenseData.map(it => it.date)).size;

            // setState
            setMonthIncome(monthTotal);
            setYearIncome(yearTotal);
            setTopTool({ name: topToolEntry[0], count: topToolEntry[1] });
            setTopCompany({ name: topCompanyEntry[0], total: topCompanyEntry[1] });
            setMonthWorkDays(uniqueDays);
            setTotalDaysInMonth(totalDaysInMonth);
            setYearWorkDays(yearWorkDays);

            setMonthExpense(monthExpenseTotal);
            setMonthExpenseDays(uniqueExpenseDays);
            setYearExpense(yearExpenseTotal);
            setYearExpenseDays(yearExpenseDays);
            setTopExpense({ category: topExpenseCategory, total: topExpenseAmount });

            setAverageMonIncome(Math.floor(yearTotal / 12));
            setAverageMonExpense(Math.floor(yearExpenseTotal / 12));

        } catch (err) {
            console.error('❌ 讀取失敗:', err);
            showAlert('warning', '發生錯誤', '請聯絡阿廷或阿夆工程師');
        }
    };


    useEffect(() => {
        const now = dayjs();
        setCurrentMonth(now.format('MM'));
        setCurrentYear(now.format('YYYY'));
        handleLoad();
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
                        <EarningCard
                            isLoading={isLoading}
                            monthIncome={monthIncome}
                            monthWorkDays={monthWorkDays}
                            monthExpense={monthExpense}
                            monthExpenseDays={monthExpenseDays}
                            totalDaysInMonth={totalDaysInMonth}
                            currentMonth={currentMonth}
                        />
                    </Grid>
                    <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
                        <TotalOrderLineChartCard
                            isLoading={isLoading}
                            yearIncome={yearIncome}
                            yearWorkDays={yearWorkDays}
                            yearExpense={yearExpense}
                            yearExpenseDays={yearExpenseDays}
                            currentYear={currentYear}
                        />
                    </Grid>
                    <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                        <Grid container spacing={gridSpacing}>
                            <Grid size={{ sm: 6, xs: 12, md: 6, lg: 6 }}>
                                <TotalIncomeDarkCard
                                    isLoading={isLoading}
                                    topTool={topTool}
                                    currentMonth={currentMonth}
                                    topExpense={topExpense}
                                />
                            </Grid>
                            <Grid size={{ sm: 6, xs: 12, md: 6, lg: 6 }}>
                                <TotalIncomeLightCard
                                    isLoading={isLoading}
                                    currentYear={currentYear}
                                    averageMonIncome={averageMonIncome}
                                    averageMonExpense={averageMonExpense}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid size={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid size={{ xs: 12 }}>
                        <TotalGrowthBarChart
                            isLoading={isLoading}
                            loadedData={loadedData}   // 👈 全部 or 今年的日誌陣列
                            loadedExpenseData={loadedExpenseData}
                        />
                    </Grid>
                    {/* <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} />
          </Grid> */}
                </Grid>
            </Grid>
        </Grid>
    );
}
