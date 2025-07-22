import { CogniFitGame, CognitiveCategory } from "@/types";

// Datos de fallback simplificados compatibles con la API real
export const fallbackGames: CogniFitGame[] = [
  {
    key: "BEE_BALLOON",
    iphone: 1,
    ipad: 1, 
    android: 0,
    skills: ["EYE_HAND_COORDINATION", "SHIFTING", "RESPONSE_TIME"],
    assets: {
      titles: {
        en: "Bee Balloon",
        es: "Abeja Globo"
      },
      descriptions: {
        en: "The objective of this game is to explode all the balloons that appear on the screen.",
        es: "El objetivo de este juego es explotar todos los globos que aparecen en la pantalla."
      },
      images: {
        icon: "https://s3.amazonaws.com/dynamicimages.cognifit.com/storage/cognifit/games/41/ScareIconZodiac"
      }
    },
    category: "COGNITIVE"
  },
  {
    key: "MAHJONG", 
    iphone: 1,
    ipad: 1,
    android: 1,
    skills: ["VISUAL_MEMORY", "PLANNING", "VISUAL_PERCEPTION"],
    assets: {
      titles: {
        en: "Mahjong",
        es: "Mahjong"
      },
      descriptions: {
        en: "Match pairs of tiles to clear the board and train your visual memory.",
        es: "Empareja pares de fichas para limpiar el tablero y entrena tu memoria visual."
      }
    },
    category: "COGNITIVE"
  },
  {
    key: "DIGITS",
    iphone: 1,
    ipad: 1,
    android: 1, 
    skills: ["WORKING_MEMORY", "PROCESSING_SPEED", "VISUAL_SCANNING"],
    assets: {
      titles: {
        en: "Digits",
        es: "Dígitos"
      },
      descriptions: {
        en: "Order numbers mentally to eliminate them in sequence and train working memory.",
        es: "Ordena números mentalmente para eliminarlos en secuencia y entrena la memoria de trabajo."
      }
    },
    category: "COGNITIVE"
  },
  {
    key: "WORDS_BIRDS",
    iphone: 1,
    ipad: 0,
    android: 1,
    skills: ["UPDATING", "NAMING", "VISUAL_SCANNING"], 
    assets: {
      titles: {
        en: "Words Birds",
        es: "Palabras Pájaros"
      },
      descriptions: {
        en: "Form words by rearranging letters to complete objectives and train language skills.",
        es: "Forma palabras reorganizando letras para completar objetivos y entrena habilidades lingüísticas."
      }
    },
    category: "LANG"
  },
  {
    key: "MATH_TRAINER",
    iphone: 1,
    ipad: 1,
    android: 1,
    skills: ["NUMERICAL_PROCESSING", "WORKING_MEMORY", "PROCESSING_SPEED"],
    assets: {
      titles: {
        en: "Math Trainer", 
        es: "Entrenador Matemático"
      },
      descriptions: {
        en: "Solve mathematical problems to improve numerical processing and calculation skills.",
        es: "Resuelve problemas matemáticos para mejorar el procesamiento numérico y habilidades de cálculo."
      }
    },
    category: "MATH"
  },
  {
    key: "VISUAL_MEMORY",
    iphone: 1,
    ipad: 1,
    android: 1,
    skills: ["VISUAL_MEMORY", "SHORT_TERM_MEMORY", "RECOGNITION"],
    assets: {
      titles: {
        en: "Visual Memory",
        es: "Memoria Visual"
      },
      descriptions: {
        en: "Memorize visual patterns and sequences of shapes and colors.",
        es: "Memoriza patrones visuales y secuencias de formas y colores."
      }
    },
    category: "COGNITIVE"
  },
  {
    key: "ATTENTION_FOCUS",
    iphone: 1,
    ipad: 1,
    android: 0,
    skills: ["FOCUS_ATTENTION", "INHIBITION", "CONCENTRATION"],
    assets: {
      titles: {
        en: "Attention Focus",
        es: "Enfoque Atencional"
      },
      descriptions: {
        en: "Focus your attention on specific stimuli while ignoring distractors.",
        es: "Enfoca tu atención en estímulos específicos ignorando distractores."
      }
    },
    category: "COGNITIVE"
  },
  {
    key: "COORDINATION_TRAINER",
    iphone: 1,
    ipad: 1, 
    android: 1,
    skills: ["EYE_HAND_COORDINATION", "MOTOR_CONTROL", "RESPONSE_TIME"],
    assets: {
      titles: {
        en: "Coordination Trainer",
        es: "Entrenador de Coordinación"
      },
      descriptions: {
        en: "Develop synchronization between what you see and your movements.",
        es: "Desarrolla la sincronización entre lo que ves y tus movimientos."
      }
    },
    category: "COGNITIVE"
  }
];

// Categorías UI para fallback (compatibles con las nuevas interfaces)
export const fallbackCategories: CognitiveCategory[] = [
  {
    id: "cognitive",
    name: "Cognitivo",
    description: "Juegos de entrenamiento cognitivo general",
    color: "bg-blue-500",
    icon: "🧠",
    apiCategory: "COGNITIVE"
  },
  {
    id: "math", 
    name: "Matemático",
    description: "Juegos matemáticos especializados",
    color: "bg-green-500",
    icon: "🔢",
    apiCategory: "MATH"
  },
  {
    id: "language",
    name: "Lenguaje", 
    description: "Juegos de lenguaje y comunicación",
    color: "bg-purple-500",
    icon: "📖",
    apiCategory: "LANG"
  }
];

// Función para obtener categorías con juegos de fallback
export const getFallbackCategoriesWithGames = () => {
  return fallbackCategories.map(category => ({
    ...category,
    games: fallbackGames.filter(game => game.category === category.apiCategory)
  }));
}; 