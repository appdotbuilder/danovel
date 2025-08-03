
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Novel, User } from '../../../server/src/schema';

interface NovelCardProps {
  novel: Novel;
  currentUser: User | null;
  onViewNovel: (novelId: number) => void;
  rank?: number;
  showUpdateDate?: boolean;
}

export function NovelCard({ novel, currentUser, onViewNovel, rank, showUpdateDate }: NovelCardProps) {
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'ongoing': return '📖';
      case 'completed': return '✅';
      case 'hiatus': return '⏸️';
      case 'draft': return '✏️';
      default: return '📚';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
      case 'hiatus': return 'Hiatus';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm border-purple-200/50 hover:border-purple-300 relative overflow-hidden">
      {rank && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
            #{rank}
          </Badge>
        </div>
      )}

      {novel.is_featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            ⭐ Unggulan
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-purple-900 group-hover:text-purple-700 transition-colors line-clamp-2">
              {novel.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {getStatusEmoji(novel.status)} {getStatusText(novel.status)}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                📖 {novel.genre}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-gray-600 line-clamp-3">
          {novel.description}
        </CardDescription>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {novel.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs text-purple-600 border-purple-300">
              {tag}
            </Badge>
          ))}
          {novel.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{novel.tags.length - 3}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-semibold text-purple-900">
              {novel.total_chapters}
            </div>
            <div className="text-xs text-gray-500">📚 Bab</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-900">
              {formatNumber(novel.total_views)}
            </div>
            <div className="text-xs text-gray-500">👁️ Views</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-900 flex items-center justify-center">
              ⭐ {novel.average_rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>

        {showUpdateDate && (
          <div className="text-xs text-gray-500 text-center">
            🕒 Update: {novel.updated_at.toLocaleDateString('id-ID')}
          </div>
        )}

        <Button 
          onClick={() => onViewNovel(novel.id)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          📖 Baca Novel
        </Button>

        {!currentUser && (
          <div className="text-xs text-center text-purple-600 bg-purple-50 rounded-lg py-2">
            💡 Login untuk fitur lengkap
          </div>
        )}
      </CardContent>
    </Card>
  );
}
