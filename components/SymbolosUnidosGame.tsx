import { useState, useEffect, useCallback } from "react";

// Tipos de datos del juego
interface GameStats {
  nivel: number;
  puntuacion: number;
  aciertos: number;
  errores: number;
  tiempoPromedio: number;
}

interface SymbolosUnidosGameProps {
  onExit: () => void;
}

// Símbolos disponibles para el juego
const SIMBOLOS = [
  "🔺",
  "🔻",
  "🔷",
  "🔶",
  "⭐",
  "🌟",
  "💠",
  "🔸",
  "🔹",
  "◆",
  "◇",
  "●",
  "○",
  "■",
  "□",
  "▲",
  "▼",
  "◀",
  "▶",
  "🔵",
  "🟡",
  "🟠",
  "🔴",
  "🟢",
];

// Fases del juego
type GamePhase =
  | "preparacion"
  | "memorizacion"
  | "seleccion"
  | "resultado"
  | "pausa";

const SymbolosUnidosGame: React.FC<SymbolosUnidosGameProps> = ({ onExit }) => {
  // Estados del juego
  const [fase, setFase] = useState<GamePhase>("preparacion");
  const [stats, setStats] = useState<GameStats>({
    nivel: 1,
    puntuacion: 0,
    aciertos: 0,
    errores: 0,
    tiempoPromedio: 0,
  });

  // Estados del tótem y símbolos
  const [simbolosTotem, setSimbolosTotem] = useState<string[]>([]);
  const [piedras, setPiedras] = useState<
    { simbolos: string[]; esCorrecta: boolean }[]
  >([]);
  const [piedraSeleccionada, setPiedraSeleccionada] = useState<number | null>(
    null,
  );

  // Estados de tiempo
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Estados de resultados
  const [ultimoResultado, setUltimoResultado] = useState<
    "correcto" | "incorrecto" | null
  >(null);
  const [mensaje, setMensaje] = useState<string>("");

  // Función para generar símbolos aleatorios únicos
  const generarSimbolosAleatorios = useCallback(
    (cantidad: number, excluir: string[] = []): string[] => {
      const simbolosDisponibles = SIMBOLOS.filter((s) => !excluir.includes(s));
      const seleccionados: string[] = [];

      for (let i = 0; i < cantidad; i++) {
        const indiceAleatorio = Math.floor(
          Math.random() * simbolosDisponibles.length,
        );
        const simbolo = simbolosDisponibles.splice(indiceAleatorio, 1)[0];

        seleccionados.push(simbolo);
      }

      return seleccionados;
    },
    [],
  );

  // Función para mezclar array (Fisher-Yates)
  const mezclarArray = useCallback(<T,>(array: T[]): T[] => {
    const arrayMezclado = [...array];

    for (let i = arrayMezclado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arrayMezclado[i], arrayMezclado[j]] = [
        arrayMezclado[j],
        arrayMezclado[i],
      ];
    }

    return arrayMezclado;
  }, []);

  // Función para iniciar una nueva ronda
  const iniciarNuevaRonda = useCallback(() => {
    // Generar símbolos para el tótem
    const nuevosSimbolos = generarSimbolosAleatorios(3);

    setSimbolosTotem(nuevosSimbolos);

    // Calcular número de piedras basado en el nivel (min 3, max 8)
    const numPiedras = Math.min(3 + Math.floor(stats.nivel / 2), 8);

    // Crear piedras
    const nuevasPiedras = [];

    // Una piedra correcta (con los mismos símbolos del tótem)
    nuevasPiedras.push({
      simbolos: mezclarArray([...nuevosSimbolos]),
      esCorrecta: true,
    });

    // Piedras incorrectas
    for (let i = 1; i < numPiedras; i++) {
      // Decidir tipo de piedra incorrecta
      const tipoError = Math.random();
      let simbolosIncorrectos;

      if (tipoError < 0.4) {
        // Cambiar 1 símbolo
        simbolosIncorrectos = [...nuevosSimbolos];
        const indiceACambiar = Math.floor(Math.random() * 3);
        const simbolosExcluir = [...nuevosSimbolos];

        simbolosIncorrectos[indiceACambiar] = generarSimbolosAleatorios(
          1,
          simbolosExcluir,
        )[0];
      } else if (tipoError < 0.7) {
        // Cambiar 2 símbolos
        simbolosIncorrectos = [...nuevosSimbolos];
        const indices = [0, 1, 2];
        const indicesACambiar = mezclarArray(indices).slice(0, 2);
        const simbolosExcluir = [...nuevosSimbolos];
        const nuevosSimbolosIncorrectos = generarSimbolosAleatorios(
          2,
          simbolosExcluir,
        );

        simbolosIncorrectos[indicesACambiar[0]] = nuevosSimbolosIncorrectos[0];
        simbolosIncorrectos[indicesACambiar[1]] = nuevosSimbolosIncorrectos[1];
      } else {
        // Cambiar todos los símbolos
        simbolosIncorrectos = generarSimbolosAleatorios(3, nuevosSimbolos);
      }

      nuevasPiedras.push({
        simbolos: mezclarArray(simbolosIncorrectos),
        esCorrecta: false,
      });
    }

    // Mezclar las piedras
    setPiedras(mezclarArray(nuevasPiedras));
    setPiedraSeleccionada(null);
    setUltimoResultado(null);
    setMensaje("");
  }, [stats.nivel, generarSimbolosAleatorios, mezclarArray]);

  // Función para manejar la selección de una piedra
  const seleccionarPiedra = useCallback(
    (indice: number) => {
      if (fase !== "seleccion" || piedraSeleccionada !== null) return;

      setPiedraSeleccionada(indice);
      const piedraSeleccionadaData = piedras[indice];
      const tiempoTranscurrido = tiempoInicio
        ? Date.now() - tiempoInicio.getTime()
        : 0;

      if (piedraSeleccionadaData.esCorrecta) {
        // Respuesta correcta
        setUltimoResultado("correcto");
        setMensaje("¡Excelente! Símbolos correctos");

        setStats((prev) => ({
          ...prev,
          puntuacion: prev.puntuacion + 100 * prev.nivel,
          aciertos: prev.aciertos + 1,
          tiempoPromedio:
            (prev.tiempoPromedio * prev.aciertos + tiempoTranscurrido) /
            (prev.aciertos + 1),
        }));

        // Aumentar nivel cada 3 aciertos
        if ((stats.aciertos + 1) % 3 === 0) {
          setStats((prev) => ({ ...prev, nivel: prev.nivel + 1 }));
          setMensaje("¡Excelente! Has subido de nivel");
        }
      } else {
        // Respuesta incorrecta
        setUltimoResultado("incorrecto");
        setMensaje("Símbolos incorrectos. ¡Inténtalo de nuevo!");

        setStats((prev) => ({
          ...prev,
          errores: prev.errores + 1,
          puntuacion: Math.max(0, prev.puntuacion - 25),
        }));
      }

      // Limpiar intervalo si existe
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // Cambiar a fase de resultado
      setTimeout(() => {
        setFase("resultado");
      }, 500);
    },
    [
      fase,
      piedraSeleccionada,
      piedras,
      tiempoInicio,
      stats.aciertos,
      intervalId,
    ],
  );

  // Función para continuar a la siguiente ronda
  const continuarJuego = useCallback(() => {
    iniciarNuevaRonda();
    setFase("preparacion");
  }, [iniciarNuevaRonda]);

  // Función para iniciar la fase de memorización
  const iniciarMemorizacion = useCallback(() => {
    setFase("memorizacion");
    setTiempoInicio(new Date());

    // Tiempo de memorización basado en el nivel (min 3s, max 8s)
    const tiempoMemorizacion = Math.max(3000, 8000 - stats.nivel * 200);

    setTiempoRestante(tiempoMemorizacion / 1000);

    // Countdown para la fase de memorización
    const id = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setFase("seleccion");

          // Tiempo para seleccionar basado en el nivel
          const tiempoSeleccion = Math.max(5000, 12000 - stats.nivel * 300);

          setTiempoRestante(tiempoSeleccion / 1000);

          // Countdown para la fase de selección
          const seleccionId = setInterval(() => {
            setTiempoRestante((prev) => {
              if (prev <= 1) {
                clearInterval(seleccionId);
                // Tiempo agotado
                setUltimoResultado("incorrecto");
                setMensaje("¡Tiempo agotado!");
                setStats((prev) => ({ ...prev, errores: prev.errores + 1 }));
                setTimeout(() => setFase("resultado"), 500);

                return 0;
              }

              return prev - 1;
            });
          }, 1000);

          setIntervalId(seleccionId);

          return tiempoSeleccion / 1000;
        }

        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  }, [stats.nivel]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Inicializar primera ronda
  useEffect(() => {
    iniciarNuevaRonda();
  }, [iniciarNuevaRonda]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header del juego */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                Nivel {stats.nivel}
              </div>
              <div className="text-sm text-blue-200">Nivel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.puntuacion}
              </div>
              <div className="text-sm text-blue-200">Puntos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stats.aciertos}
              </div>
              <div className="text-sm text-blue-200">Aciertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {stats.errores}
              </div>
              <div className="text-sm text-blue-200">Errores</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {(fase === "memorizacion" || fase === "seleccion") && (
              <div className="flex items-center">
                <div className="text-2xl font-bold text-orange-400 mr-2">
                  {Math.ceil(tiempoRestante)}s
                </div>
                <div className="text-sm text-blue-200">
                  {fase === "memorizacion" ? "Memoriza" : "Selecciona"}
                </div>
              </div>
            )}

            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              onClick={onExit}
            >
              ❌ Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal del juego */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 min-h-[500px] flex flex-col items-center justify-center">
        {/* Fase de preparación */}
        {fase === "preparacion" && (
          <div className="text-center">
            <div className="text-6xl mb-6">🏛️</div>
            <h2 className="text-3xl font-bold text-white mb-4">¡Prepárate!</h2>
            <p className="text-xl text-blue-200 mb-8">
              Vas a ver un tótem con 3 símbolos. Memorízalos bien.
            </p>
            <button
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              onClick={iniciarMemorizacion}
            >
              ✨ Comenzar Ronda
            </button>
          </div>
        )}

        {/* Fase de memorización */}
        {fase === "memorizacion" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              🧠 Memoriza estos símbolos
            </h2>

            {/* Tótem con símbolos */}
            <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-3xl p-8 mb-6 border-4 border-yellow-400 shadow-2xl">
              <div className="bg-white/20 rounded-2xl p-6">
                <div className="space-y-4">
                  {simbolosTotem.map((simbolo, index) => (
                    <div
                      key={index}
                      className="text-8xl bg-white/30 rounded-xl p-4 border-2 border-white/50 transform hover:scale-105 transition-transform duration-200"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {simbolo}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-2xl text-orange-400 font-bold mb-2">
              ⏰ {Math.ceil(tiempoRestante)} segundos
            </div>
            <p className="text-blue-200">
              Observa y memoriza bien los símbolos
            </p>
          </div>
        )}

        {/* Fase de selección */}
        {fase === "seleccion" && (
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold text-white mb-6">
              🔍 Encuentra la piedra correcta
            </h2>

            <div className="text-lg text-blue-200 mb-6">
              Busca la piedra que contiene exactamente los mismos símbolos del
              tótem
            </div>

            {/* Grid de piedras */}
            <div
              className={`grid gap-4 mb-6 ${
                piedras.length <= 4
                  ? "grid-cols-2 md:grid-cols-4"
                  : piedras.length <= 6
                    ? "grid-cols-2 md:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-4"
              }`}
            >
              {piedras.map((piedra, index) => (
                <button
                  key={index}
                  className={`
                    bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-4 border-2 border-gray-400
                    hover:from-gray-500 hover:to-gray-700 hover:border-gray-300
                    transition-all duration-300 transform hover:scale-105 disabled:opacity-50
                    ${
                      piedraSeleccionada === index
                        ? ultimoResultado === "correcto"
                          ? "ring-4 ring-green-400 bg-gradient-to-br from-green-500 to-green-700"
                          : ultimoResultado === "incorrecto"
                            ? "ring-4 ring-red-400 bg-gradient-to-br from-red-500 to-red-700"
                            : ""
                        : ""
                    }
                  `}
                  disabled={piedraSeleccionada !== null}
                  onClick={() => seleccionarPiedra(index)}
                >
                  <div className="space-y-2">
                    {piedra.simbolos.map((simbolo, simboloIndex) => (
                      <div key={simboloIndex} className="text-4xl md:text-5xl">
                        {simbolo}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-2xl text-orange-400 font-bold mb-2">
              ⏰ {Math.ceil(tiempoRestante)} segundos
            </div>
            <p className="text-blue-200">Haz clic en la piedra correcta</p>
          </div>
        )}

        {/* Fase de resultado */}
        {fase === "resultado" && (
          <div className="text-center">
            <div
              className={`text-8xl mb-6 ${
                ultimoResultado === "correcto"
                  ? "animate-bounce"
                  : "animate-pulse"
              }`}
            >
              {ultimoResultado === "correcto" ? "🎉" : "😅"}
            </div>

            <h2
              className={`text-4xl font-bold mb-4 ${
                ultimoResultado === "correcto"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {ultimoResultado === "correcto" ? "¡Correcto!" : "¡Ups!"}
            </h2>

            <p className="text-xl text-white mb-8">{mensaje}</p>

            {ultimoResultado === "correcto" && (
              <div className="bg-green-500/20 rounded-xl p-4 mb-6 border border-green-400/30">
                <div className="text-green-400 font-bold text-lg">
                  +{100 * stats.nivel} puntos
                </div>
              </div>
            )}

            <button
              className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              onClick={continuarJuego}
            >
              {ultimoResultado === "correcto"
                ? "🚀 Siguiente Ronda"
                : "🔥 Intentar de Nuevo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbolosUnidosGame;
