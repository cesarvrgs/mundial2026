import React, { useRef, useState } from 'react';
import { Assignment, getFlagUrl } from '../types';
import { 
  Trophy, 
  Copy, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  Sparkles, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface ResultsScreenProps {
  assignments: Assignment[];
  onRestart: () => void;
}

export default function ResultsScreen({ assignments, onRestart }: ResultsScreenProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // Copy Results to Clipboard
  const handleCopyResults = async () => {
    try {
      let text = "SORTEO MUNDIAL 2026 - RESULTADOS OFICIALES\n\n";
      text += "Participante\tSorpresa (Bombo C)\tIntermedio (Bombo B)\tFavorito (Bombo A)\n";
      
      assignments.forEach((a) => {
        const cName = a.bomboC?.name || '-';
        const bName = a.bomboB?.name || '-';
        const aName = a.bomboA?.name || '-';
        text += `${a.participant}\t${cName}\t${bName}\t${aName}\n`;
      });

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar los resultados:", err);
    }
  };

  // Download CSV
  const handleDownloadCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Participante,Sorpresa,Intermedio,Favorito\n";
    
    assignments.forEach((a) => {
      const cName = a.bomboC?.name || '';
      const bName = a.bomboB?.name || '';
      const aName = a.bomboA?.name || '';
      const row = [a.participant, cName, bName, aName]
        .map(val => `"${val.replace(/"/g, '""')}"`)
        .join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Resultado_Sorteo_Mundial_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export beautiful sports graphic board as PNG using html2canvas
  const handleDownloadPng = async () => {
    if (!tableRef.current || isExportingPng) return;
    
    try {
      setIsExportingPng(true);
      const element = tableRef.current;
      
      // Delay fraction to ensure fonts & images render perfectly
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // High DPI capture
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const tableWrapper = clonedDoc.getElementById('results_tv_panel');
          if (tableWrapper) {
            tableWrapper.style.padding = '40px';
            tableWrapper.style.borderRadius = '0px'; // Consistent block design
            tableWrapper.style.border = '2px solid rgba(255,255,255,0.15)';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'Sorteo_Mundial_2026_Resultados.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar PNG:", err);
      alert("Hubo un problema temporal al generar la imagen PNG. Pruebe descargando como CSV o copiando los datos.");
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 select-none">
      
      {/* EXPORT OPTIONS BAR & ACTIONS PANEL */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 mt-2 border-b border-white/10 pb-6">
        <div>
          <span className="text-[#08C84C] text-[10px] font-mono tracking-[0.25em] font-black uppercase bg-[#08C84C]/10 border border-[#08C84C]/30 px-3 py-1 block w-fit mb-2">
            CONCLUIDO • DATOS CERTIFICADOS
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#EDEDED] font-sans tracking-tight uppercase">
            RESULTADOS OFICIALES
          </h1>
        </div>

        {/* Action Widgets - ESPN styled buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* COPY */}
          <button
            onClick={handleCopyResults}
            id="btn_copy"
            className="flex items-center gap-2.5 px-6 py-4 bg-black hover:bg-white/[0.08] text-white/95 rounded text-xs font-black tracking-widest uppercase border border-white/20 transition-all duration-200 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#08C84C]" />
                Copiar Resultados ✓
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white/60" />
                Copiar Resultados
              </>
            )}
          </button>

          {/* DOWNLOAD DATA (CSV/Excel) */}
          <button
            onClick={handleDownloadCsv}
            id="btn_download_csv"
            className="flex items-center gap-2.5 px-6 py-4 bg-[#08C84C] text-black font-black hover:bg-[#08C84C]/90 rounded text-xs tracking-widest uppercase transition-all duration-300 shadow-xl active:scale-97 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-black" />
            Descargar Excel (CSV)
          </button>
        </div>
      </div>

      {/* RENDER MASTER TRANSMISSION TV BOARD (Saves as PNG) */}
      <div 
        ref={tableRef} 
        id="results_tv_panel" 
        className="bg-black border border-white/10 p-5 md:p-10 relative"
      >
        {/* Right border visual highlight */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E10000] via-[#3D56F5] to-[#08C84C]" />

        {/* Head branding banner inside the canvas screenshot area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* ESPN / DAZN TV look badge */}
            <div className="bg-[#E10000] px-4 py-2 text-black font-black text-xl tracking-tighter leading-none select-none">
              LIVE
            </div>
            <div>
              <h2 className="text-2xl font-black font-sans text-white tracking-tight leading-none uppercase">
                Sorteo Mundial 2026
              </h2>
              <span className="text-[10px] text-white/40 font-mono tracking-widest block uppercase mt-1">
                ASIGNACIONES CONFIRMADAS • FÓRMULA OFICIAL DE CLASIFICACIÓN
              </span>
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <span className="text-[9px] text-[#EDEDED]/50 font-mono uppercase tracking-widest block">SISTEMA INTEGRAL</span>
            <span className="text-xs font-mono font-bold text-[#08C84C] uppercase tracking-wider block">16 Participantes Completados</span>
          </div>
        </div>

        {/* BROADCAST RESULTS TABLE */}
        <div className="overflow-x-auto border border-white/10 rounded-none bg-black">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Table Column Category Header */}
              <tr className="bg-black text-[10px] sm:text-xs font-mono tracking-widest uppercase border-b border-white/15 text-white/50">
                <th className="py-4.5 px-4 font-bold border-r border-white/10">Participante</th>
                <th className="py-4.5 px-4 border-r border-white/10" style={{ color: '#08C84C' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#08C84C]" />
                    01. Sorpresa (C)
                  </div>
                </th>
                <th className="py-4.5 px-4 border-r border-white/10" style={{ color: '#3D56F5' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#3D56F5]" />
                    02. Intermedio (B)
                  </div>
                </th>
                <th className="py-4.5 px-4" style={{ color: '#E10000' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#E10000]" />
                    03. Favorito (A)
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/10 text-sm font-sans">
              {assignments.map((as, index) => (
                <tr 
                  key={as.participant}
                  className="bg-black hover:bg-white/[0.03] transition-colors"
                >
                  {/* Participant Name Column */}
                  <td className="py-3.5 px-4 font-black border-r border-white/10 text-[#EDEDED] uppercase tracking-wide">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30 font-mono tracking-tight w-5">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {as.participant}
                    </div>
                  </td>

                  {/* Surprise (Bombo C) Column */}
                  <td className="py-3.5 px-4 border-r border-white/10">
                    {as.bomboC ? (
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={getFlagUrl(as.bomboC.code)} 
                          alt={as.bomboC.name}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-8 h-5.5 object-cover rounded shadow border border-white/15 flex-shrink-0"
                        />
                        <span className="text-white font-semibold uppercase text-xs">
                          {as.bomboC.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </td>

                  {/* Intermediate (Bombo B) Column */}
                  <td className="py-3.5 px-4 border-r border-white/10">
                    {as.bomboB ? (
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={getFlagUrl(as.bomboB.code)} 
                          alt={as.bomboB.name}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-8 h-5.5 object-cover rounded shadow border border-white/15 flex-shrink-0"
                        />
                        <span className="text-white font-semibold uppercase text-xs">
                          {as.bomboB.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </td>

                  {/* Favorite (Bombo A) Column */}
                  <td className="py-3.5 px-4">
                    {as.bomboA ? (
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={getFlagUrl(as.bomboA.code)} 
                          alt={as.bomboA.name}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-8 h-5.5 object-cover rounded shadow border border-white/15 flex-shrink-0"
                        />
                        <span className="text-white font-semibold uppercase text-xs">
                          {as.bomboA.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom scoreboard footer block */}
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/30 text-[9px] font-mono uppercase tracking-widest gap-2">
          <span>Sorteo oficial completo sin duplicados de países • Composición certificada</span>
          <span className="text-right">Señal internacional - FIFA World Cup 2026™ simulator</span>
        </div>
      </div>
    </div>
  );
}
