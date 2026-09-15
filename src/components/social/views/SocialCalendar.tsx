import React from 'react';
import { SocialPost } from '../../../types';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface SocialCalendarProps {
  posts: SocialPost[];
  selectedPropertyId: string | null;
}

export const SocialCalendar: React.FC<SocialCalendarProps> = ({ posts, selectedPropertyId }) => {
  const filteredPosts = selectedPropertyId ? posts.filter(p => p.propertyId === selectedPropertyId) : posts;
  
  const scheduledPosts = filteredPosts.filter(p => p.status === 'Scheduled' || p.status === 'Draft');

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">Content Calendar</h2>
          <p className="text-sm text-stone-500">Upcoming scheduled posts and drafts across all platforms.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="space-y-4">
          {scheduledPosts.map(post => (
            <div key={post.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50 hover:bg-stone-100/50 transition-colors">
              <div className="flex items-center space-x-4">
                <img src={post.mediaUrl} alt="Thumbnail" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{post.propertyName}</h4>
                  <p className="text-xs text-stone-500">{post.platform} • {post.contentType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="flex items-center space-x-1.5 text-sm font-bold text-stone-900 justify-end">
                    <CalendarIcon className="w-4 h-4 text-stone-400" />
                    <span>{post.scheduledDate || 'No date set'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-stone-500 justify-end mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time pending</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  post.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-700'
                }`}>
                  {post.status}
                </span>
              </div>
            </div>
          ))}
          {scheduledPosts.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <p>No upcoming scheduled content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
