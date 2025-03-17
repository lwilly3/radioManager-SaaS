import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Extract domain from URL
        const domain = new URL(url).hostname;

        // Fetch preview data from a link preview service
        // For this example, we'll use a mock preview
        // In production, you should use a proper link preview service or backend API
        const response = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
        
        setPreview({
          title: response.data.data.title || url,
          description: response.data.data.description,
          image: response.data.data.image?.url,
          domain: domain,
        });
      } catch (err) {
        console.error('Error fetching link preview:', err);
        setError('Failed to load preview');
        // Fallback to basic preview
        setPreview({
          title: url,
          domain: new URL(url).hostname,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-3 mt-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start gap-3">
        {preview.image && (
          <img
            src={preview.image}
            alt=""
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-blue-600 truncate">{preview.title}</p>
            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
          {preview.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {preview.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{preview.domain}</p>
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;