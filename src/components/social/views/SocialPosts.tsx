import React from 'react';
import { SocialPost } from '../../../types';
import { Eye, Heart, MessageCircle, Share2, Play } from 'lucide-react';

interface SocialPostsProps {
  posts: SocialPost[];
  selectedPropertyId: string | null;
}

export const SocialPosts: React.FC<SocialPostsProps> = ({ posts, selectedPropertyId }) => {
  const filteredPosts = selectedPropertyId ? posts.filter(p => p.propertyId === selectedPropertyId) : posts;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">Post Monitoring</h2>
          <p className="text-sm text-stone-500">Track performance of published and scheduled content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col md:flex-row gap-5">
            <div className="relative flex-shrink-0">
              <img src={post.mediaUrl} alt="Content" className="w-full md:w-32 h-48 md:h-full object-cover rounded-xl" />
              {post.contentType === 'Reel' || post.contentType === 'Video' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                    {post.platform} • {post.contentType}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    post.status === 'Published' ? 'bg-emerald-50 text-emerald-700' :
                    post.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900 line-clamp-2">{post.hook || post.caption}</h4>
                <p className="text-[11px] text-stone-500 mt-1">{post.propertyName}</p>
              </div>

              {post.metrics ? (
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-stone-900 font-bold text-sm">{(post.metrics.views || 0).toLocaleString()}</div>
                    <div className="flex items-center justify-center space-x-1 text-[10px] text-stone-400 mt-0.5">
                      <Eye className="w-3 h-3" /> <span>Views</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-900 font-bold text-sm">{(post.metrics.likes || 0).toLocaleString()}</div>
                    <div className="flex items-center justify-center space-x-1 text-[10px] text-stone-400 mt-0.5">
                      <Heart className="w-3 h-3" /> <span>Likes</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-900 font-bold text-sm">{(post.metrics.comments || 0).toLocaleString()}</div>
                    <div className="flex items-center justify-center space-x-1 text-[10px] text-stone-400 mt-0.5">
                      <MessageCircle className="w-3 h-3" /> <span>Cmnts</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-900 font-bold text-sm">{(post.metrics.shares || 0).toLocaleString()}</div>
                    <div className="flex items-center justify-center space-x-1 text-[10px] text-stone-400 mt-0.5">
                      <Share2 className="w-3 h-3" /> <span>Shares</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{post.status === 'Scheduled' ? 'Scheduled for:' : 'Saved as draft'}</span>
                  <span className="font-medium text-stone-900">{post.scheduledDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
