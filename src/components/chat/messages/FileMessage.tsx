import React from 'react';
import { FileText, Image, Music, Video, Download } from 'lucide-react';
import type { Attachment } from '../../../types';

interface FileMessageProps {
  attachments: Attachment[];
}

const FileMessage: React.FC<FileMessageProps> = ({ attachments }) => {
  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-2">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
        >
          <div className="p-2 bg-white rounded-lg">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <a
            href={file.url}
            download
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Télécharger"
          >
            <Download className="h-5 w-5" />
          </a>
        </div>
      ))}
    </div>
  );
};

export default FileMessage;