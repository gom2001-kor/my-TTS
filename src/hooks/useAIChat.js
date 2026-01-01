import { useState, useCallback, useRef } from 'react';

export function useAIChat(apiKey, model = 'gpt-4o-mini') {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);

    // Get current date/time context for AI
    const getTimeContext = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][now.getDay()];

        return `현재 시간: ${year}년 ${month}월 ${day}일 ${dayOfWeek} ${hours}시 ${minutes}분`;
    };

    const sendMessage = useCallback(async (userMessage) => {
        if (!userMessage.trim()) return null;
        if (!apiKey) {
            setError('API 키가 설정되지 않았습니다. 설정에서 OpenAI API 키를 입력해주세요.');
            return null;
        }

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Add user message to chat
        const newUserMessage = {
            role: 'user',
            content: userMessage.trim(),
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setError(null);

        try {
            // Build conversation history for API
            const conversationHistory = [
                {
                    role: 'system',
                    content: `당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 
사용자와 자연스럽게 대화하며, 질문에 정확하고 유용한 답변을 제공합니다.
영어 학습을 도와줄 수도 있습니다.
${getTimeContext()}
응답은 간결하게 2-3문장 정도로 해주세요.`,
                },
                ...messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                {
                    role: 'user',
                    content: userMessage.trim(),
                },
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: conversationHistory,
                    max_tokens: 500,
                    temperature: 0.7,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error('API 키가 유효하지 않습니다. 설정에서 확인해주세요.');
                } else if (response.status === 429) {
                    throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    throw new Error(errorData.error?.message || `API 오류: ${response.status}`);
                }
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || '응답을 받지 못했습니다.';

            const newAIMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, newAIMessage]);
            setIsLoading(false);

            return aiResponse;
        } catch (err) {
            if (err.name === 'AbortError') {
                // Request was cancelled, not an error
                setIsLoading(false);
                return null;
            }

            console.error('AI Chat error:', err);
            setError(err.message || '메시지 전송에 실패했습니다.');
            setIsLoading(false);
            return null;
        }
    }, [apiKey, messages, model]);

    const clearMessages = useCallback(() => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setMessages([]);
        setError(null);
        setIsLoading(false);
    }, []);

    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsLoading(false);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        cancelRequest,
        setError,
    };
}
