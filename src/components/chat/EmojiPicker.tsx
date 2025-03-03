import React from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_LIST = [
  '👍', '👎', '❤️', '😊', '😂', '😍',
  '🎉', '🔥', '👀', '💪', '✨', '🙌',
  '👏', '🤔', '😅', '🎯', '💡', '✅',
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Emojis</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;