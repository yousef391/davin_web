export interface CoreAsset {
  path: string;
  name: string;
  type: 'image' | 'audio';
  category: string;
}

export const CORE_ASSETS: CoreAsset[] = [
  // Mascots & Characters
  { path: 'assets/svg/bear1.svg', name: 'Bear 1', type: 'image', category: 'Characters' },
  { path: 'assets/svg/bear_splash.svg', name: 'Bear Splash', type: 'image', category: 'Characters' },
  { path: 'assets/svg/beargames.svg', name: 'Bear Games', type: 'image', category: 'Characters' },
  { path: 'assets/svg/bunny.svg', name: 'Bunny', type: 'image', category: 'Characters' },
  { path: 'assets/svg/chat.svg', name: 'Cat', type: 'image', category: 'Characters' },
  { path: 'assets/svg/croco.svg', name: 'Crocodile', type: 'image', category: 'Characters' },
  { path: 'assets/svg/octopus.svg', name: 'Octopus', type: 'image', category: 'Characters' },
  { path: 'assets/svg/rabbit.svg', name: 'Rabbit', type: 'image', category: 'Characters' },
  { path: 'assets/svg/avatar1.svg', name: 'Avatar 1', type: 'image', category: 'Avatars' },
  { path: 'assets/svg/avatar2.svg', name: 'Avatar 2', type: 'image', category: 'Avatars' },
  { path: 'assets/svg/avatar3.svg', name: 'Avatar 3', type: 'image', category: 'Avatars' },
  { path: 'assets/svg/avatar4.svg', name: 'Avatar 4', type: 'image', category: 'Avatars' },

  // Backgrounds
  { path: 'assets/svg/splash_background.svg', name: 'Splash BG', type: 'image', category: 'Backgrounds' },
  { path: 'assets/svg/map_background.svg', name: 'Map BG', type: 'image', category: 'Backgrounds' },
  { path: 'assets/svg/games_background.svg', name: 'Games BG', type: 'image', category: 'Backgrounds' },
  { path: 'assets/svg/login_background.svg', name: 'Login BG', type: 'image', category: 'Backgrounds' },
  { path: 'assets/svg/create_profile_background.svg', name: 'Profile BG', type: 'image', category: 'Backgrounds' },

  // Objects & Icons
  { path: 'assets/svg/apple.svg', name: 'Apple', type: 'image', category: 'Objects' },
  { path: 'assets/svg/book.svg', name: 'Book', type: 'image', category: 'Objects' },
  { path: 'assets/svg/gift.svg', name: 'Gift', type: 'image', category: 'Objects' },
  { path: 'assets/svg/lamp.svg', name: 'Lamp', type: 'image', category: 'Objects' },
  { path: 'assets/svg/starR.svg', name: 'Star', type: 'image', category: 'Objects' },
  
  // Audio - Alphabets (Sample)
  { path: 'assets/audio/alphabets_en/a.mp3', name: 'Letter A (EN)', type: 'audio', category: 'Alphabets' },
  { path: 'assets/audio/alphabets_en/b.mp3', name: 'Letter B (EN)', type: 'audio', category: 'Alphabets' },
  { path: 'assets/audio/alphabets_en/c.mp3', name: 'Letter C (EN)', type: 'audio', category: 'Alphabets' },

  // Audio - SFX
  { path: 'assets/audio/sound_effects/correct.mp3', name: 'Correct', type: 'audio', category: 'SFX' },
  { path: 'assets/audio/sound_effects/incorrect.mp3', name: 'Incorrect', type: 'audio', category: 'SFX' },
];
