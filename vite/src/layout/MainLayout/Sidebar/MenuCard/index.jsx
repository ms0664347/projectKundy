import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';

// material-ui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { linearProgressClasses } from '@mui/material/LinearProgress';

// assets

import { solarToLunar } from 'chinese-lunar';
import dayjs from 'dayjs';

// ==============================|| PROGRESS BAR WITH LABEL ||============================== //

function LinearProgressWithLabel({ value, ...others }) {
    return (
        <Grid container direction="column" spacing={1} sx={{ mt: 1.5 }}>
            <Grid>
                <Grid container sx={{ justifyContent: 'space-between' }}>
                    <Grid>
                        <Typography variant="h6" sx={{ color: 'primary.800' }}>
                            Progress
                        </Typography>
                    </Grid>
                    <Grid>
                        <Typography variant="h6" color="inherit">{`${ Math.round(value) }%`}</Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid>
                <LinearProgress
                    aria-label="progress of theme"
                    variant="determinate"
                    value={value}
                    {...others}
                    sx={{
                        height: 10,
                        borderRadius: 30,
                        [`&.${ linearProgressClasses.colorPrimary }`]: {
                            bgcolor: 'background.paper'
                        },
                        [`& .${ linearProgressClasses.bar }`]: {
                            borderRadius: 5,
                            bgcolor: 'primary.dark'
                        }
                    }}
                />
            </Grid>
        </Grid>
    );
}

// ==============================|| SIDEBAR - MENU CARD ||============================== //

function MenuCard() {
    const theme = useTheme();
    const [festival, setFestival] = useState('');
    const [solarText, setSolarText] = useState('');
    const [lunarText, setLunarText] = useState('');

    const weekMap = {
        Sunday: '星期日',
        Monday: '星期一',
        Tuesday: '星期二',
        Wednesday: '星期三',
        Thursday: '星期四',
        Friday: '星期五',
        Saturday: '星期六'
    };

    useEffect(() => {
        const today = new Date();
        const solarMonth = today.getMonth() + 1;
        const solarDay = today.getDate();
        const weekDay = weekMap[dayjs(today).format('dddd')];
        const solarText = `國曆 ${ dayjs(today).format('YYYY/MM/DD') }（${ weekDay }）`;

        // ✅ 設定國曆日期
        setSolarText(solarText);

        // ✅ 取得農曆日期
        const lunar = solarToLunar(today);
        setLunarText(`農曆 ${ lunar.month } 月 ${ lunar.day } 日`);

        // ✅ 國曆節日
        const nationalFestivals = {
            '1-1': ['🎉 元旦快樂！'],
            '2-14': ['💞 情人節快樂！'],
            '2-28': ['🎉 和平紀念日'],
            '7-16': ['🎂 爸爸生日快樂！'],
            '8-8': ['🎉 父親節快樂！', '🎂 媽媽生日快樂！'],
            '10-10': ['🎉 雙十國慶快樂！'],
            '12-25': ['🎄 聖誕節快樂！']
        };

        // ✅ 農曆節日
        const lunarFestivals = {
            '1-1': ['🎆 新年快樂！'],
            '1-2': ['🎆 新年快樂！'],
            '1-3': ['🎆 新年快樂！'],
            '1-4': ['🎆 新年快樂！'],
            '1-5': ['🎆 新年快樂！'],
            '1-6': ['🍊 開工大吉！'],
            '1-15': ['🎉 元宵節快樂！'],
            '5-5': ['🐉 端午節快樂！'],
            '7-7': ['💞 七夕快樂！'],
            '8-15': ['🏮 中秋節快樂！'],
            '12-30': ['🎉 除夕快樂！']
        };

        const solarKey = `${ solarMonth }-${ solarDay }`;
        const lunarKey = `${ lunar.month }-${ lunar.day }`;

        let festivalMessages = [];

        // ✅ 相加判斷（不是 else if）
        if (nationalFestivals[solarKey]) {
            festivalMessages = festivalMessages.concat(nationalFestivals[solarKey]);
        }
        if (lunarFestivals[lunarKey]) {
            festivalMessages = festivalMessages.concat(lunarFestivals[lunarKey]);
        }

        // ✅ 最後合併並換行
        if (festivalMessages.length > 0) {
            setFestival(festivalMessages.join('\n')); // ✅ 使用換行符號
        } else {
            setFestival('');
        }
    }, []);

    return (
        <>
            <Card
                sx={{
                    bgcolor: 'primary.light',
                    mb: 2.75,
                    overflow: 'hidden',
                    position: 'relative',
                    '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: 157,
                        height: 157,
                        bgcolor: 'primary.200',
                        borderRadius: '50%',
                        top: -115,
                        right: -115
                    },
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: '#444',
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, // ✅ 響應式大小
                        textAlign: 'center',
                        whiteSpace: 'nowrap' // ✅ 避免換行
                    }}
                >
                    {solarText}
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        color: '#777',
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, // ✅ 響應式大小
                        textAlign: 'center',
                        mt: 0.5
                    }}
                >
                    {lunarText}
                </Typography>
            </Card>

            {/* 節慶訊息 */}
            {festival && (
                <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{
                        mt: 2,
                        color: '#d32f2f',
                        fontWeight: 'bold',
                        whiteSpace: 'pre-line', // 👈 讓 \n 換行生效
                        fontSize: '1.3rem',
                        animation: 'blink 3s ease-in-out infinite',
                        '@keyframes blink': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.3 }
                        }
                    }}
                >
                    {festival}
                </Typography>
            )}
        </>
    );
}

export default memo(MenuCard);

LinearProgressWithLabel.propTypes = { value: PropTypes.number, others: PropTypes.any };
