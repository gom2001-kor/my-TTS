import { Type, X } from 'lucide-react';

export function TextInput({ text, setText }) {
    const charCount = text.length;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Type className="w-4 h-4 text-indigo-500" />
                    영어 문장 입력
                </label>
                <span className="text-xs text-gray-400">{charCount}자</span>
            </div>

            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="영어 문장을 입력하거나 붙여넣기 하세요..."
                    className="w-full h-40 p-4 text-gray-800 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none resize-none transition-all duration-200"
                />

                {text && (
                    <button
                        onClick={() => setText('')}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="지우기"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
