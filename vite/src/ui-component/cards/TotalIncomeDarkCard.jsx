import PropTypes from 'prop-types';
import React from 'react';
// material-ui
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import BuildCircleTwoToneIcon from '@mui/icons-material/BuildCircleTwoTone';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.light,
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(210.04deg, ${theme.palette.primary[200]} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
        borderRadius: '50%',
        top: -30,
        right: -180
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(140.9deg, ${theme.palette.primary[200]} -14.02%, rgba(144, 202, 249, 0) 77.58%)`,
        borderRadius: '50%',
        top: -160,
        right: -130
    }
}));

export default function TotalIncomeDarkCard({ isLoading, topTool, topExpense, currentMonth }) {
    const theme = useTheme();
    const [mode, setMode] = React.useState('income'); // 預設顯示收入

    // 根據 mode 切換顯示內容
    const labelText = mode === 'income' ? '使用次數' : '支出';
    const color = mode === 'income' ? '#55f458ff' : '#fac472ff';
    const name = mode === 'income' ? (topTool?.name || '—') : (topExpense?.category || '—');
    const value = mode === 'income'
        ? `${topTool?.count?.toLocaleString?.() || 0} 次`
        : `$${topExpense?.total?.toLocaleString?.() || 0}`;

    return (
        <>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Grid container direction="column">
                        {/* 標題列 */}
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2
                            }}
                        >
                            {/* 左側：圖示 + 標題 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BuildCircleTwoToneIcon
                                    sx={{
                                        color: '#fff',
                                        fontSize: '1.6rem',
                                        verticalAlign: 'middle'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: '1rem',   // 小尺寸（手機）
                                            md: '1.25rem', // 中尺寸（平板）
                                            lg: '1.5rem'   // 大尺寸（桌機）
                                        },
                                        fontWeight: 500,
                                        color: '#fff'
                                    }}
                                >
                                    本月 ({currentMonth}月) {labelText}最多項目
                                </Typography>
                            </Box>

                            {/* 右上角切換按鈕 */}
                            <ToggleButtonGroup
                                color="primary"
                                exclusive
                                value={mode}
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
                                            color: '#fff'
                                        },
                                        '&:hover': {
                                            backgroundColor: '#ffffff33'
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="income">收入</ToggleButton>
                                <ToggleButton value="expense">支出</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

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
                                gap: 1,                     // ✅ 兩者間距
                                mt: 0,
                                ml: 4
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '2rem',
                                    fontWeight: 600,
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
                                {name}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.4rem',
                                    color: '#d0d0d0',
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
                                ({value})
                            </Typography>
                        </Box>
                    </Grid>
                </CardWrapper>
            )}
        </>
    );
}

TotalIncomeDarkCard.propTypes = {
    isLoading: PropTypes.bool,
    topTool: PropTypes.object,
    topExpense: PropTypes.object,
    currentMonth: PropTypes.string
};
