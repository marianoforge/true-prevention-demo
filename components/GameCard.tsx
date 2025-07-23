import { Button } from "@heroui/button";
import { CogniFitGame, CogniFitSkill } from "@/types";

interface GameCardProps {
  game: CogniFitGame;
  skills?: CogniFitSkill[]; // Para mostrar nombres de habilidades en español
  onPlayGame?: (gameKey: string) => void;
  onViewDescription?: (game: CogniFitGame) => void;
  locale?: string;
}

export default function GameCard({
  game,
  skills = [],
  onPlayGame,
  onViewDescription,
  locale = "es",
}: GameCardProps) {
  // Obtener el título y descripción en el idioma preferido
  const getLocalizedText = (
    assets: Record<string, string>,
    fallback: string = ""
  ) => {
    return (
      assets[locale] ||
      assets["en"] ||
      assets["es"] ||
      Object.values(assets)[0] ||
      fallback
    );
  };

  const title = getLocalizedText(game.assets.titles, game.key);
  const description = getLocalizedText(
    game.assets.descriptions,
    "Juego de entrenamiento cognitivo"
  );

  // Obtener nombres de habilidades en español si están disponibles
  const getSkillNames = () => {
    return game.skills.map((skillKey) => {
      const skill = skills.find((s) => s.key === skillKey);
      if (skill) {
        return getLocalizedText(skill.assets.titles, skillKey);
      }
      // Convertir snake_case a título
      return skillKey
        .replace(/_/g, " ")
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    });
  };

  // Determinar disponibilidad en plataformas
  const getPlatformAvailability = () => {
    const platforms = [];
    if (game.iphone) platforms.push("📱 iPhone");
    if (game.ipad) platforms.push("📱 iPad");
    if (game.android) platforms.push("🤖 Android");
    if (platforms.length === 0) platforms.push("💻 Web");
    return platforms;
  };

  // Obtener categoría para mostrar (fallback a cognitive)
  const category = game.category || "COGNITIVE";
  const getCategoryInfo = () => {
    switch (category) {
      case "COGNITIVE":
        return { name: "Cognitivo", icon: "🧠", color: "bg-blue-500" };
      case "MATH":
        return { name: "Matemático", icon: "🔢", color: "bg-green-500" };
      case "LANG":
        return { name: "Lenguaje", icon: "📖", color: "bg-purple-500" };
      default:
        return { name: "Cognitivo", icon: "🧠", color: "bg-blue-500" };
    }
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-w-[400px] h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-start p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between w-full mb-2">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryInfo.icon}</span>
            {game.assets.images?.icon && (
              <img
                src={game.assets.images.icon}
                alt={title}
                className="w-8 h-8 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        </div>
        <span
          className={`${categoryInfo.color} text-white px-2 py-1 rounded-full text-xs font-medium`}
        >
          {categoryInfo.name}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4 flex-grow">
        <div className="mb-4">
          <p 
            className="text-sm text-gray-600 dark:text-gray-400 mb-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
          {description && description.length > 150 && (
            <button
              onClick={() => onViewDescription?.(game)}
              className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline"
            >
              Ver más...
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
            Habilidades cognitivas:
          </p>
          <div className="flex flex-wrap gap-1">
            {getSkillNames().map((skillName, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs border border-blue-200 dark:border-blue-700"
              >
                {skillName}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm font-semibold mb-1 text-gray-900 dark:text-white">
            Disponible en:
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
            {getPlatformAvailability().map((platform, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>🎮 Game ID: {game.key}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <Button
          className="w-full"
          color="primary"
          variant="solid"
          onPress={() => onPlayGame?.(game.key)}
        >
          Jugar Ahora
        </Button>
      </div>
    </div>
  );
}
