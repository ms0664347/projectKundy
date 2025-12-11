import {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";

export default function TalkToAI() {
    const [messages, setMessages] = useState([
        { role: "ai", text: "你好，今天有什麼需要幫助的嗎？" }, // 預設訊息
    ]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);

    // 自動捲到最底
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /** ⛓️ 傳送訊息 (使用 Tauri invoke → call_gemini) */
    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setInput("");

        const typingIndex = messages.length + 1;
        setMessages((prev) => [...prev, { role: "ai", text: "...(輸入中)" }]);

        try {
            const reply = await invoke("call_chatgpt", { prompt: userMessage });

            let replyText = "(AI 無回覆內容)";
            try {
                const parsed = JSON.parse(reply);
                replyText =
                    parsed?.choices?.[0]?.message?.content ??
                    "(AI 無回覆內容)";
            } catch {
                replyText = reply;
            }

            setMessages((prev) => {
                const newMsg = [...prev];
                newMsg[typingIndex] = { role: "ai", text: replyText };
                return newMsg;
            });

        } catch (err) {
            setMessages((prev) => {
                const newMsg = [...prev];
                newMsg[typingIndex] = { role: "ai", text: `⚠️ 錯誤：${ err }` };
                return newMsg;
            });
        }
    };


    // Enter 送出
    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <Box
            p={3}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <Typography variant="h2" fontWeight="bold" mb={2}>
                💬 Talk to AI
            </Typography>

            {/* 聊天區 */}
            <Paper
                elevation={3}
                sx={{
                    flexGrow: 1,
                    p: 2,
                    overflowY: "auto",
                    borderRadius: 2,
                    background: "#f7f9fc",
                }}
            >
                {messages.map((m, idx) => (
                    <Grid
                        key={idx}
                        container
                        justifyContent={m.role === "user" ? "flex-end" : "flex-start"}
                        mb={1}
                    >
                        <Box
                            sx={{
                                maxWidth: "70%",
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: m.role === "user" ? "#1976d2" : "#eceff1",
                                color: m.role === "user" ? "#fff" : "#000",
                                fontStyle: m.text === "..." ? "italic" : "normal",
                                opacity: m.text === "..." ? 0.7 : 1,
                            }}
                        >
                            <Typography
                                whiteSpace="pre-line"
                                sx={{
                                    fontSize: '1.2rem',
                                }}
                            >
                                {m.text}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
                <div ref={chatEndRef}></div>
            </Paper>

            {/* 下方輸入區 */}
            <Grid container spacing={2} mt={2}>
                <Grid item xs={10}>
                    <TextField
                        fullWidth
                        value={input}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="輸入訊息..."
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ height: "100%" }}
                        onClick={sendMessage}
                    >
                        發送
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}
