/**
 * 平面圖數據模型
 * 嚴格基於用戶提供的平面圖，所有尺寸均為毫米(mm)
 * 座標系：X 向右，Z 向下（俯視圖），Y 向上（高度）
 * 原點設在平面圖左上角
 */

// 牆體厚度
const WALL_THICKNESS = 150;
const WALL_HEIGHT = 2700;

export interface Wall {
  id: string;
  start: [number, number]; // [x, z] in mm
  end: [number, number];
  thickness: number;
  height: number;
  hasWindow?: boolean;
  windowSill?: number;
  windowHeight?: number;
}

export interface Door {
  id: string;
  position: [number, number]; // center position [x, z]
  width: number;
  rotation: number; // degrees
  type: 'swing' | 'sliding' | 'entry';
}

export interface Furniture {
  id: string;
  name: string;
  nameCN: string;
  position: [number, number]; // center [x, z]
  size: [number, number]; // [width, depth]
  height: number;
  rotation: number;
  color: string;
  room: string;
  isOptimized?: boolean; // 是否為優化後的配置
}

export interface Room {
  id: string;
  name: string;
  nameCN: string;
  center: [number, number];
  color: string;
  description: string;
}

// 整體平面尺寸（根據平面圖分析）
// 總寬約 9200mm, 總深約 6800mm
export const FLOOR_WIDTH = 9200;
export const FLOOR_DEPTH = 6800;

// 房間定義
export const rooms: Room[] = [
  { id: '101', name: 'Entry', nameCN: '玄關', center: [900, 4800], color: '#e8e0d4', description: '鞋櫃 + 屏風' },
  { id: '102', name: 'Living', nameCN: '客廳', center: [2600, 4200], color: '#f5f0e8', description: '1800mm 沙發 + 55" TV' },
  { id: '103', name: 'Dining / Kitchen', nameCN: '餐廳/廚房', center: [4800, 3800], color: '#f0ebe3', description: '開放式餐廚' },
  { id: '104', name: 'Master', nameCN: '主臥', center: [3800, 1600], color: '#e5e8ed', description: '1500×1900 雙人床' },
  { id: '105', name: 'Room', nameCN: '次臥', center: [2200, 6000], color: '#eae5df', description: '1500×1900 雙人床 + 衣櫃' },
  { id: '106', name: 'Balcony', nameCN: '陽台', center: [7200, 3800], color: '#e0e8e0', description: '深度 2350mm' },
];

// 外牆定義
export const walls: Wall[] = [
  // 北牆（上方）
  { id: 'n1', start: [0, 0], end: [6000, 0], thickness: WALL_THICKNESS, height: WALL_HEIGHT },
  { id: 'n2', start: [6000, 0], end: [9200, 0], thickness: WALL_THICKNESS, height: WALL_HEIGHT, hasWindow: true, windowSill: 900, windowHeight: 1500 },
  // 東牆（右側）
  { id: 'e1', start: [9200, 0], end: [9200, 6800], thickness: WALL_THICKNESS, height: WALL_HEIGHT },
  // 南牆（下方）
  { id: 's1', start: [0, 6800], end: [9200, 6800], thickness: WALL_THICKNESS, height: WALL_HEIGHT },
  // 西牆（左側）
  { id: 'w1', start: [0, 0], end: [0, 6800], thickness: WALL_THICKNESS, height: WALL_HEIGHT },

  // 內牆 - 主臥與客廳之間
  { id: 'i1', start: [0, 2800], end: [2200, 2800], thickness: WALL_THICKNESS, height: WALL_HEIGHT },
  // 內牆 - 主臥與餐廚之間
  { id: 'i2', start: [2200, 2800], end: [6000, 2800], thickness: WALL_THICKNESS, height: WALL_HEIGHT },
  // 內牆 - 主臥右牆
  { id: 'i3', start: [6000, 0], end: [6000, 2800], thickness: WALL_THICKNESS, height: WALL_HEIGHT },

  // 內牆 - 客廳與次臥之間
  { id: 'i4', start: [0, 5200], end: [3600, 5200], thickness: WALL_THICKNESS, height: WALL_HEIGHT },
  // 內牆 - 餐廚與走道之間
  { id: 'i5', start: [3600, 5200], end: [6000, 5200], thickness: WALL_THICKNESS, height: WALL_HEIGHT },

  // 內牆 - 陽台隔牆
  { id: 'i6', start: [6000, 2800], end: [6000, 5200], thickness: WALL_THICKNESS, height: WALL_HEIGHT },

  // 衛浴隔牆（主臥內）
  { id: 'b1', start: [0, 800], end: [1800, 800], thickness: 100, height: WALL_HEIGHT },
  { id: 'b2', start: [1800, 0], end: [1800, 800], thickness: 100, height: WALL_HEIGHT },
];

// 門定義
export const doors: Door[] = [
  { id: 'd1', position: [800, 4800], width: 900, rotation: 0, type: 'entry' }, // 大門
  { id: 'd2', position: [1200, 2800], width: 800, rotation: 0, type: 'swing' }, // 主臥門
  { id: 'd3', position: [3200, 5200], width: 800, rotation: 180, type: 'swing' }, // 次臥門
  { id: 'd4', position: [6000, 4000], width: 1200, rotation: 90, type: 'sliding' }, // 陽台門
];

// 原始家具配置
export const originalFurniture: Furniture[] = [
  // 客廳
  { id: 'sofa', name: 'Sofa 1800', nameCN: '三人座沙發', position: [2400, 4200], size: [1800, 850], height: 750, rotation: 0, color: '#c8c0b4', room: '102' },
  { id: 'tv', name: '55" TV', nameCN: '55吋電視', position: [2400, 2950], size: [1200, 80], height: 600, rotation: 0, color: '#1a1a1a', room: '102' },
  { id: 'tv-cabinet', name: 'TV Cabinet', nameCN: '電視櫃', position: [2400, 3050], size: [1600, 350], height: 400, rotation: 0, color: '#d4b896', room: '102' },
  { id: 'shoe-cabinet', name: 'Shoe Cabinet + Screen', nameCN: '鞋櫃+屏風', position: [1400, 4500], size: [400, 1200], height: 1800, rotation: 0, color: '#d4b896', room: '101' },

  // 餐廚
  { id: 'dining-table-orig', name: 'Dining Table 650×650', nameCN: '餐桌 650×650', position: [4600, 4200], size: [650, 650], height: 750, rotation: 0, color: '#d4b896', room: '103' },
  { id: 'kitchen-counter', name: 'Kitchen Counter', nameCN: '廚房流理台', position: [4800, 3050], size: [3200, 600], height: 850, rotation: 0, color: '#f0f0f0', room: '103' },
  { id: 'appliance-cabinet', name: 'Appliance Cabinet', nameCN: '電器櫃', position: [4600, 5000], size: [600, 400], height: 1800, rotation: 0, color: '#e0d8cc', room: '103' },

  // 主臥
  { id: 'master-bed', name: 'Bed 1500×1900', nameCN: '雙人床', position: [4200, 1600], size: [1500, 1900], height: 450, rotation: 0, color: '#f0ebe3', room: '104' },
  { id: 'master-wardrobe', name: 'Wardrobe', nameCN: '衣櫃', position: [3800, 200], size: [3000, 600], height: 2400, rotation: 0, color: '#e8e0d4', room: '104' },

  // 次臥
  { id: 'room-bed', name: 'Bed 1500×1900', nameCN: '雙人床', position: [2000, 5600], size: [1500, 1900], height: 450, rotation: 0, color: '#f0ebe3', room: '105' },
  { id: 'room-wardrobe', name: 'Wardrobe', nameCN: '衣櫃', position: [2000, 6600], size: [3200, 500], height: 2400, rotation: 0, color: '#e8e0d4', room: '105' },
];

// 優化後家具配置（餐桌加大為 1400×800）
export const optimizedFurniture: Furniture[] = [
  // 客廳 - 保持不變
  { id: 'sofa', name: 'Sofa 1800', nameCN: '三人座沙發', position: [2400, 4200], size: [1800, 850], height: 750, rotation: 0, color: '#c8c0b4', room: '102' },
  { id: 'tv', name: '55" TV', nameCN: '55吋電視', position: [2400, 2950], size: [1200, 80], height: 600, rotation: 0, color: '#1a1a1a', room: '102' },
  { id: 'tv-cabinet', name: 'TV Cabinet', nameCN: '懸浮式電視櫃', position: [2400, 3050], size: [1600, 350], height: 400, rotation: 0, color: '#d4b896', room: '102' },
  { id: 'rug', name: 'Area Rug', nameCN: '地毯', position: [2400, 3700], size: [1400, 900], height: 10, rotation: 0, color: '#e8e0d4', room: '102' },
  { id: 'shoe-cabinet', name: 'Shoe Cabinet + Screen', nameCN: '鞋櫃+屏風', position: [1400, 4500], size: [400, 1200], height: 1800, rotation: 0, color: '#d4b896', room: '101' },

  // 餐廚 - 餐桌加大！
  { id: 'dining-table-new', name: 'Dining Table 1400×800', nameCN: '加大餐桌 1400×800', position: [4600, 4200], size: [1400, 800], height: 750, rotation: 0, color: '#c8a87c', room: '103', isOptimized: true },
  { id: 'bench', name: 'Bench Seat', nameCN: '長凳座椅', position: [4600, 4700], size: [1200, 400], height: 450, rotation: 0, color: '#d4b896', room: '103', isOptimized: true },
  { id: 'kitchen-counter', name: 'Kitchen Counter', nameCN: '廚房流理台', position: [4800, 3050], size: [3200, 600], height: 850, rotation: 0, color: '#f0f0f0', room: '103' },
  { id: 'appliance-cabinet', name: 'Appliance Cabinet', nameCN: '電器櫃', position: [4600, 5000], size: [600, 400], height: 1800, rotation: 0, color: '#e0d8cc', room: '103' },

  // 主臥 - 增加床頭櫃
  { id: 'master-bed', name: 'Bed 1500×1900', nameCN: '雙人床', position: [4200, 1600], size: [1500, 1900], height: 450, rotation: 0, color: '#f0ebe3', room: '104' },
  { id: 'master-wardrobe', name: 'Wardrobe', nameCN: '衣櫃', position: [3800, 200], size: [3000, 600], height: 2400, rotation: 0, color: '#e8e0d4', room: '104' },
  { id: 'master-nightstand1', name: 'Nightstand', nameCN: '床頭櫃', position: [3350, 1600], size: [400, 400], height: 500, rotation: 0, color: '#d4b896', room: '104' },
  { id: 'master-nightstand2', name: 'Nightstand', nameCN: '床頭櫃', position: [5050, 1600], size: [400, 400], height: 500, rotation: 0, color: '#d4b896', room: '104' },

  // 次臥 - 增加書桌
  { id: 'room-bed', name: 'Bed 1500×1900', nameCN: '雙人床', position: [2000, 5600], size: [1500, 1900], height: 450, rotation: 0, color: '#f0ebe3', room: '105' },
  { id: 'room-wardrobe', name: 'Wardrobe', nameCN: '衣櫃', position: [2000, 6600], size: [3200, 500], height: 2400, rotation: 0, color: '#e8e0d4', room: '105' },
  { id: 'room-desk', name: 'Desk', nameCN: '書桌', position: [3200, 5600], size: [1000, 500], height: 750, rotation: 0, color: '#d4b896', room: '105', isOptimized: true },
];

// 色彩方案
export const colorScheme = {
  wall: '#f5f3f0',
  floor: '#d4b896',
  ceiling: '#ffffff',
  accent: '#7d8fa3',
  wood: '#c8a87c',
  warmWhite: '#faf8f5',
  sage: '#a8b5a0',
  blueGray: '#8a9aad',
};

// 房間相機預設視角
export const roomCameraPresets: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  overview: { position: [4600, 8000, 8000], target: [4600, 0, 3400] },
  '101': { position: [900, 3000, 6500], target: [900, 0, 4800] },
  '102': { position: [2600, 3500, 6000], target: [2600, 0, 3800] },
  '103': { position: [4800, 3500, 6000], target: [4800, 0, 3800] },
  '104': { position: [3800, 3500, 3200], target: [3800, 0, 1600] },
  '105': { position: [2200, 3500, 7500], target: [2200, 0, 6000] },
  '106': { position: [7200, 3000, 5500], target: [7200, 0, 3800] },
};
