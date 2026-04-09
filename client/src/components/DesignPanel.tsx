/**
 * DesignPanel - 設計資訊側邊面板
 * 顯示各空間的設計建議、材質色彩方案
 */
import { rooms } from '@/lib/floorplanData';
import { ChevronRight, Palette, Ruler, Sofa, Lightbulb } from 'lucide-react';

interface DesignPanelProps {
  activeRoom: string;
  isOpen: boolean;
  onClose: () => void;
}

const roomDesignInfo: Record<string, {
  title: string;
  style: string;
  colors: { name: string; hex: string }[];
  materials: string[];
  suggestions: string[];
  dimensions?: string;
}> = {
  overview: {
    title: '整體設計概念',
    style: '現代簡約 × 北歐風',
    colors: [
      { name: '珍珠白', hex: '#f5f3f0' },
      { name: '淺木色', hex: '#d4b896' },
      { name: '莫蘭迪灰藍', hex: '#7d8fa3' },
      { name: '鼠尾草綠', hex: '#a8b5a0' },
      { name: '暖灰', hex: '#c8c0b4' },
    ],
    materials: ['超耐磨木地板（白橡木色）', '棉麻布料', '霧面烤漆', '長虹玻璃'],
    suggestions: [
      '全室採用統一的白橡木色地板，營造視覺延伸感',
      '牆面以大面積珍珠白為基底，局部跳色增加層次',
      '照明採用暖白光（3000K），搭配間接照明設計',
      '綠色植栽點綴各空間，增添北歐自然氣息',
    ],
  },
  '101': {
    title: '玄關',
    style: '簡約實用',
    colors: [
      { name: '白色', hex: '#ffffff' },
      { name: '淺木色', hex: '#d4b896' },
      { name: '灰綠色', hex: '#a8b5a0' },
    ],
    materials: ['水磨石地磚', '長虹玻璃屏風', '木質掛鉤'],
    suggestions: [
      '鞋櫃結合穿鞋椅，提升使用便利性',
      '屏風採用長虹玻璃+木框，保有透光性又有隱私',
      '牆面安裝圓形穿衣鏡，放大空間感',
      '入口處設置感應式照明',
    ],
  },
  '102': {
    title: '客廳',
    style: '開闊舒適',
    dimensions: '電視牆寬 1090mm',
    colors: [
      { name: '珍珠白', hex: '#f5f3f0' },
      { name: '淺灰', hex: '#c8c0b4' },
      { name: '霧粉', hex: '#e8c8c0' },
      { name: '淺木色', hex: '#d4b896' },
    ],
    materials: ['棉麻布沙發', '超耐磨木地板', '懸浮式電視櫃'],
    suggestions: [
      '選用低背北歐風布沙發，減少視覺壓迫',
      '電視櫃採懸浮式設計，方便掃地機清掃',
      '以幾何圖案地毯定義客廳區域',
      '搭配輕巧圓形邊桌取代笨重茶几',
    ],
  },
  '103': {
    title: '餐廳 / 廚房',
    style: '溫馨實用',
    dimensions: '餐桌升級：650×650 → 1400×800',
    colors: [
      { name: '奶白色', hex: '#faf8f5' },
      { name: '木色', hex: '#c8a87c' },
      { name: '黑色點綴', hex: '#2d2d2d' },
    ],
    materials: ['白橡木實木餐桌', '霧面烤漆廚櫃', '白色地鐵磚牆面'],
    suggestions: [
      '餐桌加大為 1400×800mm，可容納 4-6 人',
      '一側搭配長凳座椅，節省空間又增加座位',
      '廚房牆面採用白色地鐵磚，易清潔且有層次',
      '餐桌上方安裝造型吊燈，營造用餐氛圍',
      '電器櫃採頂天立地設計，嵌入微波爐等家電',
    ],
  },
  '104': {
    title: '主臥室',
    style: '寧靜放鬆',
    dimensions: '床 1500×1900mm',
    colors: [
      { name: '暖灰色', hex: '#b8b0a8' },
      { name: '米白', hex: '#f0ebe3' },
      { name: '灰藍色', hex: '#8a9aad' },
    ],
    materials: ['木質飾板床頭牆', '亞麻窗簾', '推拉門衣櫃'],
    suggestions: [
      '床頭牆面採莫蘭迪灰藍跳色，營造安眠氛圍',
      '衣櫃改用推拉門設計，節省開門迴轉空間',
      '床頭照明改用壁燈，釋放床頭櫃空間',
      '增設兩側床頭櫃，提升收納便利性',
    ],
  },
  '105': {
    title: '次臥室',
    style: '多功能空間',
    dimensions: '床 1500×1900mm',
    colors: [
      { name: '米白', hex: '#f0ebe3' },
      { name: '淺木色', hex: '#d4b896' },
      { name: '奶茶色', hex: '#c8b8a8' },
    ],
    materials: ['系統家具', '木質書桌', '遮光窗簾'],
    suggestions: [
      '床鋪靠牆擺放，留出書桌空間',
      '增設壁掛式書桌，兼具書房功能',
      '衣櫃採系統家具量身打造',
      '窗邊可設置小型閱讀角',
    ],
  },
  '106': {
    title: '陽台',
    style: '休閒綠意',
    dimensions: '深度 2350mm',
    colors: [
      { name: '灰綠', hex: '#a8b5a0' },
      { name: '白色', hex: '#ffffff' },
      { name: '木色', hex: '#d4b896' },
    ],
    materials: ['防水木紋地板', '不鏽鋼曬衣架', '戶外植栽盆'],
    suggestions: [
      '地面鋪設防水木紋地板，提升質感',
      '設置壁掛式曬衣架，節省空間',
      '擺放綠色植栽，打造小型花園',
      '可放置小型折疊桌椅，作為休閒區',
    ],
  },
};

export default function DesignPanel({ activeRoom, isOpen, onClose }: DesignPanelProps) {
  const info = roomDesignInfo[activeRoom] || roomDesignInfo.overview;

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-card/95 backdrop-blur-md shadow-2xl transition-transform duration-300 z-50 overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '380px' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {info.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{info.style}</p>
        {info.dimensions && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-primary">
            <Ruler className="w-3.5 h-3.5" />
            <span>{info.dimensions}</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Color Palette */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">色彩方案</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {info.colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <div
                  className="w-5 h-5 rounded-full border border-border/50"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs">{color.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Materials */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sofa className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">建議材質</h3>
          </div>
          <div className="space-y-1.5">
            {info.materials.map((mat, i) => (
              <div key={i} className="text-sm pl-3 border-l-2 border-border py-0.5">
                {mat}
              </div>
            ))}
          </div>
        </section>

        {/* Suggestions */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">設計建議</h3>
          </div>
          <div className="space-y-2.5">
            {info.suggestions.map((sug, i) => (
              <div key={i} className="flex gap-2.5 text-sm">
                <span className="text-primary font-medium shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-foreground/80 leading-relaxed">{sug}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
