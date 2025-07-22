interface GameInstructionsProps {
  isDemo: boolean;
  gameKey: string;
  onDismiss: () => void;
}

export default function GameInstructions({ isDemo, gameKey, onDismiss }: GameInstructionsProps) {
  if (!isDemo) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-blue-200 dark:border-blue-800 z-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Modo Demostración</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              En producción, aquí se cargaría el juego interactivo <strong>{gameKey}</strong> de CogniFit
            </p>
          </div>
        </div>
        <button 
          onClick={onDismiss}
          className="p-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 