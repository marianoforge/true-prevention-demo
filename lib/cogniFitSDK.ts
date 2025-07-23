import {
  GameLaunchParams,
  GameCompletionResponse,
  CogniFitSDKConfig,
} from "@/types";

// Declarar el objeto global HTML5JS que proporciona CogniFit
declare global {
  interface Window {
    HTML5JS?: {
      loadMode: (
        version: string,
        mode: string,
        key: string,
        elementId: string,
        config: {
          clientId: string;
          accessToken: string;
          appType: string;
        }
      ) => void;
    };
  }
}

export class CogniFitSDK {
  private sdkVersion: string | null = null;
  private isSDKLoaded: boolean = false;
  private launcher: any = null;

  constructor() {
    // Solo configurar en el cliente
    if (typeof window !== "undefined") {
      // Escuchar mensajes del juego
      this.setupMessageListener();
      // Inicializar el launcher oficial
      this.initializeLauncher();
    }
  }

  /**
   * Inicializar componentes para lanzar juegos reales
   */
  private initializeLauncher() {
    try {
      // Solo necesitamos preparar para usar la API directa
      this.launcher = true; // Marcador de que está listo
      console.log("✅ Componentes para juegos reales inicializados");
    } catch (error) {
      console.error("❌ Error inicializando componentes:", error);
    }
  }

  /**
   * Generar client_hash según la documentación de CogniFit
   * client_hash = SHA1(client_id + client_secret + user_token)
   */
  private async generateClientHash(
    clientId: string,
    clientSecret: string,
    userToken: string
  ): Promise<string> {
    // Crear el string a hashear
    const dataToHash = clientId + clientSecret + userToken;

    // Usar Web Crypto API para generar SHA1
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);

    // Convertir el hash a hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  }

  /**
   * Cargar el SDK de CogniFit
   */
  async loadSDK(version?: string): Promise<void> {
    try {
      // Si no se proporciona versión, usar la más reciente
      if (!version && !this.sdkVersion) {
        this.sdkVersion = "v2.0";
      } else if (version) {
        this.sdkVersion = version;
      }

      return new Promise((resolve, reject) => {
        // Si ya está cargado, resolver inmediatamente
        if (this.isSDKLoaded && window.HTML5JS) {
          console.log("✅ SDK ya cargado");
          resolve();

          return;
        }

        console.log("🔄 INTENTANDO cargar SDK REAL de CogniFit...");
        console.log(
          "🌐 Si falla por autorización de dominio, se usará simulación"
        );

        const script = document.createElement("script");

        script.src = `https://js.cognifit.com/${this.sdkVersion}/html5Loader.js`;
        script.async = true;
        script.crossOrigin = "anonymous";

        const timeoutId = setTimeout(() => {
          console.warn("⏱️ Timeout cargando SDK real - usando simulación");
          this.createFallbackSDK();
          this.isSDKLoaded = true;
          resolve();
        }, 10000); // 10 segundos timeout

        script.onload = () => {
          clearTimeout(timeoutId);
          this.isSDKLoaded = true;
          if (window.HTML5JS) {
            console.log("🎉 ¡SDK REAL de CogniFit cargado exitosamente!");
            console.log("🎮 Los juegos serán completamente interactivos");
          } else {
            console.warn("⚠️ SDK cargado pero HTML5JS no disponible");
            this.createFallbackSDK();
          }
          resolve();
        };

        script.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error("❌ No se pudo cargar SDK real desde:", script.src);
          console.error("🔒 Razones posibles:");
          console.error("   • Dominio no autorizado por CogniFit");
          console.error("   • Problemas de CORS");
          console.error("   • SDK no disponible públicamente");
          console.log("🔄 Usando simulación como alternativa");

          this.createFallbackSDK();
          this.isSDKLoaded = true;
          resolve(); // No rechazar para que la app siga funcionando
        };

        // Verificar si ya existe el script
        const existingScript = document.querySelector(
          `script[src="${script.src}"]`
        );

        if (existingScript) {
          clearTimeout(timeoutId);
          if (window.HTML5JS) {
            this.isSDKLoaded = true;
            console.log("✅ SDK ya existe y está funcionando");
            resolve();
          } else {
            existingScript.addEventListener("load", () => {
              clearTimeout(timeoutId);
              this.isSDKLoaded = true;
              resolve();
            });
            existingScript.addEventListener("error", () => {
              clearTimeout(timeoutId);
              this.createFallbackSDK();
              this.isSDKLoaded = true;
              resolve();
            });
          }
        } else {
          console.log("📥 Descargando SDK desde:", script.src);
          document.head.appendChild(script);
        }
      });
    } catch (error) {
      console.error("❌ Error crítico cargando SDK:", error);
      this.createFallbackSDK();

      return Promise.resolve();
    }
  }

  /**
   * Crear una versión de fallback del SDK si no se puede cargar el real
   */
  private createFallbackSDK(): void {
    console.warn("Usando SDK de fallback - los juegos serán simulaciones");

    if (!window.HTML5JS) {
      (window as any).HTML5JS = {
        loadMode: (
          version: string,
          mode: string,
          key: string,
          elementId: string,
          config: any
        ) => {
          console.log("Cargando juego con SDK de fallback:", {
            version,
            mode,
            key,
            elementId,
            config,
          });

          const container = document.getElementById(elementId);

          if (container) {
            container.innerHTML = `
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
                <h3 style="margin: 0 0 8px 0; font-size: 24px; opacity: 0.9;">${key}</h3>
                <p style="margin: 0 0 20px 0; opacity: 0.8; font-size: 16px;">Modo: ${mode}</p>
                <div style="
                  background: rgba(255,255,255,0.1);
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px;
                  max-width: 400px;
                ">
                  <p style="margin: 0 0 16px 0; opacity: 0.9; font-size: 14px;">
                    🎮 Simulación de juego cognitivo
                  </p>
                  <p style="margin: 0 0 16px 0; opacity: 0.8; font-size: 12px;">
                    En producción, aquí se cargaría el juego interactivo real de CogniFit 
                    para entrenar habilidades como memoria, atención y percepción.
                  </p>
                  <button onclick="
                    const score = Math.floor(Math.random() * 1000) + 500;
                    const accuracy = Math.floor(Math.random() * 30) + 70;
                    window.postMessage({
                      type: 'cognifitGame',
                      status: 'completed',
                      key: '${key}',
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
                  Powered by CogniFit API
                </div>
              </div>
            `;
          }
        },
      };
    }
  }

  /**
   * Lanzar un juego de CogniFit
   */
  async launchGame(params: GameLaunchParams): Promise<void> {
    try {
      // Asegurar que el SDK esté cargado
      await this.loadSDK(params.version);

      if (!window.HTML5JS) {
        throw new Error("SDK de CogniFit no está disponible");
      }

      // Verificar que el elemento de destino existe
      const targetElement = document.getElementById(params.elementId);

      if (!targetElement) {
        throw new Error(`Elemento con ID ${params.elementId} no encontrado`);
      }

      // Limpiar el contenedor antes de cargar el juego
      targetElement.innerHTML =
        '<div id="cogniFitContent">Cargando juego...</div>';

      console.log("Lanzando juego con parámetros:", {
        version: params.version,
        mode: params.mode,
        key: params.key,
        elementId: params.elementId,
        config: {
          clientId: params.config.clientId,
          accessToken: params.config.accessToken,
          appType: params.config.appType,
        },
      });

      // Lanzar el juego usando el SDK
      window.HTML5JS.loadMode(
        params.version,
        params.mode,
        params.key,
        params.elementId,
        {
          clientId: params.config.clientId,
          accessToken: params.config.accessToken,
          appType: params.config.appType,
        }
      );
    } catch (error) {
      console.error("Error lanzando juego:", error);
      throw error;
    }
  }

  /**
   * Lanzar juego REAL usando la API directa de CogniFit (método oficial)
   */
  async launchRealGame(
    gameKey: string,
    config: CogniFitSDKConfig,
    userToken: string,
    elementId: string = "cognifit-game-container"
  ): Promise<void> {
    try {
      console.log("🎮 CARGANDO JUEGO REAL con API directa de CogniFit...");
      console.log(`🔑 Juego: ${gameKey}`);
      console.log(`🆔 Cliente: ${config.clientId}`);
      console.log(`👤 Usuario: ${userToken.substring(0, 8)}...`);

      // Obtener CLIENT_HASH fijo desde el servidor (como lo muestra el tutorial de CogniFit)
      const clientHashResponse = await fetch("/api/cognifit/get-client-hash");

      if (!clientHashResponse.ok) {
        throw new Error("No se pudo obtener CLIENT_HASH desde el servidor");
      }

      const { clientHash } = await clientHashResponse.json();

      console.log(
        "🔐 CLIENT_HASH fijo obtenido:",
        clientHash.substring(0, 8) + "..."
      );

      // Usar la URL correcta según tutorial oficial de CogniFit
      const cognifitUrl = `https://www.cognifit.com/partner/${clientHash}?client_id=${config.clientId}&user_token=${userToken}&callback_url=${encodeURIComponent("http://localhost:3000/callback")}&setting=${encodeURIComponent(JSON.stringify([{ type: "task", key: gameKey }]))}`;

      console.log("🌐 Creando iframe para juego real con dominio correcto...");

      // Crear iframe para cargar el juego real
      const container = document.getElementById(elementId);

      if (!container) {
        throw new Error(`Contenedor ${elementId} no encontrado`);
      }

      // Limpiar contenedor
      container.innerHTML = "";

      // Crear iframe para el juego real
      const iframe = document.createElement("iframe");

      iframe.src = cognifitUrl;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.allow = "fullscreen";

      // Agregar iframe al contenedor
      container.appendChild(iframe);

      // Configurar listener para mensajes del juego
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== "https://api.cognifit.com") return;

        console.log("🎮 Mensaje del juego REAL:", event.data);

        // Reenviar el mensaje como evento personalizado
        window.postMessage(
          {
            type: "cognifitGameReal",
            status: event.data.status || "running",
            key: gameKey,
            data: event.data,
          },
          "*"
        );

        // Si el juego se completa, limpiar el listener
        if (event.data.status === "completed") {
          window.removeEventListener("message", messageHandler);
        }
      };

      // Escuchar mensajes del iframe
      window.addEventListener("message", messageHandler);

      console.log("🎯 ¡JUEGO REAL DE COGNIFIT CARGADO EN IFRAME!");
      console.log("🔗 URL del juego:", cognifitUrl.substring(0, 80) + "...");
    } catch (error) {
      console.error("❌ Error lanzando juego REAL:", error);
      console.log("🔄 Fallback: usando simulación como alternativa");

      // Crear SDK de fallback y lanzar simulación
      this.createFallbackSDK();
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
        // Convertir formato simulado al formato esperado
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
   * Cleanup - limpiar el iframe del juego
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
    return this.isSDKLoaded && !!window.HTML5JS;
  }

  /**
   * Obtener la versión actual del SDK
   */
  getCurrentSDKVersion(): string | null {
    return this.sdkVersion;
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

// Helper functions para uso fácil
export async function launchCogniFitGame(
  gameKey: string,
  config: CogniFitSDKConfig,
  elementId: string = "cognifit-game-container"
): Promise<void> {
  const sdk = getCogniFitSDK();

  await sdk.launchGame({
    version: config.version,
    mode: "gameMode",
    key: gameKey,
    elementId,
    config,
  });
}

export async function launchCogniFitTraining(
  trainingKey: string,
  config: CogniFitSDKConfig,
  elementId: string = "cognifit-game-container"
): Promise<void> {
  const sdk = getCogniFitSDK();

  await sdk.launchGame({
    version: config.version,
    mode: "trainingMode",
    key: trainingKey,
    elementId,
    config,
  });
}

export async function launchCogniFitAssessment(
  assessmentKey: string,
  config: CogniFitSDKConfig,
  elementId: string = "cognifit-game-container"
): Promise<void> {
  const sdk = getCogniFitSDK();

  await sdk.launchGame({
    version: config.version,
    mode: "assessmentMode",
    key: assessmentKey,
    elementId,
    config,
  });
}

export default CogniFitSDK;
