import PropTypes from 'prop-types';
import { forwardRef, useState, useEffect } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import { Box, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';

// third party
import { bindToggle } from 'material-ui-popup-state';

// project imports

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

import { motion, AnimatePresence } from 'framer-motion';


function HeaderAvatarComponent({ children, ...others }, ref) {

    const theme = useTheme();
    return (
        <Avatar
            ref={ref}
            variant="rounded"
            sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                bgcolor: 'secondary.light',
                color: 'secondary.dark',
                '&:hover': {
                    bgcolor: 'secondary.dark',
                    color: 'secondary.light'
                }
            }}
            {...others}
        >
            {children}
        </Avatar>
    );
}

const HeaderAvatar = forwardRef(HeaderAvatarComponent);

// ==============================|| SEARCH INPUT - MOBILE||============================== //

function MobileSearch({ value, setValue, popupState }) {
    const theme = useTheme();

    return (
        <OutlinedInput
            id="input-search-header"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search"
            startAdornment={
                <InputAdornment position="start">
                    <IconSearch stroke={1.5} size="16px" />
                </InputAdornment>
            }
            endAdornment={
                <InputAdornment position="end">
                    <HeaderAvatar>
                        <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
                    </HeaderAvatar>
                    <Box sx={{ ml: 2 }}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                ...theme.typography.commonAvatar,
                                ...theme.typography.mediumAvatar,
                                bgcolor: 'orange.light',
                                color: 'orange.dark',
                                '&:hover': {
                                    bgcolor: 'orange.dark',
                                    color: 'orange.light'
                                }
                            }}
                            {...bindToggle(popupState)}
                        >
                            <IconX stroke={1.5} size="20px" />
                        </Avatar>
                    </Box>
                </InputAdornment>
            }
            aria-describedby="search-helper-text"
            inputProps={{ 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } }}
            sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
        />
    );
}

// ==============================|| SEARCH INPUT ||============================== //

export default function SearchSection() {

    const [texts, setTexts] = useState([
        'Welcome to Kundy! 😊 Hi! Kundy 你好 😊',
        '工作注意安全，不疲勞駕駛 🚗，今天是個適合上班的好日子 🚜',
        '少抽菸，沒事多喝水，多喝水沒事 💧',
        '爸爸你上班辛苦了 💪 時間不早了，早點休息😎',
    ]);

    const [index, setIndex] = useState(0);


    // 🌦️ 自動載入今日天氣
    useEffect(() => {
        async function fetchWeather() {
            const apiKey = "fadd5cdc309f4c7c8a472707251411";
            const city = "Miaoli";

            try {
                // 用 forecast API 才有 hourly chance_of_rain
                const res = await fetch(
                    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&lang=zh_tw`
                );
                const data = await res.json();

                if (data?.forecast?.forecastday?.length) {
                    const today = data.forecast.forecastday[0];

                    // 今日每小時資料
                    const hours = today.hour;

                    // 找到「最接近現在」的那小時
                    const now = Date.now();
                    const closest = hours.reduce((prev, curr) => {
                        return Math.abs(new Date(curr.time) - now) <
                            Math.abs(new Date(prev.time) - now)
                            ? curr
                            : prev;
                    });

                    // 取得資料
                    const desc = closest.condition.text;
                    const temp = Math.round(closest.temp_c);
                    const feels = Math.round(closest.feelslike_c);

                    // ⭐ 每小時降雨機率（最準確）
                    const rainProb = closest.chance_of_rain ?? 0;

                    // emoji
                    let icon = "🌤";
                    if (desc.includes("雲")) icon = "☁️";
                    else if (desc.includes("雨")) icon = "🌧️";
                    else if (desc.includes("晴")) icon = "☀️";

                    const weatherMsg = `苗栗今天天氣：${desc}${icon}，氣溫 ${temp}°C，體感 ${feels}°C，降雨機率 ${rainProb}%`;

                    setTexts(prev => [weatherMsg, ...prev]);
                } else {
                    console.warn("⚠️ WeatherAPI 回傳無資料", data);
                }
            } catch (err) {
                console.error("❌ 無法取得 WeatherAPI 天氣資料", err);
            }
        }

        fetchWeather();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, 4000); // 每 3 秒切換一次
        return () => clearInterval(timer);
    }, [texts.length]);

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    p: 2,
                    width: '100%',
                    height: '70px',
                    overflow: 'hidden', // 讓動畫只顯示範圍內
                    position: 'relative',
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ position: 'absolute' }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                color: 'primary.main',
                                fontSize: '1.4rem',
                                textAlign: 'center',
                            }}
                        >
                            {texts[index]}
                        </Typography>
                    </motion.div>
                </AnimatePresence>


            </Box>
        </>
    );
}

HeaderAvatarComponent.propTypes = { children: PropTypes.node, others: PropTypes.any };

MobileSearch.propTypes = { value: PropTypes.string, setValue: PropTypes.func, popupState: PropTypes.any };
