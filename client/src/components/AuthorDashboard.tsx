
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { User, Novel } from '../../../server/src/schema';

interface AuthorDashboardProps {
  author: User;
  novels: Novel[];
  onViewNovel: (novelId: number) => void;
}

export function AuthorDashboard({ author, novels, onViewNovel }: AuthorDashboardProps) {
  const [showCreateNovel, setShowCreateNovel] = useState(false);
  const [newNovel, setNewNovel] = useState({
    title: '',
    description: '',
    genre: '',
    tags: ''
  });

  // Calculate author stats
  const totalChapters = novels.reduce((sum, novel) => sum + novel.total_chapters, 0);
  const totalViews = novels.reduce((sum, novel) => sum + novel.total_views, 0);
  const averageRating = novels.length > 0 ? 
    novels.reduce((sum, novel) => sum + novel.average_rating, 0) / novels.length : 0;

  // Stub earnings data
  const monthlyEarnings = [
    { month: 'Jan 2024', amount: 450000, coins: 900 },
    { month: 'Feb 2024', amount: 675000, coins: 1350 },
    { month: 'Mar 2024', amount: 825000, coins: 1650 }
  ];

  const handleCreateNovel = () => {
    // This would normally call the API
    console.log('Creating novel:', newNovel);
    setShowCreateNovel(false);
    setNewNovel({ title: '', description: '', genre: '', tags: '' });
  };

  return (
    <div className="space-y-6">
      {/* Author Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-green-900 flex items-center">
                ✍️ Author Dashboard - {author.username}
              </CardTitle>
              <p className="text-green-700 mt-2">{author.bio}</p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 text-lg">
              💰 {author.coins_balance.toLocaleString()} koin
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{novels.length}</div>
              <div className="text-sm text-green-600">📚 Total Novel</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{totalChapters}</div>
              <div className="text-sm text-green-600">📄 Total Chapter</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-green-600">👁️ Total Views</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-900">⭐ {averageRating.toFixed(1)}</div>
              <div className="text-sm text-green-600">Rating Rata-rata</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="novels" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="novels" className="data-[state=active]:bg-green-100">
            📚 Novel Saya
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-100">
            📊 Statistik
          </TabsTrigger>
          <TabsTrigger value="earnings" className="data-[state=active]:bg-green-100">
            💰 Pendapatan
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-green-100">
            👤 Profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="novels" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-green-900">📚 Novel Saya</h2>
            <Dialog open={showCreateNovel} onOpenChange={setShowCreateNovel}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  ➕ Tulis Novel Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>📝 Buat Novel Baru</DialogTitle>
                  <DialogDescription>
                    Isi informasi dasar untuk novel baru Anda
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Judul Novel:</label>
                    <Input
                      value={newNovel.title}
                      onChange={(e) => setNewNovel(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Masukkan judul novel yang menarik..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deskripsi:</label>
                    <Textarea
                      value={newNovel.description}
                      onChange={(e) => setNewNovel(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ceritakan tentang novel Anda..."
                      className="h-32"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Genre:</label>
                      <Select value={newNovel.genre || ''} onValueChange={(value) => setNewNovel(prev => ({ ...prev, genre: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fantasy">📚 Fantasy</SelectItem>
                          <SelectItem value="Romance">💖 Romance</SelectItem>
                          <SelectItem value="Sci-Fi">🚀 Sci-Fi</SelectItem>
                          <SelectItem value="Mystery">🔍 Mystery</SelectItem>
                          <SelectItem value="Horror">👻 Horror</SelectItem>
                          <SelectItem value="Drama">🎭 Drama</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags (pisahkan dengan koma):</label>
                      <Input
                        value={newNovel.tags}
                        onChange={(e) => setNewNovel(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="Magic, Adventure, Romance"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateNovel(false)}>
                      Batal
                    </Button>
                    <Button 
                      onClick={handleCreateNovel}
                      disabled={!newNovel.title || !newNovel.description || !newNovel.genre}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                    >
                      📝 Buat Novel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {novels.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">✍️</div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Belum ada novel
                </h3>
                <p className="text-green-600 mb-4">
                  Mulai perjalanan menulis Anda dengan membuat novel pertama!
                </p>
                <Button 
                  onClick={() => setShowCreateNovel(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                >
                  ➕ Tulis Novel Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {novels.map((novel: Novel) => (
                <Card key={novel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-lg flex items-center justify-center text-3xl">
                          📚
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-green-900">{novel.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${
                                novel.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                novel.status === 'completed' ? 'bg-green-100 text-green-800' :
                                novel.status === 'hiatus' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {novel.status === 'ongoing' ? '📖 Berlangsung' :
                                 novel.status === 'completed' ? '✅ Selesai' :
                                 novel.status === 'hiatus' ? '⏸️ Hiatus' : '✏️ Draft'}
                              </Badge>
                              <Badge variant="outline">{novel.genre}</Badge>
                              {novel.is_featured && (
                                <Badge className="bg-yellow-500 text-white">⭐ Unggulan</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 line-clamp-2">{novel.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 px-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="font-semibold text-green-900">{novel.total_chapters}</div>
                            <div className="text-xs text-gray-600">📚 Chapters</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-900">{novel.total_views.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">👁️ Views</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-900">{novel.total_likes.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">❤️ Likes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-900">⭐ {novel.average_rating.toFixed(1)}</div>
                            <div className="text-xs text-gray-600">Rating</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm"
                            onClick={() => onViewNovel(novel.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            👁️ Lihat Novel
                          </Button>
                          <Button size="sm" variant="outline">
                            ✏️ Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            ➕ Tambah Chapter
                          </Button>
                          <Button size="sm" variant="outline">
                            📊 Statistik
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-bold text-green-900">📊 Statistik & Analitik</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Popular Novels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 Novel Terpopuler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {novels.sort((a, b) => b.total_views - a.total_views).slice(0, 3).map((novel: Novel, index: number) => (
                    <div key={novel.id} className="flex items-center space-x-3">
                      <Badge className={`${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      } text-white font-bold`}>
                        #{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium">{novel.title}</div>
                        <div className="text-sm text-gray-600">{novel.total_views.toLocaleString()} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <div className="text-2xl">👁️</div>
                    <div>
                      <div className="font-medium">+245 views hari ini</div>
                      <div className="text-sm text-gray-600">Chronicles of Ethereal Realms</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <div className="text-2xl">❤️</div>
                    <div>
                      <div className="font-medium">+18 likes baru</div>
                      <div className="text-sm text-gray-600">Love in Silicon Valley</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <div className="text-2xl">💬</div>
                    <div>
                      <div className="font-medium">12 komentar baru</div>
                      <div className="text-sm text-gray-600">Shadows of Tomorrow</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Statistik Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl mb-2">👁️</div>
                  <div className="text-2xl font-bold text-blue-900">15.2K</div>
                  <div className="text-sm text-blue-600">Views Bulan Ini</div>
                  <div className="text-xs text-green-600 mt-1">↗️ +23% dari bulan lalu</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl mb-2">❤️</div>
                  <div className="text-2xl font-bold text-red-900">892</div>
                  <div className="text-sm text-red-600">Likes Baru</div>
                  <div className="text-xs text-green-600 mt-1">↗️ +15% dari bulan lalu</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-purple-900">156</div>
                  <div className="text-sm text-purple-600">Followers Baru</div>
                  <div className="text-xs text-green-600 mt-1">↗️ +31% dari bulan lalu</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <h2 className="text-2xl font-bold text-green-900">💰 Pendapatan & Keuangan</h2>
          
          {/* Earnings Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-yellow-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">💸 Ringkasan Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">Rp 825.000</div>
                  <div className="text-sm text-green-600">💰 Bulan Ini</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">Rp 1.950.000</div>
                  <div className="text-sm text-green-600">📊 Total Pendapatan</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{author.coins_balance.toLocaleString()}</div>
                  <div className="text-sm text-green-600">🪙 Koin Tersedia</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Pendapatan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyEarnings.map((earning, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{earning.month}</div>
                      <div className="text-sm text-gray-600">{earning.coins} koin terjual</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        Rp {earning.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {index === monthlyEarnings.length - 1 && (
                          <span className="text-green-600">↗️ +22%</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏦 Penarikan Dana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Saldo Dapat Ditarik</div>
                      <div className="text-sm text-gray-600">Minimum penarikan: Rp 100.000</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      Rp {(author.coins_balance * 500).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white"
                  disabled={author.coins_balance * 500 < 100000}
                >
                  💳 Tarik Dana
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  Dana akan diproses dalam 3-5 hari kerja
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <h2 className="text-2xl font-bold text-green-900">👤 Profil Author</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✏️ Edit Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username:</label>
                  <Input value={author.username} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email:</label>
                  <Input value={author.email} readOnly className="bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio:</label>
                <Textarea 
                  value={author.bio || ''} 
                  placeholder="Ceritakan tentang diri Anda sebagai penulis..."
                  className="h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avatar URL:</label>
                <Input 
                  value={author.avatar_url || ''} 
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                💾 Simpan Perubahan
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔒 Keamanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">
                    {author.two_factor_enabled ? 'Aktif - Akun Anda terlindungi' : 'Nonaktif - Disarankan untuk mengaktifkan'}
                  </div>
                </div>
                <Badge className={author.two_factor_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {author.two_factor_enabled ? '🔒 Aktif' : '🔓 Nonaktif'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Email Verification</div>
                  <div className="text-sm text-gray-600">Status verifikasi email Anda</div>
                </div>
                <Badge className={author.is_email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {author.is_email_verified ? '✅ Terverifikasi' : '❌ Belum Terverifikasi'}
                </Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                🔑 Ubah Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
