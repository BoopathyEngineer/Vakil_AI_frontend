"use client";

import { useEffect, useState, useRef, useMemo, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { IoSend } from "react-icons/io5";
import DOMPurify from "dompurify";
import API from "@/app/action/axios";
import parse, { domToReact, Element as DomElement, DOMNode as CusDomNode } from 'html-react-parser';
import { FiCopy } from 'react-icons/fi';
import { useToast } from "@/app/components/toast/useToast";
import { Element } from 'domhandler';

interface ResponseData {
  response_mode: string;
  question: string;
  answer?: string;
  resposne_id?: string;
  chat_id: string;
  user_id: number;
  detail?: string;
  suggestion_questions?: string[];
  sources?: { Title: string; URL: string }[];
  image_base64?: string;
}

// Interface for the chat history response (based on the example response)
interface ChatHistoryResponse {
  chat_id: string;
  user_id: number;
  messages: {
    message_id: string;
    query: string;
    answer: {
      answer: string;
      educational?: string;
    };
    created_at: string;
    updated_at: string;
    suggestion_questions?: string[];
    sources?: { Title: string; URL: string }[];
  }[];
}

type Source = {
  Title: string;
  URL: string;
};

interface SourcesGridProps {
  sources: Source[];
}

type Video = {
  Title: string;
  URL: string;
};

const SourcesGrid: React.FC<SourcesGridProps> = ({ sources }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleCount = 4;
  const initialSources = sources.slice(0, visibleCount);
  const remainingSources = sources.slice(visibleCount);
  const displayedSources = showAll ? sources : initialSources;

  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "source";
    }
  };

  const getFavicon = (url: string): string => {
    const domain = getDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  return (
    <div className="mt-4">
      {sources.length === 0 ? (
        <p className="text-gray-500">No sources available.</p>
      ) : (
        <div className="grid grid-row gap-3 mr-10">
          {displayedSources.map((source, index) => (
            <a
              key={index}
              href={source.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-white hover:shadow transition"
            >
              <img
                src={getFavicon(source.URL)}
                alt="favicon"
                className="w-6 h-6"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-800">{source.Title}</p>
                <p className="text-gray-500">{getDomain(source.URL)}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {remainingSources.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showAll ? "Show Less" : `Show ${remainingSources.length} More`}
          </button>
        </div>
      )}
    </div>
  );
};

interface ChatMessageProps {
  message: ResponseData;
  isLast: boolean;

  onSuggestionClick: (q: string) => void;
  loading: boolean;
  initialQueryLoading: boolean;
}

const Spinner = () => (
  <span className="ml-1 inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
);

type TabKey = "Answer" | "Sources";

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  onSuggestionClick,
  loading,
  initialQueryLoading
}) => {
  // User message
  if (message.response_mode === 'user') {
    return (
      <div className="mb-4 flex justify-end">
        <div className="mt-10 mb-5 border py-2 px-5 rounded-2xl bg-[#ECF1FF] text-md font-semibold text-left max-w-[75%] w-fit ml-auto">
          {message.question}
          {message.image_base64 && (
            <div className="mt-2">
              <img 
                src={`data:image/jpeg;base64,${message.image_base64}`} 
                alt="Uploaded content"
                className="max-w-full h-auto rounded-lg" 
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bot message tabs always shown for potential media, with spinner if loading
  const tabs: TabKey[] = ['Answer', 'Sources'];

  const [selectedTab, setSelectedTab] = useState<TabKey>('Answer');
  const suggestions = message.suggestion_questions ?? [];

  const isStreaming = isLast && (loading || initialQueryLoading);

  const sourcesList = message.sources ?? [];
  const isSourcesLoading = isStreaming && message.sources === undefined;
  const isSourcesDisabled = !isSourcesLoading && sourcesList.length === 0;
   
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  type ImageItem = {
    source: string;
  };





  interface DOMNode {
    type: string;
    name: string;
    children?: DOMNode[];
    data?: string;
  }
  
  function isElementNode(node: DOMNode): node is { type: 'tag'; name: string; children: DOMNode[] } {
    return node.type === 'tag';
  }
  
  const renderTable = (children: DOMNode[]) => {  
    const elementChildren = children.filter(isElementNode);
      
    const headers = elementChildren
      .filter(child => child.name === 'thead')
      .flatMap(thead => { 
        const thElements = (thead.children || [])
        .filter(child => child.type === 'tag' && child.name === 'tr')
        .flatMap(tr => {
          // Extract <th> elements from the <tr>
          return (tr.children || [])
            .filter(child => child.type === 'tag' && child.name === 'th')
            .map(th => th.children?.[0]?.data?.trim());
        });
        return thElements;
      });

    const rows = elementChildren.filter(child => child.name === 'tbody')
      .flatMap(tbody => Array.from(tbody.children || [])
        .filter(child => child.name === 'tr')
        .map(row => Array.from(row.children || [])
          .filter(cell => cell.name === 'td')
          .map(td => td.children?.[0]?.data?.trim())
        )
      );
    
    return (
      <table className="min-w-full table-auto my-4 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {headers.length > 0 && (
              headers.map((header, index) => (
                <th key={index} className="border border-gray-300 p-2 text-left">
                  {header}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 p-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  



  
  return (
    <div className="mb-6 flex flex-col items-start w-full">
      <div className="flex space-x-6 border-b mb-4 w-full">
        {tabs.map(tab => {
          // selected state
          const isActive = selectedTab === tab;
          // choose spinner/loading flag
          let loadingFlag = false, disabled = false;
          if (tab === 'Sources') {
            loadingFlag = isSourcesLoading;
            disabled    = isSourcesDisabled;
          }
          return (
            <button
              key={tab}
              onClick={() => !disabled && setSelectedTab(tab)}
              disabled={disabled}
              className={[
                'pb-2 font-medium',
                 isActive
                 ? 'border-b-2 border-blue-600 text-blue-600'
                 : 'text-gray-600 hover:text-gray-800',
                 disabled && 'opacity-50 cursor-not-allowed'
                ].filter(Boolean).join(' ')}
            >
              {tab}{loadingFlag ? <Spinner /> : ''}
            </button>
          );
        })}
      </div>

      <div className="w-full">
        {selectedTab === 'Answer' && (
          <>
            <div className="prose prose-sm text-black">
              {parse(DOMPurify.sanitize(message.answer || ''), {
                replace: (node) => {
                  if (node.type === 'tag') {
                    const el = node as Element;

                    if (el.name === 'table') {
                      return renderTable(el.children as DOMNode[]);
                    }
                    if (el.name === 'pre') {
                      const code = el.children[0] as Element;
                      const text = code.children[0]?.type === 'text' ? (code.children[0] as any).data : '';
                      return (
                        <div className="p-[3px] rounded-lg bg-gradient-to-r from-[#eea6ea] to-[#55b9e8] my-4">
                          <div className="bg-white rounded-lg p-4 overflow-x-auto relative group">
                            <button
                              onClick={() => handleCopy(text)}
                              className="absolute top-2 right-2 p-1 rounded bg-gray-200 hover:bg-gray-300 hidden group-hover:block"
                              title="Copy"
                            >
                              {copied === text ? (
                                <span className="text-sm">Copied!</span>
                              ) : (
                                <FiCopy size={18} />
                              )}
                            </button>
                            <pre className="text-black whitespace-pre-wrap">
                              {domToReact(el.children as CusDomNode[])}
                            </pre>
                          </div>
                        </div>
                      );
                    }

                    if (el.name === 'code') {
                      const codeText = el.children?.[0]?.type === 'text' ? (el.children[0] as any).data : '';
                      return (
                        <div className="p-[3px] rounded-lg bg-gradient-to-r from-[#eea6ea] to-[#55b9e8] my-4">
                          <div className="bg-white rounded-lg p-4 overflow-x-auto relative group">
                            <button
                              onClick={() => handleCopy(codeText)}
                              className="absolute top-2 right-2 p-1 rounded bg-gray-200 hover:bg-gray-300 hidden group-hover:block"
                              title="Copy"
                            >
                              {copied === codeText ? (
                                <span className="text-sm">Copied!</span>
                              ) : (
                                <FiCopy size={18} />
                              )}
                            </button>
                            <pre className="text-black whitespace-pre">{codeText}</pre>
                          </div>
                        </div>
                      );
                    }

                    if (el.name === 'p' && el.children?.[0]?.type === 'tag') {
                      const codeElement = el.children[0] as Element;
                      if (codeElement.name === 'code') {
                        const codeText = codeElement.children?.[0]?.type === 'text' ? (codeElement.children[0] as any).data : '';
                        return (
                          <div className="p-[3px] rounded-lg bg-gradient-to-r from-[#eea6ea] to-[#55b9e8] my-4">
                            <div className="bg-white rounded-lg p-4 overflow-x-auto relative group">
                              <button
                                onClick={() => handleCopy(codeText)}
                                className="absolute top-2 right-2 p-1 rounded bg-gray-200 hover:bg-gray-300 hidden group-hover:block"
                                title="Copy"
                              >
                                {copied === codeText ? (
                                  <span className="text-sm">Copied!</span>
                                ) : (
                                  <FiCopy size={18} />
                                )}
                              </button>
                              <pre className="text-black whitespace-pre-wrap">{codeText}</pre>
                            </div>
                          </div>
                        );
                      }
                    }
                    if (el.name === 'p') {
                      return <p>{domToReact(el.children as CusDomNode[])}</p>;
                    }
                  }
                }
              })}
            </div>
            {isLast && suggestions.length > 0 && (
              <>
                <h4 className="font-semibold mb-2 mt-5">You might also ask:</h4>
                <div className="mt-2 w-full">
                  <div className="flex flex-col flex-wrap gap-2">
                    {suggestions.map((q, i) => (
                      <div key={q} className="w-fit">
                        <button
                          key={i}
                          onClick={() => onSuggestionClick(q)}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm text-left rounded-full"
                          disabled={loading || initialQueryLoading}
                        >
                          {q}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}


        {selectedTab === 'Sources' && (
          <div className="mt-4">
            {isSourcesLoading ? (
              <div className="flex items-center"><Spinner /><span className="ml-2">Loading sources...</span></div>
            ) : (
              <SourcesGrid sources={sourcesList} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Function to fetch a single chat (reused from the example code)
const fetchSingleChat = async (
  chatId: string,
  userId: string
): Promise<ChatHistoryResponse> => {

  const response = await API.get(`/chat/chat/history?user_id=${userId}&chat_id=${chatId}`);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch chat: ${response.statusText}`);
  }

  // Check if response.data is an array
  const data = response.data;
  if (!Array.isArray(data)) {
    console.error("Invalid response format:", data);
    throw new Error("Invalid response format from server");
  }

  // Find the specific chat in the array
  const currentChat = data.find(chat => chat.chat_id === chatId);
  if (!currentChat) {
    console.error("Chat not found in response");
    throw new Error("Chat not found");
  }

  // Return the chat in expected format
  return {
    chat_id: currentChat.chat_id,
    user_id: currentChat.user_id,
    messages: currentChat.messages || []
  };
};

// TypingEffect component for animating text
const TypingEffect = ({ htmlString }: { htmlString: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const words = htmlString.split(" ");
    let currentText = "";

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setDisplayedText(currentText);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [htmlString]);

  return (
    <div
      className="p-5 text-black"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayedText) }}
    />
  );
};

const ChatPage = () => {
  const { chat_id } = useParams<{ chat_id: string }>();
  const [messages, setMessages] = useState<ResponseData[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialQueryLoading, setInitialQueryLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        notify("File size should not exceed 10MB", "error");
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        notify("Please upload a PDF, DOC, DOCX, or TXT file", "error");
        return;
      }
      
      setSelectedFile(file);
      setInput(""); // Clear any existing input
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (formRef.current) {
      const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };
  const userId: string | undefined = Cookies.get("userId");
  const authToken: string | undefined = Cookies.get("authToken");
  const hasFetched = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);

  const latestResponseId = useRef<string | null>(null);
  const { notify } = useToast();

  const handleStreamedChunk = (parsedData: ResponseData) => {
    setMessages(prev => {
      if (parsedData.response_mode === 'answer') {
        // 1) push the "answer" message
        latestResponseId.current = parsedData.resposne_id ?? null;
        return [...prev, { ...parsedData }];
      } else {
        // 2) merge into the existing answer message
        return prev.map(msg => {
          if (msg.resposne_id === latestResponseId.current) {
            // we only want to merge in the new fields, not overwrite the question
            return {
              ...msg,
              // these properties may be undefined, so we guard
              ...(parsedData.sources && { sources: parsedData.sources }),
              ...(parsedData.suggestion_questions && { suggestion_questions: parsedData.suggestion_questions }),
              // …any other streaming-only fields you expect
            };
          }
          return msg;
        });
      }
    });
  };
  

  
  const handleSuggestionClick = (question: string) => {
    setInput(question);
    setTimeout(() => {
      document.getElementById("chat-input-form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }, 0);
  };

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    if (input.length > 0) {
      ta.style.height = `${ta.scrollHeight}px`;
    } else {
      ta.style.height = '45px';
    }
  }, [input]);

  // Fetch chat history when chat_id changes (new logic)
  useEffect(() => {
    if (!chat_id) return;
    const initialQuery = Cookies.get(`chat_${chat_id}_initialQuery`);
    if (initialQuery) return;
    const fetchChatHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!chat_id) {
          throw new Error("Chat ID is undefined.");
        }

        const currentUserId = userId;
        if (!currentUserId) {
          throw new Error("User ID not found");
        }
        const chatResponse = await fetchSingleChat(chat_id, currentUserId);

        const response = await fetchSingleChat(chat_id, currentUserId);

        // Validate response structure
        if (!response || !response.messages || !Array.isArray(response.messages)) {
          console.error("Invalid chat history response:", response);
          notify("Invalid response format from server", "error");
          return;
        }
        try {
          const historyEntries: ResponseData[] = chatResponse.messages.flatMap((msg) => {
            // Skip empty or invalid messages
            if (!msg?.query || !msg?.message_id) {
              console.warn("Skipping invalid message:", msg);
              return [];
            }
            return [
              {
                response_mode: "user",
                question:      msg.query,
                chat_id:       response.chat_id || chat_id,
                user_id:       response.user_id || parseInt(currentUserId),
                // give it a distinct ID so keys stay unique
                resposne_id:   msg.message_id + "_q",
              },
              {
                response_mode: "bot",
                question:      msg.query,
                answer:        msg.answer?.answer || "",
                detail:        msg.answer?.educational,
                resposne_id:   msg.message_id,
                chat_id:       response.chat_id || chat_id,
                user_id:       response.user_id || parseInt(currentUserId),
                suggestion_questions: msg.suggestion_questions,
                sources:       msg.sources,
              },
            ];
          });

          setMessages(historyEntries);
        } catch (error) {
          console.error("Error processing chat history:", error);
          notify("Error processing chat history", "error");
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        notify("Failed to fetch chat history. Please try again.", "error");
        setMessages([]);
      } finally {
        setLoading(false);
        if (selectedFile) {
          clearSelectedFile();
          setUploadProgress(0);
        }
      }
    };

    if (chat_id) {
      fetchChatHistory();
    } else {
      notify("No chat ID found.", "error");
    }
  }, [chat_id]);

  // Fetch initial data on mount (existing logic)
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialQueryLoading(true);
      setError(null);
      if (!chat_id || !userId || !authToken) {
        notify("Missing chat_id, userId, or authToken", "error");
        setInitialQueryLoading(false);
        return;
      }

      const initialQuery = Cookies.get(`chat_${chat_id}_initialQuery`);
      if (!initialQuery) {
        setInitialQueryLoading(false);
        return;
      }

      const userMessage: ResponseData = {
        response_mode: "user",
        question: initialQuery,
        chat_id: chat_id,
        user_id: parseInt(userId),
      };
      setMessages(prev => {
        const duplicate = prev.some(msg =>
          msg.response_mode === "user" &&
          msg.question === initialQuery &&
          msg.chat_id === chat_id &&
          msg.user_id === parseInt(userId)
        );
        if (duplicate) {
          return prev;
        }
        return [...prev, userMessage];
      });

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/response`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            question: initialQuery,
            user_id: parseInt(userId),
            chat_id: chat_id,
          }),
          signal,
        });

        Cookies.remove(`chat_${chat_id}_initialQuery`);

        if (!response.body) {
          notify("Response body is empty", "error");
          setLoading(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedData = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setInitialQueryLoading(false);
            break;
          }

          accumulatedData += decoder.decode(value, { stream: true });
          const lines = accumulatedData.split("\n").filter(l => l.trim());
          lines.forEach(line => {
            try {
              const parsedData = JSON.parse(line) as ResponseData;

              if (parsedData.response_mode === "user") {
                return;
              }

              handleStreamedChunk(parsedData);

            } catch (err) {
              console.error("Failed to parse chunk:", err);
            }
          });

          accumulatedData = "";
        }
      } catch (error) {
        const err = error as any;
        if (err.name === "AbortError") {
          // aborted
        } else {
          notify("Error fetching data", "error");
        }
      }
    };

    if (!hasFetched.current && chat_id && userId && authToken && !initialQueryLoading) {
      hasFetched.current = true;
      fetchInitialData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      hasFetched.current = false;
    };
  }, [chat_id, userId, authToken]);

  const LoadingDots = () => {
    return (
      <div className="flex space-x-1">
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            background: "linear-gradient(to right, #8383F4, #B054E9)",
          }}
        ></span>
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            background: "linear-gradient(to right, #8383F4, #B054E9)",
            animationDelay: "-0.1s",
          }}
        ></span>
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            background: "linear-gradient(to right, #8383F4, #B054E9)",
            animationDelay: "-0.2s",
          }}
        ></span>
      </div>
    );
  };

  // Function to send a new message (existing logic)
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat_id || (!input.trim() && !selectedFile) || !userId || !authToken) {
      notify("Please enter a question or attach a file", "error");
      return;
    }

    const userQuery = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    const userMessage: ResponseData = {
      response_mode: "user",
      question: userQuery || `Analyzing file: ${selectedFile?.name}`,
      chat_id: chat_id,
      user_id: parseInt(userId),
      image_base64: imageBase64,
    };
    setMessages((prev) => [...prev, userMessage]);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      let documentText = null;
      let imageBase64 = null;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/document/extract`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
          signal,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to process file');
        }
        
        const result = await uploadResponse.json();
        documentText = result.text;
        imageBase64 = result.image_base64;
        clearSelectedFile();
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          question: userQuery || (selectedFile ? `Please analyze the contents of ${selectedFile.name}` : ""),
          user_id: parseInt(userId),
          chat_id: chat_id,
          document_text: documentText,
        }),
        signal,
      });

      if (!response.body) {
        notify("Response body is empty", "error");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedData = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        accumulatedData += decoder.decode(value, { stream: true });
        const lines = accumulatedData.split("\n").filter(l => l.trim());
        lines.forEach(line => {
          try {
            const parsedData = JSON.parse(line) as ResponseData;

            if (parsedData.response_mode === "user") {
              return;
            }
            handleStreamedChunk(parsedData);

          } catch (err) {
            console.error("Failed to parse chunk:", err);
          }
        });

        accumulatedData = "";
      }
    } catch (error) {
      const err = error as any;
      if (err.name === "AbortError") {
        // aborted
      } else {
        notify("Failed to send message. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 text-black h-full flex flex-col justify-center items-center">
      {/* Error Message */}
      {/* {error &&
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4 w-[75%]">
          {error}
        </div>
      } */}

      {/* Chat Messages */}
      <div
        className="flex-1 p-4 space-y-2 w-[75%]"
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        {/* {messages.length === 0 && !loading && !error &&
          <div className="text-gray-500 text-center">No messages yet.</div>
        } */}

        {messages.filter(m => m.response_mode === 'user' || m.answer).map((m, i) => (
          <ChatMessage
            key={m.resposne_id ?? i}
            message={m}
            isLast={i === messages.length - 1}

            onSuggestionClick={handleSuggestionClick}
            loading={loading}
            initialQueryLoading={initialQueryLoading}
         />
        ))}
        {(loading || initialQueryLoading) && (
          <div className="flex justify-center items-center">
            <LoadingDots />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form (Fixed at Bottom) */}
      <div className="flex justify-center pb-5 bg-gray-50 w-full">
        <form
          id="chat-input-form"
          onSubmit={sendMessage}
          className="flex items-center p-2 border bg-white w-[75%] rounded-2xl"
          ref={formRef}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
          >
            <svg 
              className="w-6 h-6 text-gray-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
              />
            </svg>
            {selectedFile && (
              <span className="ml-2 text-sm text-gray-600 truncate max-w-[100px]">
                {selectedFile.name}
              </span>
            )}
          </label>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-lg focus:outline-none text-black resize-none overflow-auto min-h-[45px] max-h-[200px]"
            placeholder={selectedFile ? `Ask about "${selectedFile.name}"...` : "Enter your question or attach a file..."}
            disabled={loading}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          {selectedFile && (
            <button
              type="button"
              onClick={clearSelectedFile}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Remove file"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="ml-2 p-2 rounded-full disabled:opacity-50"
            style={{
              background: "linear-gradient(to right, #8383F4, #B054E9)",
            }}
          >
            {(loading || initialQueryLoading) ? "..." : <IoSend className="text-white text-lg" />}
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatPage;
