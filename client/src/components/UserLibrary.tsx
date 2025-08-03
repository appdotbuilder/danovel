
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { User, Novel } from '../../../server/src/schema';

interface UserLibraryProps {
  user: User;
  novels: Novel[];
  onViewNovel: (novelId: number) => void;
}

export function UserLibrary({ user, novels, onViewNovel }: UserLibraryProps) {
  // Stub data for user's reading progress
  const readingProgress = [
    { novelId: 1, lastChapter: 5, totalChapters: 45, isFavorite: true, lastRead: new Date('2024-03-10') },
    { novelId: 2, lastChapter: 32, totalChapters: 32, isFavorite: false, lastRead: new Date('2024-03-08') },
    { novelId: 3, lastChapter: 3, totalChapters: 28, isFavorite: true, lastRead: new Date('2024-03-09') }
  ];

  const favoriteNovels = novels.filter(n => 
    readingProgress.find(p => p.novelId === n.id && p.isFavorite)
  );

  const recentlyRead = novels.filter(n => 
    readingProgress.find(p => p.novelId === n.id)
  ).sort((a, b) => {
    const aProgress = readingProgress.find(p => p.novelId === a.id);
    const bProgress = readingProgress.find(p => p.novelId === b.id);
    return (bProgress?.lastRead.getTime() || 0) - (aProgress?.lastRead.getTime() || 0);
  });

  const getProgressPercentage = (novelId: number) => {
    const progress = readingProgress.find(p => p.novelId === novelId);
    if (!progress) return 0;
    return (progress.lastChapter / progress.totalChapters) * 100;
  };

  const getLastChapter = (novelId: number) => {
    return readingProgress.find(p => p.novelId === novelId)?.lastChapter || 0;
  };

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-900 flex items-center">
            📚 Perpustakaan {user.username}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{recentlyRead.length}</div>
              <div className="text-sm text-purple-600">📖 Sedang Dibaca</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{favoriteNovels.length}</div>
              <div className="text-sm text-purple-600">❤️ Favorit</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{user.coins_balance}</div>
              <div className="text-sm text-purple-600">🪙 Koin</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {readingProgress.reduce((total, p) => total + p.lastChapter, 0)}
              </div>
              <div className="text-sm text-purple-600">📄 Total Bab Dibaca</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Library Tabs */}
      <Tabs defaultValue="reading" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="reading" className="data-[state=active]:bg-purple-100">
            📖 Sedang Dibaca
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-purple-100">
            ❤️ Favorit
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-100">
            📜 Riwayat
          </TabsTrigger>
          <TabsTrigger value="coins" className="data-[state=active]:bg-purple-100">
            🪙 Koin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">📖 Novel yang Sedang Dibaca</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {recentlyRead.length} novel
            </Badge>
          </div>
          
          {recentlyRead.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-2">
                  Belum ada novel yang sedang dibaca
                </h3>
                <p className="text-purple-600 mb-4">
                  Mulai petualangan membaca Anda sekarang!
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  🔍 Jelajahi Novel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentlyRead.map((novel: Novel) => {
                const progressPercentage = getProgressPercentage(novel.id);
                const lastChapter = getLastChapter(novel.id);
                const progress = readingProgress.find(p => p.novelId === novel.id);
                
                return (
                  <Card key={novel.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-28 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center text-2xl">
                            📚
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-bold text-purple-900">{novel.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                📖 {novel.genre}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {novel.status === 'ongoing' ? '📖 Berlangsung' : '✅ Selesai'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress Bacaan:</span>
                              <span className="font-medium">
                                Chapter {lastChapter} / {novel.total_chapters}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="text-xs text-gray-500">
                              {progressPercentage.toFixed(1)}% selesai • 
                              Terakhir dibaca: {progress?.lastRead.toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => onViewNovel(novel.id)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            >
                              📖 Lanjut Baca
                            </Button>
                            <Button size="sm" variant="outline">
                              ❤️ {progress?.isFavorite ? 'Favorit' : 'Tambah ke Favorit'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">❤️ Novel Favorit</h2>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {favoriteNovels.length} novel
            </Badge>
          </div>
          
          {favoriteNovels.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-2">
                  Belum ada novel favorit
                </h3>
                <p className="text-purple-600">
                  Tandai novel yang Anda sukai sebagai favorit
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteNovels.map((novel: Novel) => (
                <Card key={novel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center text-4xl">
                        📚
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900 line-clamp-2">{novel.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">📖 {novel.genre}</Badge>
                          <Badge variant="outline" className="text-xs">⭐ {novel.average_rating.toFixed(1)}</Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => onViewNovel(novel.id)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      >
                        📖 Buka Novel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">📜 Riwayat Bacaan</h2>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              {recentlyRead.length} novel
            </Badge>
          </div>
          
          <div className="space-y-2">
            {recentlyRead.map((novel: Novel) => {
              const progress = readingProgress.find(p => p.novelId === novel.id);
              return (
                <Card key={novel.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900">{novel.title}</h4>
                        <div className="text-sm text-gray-600">
                          Dibaca sampai Chapter {progress?.lastChapter} • 
                          {progress?.lastRead.toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewNovel(novel.id)}
                      >
                        📖 Buka
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="coins" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">🪙 Manajemen Koin</h2>
            <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">
              {user.coins_balance} koin
            </Badge>
          </div>
          
          {/* Coin Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💰 Paket Koin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="text-3xl mb-2">🪙</div>
                  <div className="text-xl font-bold">100 Koin</div>
                  <div className="text-sm text-gray-600 mb-3">Paket Pemula</div>
                  <div className="text-lg font-semibold text-green-600 mb-3">Rp 10.000</div>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                    💳 Beli Sekarang
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 text-center bg-gradient-to-br from-orange-50 to-red-50 border-orange-300">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-xl font-bold">500 Koin</div>
                  <div className="text-sm text-gray-600 mb-3">Paket Populer</div>
                  <div className="text-lg font-semibold text-green-600 mb-3">Rp 45.000</div>
                  <Badge className="mb-2 bg-orange-500 text-white">10% Bonus!</Badge>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    💳 Beli Sekarang
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
                  <div className="text-3xl mb-2">👑</div>
                  <div className="text-xl font-bold">1000 Koin</div>
                  <div className="text-sm text-gray-600 mb-3">Paket Premium</div>
                  <div className="text-lg font-semibold text-green-600 mb-3">Rp 80.000</div>
                  <Badge className="mb-2 bg-purple-500 text-white">20% Bonus!</Badge>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    💳 Beli Sekarang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🪙</div>
                    <div>
                      <div className="font-medium">Pembelian Koin</div>
                      <div className="text-sm text-gray-600">10 Maret 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+100</div>
                    <div className="text-sm text-gray-600">Rp 10.000</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📖</div>
                    <div>
                      <div className="font-medium">Unlock Chapter 4</div>
                      <div className="text-sm text-gray-600">9 Maret 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-5</div>
                    <div className="text-sm text-gray-600">Chronicles of Ethereal</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📖</div>
                    <div>
                      <div className="font-medium">Unlock Chapter 5</div>
                      <div className="text-sm text-gray-600">8 Maret 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-5</div>
                    <div className="text-sm text-gray-600">Chronicles of Ethereal</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
