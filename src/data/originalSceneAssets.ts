/** Responsive delivery variants of user-approved original ODA artwork. Paths are relative to BASE_URL. */
export const ORIGINAL_SCENE_ASSETS = {
  "dunes": {
    "src": "assets/oda/original-scenes/dunes-640.png",
    "width": 640,
    "height": 427,
    "sources": [
      {
        "src": "assets/oda/original-scenes/dunes-160.webp",
        "width": 160
      },
      {
        "src": "assets/oda/original-scenes/dunes-320.webp",
        "width": 320
      },
      {
        "src": "assets/oda/original-scenes/dunes-480.webp",
        "width": 480
      },
      {
        "src": "assets/oda/original-scenes/dunes-640.webp",
        "width": 640
      },
      {
        "src": "assets/oda/original-scenes/dunes-960.webp",
        "width": 960
      },
      {
        "src": "assets/oda/original-scenes/dunes-1280.webp",
        "width": 1280
      }
    ]
  },
  "palms": {
    "src": "assets/oda/original-scenes/palms-640.png",
    "width": 640,
    "height": 427,
    "sources": [
      {
        "src": "assets/oda/original-scenes/palms-160.webp",
        "width": 160
      },
      {
        "src": "assets/oda/original-scenes/palms-320.webp",
        "width": 320
      },
      {
        "src": "assets/oda/original-scenes/palms-480.webp",
        "width": 480
      },
      {
        "src": "assets/oda/original-scenes/palms-640.webp",
        "width": 640
      },
      {
        "src": "assets/oda/original-scenes/palms-960.webp",
        "width": 960
      },
      {
        "src": "assets/oda/original-scenes/palms-1280.webp",
        "width": 1280
      }
    ]
  },
  "foam": {
    "src": "assets/oda/original-scenes/foam-640.png",
    "width": 640,
    "height": 427,
    "sources": [
      {
        "src": "assets/oda/original-scenes/foam-160.webp",
        "width": 160
      },
      {
        "src": "assets/oda/original-scenes/foam-320.webp",
        "width": 320
      },
      {
        "src": "assets/oda/original-scenes/foam-480.webp",
        "width": 480
      },
      {
        "src": "assets/oda/original-scenes/foam-640.webp",
        "width": 640
      },
      {
        "src": "assets/oda/original-scenes/foam-960.webp",
        "width": 960
      },
      {
        "src": "assets/oda/original-scenes/foam-1280.webp",
        "width": 1280
      }
    ]
  },
  "sound-sculpture": {
    "src": "assets/oda/original-scenes/sound-sculpture-640.png",
    "width": 640,
    "height": 960,
    "sources": [
      {
        "src": "assets/oda/original-scenes/sound-sculpture-160.webp",
        "width": 160
      },
      {
        "src": "assets/oda/original-scenes/sound-sculpture-320.webp",
        "width": 320
      },
      {
        "src": "assets/oda/original-scenes/sound-sculpture-480.webp",
        "width": 480
      },
      {
        "src": "assets/oda/original-scenes/sound-sculpture-640.webp",
        "width": 640
      },
      {
        "src": "assets/oda/original-scenes/sound-sculpture-960.webp",
        "width": 960
      },
      {
        "src": "assets/oda/original-scenes/sound-sculpture-1024.webp",
        "width": 1024
      }
    ]
  },
  "coach-orb": {
    "src": "assets/oda/original-scenes/coach-orb-640.png",
    "width": 640,
    "height": 640,
    "sources": [
      {
        "src": "assets/oda/original-scenes/coach-orb-160.webp",
        "width": 160
      },
      {
        "src": "assets/oda/original-scenes/coach-orb-320.webp",
        "width": 320
      },
      {
        "src": "assets/oda/original-scenes/coach-orb-480.webp",
        "width": 480
      },
      {
        "src": "assets/oda/original-scenes/coach-orb-640.webp",
        "width": 640
      }
    ]
  },
  "today-scene": {
    "src": "assets/oda/original-scenes/today-scene-640.png",
    "width": 640,
    "height": 427,
    "sources": [
      {
        "src": "assets/oda/original-scenes/today-scene-160.webp",
        "width": 160
      },
      {
        "src": "assets/oda/original-scenes/today-scene-320.webp",
        "width": 320
      },
      {
        "src": "assets/oda/original-scenes/today-scene-480.webp",
        "width": 480
      },
      {
        "src": "assets/oda/original-scenes/today-scene-640.webp",
        "width": 640
      },
      {
        "src": "assets/oda/original-scenes/today-scene-960.webp",
        "width": 960
      },
      {
        "src": "assets/oda/original-scenes/today-scene-1280.webp",
        "width": 1280
      }
    ]
  }
} as const;

export type OriginalSceneId = keyof typeof ORIGINAL_SCENE_ASSETS;
