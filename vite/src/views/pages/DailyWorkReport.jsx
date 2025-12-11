// material-ui
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BaseDirectory, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { useEffect, useRef, useState } from 'react';
import { gridSpacing } from 'store/constant';
import Swal from 'sweetalert2';
import MainCard from 'ui-component/cards/MainCard';
import { v4 as uuidv4 } from 'uuid';

// 自訂 components
import WorkReportForm from '../../ui-component/workReport/WorkReportForm';
import WorkReportTable from '../../ui-component/workReport/WorkReportTable';


export default function DailyWorkReport() {
    const [record, setRecord] = useState({
        location: '',
        amount: '',
        overtimePay: '',
        tax: 3,
        note: ''
    });

    const [date, setDate] = useState(dayjs());
    const [loadedData, setLoadedData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedTool, setSelectedTool] = useState('');
    const [editPkno, setEditPkno] = useState(null); // ✅ 新增：記錄目前正在編輯的 pkno
    const [isEditing, setIsEditing] = useState(false); // ✅ 新增：是否為編輯模式
    const [resetKey, setResetKey] = useState(0);
    const formRef = useRef(null); // 👈 新增 Ref

    const dirName = 'data';
    const fileName = `${ dirName }/DailyWorkReport.json`;

    const companyStore = useJsonStore('company.json');
    const toolStore = useJsonStore('tool.json');

    const showAlert = (icon, title, text) => {
        Swal.fire({
            icon,
            title,
            text,
            confirmButtonColor: '#3085d6',
        });
    };

    // JSON 檔案通用讀取
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

        useEffect(() => { load(); }, []);
        return { items };
    }

    // ✅ 儲存（包含 新增 / 編輯）
    const handleSave = async () => {
        try {
            await mkdir(dirName, { baseDir: BaseDirectory.AppData, recursive: true });

            let oldRecords = [];
            try {
                const existing = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
                oldRecords = JSON.parse(existing);
            } catch { oldRecords = []; }

            let newRecords = [];

            if (isEditing && editPkno) {
                // ✅ 編輯模式：更新該筆資料
                newRecords = oldRecords.map(item =>
                    item.pkno === editPkno
                        ? {
                            ...item,
                            company: selectedCompany,
                            tool: selectedTool,
                            location: record.location,
                            amount: record.amount,
                            tax: record.tax,
                            overtimePay: record.overtimePay,
                            note: record.note,
                            date: date ? date.format('YYYY/MM/DD') : ''
                        }
                        : item
                );
            } else {
                // ✅ 新增模式
                const newRecord = {
                    pkno: uuidv4(),
                    company: selectedCompany,
                    tool: selectedTool,
                    location: record.location,
                    amount: record.amount,
                    tax: record.tax,
                    overtimePay: record.overtimePay,
                    note: record.note,
                    date: date ? date.format('YYYY/MM/DD') : ''
                };
                newRecords = [...oldRecords, newRecord];
            }

            await writeTextFile(fileName, JSON.stringify(newRecords, null, 2), { baseDir: BaseDirectory.AppData });

            showAlert('success', isEditing ? '更新成功' : '儲存成功',
                isEditing ? '✅ 該筆資料已更新！' : '✅ 已成功儲存工作紀錄！');

            // ✅ 重置狀態
            setIsEditing(false);
            setEditPkno(null);
            resetForm();

            await handleLoad();
        } catch (err) {
            console.error('❌ 寫入失敗:', err);
            showAlert('error', '寫入失敗', '請聯絡阿廷或阿夆工程師');
        }
    };

    // ✅ 讀取本月資料
    const handleLoad = async () => {
        try {
            // 🔹 確保資料夾存在
            await mkdir(dirName, { baseDir: BaseDirectory.AppData, recursive: true });

            let content = '';

            try {
                // 🔹 嘗試讀取檔案
                content = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
            } catch (err) {
                // 🔹 捕捉多種情況（Windows / macOS / Linux）
                const msg = String(err).toLowerCase();
                if (
                    msg.includes('file not found') ||
                    msg.includes('no such file') ||
                    msg.includes('failed to open file') ||
                    msg.includes('os error 2')
                ) {
                    // ✅ 檔案不存在 → 自動建立空 JSON 檔案
                    console.warn('📁 DailyWorkReport.json 不存在，正在建立空檔案...');
                    await writeTextFile(fileName, '[]', { baseDir: BaseDirectory.AppData });
                    content = '[]';
                } else {
                    throw err; // 其他錯誤往外拋
                }
            }

            if (!content || content.trim() === '') {
                setLoadedData([]);
                return;
            }

            const jsonData = JSON.parse(content);
            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                setLoadedData([]);
                return;
            }

            // ✅ 篩選本月資料（降冪排序）
            const now = dayjs();
            const currentMonth = now.format('YYYY/MM');

            const filteredData = jsonData
                .filter((item) => item.date && item.date.startsWith(currentMonth))
                .sort((a, b) => {
                    const dateA = dayjs(a.date, 'YYYY/MM/DD');
                    const dateB = dayjs(b.date, 'YYYY/MM/DD');
                    return dateB.diff(dateA);
                });

            setLoadedData(filteredData);

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

            handleLoad();
            // ✅ 通知子層清空勾選
            setResetKey(prev => prev + 1);

        } catch (err) {
            console.error(err);
            Swal.fire('刪除失敗', '請聯絡阿廷或阿夆工程師！', 'error');
        }
    };

    // ✅ 點擊「編輯」按鈕
    const handleEdit = (item) => {
        setIsEditing(true);
        setEditPkno(item.pkno);
        setSelectedCompany(item.company || '');
        setSelectedTool(item.tool || '');
        setRecord({
            location: item.location || '',
            amount: item.amount || '',
            overtimePay: item.overtimePay || '',
            tax: item.tax || 3,
            note: item.note || ''
        });
        setDate(dayjs(item.date, 'YYYY/MM/DD'));

        // ✅ 加上更慢的滑動動畫
        setTimeout(() => {
            const target = formRef.current;
            if (!target) return;

            const targetY = target.getBoundingClientRect().top + window.scrollY - 100; // 調整偏移
            const startY = window.scrollY;
            const distance = targetY - startY;
            const duration = 1000; // 🕒 動畫時間（毫秒）→ 想更慢可改 1500~2000
            const startTime = performance.now();

            function smoothScrollStep(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeInOut = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress; // 緩入緩出

                window.scrollTo(0, startY + distance * easeInOut);

                if (progress < 1) requestAnimationFrame(smoothScrollStep);
                else {
                    // ✅ 最後 focus 到第一個 input
                    const firstInput = target.querySelector('input, textarea, select');
                    if (firstInput) firstInput.focus();
                }
            }

            requestAnimationFrame(smoothScrollStep);
        }, 100);
    };

    // ✅ 重置表單與狀態
    const resetForm = () => {
        setRecord({ location: '', amount: '', overtimePay: '', tax: 5, note: '' });
        setSelectedCompany('');
        setSelectedTool('');
        setDate(dayjs());
        setIsEditing(false);
        setEditPkno(null);
    };


    useEffect(() => { handleLoad(); }, []);

    return (
        <MainCard
            title={
                <Typography
                    variant="h3"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        color: '#333',
                    }}
                >
                    🖊️每日工作日誌管理
                </Typography>
            }
        >
            <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 12 }} ref={formRef}>
                    <WorkReportForm
                        record={record}
                        setRecord={setRecord}
                        selectedCompany={selectedCompany}
                        setSelectedCompany={setSelectedCompany}
                        selectedTool={selectedTool}
                        setSelectedTool={setSelectedTool}
                        date={date}
                        setDate={setDate}
                        onSave={handleSave}
                        onLoad={handleLoad}
                        companyStore={companyStore}
                        toolStore={toolStore}
                        isEditing={isEditing} // ✅ 傳給 form 用來切換「更新」或「儲存」
                        onCancelEdit={resetForm}
                    />
                </Grid>

                <Box
                    sx={{
                        overflowX: 'auto',
                        width: '100%',
                        maxWidth: '100%',
                        display: 'block',
                        borderRadius: '8px',
                    }}
                >
                    <Box sx={{ minWidth: '1200px' }}> {/* 👈 強制表格寬度超過容器 */}
                        <WorkReportTable
                            title="本月工作日誌列表"
                            loadedData={loadedData}
                            onEdit={(item) => handleEdit(item)}
                            onDelete={(pkList) => handleDelete(pkList)}   // ✅ 直接傳回原樣
                            resetKey={resetKey}
                        />
                    </Box>
                </Box>

            </Grid>
        </MainCard>
    );
}
