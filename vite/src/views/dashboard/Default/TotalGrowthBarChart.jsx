import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';

import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import Swal from 'sweetalert2';

export default function TotalGrowthBarChart({ isLoading, loadedData = [], loadedExpenseData = [] }) {

    const [incomeOrExpense, setIncomeOrExpense] = React.useState('income'); // 收入 or 支出
    const [status, setStatus] = React.useState('all');
    const [year, setYear] = React.useState(dayjs().format('YYYY'));
    const theme = useTheme();
    const { mode } = useConfig();

    const monthLabels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
    const fileTitle = `${year}年度${incomeOrExpense === 'income' ? '收入' : '支出'}統計`;

    const fixedColors = ['#cc47f0ff', '#825be7ff', '#4268d9ff', '#6ae759ff', '#e8e853ff'];
    const otherColor = '#dbd9d9ff';


    const toMonthKey = (dateStr) => {
        const d = dayjs(dateStr, ['YYYY/MM/DD', 'YYYY-MM-DD'], true);
        return d.isValid() ? d.format('YYYY-MM') : null;
    };

    function buildMonthlySeries(data, groupKey, year) {
        const monthLabels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
        const toMonthKey = (dateStr) => {
            const d = dayjs(dateStr, ['YYYY/MM/DD', 'YYYY-MM-DD'], true);
            return d.isValid() ? d.format('YYYY-MM') : null;
        };

        const yearData = data.filter(it => {
            const m = toMonthKey(it.date);
            return m && m.startsWith(`${year}-`);
        });

        const acc = new Map(); // Map<groupName, number[12]>
        const num = (v) => Number(v) || 0;

        // 🔹 先逐筆累積每個公司／工具的每月金額
        yearData.forEach(it => {
            const key = (it[groupKey] || '未填寫').trim() || '未填寫';
            const mkey = toMonthKey(it.date);
            const monthIdx = Number(mkey.slice(5, 7)) - 1;
            const income = num(it.amount) + num(it.overtimePay);

            if (!acc.has(key)) acc.set(key, Array(12).fill(0));
            acc.get(key)[monthIdx] += income;
        });

        // 🔹 計算每個 key 的年度總金額
        const groupTotals = Array.from(acc.entries()).map(([name, arr]) => ({
            name,
            data: arr,
            total: arr.reduce((a, b) => a + b, 0)
        }));

        // 🔹 依 total 金額排序（高→低）
        groupTotals.sort((a, b) => b.total - a.total);

        // 🔹 取前 5 名，其餘合併為「其他」
        const top5 = groupTotals.slice(0, 5);
        const others = groupTotals.slice(5);

        if (others.length > 0) {
            const merged = Array(12).fill(0);
            others.forEach(g => {
                g.data.forEach((v, i) => merged[i] += v);
            });
            top5.push({ name: '其他', data: merged, total: merged.reduce((a, b) => a + b, 0) });
        }

        // 🔹 series：最終傳給 chart 的資料
        const series = top5.map(({ name, data }) => ({ name, data }));

        // 🔹 顏色（前 5 名固定 + 其他灰色）
        const colors = [...fixedColors.slice(0, series.length - 1), otherColor];

        // 🔹 全年總和（顯示在上面卡片）
        const total = series.reduce((sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0);

        return { categories: monthLabels, series, colors, total };
    }

    function buildExpenseMonthlySeries(expenseData, groupKey, year) {
        const monthLabels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
        const toMonthKey = (dateStr) => {
            const d = dayjs(dateStr, ['YYYY/MM/DD', 'YYYY-MM-DD'], true);
            return d.isValid() ? d.format('YYYY-MM') : null;
        };

        // ✅ 篩出該年度支出資料
        const yearExpenseData = expenseData.filter(it => {
            const m = toMonthKey(it.date);
            return m && m.startsWith(`${year}-`);
        });

        const acc = new Map(); // Map<category, number[12]>
        const num = (v) => Number(v) || 0;

        // ✅ 每筆累積金額到對應月份
        yearExpenseData.forEach(it => {
            const key = (it[groupKey] || '未填寫').trim() || '未填寫';
            const mkey = toMonthKey(it.date);
            const monthIdx = Number(mkey.slice(5, 7)) - 1;
            const amount = num(it.amount);

            if (!acc.has(key)) acc.set(key, Array(12).fill(0));
            acc.get(key)[monthIdx] += amount;
        });

        // ✅ 計算每個類別的年度總支出
        const groupTotals = Array.from(acc.entries()).map(([name, arr]) => ({
            name,
            data: arr,
            total: arr.reduce((a, b) => a + b, 0)
        }));

        // ✅ 依 total 金額排序（高→低）
        groupTotals.sort((a, b) => b.total - a.total);

        // ✅ 取前 5 名，其餘合併為「其他」
        const top5 = groupTotals.slice(0, 5);
        const others = groupTotals.slice(5);

        if (others.length > 0) {
            const merged = Array(12).fill(0);
            others.forEach(g => g.data.forEach((v, i) => merged[i] += v));
            top5.push({ name: '其他', data: merged, total: merged.reduce((a, b) => a + b, 0) });
        }

        // ✅ series：最終傳給 chart 的資料
        const series = top5.map(({ name, data }) => ({ name, data }));

        // ✅ 顏色（可共用 income 的顏色設定）
        const colors = [...fixedColors.slice(0, series.length - 1), otherColor];

        // ✅ 全年總支出
        const total = series.reduce((sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0);

        return { categories: monthLabels, series, colors, total };
    }

    function buildIncomeMonthlyTotal(data, year) {
        const monthLabels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
        const result = Array(12).fill(0);

        const num = (v) => Number(v) || 0;
        data.forEach(it => {
            if (it.date?.startsWith(year)) {
                const month = Number(it.date.slice(5, 7)) - 1;
                result[month] += num(it.amount) + num(it.overtimePay);
            }
        });

        const total = result.reduce((a, b) => a + b, 0);
        return {
            categories: monthLabels,
            series: [{ name: '總收入', data: result }],
            colors: ['#6ae759'],
            total
        };
    }

    function buildExpenseMonthlyTotal(data, year) {
        const monthLabels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
        const result = Array(12).fill(0);

        const num = (v) => Number(v) || 0;
        data.forEach(it => {
            if (it.date?.startsWith(year)) {
                const month = Number(it.date.slice(5, 7)) - 1;
                result[month] += num(it.amount);
            }
        });

        const total = result.reduce((a, b) => a + b, 0);
        return {
            categories: monthLabels,
            series: [{ name: '總支出', data: result }],
            colors: ['#fac472'],
            total
        };
    }

    const chartData = React.useMemo(() => {
        if (incomeOrExpense === 'expense') {
            // 👇 支出模式
            if (status === 'all') {
                return buildExpenseMonthlyTotal(loadedExpenseData, year);
            }
            return buildExpenseMonthlySeries(loadedExpenseData, status, year);
        } else {
            // 👇 收入模式
            if (status === 'all') {
                return buildIncomeMonthlyTotal(loadedData, year);
            }
            return buildMonthlySeries(loadedData, status, year);
        }
    }, [incomeOrExpense, status, year, loadedData, loadedExpenseData]);

    React.useEffect(() => {
        const handler = (e) => {
            const item = e.target.closest('.apexcharts-menu-item');
            if (!item) return;

            if (
                item.textContent.includes('Download PNG') ||
                item.textContent.includes('Download SVG') ||
                item.textContent.includes('Download CSV')
            ) {
                // 下載通常需要 0.5~1 秒生成，所以延遲一點提示
                setTimeout(() => {
                    Swal.fire({
                        icon: 'success',
                        title: '下載完成 🎉',
                        text: '圖表已成功儲存到下載資料夾！',
                        showConfirmButton: false,
                        timer: 2000,
                        toast: true,
                        position: 'center',
                        timerProgressBar: true,
                    });
                }, 1000);
            }
        };

        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonTotalGrowthBarChart />
            ) : (
                <MainCard>
                    <Grid container spacing={gridSpacing}>
                        <Grid size={12}>
                            <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Grid>
                                    <Grid container direction="column" spacing={1}>
                                        <Grid>
                                            <Typography variant="subtitle" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                {incomeOrExpense === 'income' ? '總收入' : '總支出'}
                                            </Typography>
                                        </Grid>
                                        <Grid>
                                            <Typography variant="h2">${chartData.total.toLocaleString()}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid>
                                    {/* 第一個下拉：收入 / 支出 */}
                                    <TextField
                                        select
                                        value={incomeOrExpense}
                                        onChange={(e) => {
                                            setIncomeOrExpense(e.target.value);
                                            setStatus('all'); // ✅ 預設成「全部」
                                        }}
                                        sx={{ mr: 2, minWidth: 100 }}
                                    >
                                        <MenuItem value="income">收入</MenuItem>
                                        <MenuItem value="expense">支出</MenuItem>
                                    </TextField>

                                    {/* 第二個下拉：依 incomeOrExpense 切換內容 */}
                                    <TextField
                                        select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        sx={{ mr: 2, minWidth: 120 }}
                                    >
                                        {(incomeOrExpense === 'income'
                                            ? [
                                                <MenuItem key="all" value="all">全部</MenuItem>,
                                                <MenuItem key="tool" value="tool">工具</MenuItem>,
                                                <MenuItem key="company" value="company">公司</MenuItem>
                                            ]
                                            : [
                                                <MenuItem key="all" value="all">全部</MenuItem>,
                                                <MenuItem key="category" value="category">類別</MenuItem>,
                                                <MenuItem key="method" value="method">方式</MenuItem>
                                            ]
                                        )}
                                    </TextField>

                                    {/* 第三個下拉：年份 */}
                                    <TextField
                                        select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        sx={{ minWidth: 100 }}
                                    >
                                        {[dayjs().format('YYYY'), dayjs().subtract(1, 'year').format('YYYY')].map((y) => (
                                            <MenuItem key={y} value={y}>
                                                {y}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                            </Grid>
                        </Grid>

                        {/* ✅ 圖表安全渲染 */}
                        <Grid size={12}>
                            <Chart
                                type="bar"
                                height={400}
                                series={
                                    chartData.series.length > 0
                                        ? chartData.series
                                        : [{ name: incomeOrExpense === 'income' ? '總收入' : '總支出', data: Array(12).fill(0) }]
                                }
                                options={{
                                    chart: {
                                        id: 'bar-chart',
                                        stacked: true,
                                        background: 'transparent',
                                        toolbar: {
                                            show: true,
                                            tools: {
                                                download: true,
                                                selection: false,
                                                zoom: false,
                                                zoomin: false,
                                                zoomout: false,
                                                pan: false,
                                                reset: false
                                            },
                                            export: {
                                                csv: { filename: fileTitle },
                                                png: { filename: fileTitle },
                                                svg: { filename: fileTitle }
                                            }

                                        }
                                    },
                                    plotOptions: {
                                        bar: {
                                            horizontal: false,
                                            columnWidth: '30%',
                                            borderRadius: 6,
                                            states: {
                                                hover: {
                                                    filter: {
                                                        type: 'none' // ✅ 關閉 hover 變白的效果
                                                    }
                                                },
                                                active: {
                                                    filter: {
                                                        type: 'none' // ✅ 也一併取消點擊選中時變暗
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    xaxis: {
                                        categories: chartData.categories,
                                        labels: { style: { fontSize: '16px' } }
                                    },
                                    yaxis: {
                                        min: 0,
                                        max: chartData.total === 0 ? 10 : undefined,
                                        labels: {
                                            formatter: (v) => `${Number(v || 0).toLocaleString()}`,
                                            style: { fontSize: '16px' }
                                        }
                                    },
                                    colors: chartData.colors,
                                    dataLabels: { enabled: false },
                                    legend: {
                                        show: true,
                                        showForSingleSeries: true,
                                        position: 'bottom',
                                        fontSize: '18px'
                                    },
                                    tooltip: {
                                        shared: true,
                                        intersect: false,
                                        y: {
                                            formatter: (v) => `$${Number(v || 0).toLocaleString()}`
                                        }
                                    },
                                    grid: {
                                        borderColor: 'rgba(0, 0, 0, 0.5)',
                                        strokeDashArray: 3
                                    }
                                }}
                            />
                        </Grid>

                    </Grid>
                </MainCard>
            )}
        </>
    );
}

TotalGrowthBarChart.propTypes = { isLoading: PropTypes.bool };
