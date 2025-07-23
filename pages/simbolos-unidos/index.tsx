import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import SymbolosUnidosGame from "@/components/SymbolosUnidosGame";

const SymbolosUnidosPage: NextPage = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <DefaultLayout>
      <Head>
        <title>
          Símbolos Unidos - Entrenamiento Cerebral | True Prevention
        </title>
        <meta
          content="Entrena tu memoria visual y capacidades cognitivas con Símbolos Unidos. Memoriza patrones del tótem y encuentra las coincidencias."
          name="description"
        />
      </Head>

      <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {!gameStarted ? (
            // Pantalla de inicio
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Título y logo */}
              <div className="mb-8">
                <div className="text-6xl mb-4">🏛️</div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Símbolos Unidos
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Juego de Entrenamiento Cerebral
                </p>
              </div>

              {/* Descripción del juego */}
              <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🧠</span>
                  ¿Cómo se juega?
                </h2>
                <div className="space-y-4 text-blue-100">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">1️⃣</span>
                    <p>
                      <strong>Memoriza:</strong> Observa y memoriza las tres
                      figuras del tótem sagrado
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">2️⃣</span>
                    <p>
                      <strong>Busca:</strong> Encuentra la piedra que contiene
                      exactamente los mismos símbolos
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">3️⃣</span>
                    <p>
                      <strong>Avanza:</strong> La dificultad se adapta a tu
                      rendimiento para optimizar tu entrenamiento
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficios */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl p-4 border border-pink-300/20">
                  <div className="text-3xl mb-2">👁️</div>
                  <h3 className="font-bold text-white mb-2">Memoria Visual</h3>
                  <p className="text-sm text-blue-100">
                    Fortalece tu capacidad de recordar patrones visuales
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-300/20">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold text-white mb-2">Atención</h3>
                  <p className="text-sm text-blue-100">
                    Mejora tu concentración y enfoque mental
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-300/20">
                  <div className="text-3xl mb-2">🧩</div>
                  <h3 className="font-bold text-white mb-2">Procesamiento</h3>
                  <p className="text-sm text-blue-100">
                    Acelera tu velocidad de procesamiento cognitivo
                  </p>
                </div>
              </div>

              {/* Botón de inicio */}
              <button
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => setGameStarted(true)}
              >
                🎮 Comenzar Entrenamiento
              </button>

              <p className="text-blue-200 text-sm mt-4">
                ✨ Diseñado para niños, adultos y mayores
              </p>
            </div>
          ) : (
            // Componente del juego
            <SymbolosUnidosGame onExit={() => setGameStarted(false)} />
          )}
        </div>
      </section>
    </DefaultLayout>
  );
};

export default SymbolosUnidosPage;
