import { History as HistoryIcon, Trash2, RotateCcw } from 'lucide-react';

export function History({ history, onRestore, onDelete, onClear }) {
    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <HistoryIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">아직 기록이 없습니다</p>
                <p className="text-xs">최근 학습한 문장이 여기에 표시됩니다</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <HistoryIcon className="w-4 h-4 text-indigo-500" />
                    최근 기록
                </h3>
                <button
                    onClick={onClear}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                    전체 삭제
                </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                    <div
                        key={index}
                        className="group flex items-start gap-2 p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <p className="flex-1 text-sm text-gray-600 line-clamp-2">
                            {item}
                        </p>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onRestore(item)}
                                className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-md transition-colors"
                                title="불러오기"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(index)}
                                className="p-1.5 text-red-400 hover:bg-red-100 rounded-md transition-colors"
                                title="삭제"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
