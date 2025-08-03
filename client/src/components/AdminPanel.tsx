
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { User, Novel, DashboardStats } from '../../../server/src/schema';

interface AdminPanelProps {
  admin: User;
  stats: DashboardStats;
  novels: Novel[];
}

export function AdminPanel({ admin, stats, novels }: AdminPanelProps) {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stub user data for admin management
  const stubUsers: User[] = [
    {
      id: 1,
      username: "john_reader",
      email: "john@example.com",
      password_hash: "stub",
      role: 'reader',
      avatar_url: null,
      bio: "Novel enthusiast",
      coins_balance: 150,
      is_active: true,
      is_email_verified: true,
      two_factor_enabled: false,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-03-10')
    },
    {
      id: 2,
      username: "author_maya",
      email: "maya@example.com",
      password_hash: "stub",
      role: 'author',
      avatar_url: null,
      bio: "Fantasy writer",
      coins_balance: 2500,
      is_active: true,
      is_email_verified: true,
      two_factor_enabled: true,
      created_at: new Date('2023-08-20'),
      updated_at: new Date('2024-03-10')
    },
    {
      id: 4,
      username: "reader_inactive",
      email: "inactive@example.com",
      password_hash: "stub",
      role: 'reader',
      avatar_url: null,
      bio: null,
      coins_balance: 0,
      is_active: false,
      is_email_verified: false,
      two_factor_enabled: false,
      created_at: new Date('2023-12-01'),
      updated_at: new Date('2024-01-05')
    }
  ];

  // Stub transaction data
  const stubTransactions = [
    { id: 1, user: "john_reader", type: "purchase_coins", amount: 100, date: "2024-03-10", status: "completed" },
    { id: 2, user: "author_maya", type: "author_earning", amount: 50, date: "2024-03-09", status: "completed" },
    { id: 3, user: "john_reader", type: "unlock_chapter", amount: -5, date: "2024-03-08", status: "completed" }
  ];

  const filteredUsers = stubUsers.filter((user: User) => {
    const matchesFilter = userFilter === 'all' || user.role === userFilter || 
                         (userFilter === 'active' && user.is_active) ||
                         (userFilter === 'inactive' && !user.is_active);
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSuspendUser = (userId: number) => {
    console.log('Suspending user:', userId);
    // This would normally call the API
  };

  const handleDeleteNovel = (novelId: number) => {
    console.log('Deleting novel:', novelId);
    // This would normally call the API
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-red-900 flex items-center">
                ⚙️ Admin Panel - DANOVEL
              </CardTitle>
              <p className="text-red-700 mt-2">
                Selamat datang, {admin.username} | Akses Level: Administrator
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-600 text-white px-3 py-1">
                🔒 SECURE ACCESS
              </Badge>
              {admin.two_factor_enabled && (
                <Badge className="bg-green-600 text-white px-3 py-1">
                  🛡️ 2FA ENABLED
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-100">
            📊 Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-red-100">
            👥 Users
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-red-100">
            📚 Content
          </TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-red-100">
            💰 Finance
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-red-100">
            🛡️ Moderation
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-red-100">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <h2 className="text-2xl font-bold text-red-900">📊 Dashboard Overview</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-900">{stats.total_users.toLocaleString()}</div>
                <div className="text-sm text-blue-600">👥 Total Users</div>
                <div className="text-xs text-green-600 mt-1">
                  +{stats.new_users_today} today
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-900">{stats.total_novels.toLocaleString()}</div>
                <div className="text-sm text-purple-600">📚 Total Novels</div>
                <div className="text-xs text-blue-600 mt-1">
                  {stats.total_chapters.toLocaleString()} chapters
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-900">
                  Rp {(stats.total_revenue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-green-600">💰 Revenue</div>
                <div className="text-xs text-green-600 mt-1">
                  This month
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-900">{stats.active_users_today.toLocaleString()}</div>
                <div className="text-sm text-orange-600">🔥 Active Today</div>
                <div className="text-xs text-gray-600 mt-1">
                  {((stats.active_users_today / stats.total_users) * 100).toFixed(1)}% of total
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 Popular Novels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.popular_novels.slice(0, 5).map((novel: Novel, index: number) => (
                    <div key={novel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        } text-white font-bold`}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium line-clamp-1">{novel.title}</div>
                          <div className="text-sm text-gray-600">
                            {novel.total_views.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                      <Badge className={`${
                        novel.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {novel.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💳 Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stubTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">
                          {transaction.type === 'purchase_coins' ? '🪙' :
                           transaction.type === 'author_earning' ? '💰' : '📖'}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.user}</div>
                          <div className="text-sm text-gray-600">{transaction.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                        <div className="text-xs text-gray-500">{transaction.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🖥️ System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🟢</div>
                  <div className="font-medium text-green-900">Server Status</div>
                  <div className="text-sm text-green-600">Online</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🗄️</div>
                  <div className="font-medium text-green-900">Database</div>
                  <div className="text-sm text-green-600">Healthy</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">⚠️</div>
                  <div className="font-medium text-yellow-900">Backup</div>
                  <div className="text-sm text-yellow-600">Scheduled</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="font-medium text-green-900">Security</div>
                  <div className="text-sm text-green-600">Secure</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-red-900">👥 User Management</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredUsers.length} users
            </Badge>
          </div>

          {/* User Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="🔍 Search users by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">👥 All Users</SelectItem>
                    <SelectItem value="reader">📚 Readers</SelectItem>
                    <SelectItem value="author">✍️ Authors</SelectItem>
                    <SelectItem value="admin">⚙️ Admins</SelectItem>
                    <SelectItem value="active">✅ Active</SelectItem>
                    <SelectItem value="inactive">❌ Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'author' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? '⚙️ Admin' :
                           user.role === 'author' ? '✍️ Author' : '📚 Reader'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.is_active ? '✅ Active' : '❌ Inactive'}
                          </Badge>
                          {user.is_email_verified && (
                            <Badge variant="outline" className="text-xs">
                              📧 Verified
                            </Badge>
                          )}
                          {user.two_factor_enabled && (
                            <Badge variant="outline" className="text-xs">
                              🔒 2FA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{user.coins_balance.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.created_at.toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            👁️ View
                          </Button>
                          <Button size="sm" variant="outline">
                            ✏️ Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                                ⚠️ Suspend
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to suspend {user.username}? They will not be able to access their account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Suspend User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-red-900">📚 Content Management</h2>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {novels.length} novels
            </Badge>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">{novels.length}</div>
                <div className="text-sm text-blue-600">📚 Total Novels</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-900">
                  {novels.filter(n => n.status === 'ongoing').length}
                </div>
                <div className="text-sm text-green-600">📖 Ongoing</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {novels.filter(n => n.is_featured).length}
                </div>
                <div className="text-sm text-purple-600">⭐ Featured</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-900">
                  {novels.reduce((sum, n) => sum + n.total_chapters, 0)}
                </div>
                <div className="text-sm text-orange-600">📄 Total Chapters</div>
              </CardContent>
            </Card>
          </div>

          {/* Novels List */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Novel</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {novels.map((novel: Novel) => (
                    <TableRow key={novel.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium line-clamp-1">{novel.title}</div>
                          <div className="text-sm text-gray-600 line-clamp-1">{novel.description}</div>
                          <div className="flex space-x-1 mt-1">
                            <Badge variant="outline" className="text-xs">{novel.genre}</Badge>
                            {novel.is_featured && (
                              <Badge className="bg-yellow-500 text-white text-xs">⭐</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">Author ID: {novel.author_id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          novel.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          novel.status === 'completed' ? 'bg-green-100 text-green-800' :
                          novel.status === 'hiatus' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {novel.status === 'ongoing' ? '📖 Ongoing' :
                           novel.status === 'completed' ? '✅ Completed' :
                           novel.status === 'hiatus' ? '⏸️ Hiatus' : '✏️ Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>📚 {novel.total_chapters} chapters</div>
                          <div>👁️ {novel.total_views.toLocaleString()} views</div>
                          <div>⭐ {novel.average_rating.toFixed(1)} rating</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            👁️ View
                          </Button>
                          <Button size="sm" variant="outline">
                            ✏️ Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            {novel.is_featured ? '⭐ Unfeature' : '⭐ Feature'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                                🗑️ Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Novel</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{novel.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteNovel(novel.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Novel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <h2 className="text-2xl font-bold text-red-900">💰 Financial Management</h2>
          
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-900">
                  Rp {(stats.total_revenue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-green-600">💰 Total Revenue</div>
                <div className="text-xs text-green-600 mt-1">All time</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-900">2.3M</div>
                <div className="text-sm text-blue-600">🪙 Coins Sold</div>
                <div className="text-xs text-blue-600 mt-1">This month</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-900">Rp 45K</div>
                <div className="text-sm text-purple-600">✍️ Author Payouts</div>
                <div className="text-xs text-purple-600 mt-1">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-900">15.2%</div>
                <div className="text-sm text-orange-600">📈 Growth</div>
                <div className="text-xs text-orange-600 mt-1">vs last month</div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💳 Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stubTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.type === 'purchase_coins' ? '🪙 Purchase' :
                           transaction.type === 'author_earning' ? '💰 Earning' : '📖 Unlock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          ✅ {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          👁️ Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Coin Packages Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🪙 Coin Package Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-2">🪙</div>
                    <div className="font-bold">Basic Package</div>
                    <div className="text-2xl font-bold text-green-600">Rp 10.000</div>
                    <div className="text-sm text-gray-600">100 coins</div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    ✏️ Edit Package
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 border-orange-300">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-bold">Popular Package</div>
                    <div className="text-2xl font-bold text-green-600">Rp 45.000</div>
                    <div className="text-sm text-gray-600">500 coins + 10% bonus</div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    ✏️ Edit Package
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 border-purple-300">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-2">👑</div>
                    <div className="font-bold">Premium Package</div>
                    <div className="text-2xl font-bold text-green-600">Rp 80.000</div>
                    <div className="text-sm text-gray-600">1000 coins + 20% bonus</div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    ✏️ Edit Package
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <h2 className="text-2xl font-bold text-red-900">🛡️ Content Moderation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-900">23</div>
                <div className="text-sm text-yellow-600">⚠️ Reports Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-900">7</div>
                <div className="text-sm text-red-600">🚫 Content Violations</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">156</div>
                <div className="text-sm text-blue-600">💬 Comments to Review</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-900">89</div>
                <div className="text-sm text-green-600">✅ Resolved Today</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Moderation Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">⚠️ Inappropriate Content Report</div>
                
                      <div className="text-sm text-gray-600">Novel: "Chronicles of Ethereal Realms" - Chapter 5</div>
                      <div className="text-sm text-gray-600">Reported by: user_123 • 2 hours ago</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        ✅ Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                        🚫 Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">🚫 Spam Comment Detected</div>
                      <div className="text-sm text-gray-600">Comment: "Check out my novel link..."</div>
                      <div className="text-sm text-gray-600">User: spammer_user • 1 hour ago</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        👁️ Review
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">📝 New Novel Awaiting Review</div>
                      <div className="text-sm text-gray-600">Title: "The Dark Chronicles"</div>
                      <div className="text-sm text-gray-600">Author: new_author_456 • 30 minutes ago</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        ✅ Publish
                      </Button>
                      <Button size="sm" variant="outline" className="text-yellow-600 hover:text-yellow-800">
                        ⏸️ Request Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-2xl font-bold text-red-900">⚙️ Platform Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🌐 General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name:</label>
                  <Input value="DANOVEL" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email:</label>
                  <Input value="admin@danovel.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Platform Description:</label>
                <Input value="Platform web novel untuk pembaca dan penulis Indonesia" />
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                💾 Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💰 Monetization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Author Revenue Share (%):</label>
                  <Input type="number" value="70" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Commission (%):</label>
                  <Input type="number" value="30" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Withdrawal (Rp):</label>
                  <Input type="number" value="100000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Coin to IDR Rate:</label>
                  <Input type="number" value="500" />
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                💾 Update Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔒 Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">Require 2FA for all admin accounts</div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  🔒 Enabled
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Session Timeout</div>
                  <div className="text-sm text-gray-600">Auto-logout after inactivity</div>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Login Attempts</div>
                  <div className="text-sm text-gray-600">Max failed login attempts before lockout</div>
                </div>
                <Select defaultValue="5">
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
