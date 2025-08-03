
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Novel, User } from '../../../server/src/schema';
import { NovelCard } from './NovelCard';

interface HomePageProps {
  novels: Novel[];
  currentUser: User | null;
  onViewNovel: (novelId: number) => void;
}

export function HomePage({ novels, currentUser, onViewNovel }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  const genres = ['all', ...Array.from(new Set(novels.map(n => n.genre)))];
  
  const filteredNovels = novels.filter((novel: Novel) => {
    const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         novel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || novel.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const featuredNovels = novels.filter((n: Novel) => n.is_featured);
  const popularNovels = [...novels].sort((a, b) => b.total_views - a.total_views).slice(0, 6);
  const recentNovels = [...novels].sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime()).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-200/50">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Selamat Datang di DANOVEL
          </span>
        </h1>
        <p className="text-lg md:text-xl text-purple-700 mb-8 max-w-2xl mx-auto">
          🌟 Platform web novel terbaik untuk pembaca dan penulis Indonesia. 
          Temukan cerita menakjubkan, dukung penulis favorit, dan bergabunglah dengan komunitas yang luar biasa!
        </p>
        
        {!currentUser && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 text-purple-600">
              <span>✨ Gratis untuk pembaca</span>
              <span>•</span>
              <span>💰 Monetisasi untuk penulis</span>
              <span>•</span>
              <span>📱 Akses di mana saja</span>
            </div>
          </div>
        )}
      </section>

      {/* Search and Filter */}
      <section className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="🔍 Cari novel berdasarkan judul atau deskripsi..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="border-purple-300 focus:border-purple-500"
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="📚 Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre: string) => (
                <SelectItem key={genre} value={genre}>
                  {genre === 'all' ? '📚 Semua Genre' : `📖 ${genre}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="🔢 Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">🔥 Terpopuler</SelectItem>
              <SelectItem value="rating">⭐ Rating Tertinggi</SelectItem>
              <SelectItem value="recent">🆕 Terbaru</SelectItem>
              <SelectItem value="views">👁️ Paling Dilihat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Novel Sections */}
      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="featured" className="data-[state=active]:bg-purple-100">
            ⭐ Unggulan
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-purple-100">
            🔥 Populer
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-purple-100">
            🆕 Terbaru
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-100">
            📚 Semua
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">⭐ Novel Unggulan</h2>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {featuredNovels.length} novel
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNovels.map((novel: Novel) => (
              <NovelCard 
                key={novel.id} 
                novel={novel} 
                currentUser={currentUser}
                onViewNovel={onViewNovel}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">🔥 Novel Terpopuler</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Top {popularNovels.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularNovels.map((novel: Novel, index: number) => (
              <NovelCard 
                key={novel.id} 
                novel={novel} 
                currentUser={currentUser}
                onViewNovel={onViewNovel}
                rank={index + 1}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">🆕 Update Terbaru</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {recentNovels.length} novel
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNovels.map((novel: Novel) => (
              <NovelCard 
                key={novel.id} 
                novel={novel} 
                currentUser={currentUser}
                onViewNovel={onViewNovel}
                showUpdateDate={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-900">📚 Semua Novel</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredNovels.length} novel ditemukan
            </Badge>
          </div>
          {filteredNovels.length === 0 ? (
            <div className="text-center py-12 bg-white/40 rounded-xl border border-purple-200/50">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                Tidak ada novel yang ditemukan
              </h3>
              <p className="text-purple-600">
                Coba ubah kata kunci pencarian atau filter genre
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNovels.map((novel: Novel) => (
                <NovelCard 
                  key={novel.id} 
                  novel={novel} 
                  currentUser={currentUser}
                  onViewNovel={onViewNovel}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Call to Action for Visitors */}
      {!currentUser && (
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            🚀 Bergabunglah dengan DANOVEL Sekarang!
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Nikmati pengalaman membaca yang tak terbatas dan dukung penulis Indonesia
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold mb-1">Baca Gratis</h3>
              <p className="text-sm opacity-80">Akses ribuan novel berkualitas</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">Dukung Penulis</h3>
              <p className="text-sm opacity-80">Sistem koin yang adil</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-1">Komunitas</h3>
              <p className="text-sm opacity-80">Diskusi dengan sesama pembaca</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
