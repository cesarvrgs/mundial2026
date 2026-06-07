import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Team, 
  Pot, 
  PotId, 
  POTS, 
  Assignment, 
  getFlagUrl, 
  PARTICIPANTS 
} from '../types';
import { Trophy, HelpCircle, Users, CheckCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface DrawScreenProps {
  currentPotId: PotId;
  assignments: Assignment[];
  onAddAssignment: (participant: string, team: Team, potId: PotId) => void;
  onPhaseComplete: () => void;
  isSyncedMode?: boolean;
  activeLiveStepIdx?: number;
  liveStepProgressMs?: number;
  deterministicWinner?: Team | null;
  remainingTeamsSynced?: Team[];
  liveParticipantName?: string | null;
}

export default function DrawScreen({ 
  currentPotId, 
  assignments, 
  onAddAssignment, 
  onPhaseComplete,
  isSyncedMode = false,
  activeLiveStepIdx = 0,
  liveStepProgressMs = 0,
  deterministicWinner = null,
  remainingTeamsSynced = [],
  liveParticipantName = null
}: DrawScreenProps) {
  const pot = POTS[currentPotId];
  
  const getAssignmentsCountForPot = (pId: PotId) => {
    return assignments.filter(a => {
      if (pId === 'C') return !!a.bomboC;
      if (pId === 'B') return !!a.bomboB;
      if (pId === 'A') return !!a.bomboA;
      return false;
    }).length;
  };

  const currentStep = getAssignmentsCountForPot(currentPotId);
  const currentParticipant = currentStep < PARTICIPANTS.length ? PARTICIPANTS[currentStep] : null;

  const getAssignedTeamsInCurrentPot = (): Team[] => {
    return assignments
      .map(a => {
        if (currentPotId === 'C') return a.bomboC;
        if (currentPotId === 'B') return a.bomboB;
        if (currentPotId === 'A') return a.bomboA;
        return undefined;
      })
      .filter((t): t is Team => !!t);
  };

  const assignedTeams = getAssignedTeamsInCurrentPot();
  const assignedTeamNames = new Set(assignedTeams.map(t => t.name));
  
  const remainingTeams = pot.teams.filter(t => !assignedTeamNames.has(t.name));

  // Synced mode visual overriders
  const isCmpSpinning = isSyncedMode ? (liveStepProgressMs < 4500) : false; // Manual handles state separately
  const isCmpCelebration = isSyncedMode ? (liveStepProgressMs >= 4500) : false; // Manual handles state separately
  
  const cmpParticipant = isSyncedMode ? liveParticipantName : currentParticipant;
  const cmpRemainingTeams = isSyncedMode ? remainingTeamsSynced : remainingTeams;
  const cmpCurrentStep = isSyncedMode ? (activeLiveStepIdx % 16) : currentStep;
  const cmpWinner = isSyncedMode ? deterministicWinner : null;

  // Let's calculate deterministic spinning names during active live spin
  const spinIndex = Math.floor(liveStepProgressMs / 150) % (pot.teams.length || 1);
  const spinTeam = pot.teams[spinIndex] || pot.teams[0];
  const cmpSpinningName = isSyncedMode ? (spinTeam ? spinTeam.name : "...") : "";
  const cmpSpinningCode = isSyncedMode ? (spinTeam ? spinTeam.code : "") : "";

  // Animations & State variables for manual mode
  const [isManualSpinning, setIsManualSpinning] = useState<boolean>(false);
  const [spinningName, setSpinningName] = useState<string>("?");
  const [spinningCode, setSpinningCode] = useState<string>("");
  const [lastWinner, setLastWinner] = useState<Team | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const spinIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current);
      }
    };
  }, []);

  const handleStartDraw = () => {
    if (isManualSpinning || !currentParticipant || remainingTeams.length === 0) return;

    setIsManualSpinning(true);
    setLastWinner(null);
    setShowCelebration(false);

    // Pick visual winner in advance
    const randomIndex = Math.floor(Math.random() * remainingTeams.length);
    const winnerTeam = remainingTeams[randomIndex];

    // Total duration of spin: 2.8 seconds for optimal television tension
    const spinDuration = 2800;
    let tickSpeed = 50;
    let elapsed = 0;

    const allPotTeams = pot.teams;

    const performSpinTick = () => {
      elapsed += tickSpeed;
      if (elapsed >= spinDuration) {
        if (spinIntervalRef.current) {
          window.clearInterval(spinIntervalRef.current);
        }

        setSpinningName(winnerTeam.name);
        setSpinningCode(winnerTeam.code);
        setIsManualSpinning(false);
        setLastWinner(winnerTeam);
        setShowCelebration(true);

        // Update assignments list
        onAddAssignment(currentParticipant, winnerTeam, currentPotId);
      } else {
        const tempIndex = Math.floor(Math.random() * allPotTeams.length);
        const tempTeam = allPotTeams[tempIndex];
        setSpinningName(tempTeam.name);
        setSpinningCode(tempTeam.code);

        // Physics-driven slow-down curve mimicking physical gears
        if (elapsed > spinDuration * 0.75) {
          tickSpeed += 50;
        } else if (elapsed > spinDuration * 0.5) {
          tickSpeed += 20;
        }

        if (spinIntervalRef.current) {
          window.clearInterval(spinIntervalRef.current);
        }
        spinIntervalRef.current = window.setInterval(performSpinTick, tickSpeed);
      }
    };

    spinIntervalRef.current = window.setInterval(performSpinTick, tickSpeed);
  };

  // Get stylized theme parameters dynamically based on current selected Pot
  const getThemeStyles = (id: PotId) => {
    switch (id) {
      case 'C':
        return {
          title: "BOMBO C — SORPRESAS",
          subtitle: "Inesperado • Revelación • Equipos sorpresa",
          mainColor: "#08C84C", // Verde intenso
          secondaryColor: "#B5F000", // Verde lima
          accentColor: "#DDF23A", // Amarillo verdoso
          bgGradient: "from-[#08C84C]/25 to-[#B5F000]/10",
          shadowColor: "rgba(8, 200, 76, 0.3)",
          textHeading: "text-[#B5F000]"
        };
      case 'B':
        return {
          title: "BOMBO B — INTERMEDIOS",
          subtitle: "Competitividad • Equilibrio • Aspirantes",
          mainColor: "#3D56F5", // Azul eléctrico
          secondaryColor: "#3490DC", // Azul brillante
          accentColor: "#63DCC2", // Turquesa
          bgGradient: "from-[#3D56F5]/25 to-[#3490DC]/10",
          shadowColor: "rgba(61, 86, 245, 0.3)",
          textHeading: "text-[#3490DC]"
        };
      case 'A':
        return {
          title: "BOMBO A — FAVORITOS",
          subtitle: "Poder • Prestigio • Favoritos al título",
          mainColor: "#E10000", // Rojo intenso
          secondaryColor: "#6A00FF", // Morado eléctrico
          accentColor: "#E91E63", // Magenta
          bgGradient: "from-[#E10000]/25 to-[#6A00FF]/15",
          shadowColor: "rgba(225, 0, 0, 0.3)",
          textHeading: "text-[#E10000]"
        };
    }
  };

  const themeStyles = getThemeStyles(currentPotId);
  
  // Unify rendering variables
  const renderingIsSpinning = isSyncedMode ? isCmpSpinning : isManualSpinning;
  const renderingShowCelebration = isSyncedMode ? isCmpCelebration : showCelebration;
  const renderingWinner = isSyncedMode ? cmpWinner : lastWinner;
  const renderingSpinningName = isSyncedMode ? cmpSpinningName : spinningName;
  const renderingSpinningCode = isSyncedMode ? cmpSpinningCode : spinningCode;
  const renderingParticipant = isSyncedMode ? cmpParticipant : currentParticipant;
  const renderingRemainingTeams = isSyncedMode ? cmpRemainingTeams : remainingTeams;
  const renderingCurrentStep = isSyncedMode ? cmpCurrentStep : currentStep;

  const isPotComplete = isSyncedMode ? (renderingCurrentStep === PARTICIPANTS.length) : (currentStep === PARTICIPANTS.length);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-[calc(100vh-140px)] justify-between select-none">
      
      {/* PROFESSIONAL TV BROADCAST MAIN HEADER BAR */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#000000] border-y border-white/10 p-5 rounded-none relative">
        {/* Subtle left solid color block of the active pot to emulate TV streaming graphics */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: themeStyles.mainColor }} />
        
        <div>
          <span className="text-white/40 text-[10px] font-mono tracking-[0.25em] block uppercase mb-1">
            MECÁNICA OFICIAL DE TRANSMISIÓN
          </span>
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-xl md:text-2xl font-black font-sans text-[#EDEDED] uppercase tracking-tight">
              {themeStyles.title}
            </h2>
            <span className="text-xs font-mono opacity-60" style={{ color: themeStyles.secondaryColor }}>
              [{themeStyles.subtitle}]
            </span>
          </div>
        </div>

        {/* Dynamic State steps indices */}
        <div className="flex items-center gap-1.5 md:self-center">
          {['C', 'B', 'A'].map((pId) => {
            const isCurrent = currentPotId === pId;
            const isCompleted = getAssignmentsCountForPot(pId as PotId) === PARTICIPANTS.length;
            const stepStyles = getThemeStyles(pId as PotId);
            return (
              <div 
                key={pId}
                className={`py-1.5 px-3 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all duration-300 ${
                  isCurrent 
                    ? 'text-black font-black' 
                    : isCompleted 
                      ? 'border-white/10 text-white/30 bg-transparent line-through' 
                      : 'border-white/5 text-white/15'
                }`}
                style={{
                  backgroundColor: isCurrent ? stepStyles.mainColor : 'transparent',
                  borderColor: isCurrent ? stepStyles.mainColor : undefined,
                  color: isCurrent ? '#000000' : undefined
                }}
              >
                {pId === 'C' ? 'C - Sorpresas' : pId === 'B' ? 'B - Intermedios' : 'A - Favoritos'}
              </div>
            );
          })}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
          <span className="text-white/40 text-[10px] font-mono">PROGRESO BOMBOS</span>
          <span className="text-[#EDEDED] text-base font-mono font-black" style={{ color: themeStyles.mainColor }}>
            {renderingCurrentStep} / {PARTICIPANTS.length} COMPLETADOS
          </span>
        </div>
      </div>

      {/* PHASE COMPLETE TRANSITION SCREEN */}
      {isPotComplete ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center items-center text-center py-12 px-6"
        >
          <div className="w-16 h-16 rounded mb-5 flex items-center justify-center border-t-2" style={{ borderColor: themeStyles.mainColor, backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Trophy className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight text-[#EDEDED] mb-3 uppercase">
            BOMBO {currentPotId === 'C' ? 'SORPRESAS' : currentPotId === 'B' ? 'INTERMEDIOS' : 'FAVORITOS'} COMPLETADO
          </h1>
          <p className="text-white/60 text-sm max-w-md mb-8">
            Los 16 participantes ya tienen asignado un equipo correspondiente a esta categoría.
          </p>

          <button
            onClick={onPhaseComplete}
            id="btn_continue_phase"
            className="group relative w-full py-4 bg-gradient-to-r text-black font-black font-sans text-xs tracking-[0.2em] rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-103 cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeStyles.mainColor}, ${themeStyles.secondaryColor})`,
              boxShadow: `0 8px 30px ${themeStyles.shadowColor}`
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 uppercase">
              {currentPotId === 'C' && "CONTINUAR A INTERMEDIOS (BOMBO B)"}
              {currentPotId === 'B' && "CONTINUAR A FAVORITOS (BOMBO A)"}
              {currentPotId === 'A' && "Ver Resultados Finales"}
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      ) : (
        
        /* THE MAIN INTERACTIVE GRID (NO EXTRA DECORATIONS, NO NOISE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
          
          {/* COLUMN 1: TEAMS LEFT (Solid Dark Glass Card) */}
          <div className="lg:col-span-3 bg-black border border-white/10 p-5 rounded-none flex flex-col h-[460px] lg:h-[520px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" style={{ color: themeStyles.mainColor }} />
                RESTA EN BOMBO ({renderingRemainingTeams.length})
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {renderingRemainingTeams.map((team) => (
                  <motion.div
                    key={team.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 p-2 bg-[#000000] border border-white/5 text-white/90"
                  >
                    <img 
                      src={getFlagUrl(team.code)} 
                      alt={team.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-5.5 object-cover rounded shadow border border-white/10"
                    />
                    <span className="text-xs font-sans font-medium tracking-wide">{team.name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 2: CENTER STAGE LOTTERY DRAW (Grip & Glow on Draw Select Trigger) */}
          <div className="lg:col-span-6 flex flex-col justify-center items-center text-center">
            
            {/* Participant Name Header Plate */}
            <div className="mb-6 w-full max-w-md">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-[0.25em] block mb-1">
                SORTEANDO AHORA A
              </span>
              <div 
                className="relative px-6 py-3 border bg-[#000000]"
                style={{ borderColor: `${themeStyles.mainColor}60` }}
              >
                {/* Accent vertical light bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: themeStyles.mainColor }} />
                <h3 className="text-2.5xl font-black tracking-tight text-[#EDEDED] font-sans uppercase">
                  {renderingParticipant}
                </h3>
                <div className="absolute right-0 top-0 bottom-0 w-1" style={{ backgroundColor: themeStyles.secondaryColor }} />
              </div>
            </div>

            {/* TV GRAPHIC DRAW CARD (ROUNDED SELECTION PRESETS) */}
            <div 
              className={`w-full max-w-sm aspect-[4/5] bg-black rounded-2xl relative overflow-hidden mb-6 transition-all duration-300 transform ${
                renderingShowCelebration ? 'scale-102 border-2' : 'border'
              }`}
              style={{
                borderColor: renderingShowCelebration ? themeStyles.mainColor : 'rgba(255, 255, 255, 0.12)',
                boxShadow: renderingShowCelebration ? `0 12px 40px ${themeStyles.shadowColor}` : '0 10px 40px rgba(0,0,0,0.7)'
              }}
            >
              <div className="w-full h-full flex flex-col justify-between p-6 relative z-10">
                <div className="flex items-center justify-between">
                  {/* Subtle top HUD strip */}
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Módulo de Selección
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase py-0.5 px-2 rounded" style={{ backgroundColor: `${themeStyles.mainColor}20`, color: themeStyles.mainColor }}>
                    BOMBO {currentPotId}
                  </span>
                </div>

                {/* Spinner Central Node */}
                <div className="my-auto py-6">
                  <AnimatePresence mode="wait">
                    {!renderingIsSpinning && renderingWinner ? (
                      /* WINNER BRAND DISPLAY CONTAINER */
                      <motion.div
                        key="winner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex flex-col items-center"
                      >
                        {/* Selected Flag with corresponding high tech glow */}
                        <div className="relative mb-6">
                          <div 
                            className="absolute -inset-1 rounded-lg filter blur-md transition-all duration-300"
                            style={{ backgroundColor: themeStyles.mainColor }}
                          />
                          <img 
                            src={getFlagUrl(renderingWinner.code)} 
                            alt={renderingWinner.name}
                            referrerPolicy="no-referrer"
                            className="w-36 h-22 object-cover rounded-lg relative z-10 border-2 border-[#EDEDED]"
                          />
                        </div>
                        <h4 className="text-3.5xl font-black text-[#EDEDED] mb-1.5 tracking-tight uppercase">
                          {renderingWinner.name}
                        </h4>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: themeStyles.accentColor }}>
                          ASIGNACIÓN CONFIRMADA
                        </span>
                      </motion.div>
                    ) : renderingIsSpinning ? (
                      /* ACTIVE TELEVISED FAST ACTION WHEEL SCROLL */
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-28 h-18 rounded border overflow-hidden flex items-center justify-center mb-5 bg-[#000]" style={{ borderColor: themeStyles.mainColor }}>
                          {renderingSpinningCode ? (
                            <img 
                              src={getFlagUrl(renderingSpinningCode)} 
                              alt="Televised selector"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover scale-102"
                            />
                          ) : (
                            <HelpCircle className="w-10 h-10 text-white/10 animate-pulse" />
                          )}
                        </div>
                        
                        <h4 
                          className="text-2.5xl font-extrabold text-white tracking-tight uppercase"
                          style={{
                            color: themeStyles.accentColor
                          }}
                        >
                          {renderingSpinningName}
                        </h4>
                        <span className="text-[10px] uppercase text-white/30 font-mono tracking-widest mt-2 animate-pulse">
                          ORDENANDO PAÍSES...
                        </span>
                      </motion.div>
                    ) : (
                      /* INDETERMINATE/READY PLACEHOLDER */
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-white/30">
                          <HelpCircle className="w-10 h-10 stroke-[1.5]" />
                        </div>
                        <p className="text-white/55 text-xs max-w-[240px] leading-relaxed">
                          Presione abajo para asignar aleatoriamente el equipo de este bombo para <span className="text-white font-semibold">{renderingParticipant}</span>.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Micro Progress Bar overlayed bottom */}
                <div className="h-1 w-full bg-white/5 rounded-none overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      backgroundColor: themeStyles.mainColor,
                      width: `${(renderingCurrentStep / PARTICIPANTS.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ACTION DIRECT DRAW CALL (HIGH CONTRAST BUTTON, NO BASIC OUTLINE) */}
            <div className="w-full max-w-sm">
              {isSyncedMode ? (
                <div 
                  className="w-full py-4.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-[10px] tracking-wider flex flex-col justify-center items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#E10000] rotate-45 animate-pulse" />
                    <span className="uppercase font-black text-white/50 tracking-widest">TRANSMISIÓN EN VIVO SINCRONIZADA</span>
                  </div>
                  <span className="text-[#08C84C] font-black text-xs uppercase animate-pulse tracking-wide">
                    PRÓXIMO PASO EN {Math.max(0, Math.ceil((10000 - liveStepProgressMs) / 1000))} SEG
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleStartDraw}
                  disabled={renderingIsSpinning}
                  id="btn_roll_draw"
                  className={`w-full py-4.5 rounded-lg text-black font-extrabold text-[11px] tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden select-none cursor-pointer ${
                    renderingIsSpinning 
                      ? 'bg-white/20 cursor-not-allowed opacity-50 scale-98 text-white' 
                      : 'bg-white hover:scale-102 active:scale-97'
                  }`}
                  style={{
                    boxShadow: renderingIsSpinning ? 'none' : `0 12px 30px ${themeStyles.shadowColor}`
                  }}
                >
                  <RefreshCw className={`w-4 h-4 text-black ${renderingIsSpinning ? 'animate-spin text-white' : ''}`} />
                  <span className="uppercase">
                    {renderingIsSpinning ? "SORTEANDO SIGUIENTE..." : "SORTEAR SIGUIENTE EQUIPO"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full hover:animate-shimmer" />
                </button>
              )}
              
              <p className="text-white/30 text-[9px] mt-2.5 font-mono">
                SISTEMA DETERMINÍSTICO • SIN EQUIPOS DUPLICADOS • ASIGNACIÓN ÚNICA
              </p>
            </div>

          </div>

          {/* COLUMN 3: SELECTED HISTORY */}
          <div className="lg:col-span-3 bg-black border border-white/10 p-5 rounded-none flex flex-col h-[460px] lg:h-[520px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" style={{ color: themeStyles.mainColor }} />
                ASIGNACIONES ESTA FASE ({assignedTeams.length})
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {assignments.map((as) => {
                const team = currentPotId === 'C' ? as.bomboC : currentPotId === 'B' ? as.bomboB : as.bomboA;
                if (!team) return null;
                return (
                  <motion.div
                    key={as.participant}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-[#050505] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[9px] text-white/30 font-mono tracking-widest block uppercase">PARTICIPANTE</span>
                      <span className="text-xs font-black text-[#EDEDED] font-sans">{as.participant}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black px-2 py-1 border border-white/10 rounded">
                      <img 
                        src={getFlagUrl(team.code)} 
                        alt={team.name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-4.5 object-cover border border-white/10"
                      />
                      <span className="text-[11px] text-white font-sans font-semibold">{team.name}</span>
                    </div>
                  </motion.div>
                );
              })}
              {assignedTeams.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/15 p-4">
                  <HelpCircle className="w-8 h-8 stroke-[1] mb-2 text-white/10" />
                  <p className="text-[10px] leading-relaxed">No hay registros aún. Presione "Sortear Siguiente Equipo" para iniciar.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* COMPACT SOLID BURST PARTICLES CELEBRATION (NO GRAPHS BLUR) */}
      {showCelebration && lastWinner && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i * 360) / 20;
            const distance = 80 + Math.random() * 140;
            const delay = Math.random() * 0.1;
            const x = Math.cos((angle * Math.PI) / 180) * distance;
            const y = Math.sin((angle * Math.PI) / 180) * distance;
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.1, 0.7, 0],
                  x: x,
                  y: y,
                  rotate: [0, 180],
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 1.4, delay: delay, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-none"
                style={{
                  backgroundColor: i % 3 === 0 ? themeStyles.mainColor : i % 3 === 1 ? themeStyles.secondaryColor : themeStyles.accentColor
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
