import React, { useState, useEffect, useRef } from 'react';
import { 
  Team, 
  PotId, 
  Assignment, 
  PARTICIPANTS, 
  POT_C_TEAMS, 
  POT_B_TEAMS, 
  POT_A_TEAMS, 
  seedRandom, 
  shuffleDeterministic, 
  getFlagUrl 
} from './types';
import BackgroundDecoration from './components/BackgroundDecoration';
import DrawScreen from './components/DrawScreen';
import ResultsScreen from './components/ResultsScreen';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Settings, 
  Link2,
  RefreshCw,
  Sliders,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AppMode = 'SYNC' | 'MANUAL';

// Helper to format today's date as YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // Hardcoded definitive target values for Mexico City timezone synchronization
  const targetDate = '2026-06-07';
  const targetTime = '16:00'; // 4:00 PM Mexico City Time
  const mode: AppMode = 'SYNC';

  // Manual Mode Phase
  const [manualPhase, setManualPhase] = useState<'HOME' | 'DRAWING' | 'RESULTS'>('HOME');
  const [manualPotId, setManualPotId] = useState<PotId>('C');
  const [manualAssignments, setManualAssignments] = useState<Assignment[]>([]);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Time Sync Ticker state
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // Real-time ticking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Compute deterministic seed based on selected target Date & Time for identical results across all guests
  const seedString = `${targetDate}_${targetTime}`;
  
  // Calculate deterministic lists
  const deterministicAssignments = React.useMemo(() => {
    const r = seedRandom(seedString);
    const shuffledC = shuffleDeterministic(POT_C_TEAMS, r);
    const shuffledB = shuffleDeterministic(POT_B_TEAMS, r);
    const shuffledA = shuffleDeterministic(POT_A_TEAMS, r);

    return PARTICIPANTS.map((participant, index) => ({
      participant,
      bomboC: shuffledC[index % shuffledC.length],
      bomboB: shuffledB[index % shuffledB.length],
      bomboA: shuffledA[index % shuffledA.length],
    }));
  }, [seedString]);

  // CONSTANTS FOR THE DETERMINISTIC DRAW TIMELINE (10s per step for professional look)
  const STEP_DURATION_MS = 10000;
  const TOTAL_STEPS = 48; // 16 participants * 3 bombos
  const TOTAL_DURATION_MS = TOTAL_STEPS * STEP_DURATION_MS;

  // 4:00 PM Mexico City Time (UTC-6) is exactly 10:00 PM (22:00:00) in UTC (Z) on June 7, 2026
  const targetTimeMs = React.useMemo(() => {
    return new Date('2026-06-07T22:00:00Z').getTime();
  }, []);

  const diffMs = currentTimeMs - targetTimeMs;

  // Categorize synchronized broadcast status
  const syncState: 'WAITING' | 'LIVE_DRAFT' | 'FINISHED' = React.useMemo(() => {
    if (diffMs < 0) return 'WAITING';
    if (diffMs < TOTAL_DURATION_MS) return 'LIVE_DRAFT';
    return 'FINISHED';
  }, [diffMs, TOTAL_DURATION_MS]);

  // Calculations for active details during the live synchronized broadcast
  const activeLiveStepIdx = Math.floor(diffMs / STEP_DURATION_MS);
  const liveStepProgressMs = diffMs % STEP_DURATION_MS;

  // Resolve current active PotId based on step progress
  const activeLivePotId: PotId = React.useMemo(() => {
    if (activeLiveStepIdx < 16) return 'C';
    if (activeLiveStepIdx < 32) return 'B';
    return 'A';
  }, [activeLiveStepIdx]);

  // Build temporary assignments list that grows as the live show advances
  const liveAssignmentsList: Assignment[] = React.useMemo(() => {
    return deterministicAssignments.map((as, pIdx) => {
      // Step indices where each element is filled
      const stepC = pIdx;
      const stepB = pIdx + 16;
      const stepA = pIdx + 32;

      return {
        participant: as.participant,
        bomboC: activeLiveStepIdx > stepC ? as.bomboC : undefined,
        bomboB: activeLiveStepIdx > stepB ? as.bomboB : undefined,
        bomboA: activeLiveStepIdx > stepA ? as.bomboA : undefined,
      };
    });
  }, [deterministicAssignments, activeLiveStepIdx]);

  // Active items currently undergoing visual spin
  const activeParticipantName = React.useMemo(() => {
    if (syncState !== 'LIVE_DRAFT') return null;
    const participantIdx = activeLiveStepIdx % 16;
    return PARTICIPANTS[participantIdx] || null;
  }, [syncState, activeLiveStepIdx]);

  const activeDeterministicWinner = React.useMemo(() => {
    if (syncState !== 'LIVE_DRAFT') return null;
    const pIdx = activeLiveStepIdx % 16;
    const fullAs = deterministicAssignments[pIdx];
    if (!fullAs) return null;
    
    if (activeLivePotId === 'C') return fullAs.bomboC || null;
    if (activeLivePotId === 'B') return fullAs.bomboB || null;
    return fullAs.bomboA || null;
  }, [syncState, activeLiveStepIdx, activeLivePotId, deterministicAssignments]);

  // Compute remaining teams dynamically for the left column during the live show
  const remainingTeamsSynced = React.useMemo(() => {
    const pot = {
      C: POT_C_TEAMS,
      B: POT_B_TEAMS,
      A: POT_A_TEAMS
    }[activeLivePotId];

    // Teams designed for the current pot that have already been locked by the current step
    const assignedNames = new Set(
      liveAssignmentsList
        .map(as => {
          if (activeLivePotId === 'C') return as.bomboC?.name;
          if (activeLivePotId === 'B') return as.bomboB?.name;
          return as.bomboA?.name;
        })
        .filter(Boolean)
    );

    return pot.filter(t => !assignedNames.has(t.name));
  }, [activeLivePotId, liveAssignmentsList]);

  // Share link callback
  const handleCopyShareLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?date=${targetDate}&time=${targetTime}&mode=SYNC`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Convert milliseconds into highly readable HH:MM:SS Countdown
  const formatCountdown = (ms: number) => {
    const totalSec = Math.floor(Math.abs(ms) / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Manual draft initiations
  const handleStartManualDraw = () => {
    const initialAssignments: Assignment[] = PARTICIPANTS.map((participant) => ({
      participant,
      bomboC: undefined,
      bomboB: undefined,
      bomboA: undefined,
    }));
    setManualAssignments(initialAssignments);
    setManualPotId('C');
    setManualPhase('DRAWING');
  };

  const handleAddManualAssignment = (participant: string, team: Team, potId: PotId) => {
    setManualAssignments((prev) => 
      prev.map((as) => {
        if (as.participant === participant) {
          return {
            ...as,
            [potId === 'C' ? 'bomboC' : potId === 'B' ? 'bomboB' : 'bomboA']: team
          };
        }
        return as;
      })
    );
  };

  const handleManualPhaseComplete = () => {
    if (manualPotId === 'C') {
      setManualPotId('B');
    } else if (manualPotId === 'B') {
      setManualPotId('A');
    } else {
      setManualPhase('RESULTS');
    }
  };

  const handleRestartManual = () => {
    setManualAssignments([]);
    setManualPotId('C');
    setManualPhase('HOME');
  };

  return (
    <div className="relative min-h-screen text-[#EDEDED] bg-[#000000] font-sans antialiased flex flex-col justify-between overflow-x-hidden">
      
      {/* High-tech dynamic geometric graphics */}
      <BackgroundDecoration />

      {/* HEADER MASTER BAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 py-5 flex items-center justify-between border-b border-white/10 select-none">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#E10000] px-3 py-1 text-black font-black text-sm tracking-tighter uppercase rounded-sm">
            LIVE
          </div>
          <div className="flex flex-col">
            <span className="text-white text-base font-black tracking-widest uppercase leading-none">
              SORTEO MUNDIAL 2026
            </span>
            <span className="text-[9px] text-[#08C84C] font-mono tracking-widest uppercase mt-1">
              {mode === 'SYNC' ? '● MODO TRANSMISIÓN SINCRONIZADA' : '○ MODO MANUAL INTERACTIVO'}
            </span>
          </div>
        </div>

        {/* Right Side: Definite Time Display */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex flex-col items-end text-right">
            <span className="text-white text-xs font-black font-sans uppercase tracking-wider">Hora Oficial México</span>
            <span className="text-[10px] text-[#B5F000] font-mono tracking-widest mt-0.5">16:00 (4:00 PM) DEFINITIVA</span>
          </div>
        </div>
      </header>

      {/* Definitive automated time. No custom clock configuration drawer allowed. */}

      {/* CORE RENDER FRAME FOR VIEWS */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        
        {/* ==================================== */}
        {/*   1. SYNCHRONIZED BROADCAST ROUTER   */}
        {/* ==================================== */}
        {mode === 'SYNC' && (
          <>
            {/* STATE 1.1: COUNTDOWN SCREEN (Pre-draft waiting room) */}
            {syncState === 'WAITING' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center select-none"
              >
                {/* Visual live ticker badge */}
                <div className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-[#B5F000]/10 border border-[#B5F000]/30 rounded">
                  <Clock className="w-4 h-4 text-[#B5F000] animate-spin-slow" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5F000]">
                    SALA DE ESPERA • SEÑAL EN TRANSMISIÓN
                  </span>
                </div>

                {/* Subtitle / Day Display */}
                <span className="text-white/40 text-xs font-mono uppercase tracking-[0.4em] block mb-2">
                  EL SORTEO OFICIAL COMENZARÁ EN EN VIVO
                </span>

                {/* GIGANTIC DIGITAL HIGH-TECH CLOCK */}
                <div className="mb-8 font-sans font-black tracking-tighter text-6xl md:text-9xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent flex justify-center items-center gap-2 select-none">
                  {formatCountdown(diffMs)}
                </div>

                {/* Target Date Details Table */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-xs font-mono text-white/60 bg-white/5 border border-white/10 px-5 py-3 rounded">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#B5F000]" />
                    <span>Fecha: <span className="text-white font-bold">{targetDate}</span></span>
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#3D56F5]" />
                    <span>Hora Oficial: <span className="text-white font-bold">{targetTime} (4:00 PM)</span></span>
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div className="text-[#08C84C] font-black uppercase">
                    Señal Sincronizada Activa
                  </div>
                </div>

                {/* Informative text */}
                <p className="text-white/50 text-xs md:text-sm max-w-md mb-8 leading-relaxed">
                  No cierres esta pestaña. En cuanto el temporizador llegue a cero, la transmisión y asignación de equipos comenzará <span className="text-white font-black underline">automáticamente en tiempo real</span> para ti y todos los demás participantes en el mismo segundo exacto.
                </p>

                {/* Sharing trigger buttons container */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleCopyShareLink}
                    className="px-6 py-3.5 bg-[#B5F000] text-black font-black text-xs tracking-widest uppercase transition-all hover:scale-103 duration-250 flex items-center gap-2 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4.5 h-4.5 text-black" />
                        ¡URL Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4.5 h-4.5 text-black" />
                        Compartir Sorteo con Amigos
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STATE 1.2: SYNCHRONIZED AUTOMATIC LIVE DRAW */}
            {syncState === 'LIVE_DRAFT' && (
              <DrawScreen
                isSyncedMode={true}
                currentPotId={activeLivePotId}
                assignments={liveAssignmentsList}
                remainingTeamsSynced={remainingTeamsSynced}
                liveParticipantName={activeParticipantName}
                deterministicWinner={activeDeterministicWinner}
                liveStepProgressMs={liveStepProgressMs}
                activeLiveStepIdx={activeLiveStepIdx}
                onAddAssignment={() => {}} // Synced mode operates without side effects
                onPhaseComplete={() => {}} // Transitions happen automatically when stepping past indices
              />
            )}

            {/* STATE 1.3: DETERMINISTIC REPRODUCIBLE FINAL SCOREBOARD */}
            {syncState === 'FINISHED' && (
              <ResultsScreen
                assignments={deterministicAssignments}
                onRestart={() => {
                  window.location.reload();
                }}
              />
            )}
          </>
        )}
      </main>

      {/* FOOTER MASTER BAR */}
      <footer className="relative z-10 w-full py-6 select-none border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-white/30 text-[9px] font-mono uppercase tracking-widest gap-2">
          <span>SORTEO MUNDIAL 2026 • TRANSMISIÓN EN TIEMPO REAL SINCRONIZADA</span>
          <span>FIFA COPA MUNDIAL 2026™ SIMULADOR • IGNIS SPORTS BROADCASTS</span>
        </div>
      </footer>
    </div>
  );
}
