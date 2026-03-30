import React, { useState, useRef, useEffect } from 'react';
import { analyzeRemodelProject, analyzeRemodelProjectFromText, fetchLivePricing, simulateRemodel, generateGrandmasterProposal, getRecommendedStyles, optimizeMaterials } from '../services/geminiService.ts';
import { BidData, MaterialItem, ProjectTier, AppSettings, ProjectSpecs, SpatialData, RemodelStyle, MaterialSuggestion } from '../types.ts';
import MetallicPanel from './MetallicPanel.tsx';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

interface BidWizardProps {
  onComplete: (bid: BidData) => void;
  initialBid?: BidData;
  settings: AppSettings;
  onConsultGrandMaster?: (context: any) => void;
  initialStep?: number;
  userLocation?: {lat: number, lon: number} | null;
}

const ThreeRoomView: React.FC<{ spatial: SpatialData }> = ({ spatial }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5); camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height); mountRef.current.appendChild(renderer.domElement);
    const h = parseFloat(spatial.ceilingHeight) || 8; const side = Math.sqrt(parseFloat(spatial.floorArea) || 100);
    const geometry = new THREE.BoxGeometry(side / 2, h / 2, side / 2);
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x3b82f6 })); scene.add(line);
    const animate = () => { requestAnimationFrame(animate); line.rotation.y += 0.01; renderer.render(scene, camera); };
    animate();
    return () => { renderer.dispose(); if (mountRef.current) mountRef.current.removeChild(renderer.domElement); };
  }, [spatial]);
  return <div ref={mountRef} className="w-full h-full" />;
};

const BidWizard: React.FC<BidWizardProps> = ({ onComplete, initialBid, settings, initialStep, userLocation }) => {
  const [step, setStep] = useState(initialStep || (initialBid ? 3 : 1));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Survey...');
  const [entryMode, setEntryMode] = useState<'OPTICS' | 'SYSTEMATIC'>('OPTICS');
  const [bid, setBid] = useState<Partial<BidData>>(initialBid || { id: Math.random().toString(36).substr(2, 9), clientName: '', projectName: '', projectTier: settings.defaultProjectTier, materials: [], laborCost: settings.defaultLaborCost, status: 'Draft', date: new Date().toLocaleDateString() });
  const [specs, setSpecs] = useState<ProjectSpecs>(initialBid?.textDescription || { roomType: 'Bathroom', width: '10', length: '12', height: '8', scope: 'Partial', notes: '' });
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [letterDraft, setLetterDraft] = useState('');
  const [recommendedStyles, setRecommendedStyles] = useState<RemodelStyle[]>([]);
  const [activeStyle, setActiveStyle] = useState<RemodelStyle>(settings.defaultRemodelStyle);
  const [showScanReminder, setShowScanReminder] = useState(true);
  const [materialSuggestions, setMaterialSuggestions] = useState<MaterialSuggestion[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); if (videoRef.current) videoRef.current.srcObject = s; } catch (e) { alert("Camera Denied"); } };
  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setBeforePreview(dataUrl);
      setBid({ ...bid, beforePhoto: dataUrl.split(',')[1] });
      if (videoRef.current.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const analyze = async () => {
    setLoading(true); setLoadingMsg("Synchronizing Site Dynamics...");
    try {
      const result = entryMode === 'OPTICS' && bid.beforePhoto ? await analyzeRemodelProject(bid.beforePhoto, specs.roomType, bid.projectTier!, settings.thinkingBudget) : await analyzeRemodelProjectFromText(specs, bid.projectTier!, settings.thinkingBudget);
      const tempBid = { ...bid, ...result, materials: result.suggestedMaterials };
      setBid(tempBid);
      
      setLoadingMsg("Intelligently Matching Styles...");
      const styles = await getRecommendedStyles(tempBid);
      setRecommendedStyles(styles);
      if (styles.length > 0) setActiveStyle(styles[0]);

      const mockup = await simulateRemodel(bid.beforePhoto || null, null, specs.notes, bid.projectTier!, styles[0] || activeStyle);
      setBid(prev => ({ ...prev, afterMockup: mockup }));
      
      setLoadingMsg("Running Forensic Material Audit...");
      const suggestions = await optimizeMaterials(tempBid.materials || [], specs, bid.projectTier!, styles[0] || activeStyle, settings.thinkingBudget);
      setMaterialSuggestions(suggestions);

      setStep(3);
    } finally { setLoading(false); }
  };

  const changeStyle = async (newStyle: RemodelStyle) => {
    setActiveStyle(newStyle);
    setLoading(true); setLoadingMsg(`Rendering ${newStyle} Projection...`);
    try {
      const mockup = await simulateRemodel(bid.beforePhoto || null, null, specs.notes, bid.projectTier!, newStyle);
      setBid(prev => ({ ...prev, afterMockup: mockup }));
      
      setLoadingMsg("Re-Auditing Materials for New Style...");
      const suggestions = await optimizeMaterials(bid.materials || [], specs, bid.projectTier!, newStyle, settings.thinkingBudget);
      setMaterialSuggestions(suggestions);
    } finally { setLoading(false); }
  };

  const handleApplySuggestion = (suggestion: MaterialSuggestion) => {
    const updatedMaterials = [...(bid.materials || [])];
    if (suggestion.type === 'Replacement' && suggestion.originalMaterial) {
      const idx = updatedMaterials.findIndex(m => m.name === suggestion.originalMaterial);
      if (idx !== -1) updatedMaterials[idx] = { ...suggestion.suggestedMaterial };
    } else {
      updatedMaterials.push(suggestion.suggestedMaterial);
    }
    setBid({ ...bid, materials: updatedMaterials });
    setMaterialSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const generateProposal = async () => {
    setLoading(true); setLoadingMsg("Architecting Final Bid...");
    try {
      const draft = await generateGrandmasterProposal(bid, "", settings.thinkingBudget);
      setLetterDraft(draft); setStep(4);
    } finally { setLoading(false); }
  };

  const handlePriceCheck = async (idx: number) => {
    const mat = bid.materials![idx];
    setLoading(true); setLoadingMsg(`Geolocating Suppliers for ${mat.name}...`);
    try {
      const data = await fetchLivePricing(mat.name, settings, userLocation);
      const updated = [...bid.materials!];
      updated[idx] = { 
        ...mat, 
        unitPrice: parseFloat(data.price.replace('$','')) || mat.unitPrice, 
        confidence: data.confidence, 
        sourceUrl: data.sourceUrl, 
        mapUrl: data.mapUrl,
        source: data.sourceName,
        amazonPrice: data.amazonPrice,
        auditDelta: data.auditDelta
      };
      setBid({ ...bid, materials: updated });
    } finally { setLoading(false); }
  };

  const renderStep = () => {
    if (loading) return <div className="py-24 text-center animate-pulse"><div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div><p className="text-xl font-black uppercase tracking-widest text-slate-800">{loadingMsg}</p></div>;
    
    switch (step) {
      case 1: return (
        <div className="space-y-8 animate-fadeIn">
          <input className="w-full bg-white/50 border-b-4 border-slate-300 p-6 text-3xl font-black uppercase outline-none" placeholder="Project Title" value={bid.projectName} onChange={e => setBid({...bid, projectName: e.target.value})} />
          <input className="w-full bg-white/50 border-b-4 border-slate-300 p-6 text-2xl font-bold outline-none" placeholder="Client Name" value={bid.clientName} onChange={e => setBid({...bid, clientName: e.target.value})} />
          <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest luxury-shadow">Begin Survey</button>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex bg-slate-200 p-1 rounded-2xl">
             <button onClick={() => setEntryMode('OPTICS')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] ${entryMode === 'OPTICS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Optic Scan</button>
             <button onClick={() => setEntryMode('SYSTEMATIC')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] ${entryMode === 'SYSTEMATIC' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Systematic</button>
          </div>
          {entryMode === 'OPTICS' ? (
            <div className="aspect-video bg-slate-100 rounded-[2.5rem] border-4 border-dashed border-slate-300 overflow-hidden relative flex items-center justify-center">
               {beforePreview ? <img src={beforePreview} className="w-full h-full object-cover" /> : <div className="text-center font-black text-slate-300 uppercase px-12">Site Photo or Blueprint Required</div>}
               <div className="absolute bottom-6 flex gap-2"><button onClick={startCamera} className="bg-slate-800 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase">Start Cam</button><button onClick={capture} className="bg-blue-600 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase">Capture</button></div>
               <video ref={videoRef} autoPlay playsInline className="hidden" /><canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
             <div className="p-8 bg-white/40 rounded-[2.5rem] border border-slate-200 grid grid-cols-2 gap-4">
                <input placeholder="Width" className="bg-white p-4 rounded-xl font-bold" value={specs.width} onChange={e => setSpecs({...specs, width: e.target.value})} />
                <input placeholder="Length" className="bg-white p-4 rounded-xl font-bold" value={specs.length} onChange={e => setSpecs({...specs, length: e.target.value})} />
             </div>
          )}
          <button onClick={analyze} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl">Reconstruct Reality</button>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-fadeIn pb-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-video rounded-[2.5rem] overflow-hidden luxury-shadow bg-slate-200 border border-slate-300 relative">
                  {bid.afterMockup && <img src={bid.afterMockup} className="w-full h-full object-cover" />}
                  <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Projection: {activeStyle}</div>
                </div>
                <div className="bg-white/40 p-4 rounded-[2rem] border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Intelligent Style Refinements</span>
                  <div className="flex flex-wrap gap-2">
                    {recommendedStyles.map(style => (
                      <button 
                        key={style} 
                        onClick={() => changeStyle(style)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeStyle === style ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="aspect-square lg:aspect-auto rounded-[2.5rem] overflow-hidden luxury-shadow border border-slate-300 bg-white">
                {bid.spatialProfile && <ThreeRoomView spatial={bid.spatialProfile} />}
              </div>
           </div>

           {/* AI Foreman Suggestions Audit with Safety Sirens and Style Alerts */}
           {materialSuggestions.length > 0 && (
             <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 ml-4">
                  <div className={`w-2 h-2 rounded-full ${materialSuggestions.some(s => s.safetyWarning) ? 'bg-red-600 animate-siren-light' : materialSuggestions.some(s => s.styleWarning) ? 'bg-purple-600' : 'bg-orange-500 animate-pulse'}`}></div>
                  <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${materialSuggestions.some(s => s.safetyWarning) ? 'text-red-600 animate-siren-text' : materialSuggestions.some(s => s.styleWarning) ? 'text-purple-600' : 'text-orange-600'}`}>
                    {materialSuggestions.some(s => s.safetyWarning) ? 'CRITICAL SAFETY AUDIT REQUIRED' : materialSuggestions.some(s => s.styleWarning) ? 'STYLE & DESIGN OPTIMIZATION' : 'Foreman\'s Material Audit'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materialSuggestions.map((s, idx) => (
                    <div key={idx} className={`p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden flex flex-col justify-between ${s.safetyWarning ? 'bg-red-50 border-red-500 animate-siren shadow-2xl' : s.styleWarning ? 'bg-purple-50 border-purple-200 shadow-xl' : 'bg-orange-50/50 border-orange-100'}`}>
                      {s.safetyWarning && (
                        <div className="absolute top-4 right-4 z-20">
                           <div className="bg-red-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-[0_0_20px_red] border-4 border-white animate-bounce">🚨</div>
                        </div>
                      )}
                      
                      {s.styleWarning && !s.safetyWarning && (
                        <div className="absolute top-4 right-4 z-20">
                           <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-[0_0_10px_purple] border-2 border-white">✨</div>
                        </div>
                      )}
                      
                      <div>
                        {s.safetyWarning ? (
                          <div className="mb-4 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] inline-block animate-pulse">
                            DANGEROUS MATERIAL DETECTED
                          </div>
                        ) : s.styleWarning ? (
                          <div className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] inline-block">
                            STYLE MISMATCH DETECTED
                          </div>
                        ) : null}
                        
                        <div className="flex justify-between items-start mb-2">
                           <div className="max-w-[85%]">
                              {s.originalMaterial && (
                                <div className="mb-2">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{s.safetyWarning ? 'Original Choice (UNSAFE)' : 'Original Choice (Stylistic Mismatch)'}</span>
                                  <span className={`text-sm font-bold line-through opacity-70 ${s.safetyWarning ? 'text-red-600' : 'text-purple-600'}`}>{s.originalMaterial}</span>
                                </div>
                              )}
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${s.safetyWarning ? 'bg-red-100 text-red-700' : s.styleWarning ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {s.safetyWarning ? 'STRUCTURAL REPLACEMENT' : s.styleWarning ? 'DESIGN ADJUSTMENT' : s.type}
                              </span>
                              <h4 className="font-black text-slate-800 mt-1 text-xl">{s.suggestedMaterial.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.suggestedMaterial.quantity} • Estimated Audit Cost: ${s.suggestedMaterial.unitPrice}</p>
                           </div>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed italic mb-6 p-4 rounded-2xl border ${s.safetyWarning ? 'bg-white border-red-200 text-red-900 shadow-inner' : s.styleWarning ? 'bg-white border-purple-200 text-purple-900' : 'bg-white/50 border-orange-100 text-slate-600'}`}>
                          "{s.justification}"
                        </p>
                      </div>
                      <button 
                        onClick={() => handleApplySuggestion(s)} 
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${s.safetyWarning ? 'bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-[1.02]' : s.styleWarning ? 'bg-purple-700 text-white shadow-lg hover:bg-purple-800' : 'bg-slate-800 text-white hover:bg-blue-600'}`}
                      >
                        {s.safetyWarning ? `ACCEPT SAFETY FIX` : s.styleWarning ? `ALIGN WITH ${activeStyle}` : `Replace ${s.originalMaterial}`}
                      </button>
                    </div>
                  ))}
                </div>
             </div>
           )}
           
           <div className="space-y-4">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest ml-4">Current Verified Material List</h3>
              {bid.materials?.map((m, i) => (
                <div key={i} className="bg-white/80 p-6 rounded-[2rem] border border-slate-200 flex flex-col luxury-shadow group transition-all hover:translate-x-1">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex-1">
                        <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                          {m.name}
                          {m.confidence && (
                            <span className={`text-[8px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              m.confidence === 'High' ? 'bg-green-100 text-green-700 border-green-300' : 
                              m.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
                              'bg-red-100 text-red-700 border-red-300 animate-pulse'
                            }`}>
                              {m.confidence === 'High' ? 'VERIFIED' : m.confidence}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                          {m.quantity} • {m.source || 'Audit Pending'}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">${m.unitPrice.toLocaleString()}</div>
                        <button onClick={() => handlePriceCheck(i)} className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline mt-1">Live Price Update</button>
                     </div>
                   </div>
                </div>
              ))}
           </div>
           <button onClick={generateProposal} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest luxury-shadow">Generate Final Proposal</button>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-fadeIn pb-12">
          <div className="bg-white p-12 rounded-[3rem] shadow-inner border border-slate-200 min-h-[400px] text-lg italic leading-relaxed font-serif whitespace-pre-wrap">{letterDraft}</div>
          <button onClick={() => { confetti(); onComplete(bid as BidData); }} className="w-full bg-slate-900 text-white py-8 rounded-3xl font-black text-xl uppercase tracking-widest shadow-2xl">Publish To Dashboard</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="relative">
      <MetallicPanel title={step === 4 ? "Final Quote Architecture" : "Survey Engine Progress"}>
        {renderStep()}
      </MetallicPanel>
    </div>
  );
};

export default BidWizard;