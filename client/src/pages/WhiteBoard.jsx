import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const CHAT_WIDTH = 320;
const MOBILE_BREAKPOINT = 768;
const THROTTLE_INTERVAL = 16;
const RESIZE_DEBOUNCE_MS = 100;

const socket = io(`${backendURL}`);

export default function WhiteBoard() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const previewRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(4);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [showChat, setShowChat] = useState(!isMobile);
  const [userCount, setUserCount] = useState(1);

  const drawingCommands = useRef([]);
  const lastDrawTime = useRef(0);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingCommands.current.forEach((cmd) => drawCommand(cmd, false));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth - (showChat && !isMobile ? CHAT_WIDTH : 0);
      canvas.height = window.innerHeight;
      preview.width = canvas.width;
      preview.height = canvas.height;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      redrawCanvas();
    };

    setCanvasDimensions();

    socket.emit("join-room", roomId, (history, count) => {
      drawingCommands.current = history;
      setUserCount(count);
      redrawCanvas();
    });

    const handleDraw = (data) => {
      if (data.clear) {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawingCommands.current = [];
        return;
      }
      drawingCommands.current.push(data);
      drawCommand(data, false);
    };

    socket.on("draw", handleDraw);
    socket.on("user-count", (count) => setUserCount(count));

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        setCanvasDimensions();
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("draw", handleDraw);
    };
  }, [roomId, showChat, isMobile, redrawCanvas]);

  useEffect(() => {
    const handleChatMessage = ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
    };
    socket.on("chat-message", handleChatMessage);
    return () => socket.off("chat-message", handleChatMessage);
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [color, tool, lineWidth]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const username = user?.username || `User-${user?.id?.slice(-4) || "Guest"}`;
    socket.emit("chat-message", { roomId, username, message: chatInput });
    setChatInput("");
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e.nativeEvent);
    setStartPos({ x, y });
    setDrawing(true);
    if (tool === "pen" || tool === "eraser") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    }
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e.nativeEvent);
    if (tool === "pen" || tool === "eraser") {
      const now = Date.now();
      if (now - lastDrawTime.current < THROTTLE_INTERVAL) return;
      lastDrawTime.current = now;
      const cmd = {
        tool,
        color: tool === "eraser" ? "#ffffff" : color,
        lineWidth,
        x0: startPos.x / canvasRef.current.width,
        y0: startPos.y / canvasRef.current.height,
        x1: x / canvasRef.current.width,
        y1: y / canvasRef.current.height,
      };
      drawCommand(cmd, true);
      setStartPos({ x, y });
    } else {
      const previewCtx = previewRef.current.getContext("2d");
      previewCtx.clearRect(0, 0, previewRef.current.width, previewRef.current.height);
      previewCtx.strokeStyle = color;
      previewCtx.lineWidth = lineWidth;
      if (tool === "rect") {
        previewCtx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.hypot(x - startPos.x, y - startPos.y);
        previewCtx.beginPath();
        previewCtx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        previewCtx.stroke();
      } else if (tool === "line") {
        previewCtx.beginPath();
        previewCtx.moveTo(startPos.x, startPos.y);
        previewCtx.lineTo(x, y);
        previewCtx.stroke();
      }
    }
  };

  const finishDrawing = (e) => {
    if (!drawing) return;
    setDrawing(false);
    const event = e.nativeEvent;
    const { x, y } = event ? getCanvasCoords(event) : startPos;
    previewRef.current.getContext("2d").clearRect(0, 0, previewRef.current.width, previewRef.current.height);
    if (tool !== "pen" && tool !== "eraser") {
      const cmd = {
        tool,
        color,
        lineWidth,
        x0: startPos.x / canvasRef.current.width,
        y0: startPos.y / canvasRef.current.height,
        x1: x / canvasRef.current.width,
        y1: y / canvasRef.current.height,
      };
      drawCommand(cmd, true);
    }
  };

  const drawCommand = (cmd, emit) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    ctx.strokeStyle = cmd.color;
    ctx.lineWidth = cmd.lineWidth;
    const x0 = cmd.x0 * w;
    const y0 = cmd.y0 * h;
    const x1 = cmd.x1 * w;
    const y1 = cmd.y1 * h;
    ctx.beginPath();
    if (cmd.tool === "pen" || cmd.tool === "eraser") {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
    } else if (cmd.tool === "rect") {
      ctx.rect(x0, y0, x1 - x0, y1 - y0);
    } else if (cmd.tool === "circle") {
      const radius = Math.hypot(x1 - x0, y1 - y0);
      ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
    } else if (cmd.tool === "line") {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
    }
    ctx.stroke();

    if (emit) {
      drawingCommands.current.push(cmd);
      socket.emit("draw", { roomId, data: cmd });
    }
  };

  const clearCanvas = () => {
    if (userCount > 1) {
      const confirmClear = confirm(
        `⚠️ There are ${userCount} users in this room. Do you really want to clear the board for everyone?`
      );
      if (!confirmClear) return;
    }
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawingCommands.current = [];
    socket.emit("draw", { roomId, data: { clear: true } });
  };

  return (
    <div className="flex w-screen h-screen bg-white relative overflow-hidden">
      {!(isMobile && showChat) && (
        <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-lg px-2 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg flex items-center gap-2 sm:gap-4 border border-gray-200 z-50 flex-wrap justify-center">
          <div className="font-semibold text-gray-700 hidden sm:block">Room: {roomId}</div>
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="border border-gray-300 rounded-lg p-1 text-sm sm:text-base cursor-pointer focus:ring-2 focus:ring-indigo-400"
          >
            <option value="pen">✏️ Pen</option>
            <option value="eraser">🧽 Eraser</option>
            <option value="rect">▭ Rect</option>
            <option value="circle">⚪ Circle</option>
            <option value="line">─ Line</option>
          </select>
          <input
            type="color"
            value={color}
            disabled={tool === "eraser"}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="cursor-pointer accent-indigo-500 w-20 sm:w-auto"
          />
          <button
            onClick={clearCanvas}
            className="px-3 sm:px-4 py-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm sm:text-base"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={finishDrawing}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          className="w-full h-full cursor-crosshair"
        />
        <canvas ref={previewRef} className="w-full h-full absolute top-0 left-0 pointer-events-none" />
      </div>

      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50"
        >
          💬
        </button>
      )}

      {showChat && (
        <div
          className={`${
            isMobile ? "fixed inset-0" : "relative w-[320px]"
          } bg-white/95 backdrop-blur-sm border-l border-gray-200 flex flex-col shadow-lg z-40`}
        >
          <div className="bg-indigo-600 text-white p-3 font-semibold flex justify-between items-center">
            <span>💬 Room Chat ({userCount} users)</span>
            <button onClick={() => setShowChat(false)} className="text-white text-lg hover:text-gray-200">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg shadow-sm text-sm">
                <span className={`font-semibold text-indigo-600`}>{msg.username}:</span> {msg.message}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex p-2 border-t bg-white shadow-sm">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-l-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="px-4 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition text-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
