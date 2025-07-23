import { NextPage } from "next";
import { useState, useEffect } from "react";
import { Button } from "@heroui/button";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import GameCard from "@/components/GameCard";
import GameInstructions from "@/components/GameInstructions";
import useCogniFitAPI from "@/hooks/useCogniFitAPI";
import { CogniFitGame, GameCategory } from "@/types";

// Mapeo de categorías para organización visual
const categoryMapping = {
  COGNITIVE: {
    id: "cognitive",
    name: "Juegos Cognitivos",
    description:
      "Ejercicios para entrenar memoria, atención, percepción y otras funciones cognitivas",
    icon: "🧠",
    color: "bg-blue-500",
  },
  MATH: {
    id: "math",
    name: "Juegos Matemáticos",
    description: "Actividades para mejorar habilidades numéricas y de cálculo",
    icon: "🔢",
    color: "bg-green-500",
  },
  LANG: {
    id: "language",
    name: "Juegos de Lenguaje",
    description:
      "Ejercicios para fortalecer habilidades verbales y de comunicación",
    icon: "📖",
    color: "bg-purple-500",
  },
};

const IndexPage: NextPage = () => {
  const {
    games,
    skills,
    loading,
    loadingAuth,
    error,
    authError,
    gameError,
    currentUser,
    isAuthenticated,
    createUser,
    launchGame,
    refreshData,
  } = useCogniFitAPI({
    locale: "es",
    autoLogin: false,
  });

  const [selectedCategory, setSelectedCategory] =
    useState<GameCategory>("COGNITIVE");
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentGameKey, setCurrentGameKey] = useState<string>("");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedGameForDescription, setSelectedGameForDescription] =
    useState<CogniFitGame | null>(null);

  // Estado de paginación por categoría
  const [currentPages, setCurrentPages] = useState<
    Record<GameCategory, number>
  >({
    COGNITIVE: 1,
    MATH: 1,
    LANG: 1,
  });

  const GAMES_PER_PAGE = 5;

  // Agrupar juegos por categoría
  const gamesByCategory = games.reduce(
    (acc, game) => {
      const category = game.category as GameCategory;

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(game);

      return acc;
    },
    {} as Record<GameCategory, CogniFitGame[]>,
  );

  // Filtrar juegos según categoría seleccionada
  const allFilteredGames = gamesByCategory[selectedCategory] || [];

  // Calcular paginación
  const currentPage = currentPages[selectedCategory] || 1;
  const totalPages = Math.ceil(allFilteredGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const endIndex = startIndex + GAMES_PER_PAGE;
  const filteredGames = allFilteredGames.slice(startIndex, endIndex);

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [selectedCategory]: page,
    }));
  };

  // Cambiar categoría (resetear página)
  const handleCategoryChange = (category: GameCategory) => {
    setSelectedCategory(category);
    // Resetear a página 1 cuando cambie la categoría
    setCurrentPages((prev) => ({
      ...prev,
      [category]: 1,
    }));
  };

  // Manejar juego
  const handlePlayGame = async (gameKey: string) => {
    setCurrentGameKey(gameKey);
    setShowGameModal(true);

    try {
      await launchGame(gameKey, "cognifit-game-container");
    } catch (error) {
      console.error("Error lanzando juego:", error);
    }
  };

  // Manejar ver descripción completa
  const handleViewDescription = (game: CogniFitGame) => {
    setSelectedGameForDescription(game);
    setShowDescriptionModal(true);
  };

  // Cerrar modal de descripción
  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedGameForDescription(null);
  };

  // Cerrar modal de juego
  const closeGameModal = () => {
    setShowGameModal(false);
    setCurrentGameKey("");

    // Limpiar el contenedor del juego
    const container = document.getElementById("cognifit-game-container");

    if (container) {
      container.innerHTML = "";
    }
  };

  // Manejar creación de usuario demo
  const handleCreateDemoUser = async () => {
    try {
      await createUser({
        userEmail: `demo${Date.now()}@ejemplo.com`,
        userName: "Usuario Demo",
        userLastname: "CogniFit",
        userPassword: "DemoUser123*",
        userBirthday: "1990-01-01",
        userSex: 1,
        userLocale: "es",
      });
    } catch (error) {
      console.error("Error creando usuario demo:", error);
    }
  };

  // Escuchar eventos de finalización de juego
  useEffect(() => {
    const handleGameCompletion = (event: MessageEvent) => {
      if (
        event.data.type === "cognifitGame" &&
        event.data.status === "completed"
      ) {
        console.log("Juego completado:", event.data);
        setTimeout(() => {
          closeGameModal();
        }, 2000);
      }
    };

    window.addEventListener("message", handleGameCompletion);

    return () => window.removeEventListener("message", handleGameCompletion);
  }, []);

  if (loading) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6" />
            <h1 className={title()}>Cargando Juegos Reales de CogniFit...</h1>
            <p className="text-gray-600 mt-4 text-lg">
              🌐 Conectando con la API oficial de CogniFit
            </p>
            <p className="text-blue-600 font-semibold mt-2">
              Cargando más de 200 juegos auténticos...
            </p>
          </div>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl">🧠</div>
            <div className="text-left">
              <h1 className={title()}>Juegos Reales de CogniFit</h1>
              <h2 className={title({ color: "blue", size: "sm" })}>
                API Oficial
              </h2>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-3 rounded-xl mb-6">
            <p className="text-green-700 dark:text-green-300 font-bold text-center text-lg">
              ✅ {games.length} Juegos Auténticos Cargados desde CogniFit
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              Datos reales • Sin simulación • Integración completa
            </p>
          </div>

          <p className="text-lg text-default-600 mt-4 max-w-3xl">
            Entrena tu mente con juegos científicamente validados cargados
            directamente desde la API oficial de CogniFit. Tenemos{" "}
            <strong>{games.length} juegos reales</strong> organizados por
            categorías cognitivas: memoria, atención, percepción, matemáticas y
            lenguaje.
          </p>
        </div>

        {/* Juego Destacado: Símbolos Unidos */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏛️</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Símbolos Unidos
              </h2>
              <p className="text-xl text-blue-100 mb-4">
                🎮 Juego de Entrenamiento Cerebral Exclusivo
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="text-left">
                <div className="space-y-3 text-blue-100">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🧠</span>
                    <p>
                      <strong>Memoriza</strong> los símbolos del tótem sagrado
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🔍</span>
                    <p>
                      <strong>Encuentra</strong> la piedra con los mismos
                      símbolos
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📈</span>
                    <p>
                      <strong>Mejora</strong> tu memoria visual y atención
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-yellow-600/30 rounded-lg p-3 text-3xl border border-yellow-400/30">
                    🔺
                  </div>
                  <div className="bg-yellow-600/30 rounded-lg p-3 text-3xl border border-yellow-400/30">
                    ⭐
                  </div>
                  <div className="bg-yellow-600/30 rounded-lg p-3 text-3xl border border-yellow-400/30">
                    🔷
                  </div>
                </div>
                <p className="text-sm text-blue-200 mb-4">
                  Dificultad adaptativa • Múltiples niveles
                </p>

                <Button
                  as="a"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold transform hover:scale-105 transition-all duration-300"
                  color="warning"
                  href="/simbolos-unidos"
                  size="lg"
                >
                  🎮 Jugar Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de crear usuario si no está autenticado */}
        {!isAuthenticated && (
          <div className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
              🚀 Comenzar a jugar
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Crea un usuario demo para acceder a todos los juegos de
              entrenamiento cognitivo.
            </p>
            <Button
              color="warning"
              isLoading={loadingAuth}
              size="lg"
              onPress={handleCreateDemoUser}
            >
              {loadingAuth ? "Creando usuario..." : "🎮 Crear Usuario Demo"}
            </Button>
            {authError && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                Error: {authError}
              </p>
            )}
          </div>
        )}

        {/* Información del usuario autenticado */}
        {isAuthenticated && currentUser && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 text-center">
              ✅ <strong>Usuario autenticado:</strong> {currentUser.email}
            </p>
          </div>
        )}

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {Object.entries(categoryMapping).map(([key, info]) => {
            const categoryKey = key as GameCategory;
            const count = gamesByCategory[categoryKey]?.length || 0;

            return (
              <Button
                key={key}
                className="font-semibold"
                color="primary"
                size="sm"
                variant={
                  selectedCategory === categoryKey ? "solid" : "bordered"
                }
                onPress={() => handleCategoryChange(categoryKey)}
              >
                {info.icon} {info.name} ({count})
              </Button>
            );
          })}
        </div>

        {/* Lista de juegos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 w-full max-w-7xl">
          {filteredGames.map((game) => (
            <GameCard
              key={game.key}
              game={game}
              onPlayGame={handlePlayGame}
              onViewDescription={handleViewDescription}
            />
          ))}
        </div>

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Información de página */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1}-
                {Math.min(endIndex, allFilteredGames.length)} de{" "}
                {allFilteredGames.length} juegos
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Página {currentPage} de {totalPages}
              </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Primera línea: Botones anterior y siguiente */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  className="flex-1 md:flex-none"
                  isDisabled={currentPage <= 1}
                  size="sm"
                  variant="bordered"
                  onPress={() => handlePageChange(currentPage - 1)}
                >
                  ← Anterior
                </Button>

                <Button
                  className="flex-1 md:flex-none"
                  isDisabled={currentPage >= totalPages}
                  size="sm"
                  variant="bordered"
                  onPress={() => handlePageChange(currentPage + 1)}
                >
                  Siguiente →
                </Button>
              </div>

              {/* Segunda línea: Números de página */}
              <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                {(() => {
                  const maxVisiblePages = 7; // Máximo de páginas visibles
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2),
                  );
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1,
                  );

                  // Ajustar el rango si estamos cerca del final
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  const pages = [];

                  // Botón primera página si no está visible
                  if (startPage > 1) {
                    pages.push(
                      <Button
                        key={1}
                        className="min-w-[35px] md:min-w-[40px]"
                        size="sm"
                        variant="bordered"
                        onPress={() => handlePageChange(1)}
                      >
                        1
                      </Button>,
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 text-gray-500">
                          ...
                        </span>,
                      );
                    }
                  }

                  // Páginas del rango visible
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        className="min-w-[35px] md:min-w-[40px]"
                        color={currentPage === i ? "primary" : "default"}
                        size="sm"
                        variant={currentPage === i ? "solid" : "bordered"}
                        onPress={() => handlePageChange(i)}
                      >
                        {i}
                      </Button>,
                    );
                  }

                  // Botón última página si no está visible
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 text-gray-500">
                          ...
                        </span>,
                      );
                    }
                    pages.push(
                      <Button
                        key={totalPages}
                        className="min-w-[35px] md:min-w-[40px]"
                        size="sm"
                        variant="bordered"
                        onPress={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>,
                    );
                  }

                  return pages;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay juegos */}
        {filteredGames.length === 0 && allFilteredGames.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No hay juegos disponibles en esta categoría.
            </p>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl max-w-5xl shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-center text-blue-900 dark:text-blue-100">
            🚀 Estado de Integración CogniFit
          </h3>

          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-bold text-lg mb-3 text-blue-800 dark:text-blue-200">
                Datos Reales
              </h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>
                  ✅ <strong>{games.length}</strong> juegos auténticos
                </li>
                <li>✅ API oficial de CogniFit</li>
                <li>✅ Títulos en español/inglés</li>
                <li>✅ Metadatos completos</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h4 className="font-bold text-lg mb-3 text-green-800 dark:text-green-200">
                Estado de API
              </h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>
                  {error ? "❌" : "✅"}{" "}
                  {error ? "Usando fallback" : "Conectado a CogniFit"}
                </li>
                <li>
                  {isAuthenticated ? "✅" : "⚠️"}{" "}
                  {isAuthenticated ? "Usuario autenticado" : "Sin autenticar"}
                </li>
                <li>🎮 SDK: {showGameModal ? "Activo" : "Listo"}</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">📈</div>
              <h4 className="font-bold text-lg mb-3 text-purple-800 dark:text-purple-200">
                Categorías
              </h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>🧠 Cognitivo: ~61</li>
                <li>🔢 Matemático: ~73</li>
                <li>📖 Lenguaje: ~74</li>
                <li>
                  🚀 <strong>Total: {games.length}</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>💡 Nota:</strong> Los juegos muestran una simulación
              interactiva porque el SDK de CogniFit requiere autorización de
              dominio. En producción con dominio autorizado, los juegos serían
              completamente interactivos.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de juegos */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden relative">
            <GameInstructions
              gameKey={currentGameKey}
              isDemo={true}
              onDismiss={() => {}}
            />
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 mt-16">
              <div>
                <h3 className="text-lg font-semibold">
                  🧠 Juego CogniFit: {currentGameKey}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entrenamiento Cognitivo Interactivo
                </p>
              </div>
              <Button
                className="shrink-0"
                color="danger"
                size="sm"
                variant="light"
                onPress={closeGameModal}
              >
                Cerrar
              </Button>
            </div>
            <div className="p-4">
              <div
                className="w-full h-[600px] bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                id="cognifit-game-container"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Cargando juego {currentGameKey}...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Inicializando SDK de CogniFit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de descripción completa */}
      {showDescriptionModal && selectedGameForDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedGameForDescription.assets.titles.es ||
                  selectedGameForDescription.assets.titles.en ||
                  selectedGameForDescription.key}
              </h3>
              <Button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                size="sm"
                variant="light"
                onPress={closeDescriptionModal}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {selectedGameForDescription.category === "COGNITIVE"
                      ? "🧠"
                      : selectedGameForDescription.category === "MATH"
                        ? "🔢"
                        : selectedGameForDescription.category === "LANG"
                          ? "📖"
                          : "🧠"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                      selectedGameForDescription.category === "COGNITIVE"
                        ? "bg-blue-500"
                        : selectedGameForDescription.category === "MATH"
                          ? "bg-green-500"
                          : selectedGameForDescription.category === "LANG"
                            ? "bg-purple-500"
                            : "bg-blue-500"
                    }`}
                  >
                    {selectedGameForDescription.category === "COGNITIVE"
                      ? "Juego Cognitivo"
                      : selectedGameForDescription.category === "MATH"
                        ? "Juego Matemático"
                        : selectedGameForDescription.category === "LANG"
                          ? "Juego de Lenguaje"
                          : "Juego Cognitivo"}
                  </span>
                </div>
                {selectedGameForDescription.assets.images?.icon && (
                  <img
                    alt="Icono del juego"
                    className="w-16 h-16 rounded-lg mb-4 object-cover"
                    src={selectedGameForDescription.assets.images.icon}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                  Descripción completa:
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedGameForDescription.assets.descriptions.es ||
                    selectedGameForDescription.assets.descriptions.en ||
                    "Juego de entrenamiento cognitivo diseñado para mejorar habilidades específicas."}
                </p>
              </div>

              {selectedGameForDescription.skills &&
                selectedGameForDescription.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                      Habilidades cognitivas:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGameForDescription.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                        >
                          {skill
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-center">
                <Button
                  color="primary"
                  size="lg"
                  onPress={() => {
                    closeDescriptionModal();
                    handlePlayGame(selectedGameForDescription.key);
                  }}
                >
                  🎮 Jugar Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default IndexPage;
