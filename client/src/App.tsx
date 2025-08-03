
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Novel, User, DashboardStats } from '../../server/src/schema';
import { HomePage } from '@/components/HomePage';
import { NovelDetail } from '@/components/NovelDetail';
import { ChapterReader } from '@/components/ChapterReader';
import { AuthorDashboard } from '@/components/AuthorDashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { UserLibrary } from '@/components/UserLibrary';

// Stub data - These would normally come from authentication context
const STUB_USER: User = {
  id: 1,
  username: "john_reader",
  email: "john@example.com",
  password_hash: "stub",
  role: 'reader',
  avatar_url: null,
  bio: "Novel enthusiast who loves fantasy and romance stories 📚✨",
  coins_balance: 150,
  is_active: true,
  is_email_verified: true,
  two_factor_enabled: false,
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-03-10')
};

const STUB_AUTHOR: User = {
  id: 2,
  username: "author_maya",
  email: "maya@example.com", 
  password_hash: "stub",
  role: 'author',
  avatar_url: null,
  bio: "Fantasy writer with 5+ published novels 🖋️✨",
  coins_balance: 2500,
  is_active: true,
  is_email_verified: true,
  two_factor_enabled: true,
  created_at: new Date('2023-08-20'),
  updated_at: new Date('2024-03-10')
};

const STUB_ADMIN: User = {
  id: 3,
  username: "admin_alex",
  email: "admin@danovel.com",
  password_hash: "stub", 
  role: 'admin',
  avatar_url: null,
  bio: "DANOVEL Platform Administrator",
  coins_balance: 0,
  is_active: true,
  is_email_verified: true,
  two_factor_enabled: true,
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2024-03-10')
};

// Stub data for novels - This would normally come from the API
const STUB_NOVELS: Novel[] = [
  {
    id: 1,
    title: "Chronicles of Ethereal Realms",
    description: "A young mage discovers her destiny in a world where magic and technology collide. Follow Aria's journey as she uncovers ancient secrets and battles dark forces threatening the balance between realms.",
    cover_url: null,
    author_id: 2,
    status: 'ongoing',
    genre: 'Fantasy',
    tags: ['Magic', 'Adventure', 'Romance', 'Epic Fantasy'],
    total_chapters: 45,
    total_views: 125430,
    total_likes: 8920,
    average_rating: 4.7,
    is_featured: true,
    created_at: new Date('2023-09-15'),
    updated_at: new Date('2024-03-10')
  },
  {
    id: 2, 
    title: "Love in Silicon Valley",
    description: "When tech genius Emma meets mysterious investor David, sparks fly in the competitive world of startups. But can love survive corporate espionage and billion-dollar deals?",
    cover_url: null,
    author_id: 2,
    status: 'completed',
    genre: 'Romance',
    tags: ['Contemporary', 'CEO', 'Tech', 'Billionaire'],
    total_chapters: 32,
    total_views: 89230,
    total_likes: 6750,
    average_rating: 4.5,
    is_featured: false,
    created_at: new Date('2023-06-20'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 3,
    title: "Shadows of Tomorrow",
    description: "In a dystopian future where memories can be traded like currency, detective Sarah Chen investigates a series of murders linked to illegal memory trafficking.",
    cover_url: null,
    author_id: 2,
    status: 'ongoing',
    genre: 'Sci-Fi',
    tags: ['Dystopian', 'Thriller', 'Mystery', 'Cyberpunk'],
    total_chapters: 28,
    total_views: 67890,
    total_likes: 4320,
    average_rating: 4.3,
    is_featured: true,
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-03-08')
  }
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'novel' | 'chapter' | 'library' | 'author-dashboard' | 'admin'>('home');
  const [selectedNovelId, setSelectedNovelId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Load initial data
  useEffect(() => {
    setNovels(STUB_NOVELS);
    
    // Stub dashboard stats
    setDashboardStats({
      total_users: 15420,
      total_novels: 1285,
      total_chapters: 45680,
      total_revenue: 125430.50,
      active_users_today: 892,
      new_users_today: 23,
      popular_novels: STUB_NOVELS.slice(0, 3),
      recent_transactions: []
    });
  }, []);

  const handleLogin = (userType: 'visitor' | 'reader' | 'author' | 'admin') => {
    switch (userType) {
      case 'reader':
        setCurrentUser(STUB_USER);
        break;
      case 'author':
        setCurrentUser(STUB_AUTHOR);
        break;
      case 'admin':
        setCurrentUser(STUB_ADMIN);
        break;
      default:
        setCurrentUser(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleViewNovel = (novelId: number) => {
    setSelectedNovelId(novelId);
    setCurrentView('novel');
  };

  const handleReadChapter = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    setCurrentView('chapter');
  };

  const selectedNovel = novels.find(n => n.id === selectedNovelId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => setCurrentView('home')}
              >
                📚 DANOVEL
              </h1>
              <div className="hidden md:flex space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView('home')}
                  className="text-purple-700 hover:text-purple-900"
                >
                  🏠 Home
                </Button>
                {currentUser && (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentView('library')}
                      className="text-purple-700 hover:text-purple-900"
                    >
                      📖 My Library
                    </Button>
                    {currentUser.role === 'author' && (
                      <Button 
                        variant="ghost" 
                        onClick={() => setCurrentView('author-dashboard')}
                        className="text-purple-700 hover:text-purple-900"
                      >
                        ✍️ Author Dashboard
                      </Button>
                    )}
                    {currentUser.role === 'admin' && (
                      <Button 
                        variant="ghost" 
                        onClick={() => setCurrentView('admin')}
                        className="text-red-600 hover:text-red-800"
                      >
                        ⚙️ Admin Panel
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {currentUser.role !== 'admin' && (
                    <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      <span>🪙</span>
                      <span className="font-semibold">{currentUser.coins_balance}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-200 text-purple-800">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-purple-900">
                      {currentUser.username}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Select onValueChange={(value: string) => handleLogin(value as 'visitor' | 'reader' | 'author' | 'admin')}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="🔑 Login as..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">👤 Visitor</SelectItem>
                      <SelectItem value="reader">📚 Reader</SelectItem>
                      <SelectItem value="author">✍️ Author</SelectItem>
                      <SelectItem value="admin">⚙️ Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === 'home' && (
          <HomePage 
            novels={novels}
            currentUser={currentUser}
            onViewNovel={handleViewNovel}
          />
        )}
        
        {currentView === 'novel' && selectedNovel && (
          <NovelDetail 
            novel={selectedNovel}
            currentUser={currentUser}
            onReadChapter={handleReadChapter}
            onBack={() => setCurrentView('home')}
          />
        )}
        
        {currentView === 'chapter' && selectedChapterId && (
          <ChapterReader 
            chapterId={selectedChapterId}
            currentUser={currentUser}
            onBack={() => setCurrentView('novel')}
          />
        )}
        
        {currentView === 'library' && currentUser && (
          <UserLibrary 
            user={currentUser}
            novels={novels}
            onViewNovel={handleViewNovel}
          />
        )}
        
        {currentView === 'author-dashboard' && currentUser?.role === 'author' && (
          <AuthorDashboard 
            author={currentUser}
            novels={novels.filter(n => n.author_id === currentUser.id)}
            onViewNovel={handleViewNovel}
          />
        )}
        
        {currentView === 'admin' && currentUser?.role === 'admin' && dashboardStats && (
          <AdminPanel 
            admin={currentUser}
            stats={dashboardStats}
            novels={novels}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-purple-200/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-purple-600">
            <p className="mb-2">
              <span className="text-2xl">📚</span> <strong>DANOVEL</strong> - Where Stories Come Alive
            </p>
            <p className="text-sm text-purple-500">
              Platform web novel untuk pembaca dan penulis Indonesia 🇮🇩
            </p>
            <div className="flex justify-center space-x-6 mt-4 text-sm">
              <span>🌟 Novel Berkualitas</span>
              <span>💰 Sistem Monetisasi Adil</span>
              <span>👥 Komunitas Aktif</span>
              <span>📱 Responsif</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
