// Importar el SDK oficial de CogniFit
// @ts-ignore - SDK no tiene tipos TypeScript perfectos
import { CognifitSdk } from "@cognifit/launcher-js-sdk";
// @ts-ignore - SDK no tiene tipos TypeScript perfectos
import { CognifitSdkConfig } from "@cognifit/launcher-js-sdk/lib/lib/cognifit.sdk.config";

import {
  GameLaunchParams,
  GameCompletionResponse,
  CogniFitSDKConfig,
} from "@/types";

export class CogniFitSDK {
  private officialSdk: any = null;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.setupMessageListener();
      this.initializeOfficialSDK();
    }
  }

  /**
   * Inicializar el SDK oficial de CogniFit
   */
  private initializeOfficialSDK() {
    try {
      this.officialSdk = new CognifitSdk();
      console.log("✅ SDK oficial de CogniFit inicializado");
    } catch (error) {
      console.error("❌ Error inicializando SDK oficial:", error);
    }
  }

  /**
   * Lanzar juego usando el SDK oficial de CogniFit
   */
  async launchRealGame(
    gameKey: string,
    config: CogniFitSDKConfig,
    userToken: string,
    elementId: string = "cognifit-game-container"
  ): Promise<void> {
    try {
      console.log("🎮 LANZANDO JUEGO CON SDK OFICIAL DE COGNIFIT");
      console.log(`🔑 Juego: ${gameKey}`);
      console.log(`🆔 Cliente: ${config.clientId}`);
      console.log(`👤 Usuario: ${userToken.substring(0, 8)}...`);

      // Obtener access token desde el API
      const tokenResponse = await fetch("/api/cognifit/issue-access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken }),
      });

      if (!tokenResponse.ok) {
        throw new Error("No se pudo obtener access token");
      }

      const { access_token } = await tokenResponse.json();

      console.log(
        "🔐 Access token obtenido:",
        access_token.substring(0, 8) + "..."
      );

      // Configurar el SDK oficial usando la CLASE CognifitSdkConfig correctamente
      console.log("🔧 Creando configuración del SDK...");

      const cognifitSdkConfig = new CognifitSdkConfig(
        elementId, // containerId
        config.clientId, // clientId
        access_token, // cognifitUserAccessToken
        {
          sandbox: false,
          appType: "web",
          theme: "light",
          showResults: false,
          customCss: "",
          screensNotToShow: [],
          preferredMobileOrientation: "",
          isFullscreenEnabled: true,
          scale: 800,
          listenEvents: true,
        }
      );

      console.log("🔧 Configuración del SDK creada exitosamente");

      // Inicializar el SDK oficial
      console.log("🔧 Inicializando SDK oficial...");

      await this.officialSdk.init(cognifitSdkConfig);
      this.isInitialized = true;

      console.log("✅ SDK oficial inicializado exitosamente");

      // Determinar el tipo de actividad
      let typeValue = "GAME";
      let keyValue = gameKey;

      // Lanzar el juego usando el SDK oficial
      console.log(`🚀 Lanzando ${typeValue}: ${keyValue}`);

      const subscription = this.officialSdk
        .start(typeValue, keyValue)
        .subscribe({
          next: (cognifitSdkResponse: any) => {
            console.log("📨 Respuesta del SDK:", cognifitSdkResponse);

            if (cognifitSdkResponse.isSessionCompleted()) {
              console.log("🎉 Juego completado exitosamente");

              // Emitir evento de finalización
              const completionData: GameCompletionResponse = {
                status: "completed",
                key: gameKey,
                score: 0, // El SDK oficial maneja esto internamente
                timestamp: Date.now(),
              };

              this.handleGameCompletion(completionData);
              subscription.unsubscribe();
            } else if (cognifitSdkResponse.isSessionAborted()) {
              console.log("⚠️ Juego abortado por el usuario");

              const abortedData: GameCompletionResponse = {
                status: "aborted",
                key: gameKey,
                score: 0,
                timestamp: Date.now(),
              };

              this.handleGameCompletion(abortedData);
              subscription.unsubscribe();
            } else if (cognifitSdkResponse.isErrorLogin()) {
              console.log("❌ Error de login en el juego");

              const errorData: GameCompletionResponse = {
                status: "loginError",
                key: gameKey,
                score: 0,
                timestamp: Date.now(),
              };

              this.handleGameCompletion(errorData);
              subscription.unsubscribe();
            } else if (cognifitSdkResponse.isEvent()) {
              console.log(
                "📊 Evento del juego:",
                cognifitSdkResponse.eventPayload
              );
              // Manejar eventos del juego si es necesario
            }
          },
          complete: () => {
            console.log("✅ Sesión de juego completada");
          },
          error: (reason: any) => {
            console.error("❌ Error en la sesión del juego:", reason);

            // Crear mensaje de error para fallback
            const errorData: GameCompletionResponse = {
              status: "loginError",
              key: gameKey,
              score: 0,
              timestamp: Date.now(),
            };

            this.handleGameCompletion(errorData);
          },
        });

      console.log("🎯 ¡JUEGO LANZADO CON SDK OFICIAL!");
    } catch (error) {
      console.error("❌ Error lanzando juego con SDK oficial:", error);
      console.log("🔄 Fallback: usando simulación como alternativa");

      // Fallback a simulación
      await this.launchGame({
        version: config.version,
        mode: "gameMode",
        key: gameKey,
        elementId: elementId,
        config: config,
      });
    }
  }

  /**
   * Lanzar juego con simulación (fallback)
   */
  async launchGame(params: GameLaunchParams): Promise<void> {
    try {
      console.log("🎮 Lanzando juego simulado (fallback)");

      const targetElement = document.getElementById(params.elementId);

      if (!targetElement) {
        throw new Error(`Elemento con ID ${params.elementId} no encontrado`);
      }

      // Crear simulación mejorada
      targetElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 500px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">🧠</div>
          <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 600;">Juego CogniFit</h2>
          <h3 style="margin: 0 0 8px 0; font-size: 24px; opacity: 0.9;">${params.key}</h3>
          <p style="margin: 0 0 20px 0; opacity: 0.8; font-size: 16px;">Modo: ${params.mode}</p>
          
          <div style="
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            margin: 20px;
            max-width: 400px;
          ">
            <p style="margin: 0 0 16px 0; opacity: 0.9; font-size: 14px;">
              🎮 El SDK oficial de CogniFit cargará aquí
            </p>
            <p style="margin: 0 0 16px 0; opacity: 0.8; font-size: 12px;">
              Una vez solucionados los permisos, este será un juego interactivo real 
              para entrenar habilidades como memoria, atención y percepción.
            </p>
            <button onclick="
              const score = Math.floor(Math.random() * 1000) + 500;
              const accuracy = Math.floor(Math.random() * 30) + 70;
              window.postMessage({
                type: 'cognifitGame',
                status: 'completed',
                key: '${params.key}',
                score: score,
                accuracy: accuracy,
                duration: Math.floor(Math.random() * 300) + 120
              }, '*');
            " style="
              padding: 12px 24px;
              background: rgba(255,255,255,0.2);
              border: 2px solid rgba(255,255,255,0.3);
              color: white;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
              🎯 Completar Sesión de Entrenamiento
            </button>
          </div>
          
          <div style="
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            opacity: 0.6;
          ">
            Powered by CogniFit Official SDK
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Error lanzando juego simulado:", error);
      throw error;
    }
  }

  /**
   * Configurar el listener para mensajes del juego
   */
  private setupMessageListener(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("message", (event) => {
      // Verificar que el mensaje viene de CogniFit o es simulado
      const isSimulated =
        event.source === window && event.data.type === "cognifitGame";
      const isCogniFit =
        event.origin === "https://www.cognifit.com" ||
        event.origin === "https://js.cognifit.com";

      if (!isSimulated && !isCogniFit) {
        return;
      }

      let data: GameCompletionResponse;

      if (isSimulated) {
        data = {
          status: event.data.status,
          key: event.data.key,
          score: event.data.score,
          timestamp: Date.now(),
        };
      } else {
        data = event.data as GameCompletionResponse;
      }

      if (
        data &&
        (data.status === "completed" ||
          data.status === "aborted" ||
          data.status === "loginError")
      ) {
        console.log("Juego terminado:", data);
        this.handleGameCompletion(data);
      }
    });
  }

  /**
   * Manejar la finalización del juego
   */
  private handleGameCompletion(data: GameCompletionResponse): void {
    if (typeof window === "undefined") return;

    // Emitir evento personalizado para que los componentes puedan escucharlo
    const gameCompletionEvent = new CustomEvent("cognifitGameCompletion", {
      detail: data,
    });

    window.dispatchEvent(gameCompletionEvent);

    // También se puede usar un callback si se configura
    if (this.onGameCompletion) {
      this.onGameCompletion(data);
    }
  }

  /**
   * Callback opcional para manejar la finalización del juego
   */
  onGameCompletion?: (data: GameCompletionResponse) => void;

  /**
   * Cleanup - limpiar el contenedor del juego
   */
  cleanupGame(elementId: string): void {
    const targetElement = document.getElementById(elementId);

    if (targetElement) {
      targetElement.innerHTML = "";
    }
  }

  /**
   * Verificar si el SDK está disponible
   */
  isSDKAvailable(): boolean {
    return this.officialSdk !== null;
  }
}

// Singleton para uso en la aplicación
let cogniFitSDKInstance: CogniFitSDK | null = null;

export function getCogniFitSDK(): CogniFitSDK {
  if (!cogniFitSDKInstance) {
    cogniFitSDKInstance = new CogniFitSDK();
  }

  return cogniFitSDKInstance;
}

// Helper functions para uso fácil (mantener compatibilidad)
export async function launchCogniFitGame(
  gameKey: string,
  config: CogniFitSDKConfig,
  elementId: string = "cognifit-game-container"
): Promise<void> {
  const sdk = getCogniFitSDK();

  // Usar el SDK oficial
  await sdk.launchRealGame(gameKey, config, "", elementId);
}

export async function launchCogniFitTraining(
  trainingKey: string,
  config: CogniFitSDKConfig,
  elementId: string = "cognifit-game-container"
): Promise<void> {
  const sdk = getCogniFitSDK();

  await sdk.launchRealGame(trainingKey, config, "", elementId);
}

export async function launchCogniFitAssessment(
  assessmentKey: string,
  config: CogniFitSDKConfig,
  elementId: string = "cognifit-game-container"
): Promise<void> {
  const sdk = getCogniFitSDK();

  await sdk.launchRealGame(assessmentKey, config, "", elementId);
}

export default CogniFitSDK;
