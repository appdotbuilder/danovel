
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { Novel, User, Chapter, Review } from '../../../server/src/schema';

interface NovelDetailProps {
  novel: Novel;
  currentUser: User | null;
  onReadChapter: (chapterId: number) => void;
  onBack: () => void;
}

export function NovelDetail({ novel, currentUser, onReadChapter, onBack }: NovelDetailProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // Stub data for chapters
  useEffect(() => {
    const stubChapters: Chapter[] = Array.from({ length: novel.total_chapters }, (_, i) => ({
      id: i + 1,
      novel_id: novel.id,
      chapter_number: i + 1,
      title: `Chapter ${i + 1}: ${getChapterTitle(i + 1)}`,
      content: `Chapter content for chapter ${i + 1}...`,
      status: 'published' as const,
      coin_cost: i < 3 ? 0 : Math.floor(Math.random() * 10) + 5, // First 3 chapters free
      word_count: Math.floor(Math.random() * 2000) + 1000,
      views: Math.floor(Math.random() * 5000),
      is_free: i < 3,
      created_at: new Date(2024, 0, 1 + i),
      updated_at: new Date(2024, 0, 1 + i)
    }));
    setChapters(stubChapters);

    // Stub reviews
    setReviews([
      {
        id: 1,
        novel_id: novel.id,
        user_id: 101,
        rating: 5,
        review_text: "Novel yang luar biasa! Plot twist yang tidak terduga dan karakter yang sangat berkembang. Tidak sabar menunggu update selanjutnya! 🌟",
        created_at: new Date('2024-03-01'),
        updated_at: new Date('2024-03-01')
      },
      {
        id: 2,
        novel_id: novel.id,
        user_id: 102,
        rating: 4,
        review_text: "Cerita menarik dengan world building yang solid. Gaya penulisan mudah dipahami dan alur cerita mengalir dengan baik.",
        created_at: new Date('2024-02-28'),
        updated_at: new Date('2024-02-28')
      },
      {
        id: 3,
        novel_id: novel.id,
        user_id: 103,
        rating: 5,
        review_text: "Sudah mengikuti dari awal dan tidak pernah kecewa! Penulis sangat konsisten dalam update dan kualitas cerita selalu terjaga.",
        created_at: new Date('2024-02-25'),
        updated_at: new Date('2024-02-25')
      }
    ]);
  }, [novel]);

  function getChapterTitle(chapterNum: number): string {
    const titles = [
      "The Beginning",
      "First Encounter", 
      "Awakening Power",
      "Hidden Truth",
      "The Challenge",
      "Unexpected Alliance",
      "Dark Secrets",
      "Rising Storm",
      "The Revelation",
      "New Horizons"
    ];
    return titles[(chapterNum - 1) % titles.length];
  }

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

  const freeChapters = chapters.filter(c => c.is_free);
  const paidChapters = chapters.filter(c => !c.is_free);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={onBack}
        className="border-purple-300 text-purple-700 hover:bg-purple-50"
      >
        ← Kembali ke Home
      </Button>

      {/* Novel Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-48 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center text-6xl">
                📚
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                  {novel.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {getStatusEmoji(novel.status)} {getStatusText(novel.status)}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    📖 {novel.genre}
                  </Badge>
                  {novel.is_featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      ⭐ Unggulan
                    </Badge>
                  )}
                </div>
              </div>

              <CardDescription className="text-base text-purple-700">
                {novel.description}
              </CardDescription>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {novel.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-purple-600 border-purple-300">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{novel.total_chapters}</div>
                  <div className="text-sm text-purple-600">📚 Total Bab</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(novel.total_views)}</div>
                  <div className="text-sm text-purple-600">👁️ Views</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(novel.total_likes)}</div>
                  <div className="text-sm text-purple-600">❤️ Likes</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900 flex items-center justify-center">
                    ⭐ {novel.average_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-purple-600">Rating</div>
                </div>
              </div>

              {/* Actions */}
              {currentUser && (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={isFollowing ? "bg-purple-100 text-purple-700" : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"}
                  >
                    {isFollowing ? '✅ Mengikuti' : '👤 Ikuti Penulis'}
                  </Button>
                  <Button variant="outline" className="border-purple-300 text-purple-700">
                    ❤️ {novel.total_likes}
                  </Button>
                  <Button variant="outline" className="border-purple-300 text-purple-700">
                    📤 Bagikan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="chapters" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="chapters" className="data-[state=active]:bg-purple-100">
            📚 Daftar Bab ({novel.total_chapters})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-100">
            ⭐ Review ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-purple-100">
            ℹ️ Info Novel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="space-y-4">
          {/* Reading Progress */}
          {currentUser && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">📖 Progress Bacaan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bab terakhir dibaca: Chapter 3</span>
                    <span>3/{novel.total_chapters} bab</span>
                  </div>
                  <Progress value={(3 / novel.total_chapters) * 100} className="h-2" />
                  <Button size="sm" className="mt-2">
                    📖 Lanjut Baca
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Free Chapters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                🆓 Bab Gratis ({freeChapters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {freeChapters.map((chapter: Chapter) => (
                  <div key={chapter.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">{chapter.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-green-600">
                        <span>📝 {chapter.word_count.toLocaleString()} kata</span>
                        <span>👁️ {chapter.views.toLocaleString()}</span>
                        <span>📅 {chapter.created_at.toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => onReadChapter(chapter.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      📖 Baca
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Paid Chapters */}
          {paidChapters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-900 flex items-center">
                  🪙 Bab Berbayar ({paidChapters.length})
                </CardTitle>
                <CardDescription>
                  Bab-bab ini memerlukan koin untuk dibuka
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paidChapters.slice(0, 10).map((chapter: Chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-900">{chapter.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-orange-600">
                          <span>📝 {chapter.word_count.toLocaleString()} kata</span>
                          <span>👁️ {chapter.views.toLocaleString()}</span>
                          <span>🪙 {chapter.coin_cost} koin</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {currentUser ? (
                          currentUser.coins_balance >= chapter.coin_cost ? (
                            <Button 
                              size="sm"
                              onClick={() => onReadChapter(chapter.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              🪙 Buka ({chapter.coin_cost})
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              💰 Koin Tidak Cukup
                            </Button>
                          )
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            🔒 Perlu Login
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {paidChapters.length > 10 && (
                    <div className="text-center p-4 text-orange-600">
                      ... dan {paidChapters.length - 10} bab lainnya
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {/* Rating Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⭐ Rating & Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-900">{novel.average_rating.toFixed(1)}</div>
                  <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                  <div className="text-sm text-gray-600">{reviews.length} review</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center space-x-2 mb-1">
                      <span className="text-sm w-8">{star}⭐</span>
                      <Progress value={star === 5 ? 70 : star === 4 ? 25 : 5} className="flex-1 h-2" />
                      <span className="text-sm text-gray-600 w-8">
                        {star === 5 ? reviews.filter(r => r.rating === 5).length : 
                         star === 4 ? reviews.filter(r => r.rating === 4).length : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-200 text-purple-800">
                        U{review.user_id}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">User {review.user_id}</span>
                        <div className="text-yellow-500">
                          {'⭐'.repeat(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.created_at.toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {review.review_text && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.review_text}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Review (for logged in users) */}
          {currentUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✍️ Tulis Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating:</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`text-2xl ${star <= userRating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Review (opsional):</label>
                    <textarea 
                      className="w-full p-3 border rounded-lg resize-none h-20"
                      placeholder="Bagikan pendapat Anda tentang novel ini..."
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    📝 Kirim Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Informasi Novel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">📊 Statistik</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Bab:</span>
                      <span className="font-medium">{novel.total_chapters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Views:</span>
                      <span className="font-medium">{novel.total_views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Likes:</span>
                      <span className="font-medium">{novel.total_likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">⭐ {novel.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">📅 Tanggal</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dibuat:</span>
                      <span className="font-medium">{novel.created_at.toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Update Terakhir:</span>
                      <span className="font-medium">{novel.updated_at.toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-purple-900 mb-2">🏷️ Tags & Genre</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-100 text-purple-800">📖 {novel.genre}</Badge>
                  {novel.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="border-purple-300 text-purple-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
