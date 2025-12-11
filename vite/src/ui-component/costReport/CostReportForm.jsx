import React from 'react';
import {
    TextField, Button, Typography, FormControl,
    InputLabel, Select, MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SubCard from 'ui-component/cards/SubCard';

export default function CostReportForm({
    record, setRecord,
    selectedCategory, setSelectedCategory,
    selectedMethod, setSelectedMethod,
    date, setDate,
    onSave, categoryStore, methodStore,
    isEditing, onCancelEdit
}) {
    const handleChange = (e) => {
        setRecord({ ...record, [e.target.name]: e.target.value });
    };

    return (
        <SubCard title={
            <Typography
                variant="h5"
                sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.6rem' }}
            >
                {isEditing ? '✏️ 編輯支出紀錄' : '📝 新增支出紀錄'}
            </Typography>
        }>
            <Grid container direction="column" spacing={1} sx={{ width: '80%', margin: '0 auto' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
                    <DatePicker
                        label="日期"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        format="YYYY/MM/DD"
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>

                <FormControl fullWidth>
                    <InputLabel id="company-select-label">類別</InputLabel>
                    <Select
                        labelId="company-select-label"
                        value={selectedCategory || ''}
                        label="類別"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {(categoryStore.items || []).map((name, index) => (
                            <MenuItem key={index} value={name}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="tool-select-label">支出方式(信用卡、現金....)</InputLabel>
                    <Select
                        labelId="tool-select-label"
                        value={selectedMethod || ''}
                        label="支出方式(信用卡、現金....)"
                        onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                        {(methodStore.items || []).map((name, index) => (
                            <MenuItem key={index} value={name}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField label="地點" name="location" value={record.location} onChange={handleChange} fullWidth />

                {/* 💰 金額 */}
                <TextField
                    label="支出金額"
                    name="amount"
                    type="number"
                    fullWidth
                    value={record.amount || ''}
                    inputProps={{
                        min: 1,
                        step: 1,
                        inputMode: 'numeric',
                        pattern: '[0-9]*'
                    }}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[1-9]\d*$/.test(val)) {
                            handleChange(e);
                        }
                    }}
                />

                <TextField label="備註" name="note" value={record.note} onChange={handleChange} fullWidth />

                <Button variant="contained" color="primary" onClick={onSave}
                    sx={{
                        width: '40%',
                        backgroundColor: '#4d78ddff',     // ✅ 主色
                        borderColor: '#4171e2',
                        margin: '10px auto',
                        color: '#fff',
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                            backgroundColor: '#3358d4',   // ✅ hover 顏色更深
                            boxShadow: '0 0 6px rgba(65,113,226,0.4)', // ✅ 微光暈效果
                        },
                    }}>{isEditing ? '🔄 更新' : '💾 儲存'}
                </Button>

                {isEditing && (
                    <Button variant="outlined" color="secondary" onClick={onCancelEdit}
                        sx={{
                            width: '40%',
                            margin: '10px auto',
                            textTransform: 'none',
                            borderRadius: 2,
                            color: '#d32f2f', // 🔹 直接指定文字顏色
                            borderColor: '#d32f2f', // 🔹 外框顏色同步
                            '&:hover': {
                                backgroundColor: '#e17a67ff',
                                color: '#fff', // 🔹 hover 時變白字
                                borderColor: '#e17a67ff',
                            },
                        }}
                    >
                        取消編輯
                    </Button>
                )}

            </Grid>
        </SubCard>
    );
}
