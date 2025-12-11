import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import TimelineTwoToneIcon from '@mui/icons-material/TimelineTwoTone';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';

export default function TotalOrderLineChartCard({ isLoading, yearIncome, yearWorkDays, yearExpense, yearExpenseDays, currentYear }) {
    const theme = useTheme();

    const [mode, setMode] = React.useState('income'); // 預設顯示收入

    // 根據 mode 切換顯示內容
    const displayAmount = mode === 'income' ? yearIncome : yearExpense;
    const displayDays = mode === 'income' ? yearWorkDays : yearExpenseDays;
    const labelText = mode === 'income' ? '收入' : '支出';
    const color = mode === 'income' ? '#55f458ff' : '#fac472ff'; // 收入→綠, 支出→橘

    return (
        <>
            {isLoading ? (
                <SkeletonTotalOrderCard />
            ) : (
                <MainCard
                    border={false}
                    content={false}
                    sx={{
                        bgcolor: 'primary.dark',
                        color: '#fff',
                        overflow: 'hidden',
                        position: 'relative',
                        height: {
                            xs: '100%',  // 手機、小螢幕
                            md: '100%',  // 中尺寸螢幕
                            lg: '90%'    // 大螢幕縮短
                        },
                        '&>div': {
                            position: 'relative',
                            zIndex: 5
                        },
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            width: 150,
                            height: 150,
                            background: theme.palette.primary[800],
                            borderRadius: '50%',
                            top: { xs: -85 },
                            right: { xs: -95 }
                        },
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            width: 210,
                            height: 210,
                            background: theme.palette.primary[800],
                            borderRadius: '50%',
                            top: { xs: -125 },
                            right: { xs: -15 },
                            opacity: 0.5
                        }
                    }}
                >
                    <Box
                        sx={{
                            p: 2.25,
                            [theme.breakpoints.up('lg')]: {
                                mt: 0, // 整體往下移
                                p: 3.5
                            }
                        }}
                    >
                        <Grid container direction="column">
                            {/* 標題區塊 */}
                            <Box
                                mb={2}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between', // ← 左右兩邊分開
                                    gap: 2,
                                    [theme.breakpoints.up('lg')]: {
                                        mb: 0 // 標題與內容間距變大
                                    }
                                }}
                            >
                                {/* ✅ 左邊包一層 */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TimelineTwoToneIcon
                                        sx={{
                                            color: '#fff',
                                            fontSize: '1.6rem',
                                            [theme.breakpoints.up('lg')]: {
                                                fontSize: '3rem' // 大螢幕放大圖示
                                            }
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '1.25rem',
                                            fontWeight: 500,
                                            color: '#fff',
                                            [theme.breakpoints.up('lg')]: {
                                                fontSize: '1.5rem' // 大螢幕放大文字
                                            }
                                        }}
                                    >
                                        今年 ({currentYear}年)
                                    </Typography>
                                </Box>
                                {/* 右上角切換按鈕 */}
                                <ToggleButtonGroup
                                    color="primary"
                                    exclusive
                                    value={mode}
                                    justify="right"
                                    onChange={(e, newMode) => {
                                        if (newMode !== null) setMode(newMode);
                                    }}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: 2,
                                        '& .MuiToggleButton-root': {
                                            color: '#fff',
                                            border: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            px: 2,
                                            '&.Mui-selected': {
                                                backgroundColor: '#ffffff78',
                                                color: '#fff',
                                            },
                                            '&:hover': {
                                                backgroundColor: '#ffffff33',
                                            },
                                        },
                                    }}
                                >
                                    <ToggleButton value="income">收入</ToggleButton>
                                    <ToggleButton value="expense">支出</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            {/* 收入與天數 */}
                            <Grid>
                                <Grid
                                    container
                                    direction="column"
                                    sx={{
                                        mt: 1,
                                        gap: 0.5,
                                        [theme.breakpoints.up('lg')]: {
                                            mt: 2, // 間距加大
                                            gap: 0
                                        }
                                    }}
                                >
                                    {/* 顯示金額（含動畫） */}
                                    {/* 內容區塊 */}
                                    <Box
                                        key={mode}
                                        sx={{
                                            p: 2,
                                            color: '#fff',
                                            animation: 'fadeInScale 0.5s ease forwards',
                                            '@keyframes fadeInScale': {
                                                '0%': { opacity: 0, transform: 'scale(0.95)' },
                                                '100%': { opacity: 1, transform: 'scale(1)' }
                                            },
                                            display: 'flex',           // ✅ 同一行排列
                                            alignItems: 'baseline',    // ✅ 對齊底線（讓字漂亮對齊）
                                            gap: 1                     // ✅ 兩者間距
                                        }}
                                    >
                                        <Typography
                                            key={mode} // 👈 強制 React 重新渲染以觸發動畫
                                            sx={{
                                                fontSize: '1.6rem',
                                                fontWeight: 700,
                                                color,
                                                opacity: 0,
                                                transform: 'scale(0.9)',
                                                animation: 'fadeInScale 0.6s ease forwards', // 👈 呼叫動畫
                                                [theme.breakpoints.up('lg')]: { fontSize: '2.2rem' },
                                                '@keyframes fadeInScale': {
                                                    '0%': { opacity: 0, transform: 'scale(0.9)' },
                                                    '50%': { opacity: 0.5, transform: 'scale(1.05)' },
                                                    '100%': { opacity: 1, transform: 'scale(1)' }
                                                }
                                            }}
                                        >
                                            {labelText}：${displayAmount?.toLocaleString() || '0.00'}
                                        </Typography>

                                        {/* 顯示天數（含動畫） */}
                                        <Typography
                                            key={mode + '-days'}
                                            sx={{
                                                fontSize: '1.25rem',
                                                color: '#e0e0e0',
                                                fontWeight: 400,
                                                opacity: 0,
                                                animation: 'fadeIn 0.6s ease forwards',
                                                [theme.breakpoints.up('lg')]: { fontSize: '1.6rem' },
                                                '@keyframes fadeIn': {
                                                    '0%': { opacity: 0 },
                                                    '100%': { opacity: 1 }
                                                }
                                            }}
                                        >
                                            ({displayDays}/{365} 天)
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </MainCard>
            )}
        </>
    );
}

TotalOrderLineChartCard.propTypes = { isLoading: PropTypes.bool };
