
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { Chapter, User, Comment } from '../../../server/src/schema';

interface ChapterReaderProps {
  chapterId: number;
  currentUser: User | null;
  onBack: () => void;
}

export function ChapterReader({ chapterId, currentUser, onBack }: ChapterReaderProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Stub chapter data
  useEffect(() => {
    const stubChapter: Chapter = {
      id: chapterId,
      novel_id: 1,
      chapter_number: chapterId,
      title: `Chapter ${chapterId}: ${getChapterTitle(chapterId)}`,
      content: getChapterContent(),
      status: 'published',
      coin_cost: chapterId <= 3 ? 0 : 5,
      word_count: 2150,
      views: Math.floor(Math.random() * 5000) + 1000,
      is_free: chapterId <= 3,
      created_at: new Date(2024, 0, chapterId),
      updated_at: new Date(2024, 0, chapterId)
    };
    setChapter(stubChapter);

    // Stub comments
    const stubComments: Comment[] = [
      {
        id: 1,
        chapter_id: chapterId,
        user_id: 101,
        content: "Bab ini luar biasa! Plot twist yang tidak terduga 🤯",
        parent_id: null,
        is_moderated: true,
        created_at: new Date('2024-03-10T10:30:00'),
        updated_at: new Date('2024-03-10T10:30:00')
      },
      {
        id: 2,
        chapter_id: chapterId,
        user_id: 102,
        content: "Setuju! Karakter utama semakin berkembang dengan baik",
        parent_id: 1,
        is_moderated: true,
        created_at: new Date('2024-03-10T11:00:00'),
        updated_at: new Date('2024-03-10T11:00:00')
      },
      {
        id: 3,
        chapter_id: chapterId,
        user_id: 103,
        content: "Kapan update chapter selanjutnya? Penasaran dengan kelanjutannya! 😭",
        parent_id: null,
        is_moderated: true,
        created_at: new Date('2024-03-10T12:15:00'),
        updated_at: new Date('2024-03-10T12:15:00')
      }
    ];
    setComments(stubComments);
  }, [chapterId]);

  function getChapterTitle(chapterNum: number): string {
    const titles = [
      "The Beginning of Adventure",
      "First Encounter with Magic", 
      "Awakening of Hidden Power",
      "Unveiling the Hidden Truth",
      "The Great Challenge Begins",
      "An Unexpected Alliance",
      "Dark Secrets Revealed",
      "The Rising Storm",
      "The Ultimate Revelation",
      "New Horizons Ahead"
    ];
    return titles[(chapterNum - 1) % titles.length];
  }

  function getChapterContent(): string {
    return `
    Matahari pagi menyinari kota kecil Elderwood dengan cahaya keemasan yang hangat. Aria bangun dari tidurnya yang gelisah, bermimpi tentang kilatan cahaya aneh yang telah menghantuinya selama berminggu-minggu. Dia tidak tahu bahwa hari ini akan mengubah hidupnya selamanya.

    Saat Aria berjalan menuju pasar untuk membeli roti pagi, dia merasakan getaran aneh di udara. Magisnya yang selama ini tersembunyi mulai bereaksi terhadap sesuatu yang tidak bisa dia pahami. Kristal kecil di kantongnya—warisan dari ibunya yang telah tiada—mulai bersinar redup.

    "Aria!" panggil Marcus, sahabat masa kecilnya yang kini menjadi seorang pemuda tampan dengan rambut coklat berkilau. "Kamu terlihat pucat. Ada apa?"

    Aria menoleh, matanya yang biru seperti safir tampak cemas. "Aku merasakan sesuatu yang aneh, Marcus. Seolah-olah ada kekuatan besar yang sedang terbangun."

    Marcus mengerutkan kening. Sebagai seorang pelajar di Akademi Sihir, dia lebih peka terhadap fluktuasi energi magis dibanding orang biasa. "Sekarang kamu menyebutnya, aku juga merasakan hal yang sama. Energi di udara... berbeda."

    Tiba-tiba, langit yang cerah berubah mendung. Awan-awan gelap berkumpul dengan kecepatan yang tidak wajar, dan kilat ungu menyambar di kejauhan. Penduduk kota mulai panik, berlarian mencari temp Tempat berlindung.

    "Aria, kita harus pergi dari sini!" Marcus meraih tangan Aria, tapi dia tidak bergerak. Matanya tertuju pada sebuah titik di langit dimana kilat ungu berkumpul membentuk spiral.

    "Tidak," bisik Aria, suaranya hampir tidak terdengar di tengah angin yang semakin kencang. "Ini... ini memanggilku."

    Kristal di kantongnya kini bersinar sangat terang, menembus kain dan menciptakan cahaya yang hangat di sekitar tubuhnya. Marcus mundur, terkejut melihat transformasi yang terjadi pada sahabatnya.

    "Aria, apa yang terjadi padamu?"

    Tapi Aria tidak menjawab. Dia merasa ada suara yang berbisik di pikirannya, suara yang familiar namun asing. Suara yang menceritakan tentang takdir, tentang kekuatan yang telah lama tertidur, dan tentang tanggung jawab yang harus dipikul.

    Kilat ungu di langit semakin intensif, dan Aria merasakan energi yang mengalir melalui seluruh tubuhnya. Untuk pertama kalinya dalam hidupnya, dia merasa utuh—seolah-olah selama ini dia hanya hidup setengah.

    "Marcus," katanya dengan suara yang lebih tenang namun penuh kekuatan. "Aku pikir... aku pikir aku tidak lagi menjadi Aria yang dulu kamu kenal."

    Cahaya kristal semakin terang, dan ketika cahaya itu mulai meredup, sosok Aria telah berubah. Rambutnya yang coklat kini berkilau dengan helai-helai perak, dan matanya memancarkan cahaya biru yang dalam—mata seorang penyihir sejati.

    "Selamat datang di dunia yang sesungguhnya, Aria," bisik angin, membawa pesan dari dimensi lain yang menanti kedatangannya.

    Dan dengan demikian, petualangan sesungguhnya dimulai...
    `;
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;

    const comment: Comment = {
      id: comments.length + 1,
      chapter_id: chapterId,
      user_id: currentUser.id,
      content: newComment,
      parent_id: null,
      is_moderated: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <div className="text-xl font-semibold text-purple-900">Memuat chapter...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              ← Kembali ke Novel
            </Button>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                📖 Chapter {chapter.chapter_number}
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                📝 {chapter.word_count.toLocaleString()} kata
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                👁️ {chapter.views.toLocaleString()}
              </Badge>
              {!chapter.is_free && (
                <Badge className="bg-yellow-500 text-white">
                  🪙 {chapter.coin_cost} koin
                </Badge>
              )}
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-purple-900 mt-4">
            {chapter.title}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Reading Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚙️ Pengaturan Baca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Family:</label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">📚 Serif (Georgia)</SelectItem>
                  <SelectItem value="sans">🔤 Sans Serif (Arial)</SelectItem>
                  <SelectItem value="mono">💻 Monospace (Courier)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Ukuran Font: {fontSize}px</label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={14}
                max={24}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Line Height: {lineHeight}</label>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
                min={1.2}
                max={2.0}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Content */}
      <Card>
        <CardContent className="pt-6">
          <div 
            className="prose max-w-none"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 
                         fontFamily === 'sans' ? 'Arial, sans-serif' : 
                         'Courier New, monospace',
              lineHeight: lineHeight
            }}
          >
            {chapter.content.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          disabled={chapter.chapter_number === 1}
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          ← Chapter Sebelumnya
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowComments(!showComments)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            💬 Komentar ({comments.length})
          </Button>
          <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
            ❤️ Like
          </Button>
          <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
            📤 Bagikan
          </Button>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          Chapter Selanjutnya →
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💬 Komentar Chapter ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            {currentUser && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tulis Komentar:</h4>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none h-20"
                  placeholder="Bagikan pendapat Anda tentang chapter ini..."
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    💬 Kirim Komentar
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-purple-900">
                      {comment.user_id === currentUser?.id ? 'Anda' : `User ${comment.user_id}`}
                    </span>
                    <span className="text-sm text-gray-500">
                      {comment.created_at.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  
                  {/* Reply indicator for nested comments */}
                  {comment.parent_id && (
                    <div className="text-xs text-purple-600 mt-1">
                      ↳ Balasan untuk komentar #{comment.parent_id}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💭</div>
                <p>Belum ada komentar untuk chapter ini.</p>
                {currentUser && <p className="text-sm">Jadilah yang pertama berkomentar!</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
