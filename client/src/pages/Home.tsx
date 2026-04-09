/**
 * Home Page - 互動式設計提案
 * 設計風格：功能主義互動設計（Functional Interactive Design）
 * 色彩：暖灰白背景 + 莫蘭迪灰藍控件
 * 字體：Noto Sans TC + Space Grotesk
 *
 * 架構：Canvas 和 UI 控件完全分離。
 * Canvas 放在 z-index:0 的層，UI 控件放在 z-index:50 的層。
 * CanvasWrapper 將 R3F 內部 wrapper divs 的 pointer-events 設為 none，
 * 只保留 canvas 本身的 pointer-events:auto（用於 OrbitControls）。
 * 所有 UI 按鈕使用標準 onClick 事件。
 */
import { useState, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, EyeOff, Tag, Minus, Info,
  Home as HomeIcon, UtensilsCrossed, BedDouble, DoorOpen, Sun, LayoutGrid, Palette,
  RotateCcw
} from 'lucide-react';
import DesignPanel from '@/components/DesignPanel';
import CanvasWrapper from '@/components/CanvasWrapper';

const FloorplanScene = lazy(() => import('@/components/FloorplanScene'));

const FLOORPLAN_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/floorplan_original_a7c593b0.png';

const RENDER_URLS: Record<string, string> = {
  '102': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/01_living_dining_view_2015c1b1.png',
  '103': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/02_dining_kitchen_closeup_8b94d6cb.png',
  '104': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/03_master_bedroom_1b1a7bcb.png',
  '105': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/04_second_bedroom_28b71f79.png',
  '101': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/05_entry_21235968.png',
  '106': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/06_balcony_5b415924.png',
};

const MOODBOARD_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663505819015/SMBAZg5zx4785EqrG8hPdp/07_moodboard_72631b94.png';

const roomTabs = [
  { id: 'overview', label: '總覽', icon: LayoutGrid },
  { id: '102', label: '客廳', icon: HomeIcon },
  { id: '103', label: '餐廚', icon: UtensilsCrossed },
  { id: '104', label: '主臥', icon: BedDouble },
  { id: '105', label: '次臥', icon: BedDouble },
  { id: '101', label: '玄關', icon: DoorOpen },
  { id: '106', label: '陽台', icon: Sun },
];

type ViewMode = '3d' | '2d' | 'moodboard';

export default function Home() {
  const [activeRoom, setActiveRoom] = useState('overview');
  const [showOptimized, setShowOptimized] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [panelOpen, setPanelOpen] = useState(false);

  const handleRoomChange = (room: string) => {
    setActiveRoom(room);
    if (viewMode === 'moodboard') {
      setViewMode('3d');
    }
  };

  const resetCamera = () => {
    const current = activeRoom;
    setActiveRoom('');
    setTimeout(() => setActiveRoom(current), 50);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ═══ Top Navigation Bar ═══ */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-md" style={{ zIndex: 100 }}>
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #d4b896, #7d8fa3)' }}>
              <HomeIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Noto Sans TC', sans-serif" }}>
                北歐風室內設計提案
              </h1>
              <p className="text-xs text-muted-foreground">現代簡約 × Scandinavian</p>
            </div>
          </div>

          {/* Room Tabs */}
          <Tabs value={activeRoom} onValueChange={handleRoomChange}>
            <TabsList className="bg-muted/50 h-9">
              {roomTabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-xs px-3 h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5"
                >
                  <tab.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={panelOpen ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-8"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              <Info className="w-3.5 h-3.5 mr-1.5" />
              設計說明
            </Button>
          </div>
        </div>
      </header>

      {/* ═══ Main Content Area ═══ */}
      {/* 使用 CSS Grid 將 Canvas 和 UI 控件分離到不同層 */}
      <div className="flex-1 relative overflow-hidden" style={{ display: 'grid', gridTemplate: '1fr / 1fr' }}>

        {/* ─── Layer 0: Content (3D / 2D / Moodboard) ─── */}
        <div style={{ gridArea: '1/1', zIndex: 0 }}>
          {viewMode === '3d' && (
            <CanvasWrapper>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center" style={{ background: '#f5f3f0' }}>
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">載入 3D 場景中...</p>
                  </div>
                </div>
              }>
                <FloorplanScene
                  showOptimized={showOptimized}
                  showLabels={showLabels}
                  activeRoom={activeRoom}
                />
              </Suspense>
            </CanvasWrapper>
          )}

          {viewMode === '2d' && (
            <div className="w-full h-full flex items-center justify-center bg-white p-8 overflow-auto">
              <div className="relative max-w-full max-h-full">
                <img
                  src={FLOORPLAN_URL}
                  alt="原始平面圖"
                  className="max-w-full max-h-[calc(100vh-120px)] object-contain shadow-lg rounded-lg"
                />
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-border">
                  <p className="text-xs text-muted-foreground">設計師提供的原始平面圖（隔間已固定）</p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'moodboard' && (
            <div className="w-full h-full flex items-center justify-center bg-white p-8 overflow-auto">
              <div className="relative max-w-full max-h-full">
                <img
                  src={MOODBOARD_URL}
                  alt="色彩與材質搭配板"
                  className="max-w-full max-h-[calc(100vh-120px)] object-contain shadow-lg rounded-lg"
                />
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-border">
                  <p className="text-xs text-muted-foreground">色彩與材質搭配板 — 北歐現代簡約風</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Layer 1: UI Controls (pointer-events:none container, auto on buttons) ─── */}
        <div style={{ gridArea: '1/1', zIndex: 50, pointerEvents: 'none' }}>

          {/* View Mode Switcher - Top Left */}
          <div
            className="absolute top-4 left-4 flex gap-1.5 bg-card/95 backdrop-blur-md rounded-lg p-1.5 shadow-xl border border-border/80"
            style={{ pointerEvents: 'auto' }}
          >
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all select-none ${
                viewMode === '3d'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              3D 視圖
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all select-none ${
                viewMode === '2d'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              平面圖
            </button>
            <button
              onClick={() => setViewMode('moodboard')}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all select-none ${
                viewMode === 'moodboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Palette className="w-3 h-3 inline mr-1" />
              色彩板
            </button>
          </div>

          {/* 3D Controls - Top Right */}
          {viewMode === '3d' && (
            <div
              className="absolute top-4 right-4 flex flex-col gap-1.5"
              style={{ pointerEvents: 'auto' }}
            >
              <button
                onClick={() => setShowOptimized(v => !v)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all shadow-xl border select-none ${
                  showOptimized
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-card/95 backdrop-blur-md text-muted-foreground border-border'
                }`}
              >
                {showOptimized ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showOptimized ? '優化方案' : '原始配置'}
              </button>
              <button
                onClick={() => setShowLabels(v => !v)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all shadow-xl border select-none ${
                  showLabels
                    ? 'bg-card/95 backdrop-blur-md text-foreground border-border'
                    : 'bg-card/95 backdrop-blur-md text-muted-foreground border-border'
                }`}
              >
                {showLabels ? <Tag className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                標註
              </button>
              <button
                onClick={resetCamera}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all shadow-xl border bg-card/95 backdrop-blur-md text-muted-foreground border-border hover:text-foreground select-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置視角
              </button>
            </div>
          )}

          {/* Bottom Info Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2" style={{ pointerEvents: 'auto' }}>
            <div className="bg-card/95 backdrop-blur-md rounded-xl px-5 py-2.5 shadow-xl border border-border/80 flex items-center gap-4">
              {viewMode === '3d' && (
                <>
                  <span className="text-xs text-muted-foreground">滑鼠拖曳旋轉</span>
                  <span className="w-px h-3 bg-border" />
                  <span className="text-xs text-muted-foreground">滾輪縮放</span>
                  <span className="w-px h-3 bg-border" />
                  <span className="text-xs text-muted-foreground">右鍵平移</span>
                  <span className="w-px h-3 bg-border" />
                  <span className="text-xs text-muted-foreground">懸停家具查看名稱</span>
                </>
              )}
              {viewMode === '2d' && (
                <span className="text-xs text-muted-foreground">原始平面圖 — 所有隔間與尺寸標註均為固定</span>
              )}
              {viewMode === 'moodboard' && (
                <span className="text-xs text-muted-foreground">色彩與材質搭配板 — 珍珠白 × 白橡木 × 莫蘭迪灰藍 × 鼠尾草綠</span>
              )}
            </div>
          </div>

          {/* Comparison Badge (when showing optimized in 3D) */}
          {viewMode === '3d' && showOptimized && (
            <div className="absolute bottom-16 left-4" style={{ pointerEvents: 'auto' }}>
              <div className="bg-emerald-50/95 backdrop-blur-sm border border-emerald-200 rounded-lg px-4 py-2.5 shadow-lg">
                <p className="text-xs font-medium text-emerald-700 mb-0.5">優化重點</p>
                <p className="text-xs text-emerald-600">餐桌 650×650 → 1400×800 | 增設長凳座椅 | 增設床頭櫃 | 增設書桌</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Design Panel (Slide-over) ═══ */}
      <DesignPanel
        activeRoom={activeRoom}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      {/* Panel Overlay */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/10"
          style={{ zIndex: 60 }}
          onClick={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
