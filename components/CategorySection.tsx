import GameCard from "./GameCard";

import { CognitiveCategory, CogniFitGame } from "@/types";

interface CategorySectionProps {
  category: CognitiveCategory;
  games: CogniFitGame[];
  onPlayGame?: (gameId: string) => void;
}

export default function CategorySection({
  category,
  games,
  onPlayGame,
}: CategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className={`${category.color} p-3 rounded-lg text-white`}>
          <span className="text-2xl">{category.icon}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game.key} game={game} onPlayGame={onPlayGame} />
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No hay juegos disponibles en esta categoría
          </p>
        </div>
      )}
    </section>
  );
}
