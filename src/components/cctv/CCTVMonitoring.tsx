import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CCTVCamera, SecurityIncident } from '../../types';
import {
  Cctv,
  Camera,
  Maximize2,
  Minimize2,
  Eye,
  ShieldAlert,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Move,
  Clock,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const CCTVMonitoring: React.FC = () => {
  const {
    cctvCameras,
    activeCameraId,
    setActiveCameraId,
    toggleMotionAlert,
    reportIncident,
    currentUser,
    hasPermission,
    showToast
  } = useApp();

  const [fullscreenCamId, setFullscreenCamId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<SecurityIncident['severity']>('medium');
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCamera = cctvCameras.find((c) => c.id === (fullscreenCamId || activeCameraId)) || cctvCameras[0];

  const handleLogCameraIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;

    reportIncident({
      location: activeCamera.location,
      severity: incidentSeverity,
      reportedBy: `${currentUser.name} (${currentUser.role})`,
      description: `[CCTV TAG ${activeCamera.name}] ${incidentDesc}`,
      cctvCameraId: activeCamera.id,
    });

    setIncidentModalOpen(false);
    setIncidentDesc('');
  };

  const currentDateStr = new Date().toISOString().slice(0, 10);
  const currentTimeStr = new Date().toLocaleTimeString();

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & Surveillance Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Cctv className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              CCTV Surveillance & High-Definition Matrix
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              8 Feeds Live Streaming
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24/7 synchronized monitoring covering Cashier Tills, VIP Lounge, Entrance Gate, Butchery, Hotel Lobby, and Perimeter.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              toggleMotionAlert(activeCamera.id);
              showToast(`Toggled motion simulation for ${activeCamera.name}`, 'info');
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition cursor-pointer"
          >
            Simulate Motion Alert
          </button>
          <button
            onClick={() => setIncidentModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Tag Security Incident</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 8 Camera Feeds Matrix or Fullscreen View */}
      {fullscreenCamId ? (
        /* Fullscreen View */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-white text-sm">{activeCamera.name}</span>
              <span className="text-slate-400">({activeCamera.location})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1.0, z - 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-amber-400">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFullscreenCamId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer ml-2"
              >
                Exit Fullscreen Grid
              </button>
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-500/50 shadow-2xl flex items-center justify-center">
            {/* Camera Simulated Video Feed Background with Scanline effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeCamera.thumbnailColor} opacity-70`} />
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none"
            />

            {/* Simulated Live View Wireframe & Motion Target Box */}
            <div className="relative z-10 text-center space-y-2 select-none">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400/40 mx-auto flex items-center justify-center animate-spin">
                <div className="w-16 h-16 rounded-full border border-cyan-400/60 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-cyan-400/70" />
                </div>
              </div>
              <div className="font-mono text-cyan-300 text-sm font-semibold tracking-widest">
                LIVE FEED STREAMING • {activeCamera.fps} FPS • {activeCamera.resolution}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Zone: {activeCamera.zone} | Camera IP: 192.168.10.{activeCamera.id.split('-')[1]} | Encryption: AES-256
              </p>
            </div>

            {/* OSD Timecode & Watermark Overlays */}
            <div className="absolute top-4 left-4 z-20 font-mono text-xs text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>REC • {currentDateStr} {currentTimeStr}</span>
            </div>

            <div className="absolute top-4 right-4 z-20 font-mono text-xs text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              {activeCamera.name}
            </div>

            {activeCamera.motionAlert && (
              <div className="absolute bottom-4 left-4 z-20 font-mono text-xs bg-rose-950/90 text-rose-300 border border-rose-500 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>MOTION DETECTION TARGET LOCKED</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Feed 8 Cameras Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cctvCameras.map((cam) => {
            const isSelected = activeCameraId === cam.id;

            return (
              <div
                key={cam.id}
                onClick={() => setActiveCameraId(cam.id)}
                className={`group rounded-2xl overflow-hidden border transition-all cursor-pointer bg-slate-950 flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Camera Screen View */}
                <div className={`relative aspect-video bg-gradient-to-br ${cam.thumbnailColor} overflow-hidden p-3 flex flex-col justify-between`}>
                  {/* Scanline pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_3px] pointer-events-none opacity-40" />

                  {/* Top Bar on screen */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 text-slate-300">
                      {cam.resolution}
                    </span>
                  </div>

                  {/* Center Camera Icon & Reticle */}
                  <div className="relative z-10 text-center opacity-40 group-hover:opacity-70 transition">
                    <Camera className="w-7 h-7 mx-auto text-white" />
                  </div>

                  {/* Bottom OSD Bar */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 bg-slate-950/70 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                      {cam.location}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenCamId(cam.id);
                      }}
                      className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Expand to Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Motion alert badge overlay */}
                  {cam.motionAlert && (
                    <div className="absolute inset-0 bg-rose-950/30 border-2 border-rose-500 pointer-events-none flex items-center justify-center animate-pulse">
                      <span className="text-[10px] font-bold font-mono text-rose-300 bg-rose-950 px-2 py-1 rounded border border-rose-600">
                        MOTION DETECTED
                      </span>
                    </div>
                  )}
                </div>

                {/* Camera Card Footer */}
                <div className="p-3 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white truncate text-[11px]">{cam.name}</div>
                    <div className="text-[10px] text-slate-400">Zone: {cam.zone}</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMotionAlert(cam.id);
                    }}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-mono transition cursor-pointer ${
                      cam.motionAlert
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    {cam.motionAlert ? 'Alerting' : 'Test Motion'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incident Log Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLogCameraIncident}
            className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Snapshot Security Incident
              </h3>
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Camera Source:</span>
                <div className="font-bold text-white mt-0.5">{activeCamera.name}</div>
                <div className="text-[10px] text-slate-500">{activeCamera.location}</div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Severity Level</label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="low">Low (Suspicious Loitering)</option>
                  <option value="medium">Medium (Unruly Patron / Till Variance)</option>
                  <option value="high">High (Physical Disorder / Fight)</option>
                  <option value="critical">Critical (Breach / Theft / Armed)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Description & Surveillance Observations</label>
                <textarea
                  rows={3}
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Record timestamp details, person description, clothes, and dispatch actions..."
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Save CCTV Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
