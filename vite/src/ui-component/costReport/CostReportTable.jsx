import React, { useState } from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Stack,
    Box,
    Pagination,
    Checkbox
} from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function CostReportTable({
    title = '',
    loadedData = [],
    onEdit,
    onDelete,
    onSelectionChange, // ✅ 新增 callback
    resetKey, // ✅ 新增：父層控制清空用
    pageResetKey // ✅ 新增：父層控制回第一頁用
}) {
    // ✅ 確保 loadedData 為陣列
    const safeData = Array.isArray(loadedData) ? loadedData : [];
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]); // ✅ 勾選狀態
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // ✅ 計算分頁資料
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedData = safeData.slice(startIndex, startIndex + rowsPerPage);
    const totalPages = Math.ceil(safeData.length / rowsPerPage);


    const seenDates = new Set();

    // ✅ 計算分頁內的日期出現次數（只在當前頁有效）
    const dateGroup = {};
    paginatedData.forEach((item, index) => {
        // 如果這筆是該頁中第一次出現的日期，就初始化
        if (!dateGroup[item.date]) {
            // 🔹 確認「上一頁的最後一筆」是不是同日期？
            const prevPageLastItem = safeData[startIndex - 1];
            // 🔹 如果跨頁日期一樣，就當成新群組（避免 rowSpan 跨頁）
            if (prevPageLastItem && prevPageLastItem.date === item.date) {
                dateGroup[item.date] = 0; // 強制重新開始計算
            } else {
                dateGroup[item.date] = 0;
            }
        }
        dateGroup[item.date]++;
    });


    // ✅ 是否全選當前頁
    const isAllSelected =
        paginatedData.length > 0 && paginatedData.every((row) => selected.includes(row.pkno));

    // ✅ 切換全選
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = Array.from(
                new Set([...selected, ...paginatedData.map((r) => r.pkno)])
            );
            setSelected(newSelected);
            onSelectionChange && onSelectionChange(newSelected);
        } else {
            const remaining = selected.filter(
                (pk) => !paginatedData.some((r) => r.pkno === pk)
            );
            setSelected(remaining);
            onSelectionChange && onSelectionChange(remaining);
        }
    };

    // ✅ 單筆勾選
    const handleSelectOne = (pkno, checked) => {
        const newSelected = checked
            ? [...selected, pkno]
            : selected.filter((id) => id !== pkno);
        setSelected(newSelected);
        onSelectionChange && onSelectionChange(newSelected);
    };

    // ✅ 合計統計
    const summary =
        safeData.length > 0
            ? safeData.reduce(
                (acc, item) => {
                    const amount = Math.round(parseFloat(item.amount) || 0);

                    // ✅ 只在第一次出現該日期時 +1
                    if (!seenDates.has(item.date)) {
                        seenDates.add(item.date);
                        acc.days += 1;
                    }

                    acc.totalAmount += amount;
                    return acc;
                },
                { days: 0, totalAmount: 0 }
            )
            : null;

    // ✅ 父層的 resetKey 一變，清空勾選
    React.useEffect(() => {
        setSelected([]);
    }, [resetKey]);

    // ✅ 父層的 pageResetKey 一變 → 回到第一頁
    React.useEffect(() => {
        setPage(1);
    }, [pageResetKey]);

    return (
        <SubCard
            title={
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.6rem'
                    }}
                >
                    {title || ''}
                </Typography>
            }
        >
            {/* ✅ 顯示總筆數 / 分頁資訊 */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'left',
                    alignItems: 'center',
                    mb: 2,
                    px: 1,
                    color: '#555',
                    fontSize: '1.4rem'
                }}
            >
                <span>
                    📊 共 <b>{safeData.length}</b> 筆資料
                    （每頁{rowsPerPage}筆，目前第 <b>{page}</b> / {totalPages} 頁）
                </span>

                {/* 🔽 每頁顯示筆數選擇 */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>每頁顯示</InputLabel>
                    <Select
                        value={rowsPerPage}
                        label="每頁顯示"
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1); // 換筆數時回到第一頁
                        }}
                    >
                        <MenuItem value={10}>每頁 10 筆</MenuItem>
                        <MenuItem value={15}>每頁 15 筆</MenuItem>
                        <MenuItem value={30}>每頁 30 筆</MenuItem>
                    </Select>
                </FormControl>
            </Box>


            {/* 📋 資料表格 */}
            {safeData.length === 0 ? (
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        color: '#555',
                        margin: '20px 0'
                    }}
                >
                    尚未讀取資料
                </p>
            ) : (
                <>
                    <Table
                        sx={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '1rem', // ✅ 整張表格字放大
                            '& th': {
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                fontSize: '2rem',
                                padding: '8px'
                            },
                            '& td': {
                                textAlign: 'center',
                                padding: '8px'
                            },
                            '& tr:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            '& tr:hover': { backgroundColor: '#e8f4ff' }
                        }}
                    >
                        <TableHead >
                            <TableRow >
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        #
                                    </Typography>
                                </TableCell>
                                {/* ✅ 新增全選 checkbox */}
                                <TableCell >
                                    <Checkbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        📅 日期
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        🏷️ 類別
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        💳 支付方式
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        📍 地點
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        💬 備註
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        💰 金額
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        ⚙️ 操作
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData.map((item, index) => {
                                const amount = Math.round(parseFloat(item.amount) || 0);

                                // ✅ 判斷是否為該日期的第一筆（用 paginatedData 的 index 找前一筆）
                                const isFirstOfDate =
                                    index === 0 || paginatedData[index - 1].date !== item.date;

                                return (
                                    <TableRow key={item.pkno || index}>
                                        <TableCell sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                            {startIndex + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.includes(item.pkno)}
                                                onChange={(e) =>
                                                    handleSelectOne(item.pkno, e.target.checked)
                                                }
                                            />
                                        </TableCell>
                                        {/* ✅ 日期欄，只在第一筆輸出 rowSpan */}
                                        {isFirstOfDate && (
                                            <TableCell
                                                rowSpan={dateGroup[item.date]} // ✅ 自動合併
                                                sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}
                                            >
                                                {item.date}
                                            </TableCell>
                                        )}
                                        <TableCell sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>{item.category || '—'}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>{item.method || '—'}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>{item.location || '—'}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>{item.note || '—'}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>{amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                {/* 編輯按鈕 */}
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#fff',
                                                        backgroundColor: '#507ce4ff',
                                                        borderColor: '#4171e2',
                                                        boxShadow: 'none',
                                                        '&:hover': {
                                                            backgroundColor: '#3358d4',
                                                            boxShadow: '0 0 6px rgba(65,113,226,0.4)',
                                                        },
                                                    }}
                                                    onClick={() => onEdit(item)}
                                                >
                                                    ✏️ 編輯
                                                </Button>

                                                {/* 刪除按鈕 */}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    fontSize="medium"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#d32f2f',
                                                        borderColor: '#d32f2f',
                                                        '&:hover': {
                                                            backgroundColor: '#e17a67',
                                                            color: '#fff',
                                                            borderColor: '#e17a67',
                                                            boxShadow: '0 0 6px rgba(225,122,103,0.4)',
                                                        },
                                                    }}
                                                    onClick={() => onDelete([item.pkno])}
                                                >
                                                    🗑️ 刪除
                                                </Button>
                                            </Stack>
                                        </TableCell>

                                    </TableRow>
                                );
                            })}

                            {/* ✅ 合計列 */}
                            {summary && (
                                <TableRow
                                    sx={{
                                        backgroundColor: '#e3f2fd',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.2rem' } }}>📊 合計</TableCell>
                                    <TableCell>—</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.2rem' } }}>{summary.days} 天</TableCell>
                                    <TableCell colSpan={3}>—</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.2rem' } }}></TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        {summary.totalAmount.toLocaleString()}
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* ✅ 分頁控制 */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                            gap: 2,
                            mt: 2
                        }}
                    >
                        {/* 🗑️ 批次刪除 */}
                        <Button
                            variant="contained"
                            color="error"
                            disabled={selected.length === 0}
                            onClick={() => onDelete(selected)}
                            sx={{
                                fontWeight: 'bold',
                                color: '#f7f7f7ff',
                                backgroundColor: '#f94343ff',
                                borderColor: '#d32f2f',
                                '&:hover': {
                                    backgroundColor: '#c01818f9',
                                    color: '#ffffffff',
                                    borderColor: '#e17a67',
                                    boxShadow: '0 0 6px rgba(225,122,103,0.4)',
                                },
                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                px: 3
                            }}
                        >
                            🗑️ 批次刪除 ({selected.length})
                        </Button>

                        {/* ⬆️ 返回最上層 */}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                const duration = 1200; // 🕒 動畫時間 1.2 秒
                                const startY = window.scrollY;
                                const distance = -window.scrollY; // 滾回 0
                                const startTime = performance.now();

                                function step(now) {
                                    const elapsed = now - startTime;
                                    const progress = Math.min(elapsed / duration, 1);
                                    const easeInOut = progress < 0.5
                                        ? 2 * progress * progress
                                        : -1 + (4 - 2 * progress) * progress;

                                    window.scrollTo(0, startY + distance * easeInOut);

                                    if (progress < 1) requestAnimationFrame(step);
                                }

                                requestAnimationFrame(step);
                            }}
                            sx={{
                                fontWeight: 'bold',
                                borderColor: '#4d78ddff',
                                color: '#4d78ddff',
                                '&:hover': {
                                    backgroundColor: '#4d78ddff',
                                    color: '#fff',
                                    boxShadow: '0 0 6px rgba(65,113,226,0.4)',
                                },
                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                px: 3
                            }}
                        >
                            ⬆️ 返回最上層
                        </Button>
                    </Box>
                </>
            )}
        </SubCard>
    );
}
