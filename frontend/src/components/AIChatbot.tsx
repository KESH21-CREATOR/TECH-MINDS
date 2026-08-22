import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api } from "../services/api";
import { AIChatMessage } from "../types";

interface AIChatbotProps {
  activeCredentialId?: string;
  verificationResult?: any;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  activeCredentialId,
  verificationResult
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hi! I'm **CredentialChain AI**. I can help you understand your academic credentials, verification results, blockchain status, and how CredentialChain works.\n\n*Cryptographic verification is the absolute source of truth. I provide natural language explanations and assistance.*",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !minimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, minimized]);

  const getSuggestedQuestions = () => {
    const defaultList = [
      "What is CredentialChain?",
      "How does credential verification work?",
      "Why is blockchain used?",
      "What does 'Tampered' mean?",
      "What is SHA-256?",
      "Is my transcript stored on blockchain?",
      "How do I share my credential?",
      "What happens if my credential is revoked?"
    ];

    if (verificationResult) {
      if (verificationResult.verdict === "VALID") {
        return ["Why is this credential valid?", "What information is visible to a verifier?", ...defaultList];
      } else if (verificationResult.verdict === "TAMPERED") {
        return ["Why was this flagged as tampered?", "What is a hash mismatch?", ...defaultList];
      } else if (verificationResult.verdict === "REVOKED") {
        return ["Why is this credential revoked?", "Can a revoked certificate be verified?", ...defaultList];
      }
    }

    return defaultList;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const contextPayload = {
        activePage: location.pathname,
        credentialId: activeCredentialId || undefined,
        verificationResult: verificationResult || undefined
      };

      const response = await api.aiChat(text, contextPayload);

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.data?.reply || "I don't have enough verified information to answer that.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isContextAware: response.data?.isContextAware,
        topic: response.data?.topic
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "I'm having trouble retrieving that information right now. Please note that cryptographic blockchain verification continues to operate independently as the source of truth.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Format simple markdown (bold, lists, code) into styled JSX
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-white text-xs mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      // Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 text-xs my-0.5">
            {formatInline(line.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-2 text-slate-200 text-xs my-0.5">
            {formatInline(line)}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-slate-200 text-xs leading-relaxed my-0.5">
          {formatInline(line)}
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    // Basic bold and code replace
    const parts = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1 py-0.5 bg-slate-950 text-brand-300 rounded font-mono text-[11px] border border-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-brand-500/30 hover:scale-105 transition-all duration-200 group border border-brand-400/30"
          aria-label="Open CredentialChain AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <span className="font-bold text-xs tracking-wide">CredentialChain AI</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white uppercase">
            Assistant
          </span>
        </button>
      )}

      {/* Modern AI Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] h-[580px] max-h-[85vh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-xl shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">CredentialChain AI</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Context-Aware AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {(activeCredentialId || verificationResult) && (
            <div className="px-4 py-2 bg-brand-950/40 border-b border-brand-900/30 flex items-center justify-between text-[11px]">
              <span className="text-brand-300 flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>Context: {activeCredentialId || "Live Verification"}</span>
              </span>
              {verificationResult && (
                <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  verificationResult.verdict === "VALID"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}>
                  {verificationResult.verdict}
                </span>
              )}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                    msg.sender === "user"
                      ? "bg-brand-600 text-white rounded-br-none shadow-md"
                      : "bg-slate-950/80 border border-slate-800 rounded-tl-none shadow-inner space-y-1"
                  }`}
                >
                  {renderMessageContent(msg.text)}
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender === "user" ? "text-brand-200" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt Chips */}
          <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
            {getSuggestedQuestions().slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white rounded-full text-[11px] transition shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask CredentialChain AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
