// material-ui
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    FormControl, InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { BaseDirectory, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import MainCard from 'ui-component/cards/MainCard';
import WorkReportForm from '../../ui-component/workReport/WorkReportForm';
import WorkReportTable from '../../ui-component/workReport/WorkReportTable';

export default function AllWorkReport() {
    const [loadedData, setLoadedData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [resetKey, setResetKey] = useState(0);
    const [pageResetKey, setPageResetKey] = useState(0);


    const dirName = 'data';
    const fileName = `${ dirName }/DailyWorkReport.json`;

    // ✅ 讀取公司與工具
    const companyStore = useJsonStore('company.json');
    const toolStore = useJsonStore('tool.json');

    // ✅ 點擊「編輯」按鈕
    const handleEdit = (item) => {
        setEditForm({
            company: item.company || '',
            tool: item.tool || '',
            location: item.location || '',
            amount: item.amount || '',
            overtimePay: item.overtimePay || '',
            tax: item.tax || 3,
            note: item.note || '',
            date: dayjs(item.date, 'YYYY/MM/DD'),
            pkno: item.pkno,
        });
        setOpenModal(true);
    };

    const handleModalClose = () => {
        setOpenModal(false);
        // 延遲清空資料（避免動畫期間內容變空白）
        setTimeout(() => {
            setEditForm(null);
        }, 300); // MUI Dialog 預設 transitionDuration 約 200ms
    };


    // ✅ 更新資料
    const handleSaveEdit = async (updatedRecord) => {
        try {
            const content = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
            const jsonData = JSON.parse(content);
            updatedRecord.date = updatedRecord.date ? updatedRecord.date.format('YYYY/MM/DD') : '';
            const newList = jsonData.map((item) =>
                item.pkno === updatedRecord.pkno ? { ...updatedRecord } : item
            );

            await writeTextFile(fileName, JSON.stringify(newList, null, 2), { baseDir: BaseDirectory.AppData });
            showAlert('success', '更新成功', `✅ ${ updatedRecord.date } 的工作日誌已更新！`);

            const refreshedData = await handleLoadAll();
            handleSearch(refreshedData);
            handleModalClose();

        } catch (err) {
            console.error('❌ 更新失敗:', err);
            showAlert('error', '更新失敗', '請聯絡阿廷或阿夆工程師');
        }
    };

    // 🔍 篩選條件
    const [filters, setFilters] = useState({
        year: '',
        month: '',
        company: '',
        tool: '',
        keyword: ''
    });


    const showAlert = (icon, title, text) => {
        Swal.fire({
            icon,
            title,
            text,
            confirmButtonColor: '#3085d6'
        });
    };

    // ✅ 重置篩選條件
    const handleReset = () => {
        setFilters({ year: '', month: '', company: '', tool: '', keyword: '' });
        setLoadedData(allData);
    };

    // ✅ 年份選項（從資料動態生成）
    const uniqueYears = Array.from(
        new Set(allData.map((item) => item.date?.split('/')[0]).filter(Boolean))
    ).sort((a, b) => b - a);

    // ✅ 月份選項（1~12固定）
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

    /** ✅ 共用 JSON 檔案讀取 Hook */
    function useJsonStore(fileName) {
        const [items, setItems] = useState([]);
        const filePath = `${ dirName }/${ fileName }`;

        const load = async () => {
            try {
                const content = await readTextFile(filePath, { baseDir: BaseDirectory.AppData });
                const jsonData = JSON.parse(content);
                setItems(jsonData || []);
            } catch {
                setItems([]);
            }
        };

        useEffect(() => {
            load();
        }, []);

        return { items };
    }

    // ✅ 讀取所有 DailyWorkReport
    const handleLoadAll = async () => {
        try {
            // 🔹 確保資料夾存在
            await mkdir(dirName, { baseDir: BaseDirectory.AppData, recursive: true });

            let content = '';

            try {
                // 嘗試讀取檔案
                content = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
            } catch (err) {
                // 🔹 有些系統 err 不是 JS Error，要強制轉字串來分析
                const msg = String(err).toLowerCase();
                if (
                    msg.includes('file not found') ||
                    msg.includes('no such file') ||
                    msg.includes('failed to open file') ||
                    msg.includes('os error 2')
                ) {
                    console.warn('📁 DailyWorkReport.json 不存在，正在建立空檔案...');
                    await writeTextFile(fileName, '[]', { baseDir: BaseDirectory.AppData });
                    content = '[]';
                } else {
                    throw err;
                }
            }

            // 🔹 若內容空白 → 不載入資料
            if (!content || content.trim() === '') {
                setLoadedData([]);
                return [];
            }

            const jsonData = JSON.parse(content);
            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                setLoadedData([]);
                return [];
            }

            // ✅ 日期由新到舊排序
            const sortedData = jsonData.sort((a, b) => new Date(b.date) - new Date(a.date));

            setAllData(sortedData);
            setLoadedData(sortedData);

            return sortedData; // ✅ 關鍵：回傳最新資料

        } catch (err) {
            console.error('❌ 讀取失敗:', err);
            showAlert('warning', '發生錯誤', '請聯絡阿廷或阿夆工程師');
        }
    };

    // ✅ 刪除指定 pkno 的資料
    const handleDelete = async (pkList) => {
        // ✅ 接收陣列
        if (!Array.isArray(pkList) || pkList.length === 0) {
            Swal.fire('提示', '請先選擇要刪除的資料！', 'info');
            return;
        }

        const result = await Swal.fire({
            title: `確定要刪除 ${ pkList.length } 筆資料嗎？`,
            text: '刪除後無法復原！',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '是的，刪除！',
            cancelButtonText: '取消'
        });

        if (!result.isConfirmed) return;

        try {
            const content = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
            const jsonData = JSON.parse(content);
            const newList = jsonData.filter((item) => !pkList.includes(item.pkno));

            await writeTextFile(fileName, JSON.stringify(newList, null, 2), { baseDir: BaseDirectory.AppData });

            Swal.fire('刪除成功', `🗑️ 已刪除 ${ pkList.length } 筆資料`, 'success');

            const refreshedData = await handleLoadAll();
            handleSearch(refreshedData);

            // ✅ 通知子層清空勾選
            setResetKey(prev => prev + 1);

        } catch (err) {
            console.error(err);
            Swal.fire('刪除失敗', '請聯絡阿廷或阿夆工程師！', 'error');
        }
    };


    const handleSearch = (data) => {
        const baseData = Array.isArray(data) ? data : allData;
        let filtered = [...baseData];

        const { year, month, company, tool, keyword } = filters;

        if (year)
            filtered = filtered.filter((item) => item.date?.startsWith(year));
        if (month)
            filtered = filtered.filter((item) => item.date?.split('/')[1] === month);
        if (company)
            filtered = filtered.filter((item) => item.company === company);
        if (tool)
            filtered = filtered.filter((item) => item.tool === tool);

        if (keyword) {
            const kw = keyword.toLowerCase();
            filtered = filtered.filter((item) =>
                [item.note, item.company, item.tool, item.location]
                    .filter(Boolean)
                    .some((v) => v.toLowerCase().includes(kw))
            );
        }

        // ✅ 排序：確保日期由新到舊，空白日期排最後
        filtered.sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateB - dateA;
        });

        setLoadedData(filtered);
        setPageResetKey(prev => prev + 1); // ✅ 通知子層回到第一頁

    };


    useEffect(() => {
        handleLoadAll();
    }, []);

    return (
        <MainCard
            title={
                <Typography
                    variant="h3"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        color: '#333'
                    }}
                >
                    📋所有工作日誌報表
                </Typography>
            }
        >
            {/* 🔍 搜尋列 */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    mb: 3
                }}
            >
                {/* 年份 */}
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>年份</InputLabel>
                    <Select
                        value={filters.year}
                        label="年份"
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    >
                        <MenuItem value="">全部</MenuItem>
                        {uniqueYears.map((y, index) => (
                            <MenuItem key={index} value={y}>
                                {y} 年
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 月份 */}
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>月份</InputLabel>
                    <Select
                        value={filters.month}
                        label="月份"
                        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                    >
                        <MenuItem value="">全部</MenuItem>
                        {months.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m} 月
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 公司 */}
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>公司</InputLabel>
                    <Select
                        value={filters.company}
                        label="公司"
                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                    >
                        <MenuItem value="">全部</MenuItem>
                        {companyStore.items.map((name, index) => (
                            <MenuItem key={index} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 工具 */}
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>工具</InputLabel>
                    <Select
                        value={filters.tool}
                        label="工具"
                        onChange={(e) => setFilters({ ...filters, tool: e.target.value })}
                    >
                        <MenuItem value="">全部</MenuItem>
                        {toolStore.items.map((name, index) => (
                            <MenuItem key={index} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 關鍵字 */}
                <TextField
                    label="搜尋關鍵字"
                    variant="outlined"
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    sx={{ minWidth: 200 }}
                />

                {/* 搜尋按鈕 */}
                <Button
                    id="searchButton"
                    variant="contained"
                    sx={{
                        height: '38px',
                        width: '100px',
                        px: 2.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#fff',                  // ✅ 白字
                        backgroundColor: '#4d7ae2ff',     // ✅ 主色
                        borderColor: '#4171e2',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#3358d4',   // ✅ hover 顏色更深
                            boxShadow: '0 0 6px rgba(65,113,226,0.4)', // ✅ 微光暈效果
                        },
                    }}
                    onClick={handleSearch}
                >
                    🔍 搜尋
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    sx={{
                        height: '38px',
                        width: '100px',
                        px: 2.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#d32f2f', // 🔹 直接指定文字顏色
                        borderColor: '#d32f2f', // 🔹 外框顏色同步
                        '&:hover': {
                            backgroundColor: '#e17a67ff',
                            color: '#fff', // 🔹 hover 時變白字
                            borderColor: '#e17a67ff',
                        },
                    }}
                    onClick={handleReset}
                >
                    🗑️ 清除
                </Button>

            </Box>

            {/* 📋 表格 */}
            <Box
                sx={{
                    overflowX: 'auto',
                    width: '100%',
                    maxWidth: '100%',
                    display: 'block',
                    borderRadius: '8px',
                }}
            >
                <Box sx={{ minWidth: '1450px' }}> {/* 👈 強制表格寬度超過容器 */}
                    <WorkReportTable
                        title=""
                        loadedData={loadedData || []}
                        onEdit={(item) => handleEdit(item)}
                        onDelete={(pkList) => handleDelete(pkList)}   // ✅ 直接傳回原樣
                        resetKey={resetKey}   // ✅ 加這行
                        pageResetKey={pageResetKey}   // ✅ 新增
                    />
                </Box>
            </Box>

            {/* ✏️ 編輯用 Modal */}
            <Dialog open={openModal} onClose={handleModalClose} fullWidth maxWidth="sm">
                <DialogContent>
                    {editForm && (
                        <WorkReportForm
                            record={{
                                location: editForm.location,
                                amount: editForm.amount,
                                overtimePay: editForm.overtimePay,
                                tax: editForm.tax,
                                note: editForm.note,
                            }}
                            setRecord={(newData) => setEditForm({ ...editForm, ...newData })}
                            selectedCompany={editForm.company}
                            setSelectedCompany={(val) => setEditForm({ ...editForm, company: val })}
                            selectedTool={editForm.tool}
                            setSelectedTool={(val) => setEditForm({ ...editForm, tool: val })}
                            date={dayjs(editForm.date)}   // ← 確保永遠轉成 dayjs 物件
                            setDate={(val) => setEditForm({ ...editForm, date: val })}
                            companyStore={companyStore}
                            toolStore={toolStore}
                            isEditing={true}
                            onSave={() => handleSaveEdit(editForm)}
                            onCancelEdit={handleModalClose}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </MainCard>
    );
}
