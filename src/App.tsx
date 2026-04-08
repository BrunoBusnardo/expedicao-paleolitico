import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import { 
  Flame, 
  Skull, 
  Wind, 
  Utensils, 
  Map as MapIcon, 
  Palette, 
  Users, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  History,
  X,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Search,
  Loader2,
  Lightbulb,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { QUESTIONS, PALEO_TIPS } from './constants';
import { StoryState, GroupAnswers } from './types';
import { 
  getElderFeedback, 
  generateFinalStory, 
  generatePhaseDraft, 
  verifyPhaseDraft 
} from './services/gemini';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [state, setState] = useState<StoryState>({
    step: 'intro',
    currentQuestionIndex: 0,
    answers: {},
    currentDraft: '',
    verifiedDrafts: {},
    elderFeedback: null,
    isElderOpen: false,
    isDraftVerified: false,
    consultationCount: {},
    finalStory: ''
  });

  const [currentInput, setCurrentInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const nodeRef = useRef(null);
  const appRef = useRef<HTMLDivElement>(null);

  const currentQuestion = QUESTIONS[state.currentQuestionIndex];

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appRef.current?.requestFullscreen().catch(err => {
        console.error(`Erro ao tentar ativar tela cheia: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Effect to rotate tips every 25 seconds during verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVerifying) {
      interval = setInterval(() => {
        setCurrentTipIndex(Math.floor(Math.random() * PALEO_TIPS.length));
      }, 25000);
    }
    return () => clearInterval(interval);
  }, [isVerifying]);

  const handleGoToDrafting = async () => {
    if (!currentInput.trim()) return;
    
    setIsAnalyzing(true);
    const result = await generatePhaseDraft(currentQuestion.id, currentInput);
    
    setState(prev => ({ 
      ...prev, 
      step: 'drafting',
      answers: { ...prev.answers, [currentQuestion.id]: currentInput },
      currentDraft: result.draft,
      isDraftVerified: !result.hasErrors,
      elderFeedback: null,
      isElderOpen: false,
      verifiedDrafts: !result.hasErrors ? { ...prev.verifiedDrafts, [currentQuestion.id]: result.draft } : prev.verifiedDrafts
    }));
    setVerificationFeedback(null);
    setIsAnalyzing(false);
  };

  const handleConsultElder = async () => {
    setIsAnalyzing(true);
    
    const currentCount = (state.consultationCount[currentQuestion.id] || 0) + 1;
    
    setState(prev => ({ 
      ...prev, 
      isElderOpen: true, 
      elderFeedback: null,
      consultationCount: { ...prev.consultationCount, [currentQuestion.id]: currentCount }
    }));
    
    const feedback = await getElderFeedback(currentQuestion.id, state.currentDraft, currentCount);
    
    setState(prev => ({ 
      ...prev, 
      elderFeedback: feedback 
    }));
    setIsAnalyzing(false);
  };

  const handleVerifyDraft = async () => {
    setIsVerifying(true);
    setCurrentTipIndex(Math.floor(Math.random() * PALEO_TIPS.length));
    
    const result = await verifyPhaseDraft(currentQuestion.id, state.currentDraft);
    
    setVerificationFeedback(result.feedback);
    setState(prev => ({ ...prev, isDraftVerified: result.isCorrect }));
    
    if (result.isCorrect) {
      setState(prev => ({
        ...prev,
        verifiedDrafts: { ...prev.verifiedDrafts, [currentQuestion.id]: prev.currentDraft }
      }));
    }
    setIsVerifying(false);
  };

  const handleNextPhase = () => {
    if (state.currentQuestionIndex < QUESTIONS.length - 1) {
      setState(prev => ({
        ...prev,
        step: 'questions',
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentDraft: '',
        isDraftVerified: false,
        elderFeedback: null,
        isElderOpen: false
      }));
      setCurrentInput('');
      setVerificationFeedback(null);
    } else {
      handleFinishExpedition();
    }
  };

  const handleFinishExpedition = async () => {
    setIsAnalyzing(true);
    setState(prev => ({ ...prev, step: 'final-story' }));
    const draftsArray = QUESTIONS.map(q => state.verifiedDrafts[q.id] || '');
    const story = await generateFinalStory(state.answers, draftsArray);
    setState(prev => ({ ...prev, finalStory: story }));
    setIsAnalyzing(false);
  };

  const addSuggestion = (suggestion: string) => {
    setCurrentInput(prev => prev ? `${prev}, ${suggestion}` : suggestion);
  };

  return (
    <div ref={appRef} className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#f4f1ea]">
      {/* Fullscreen Toggle Button */}
      <div className="fixed top-4 right-4 z-[60]">
        <button
          onClick={toggleFullscreen}
          className="p-3 bg-white/80 backdrop-blur-sm border border-paleo-sand rounded-full shadow-md hover:bg-white transition-all text-paleo-earth"
          title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
        >
          {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {state.step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-paleo-sand text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-paleo-fire/10 rounded-full fire-glow">
                <Flame className="w-12 h-12 text-paleo-fire" />
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-paleo-earth mb-4">Expedição Paleolítico</h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-8 italic">
              “Imaginem que vocês estão na África… mas não é a África de hoje. 
              Não existem cidades. Não existem escolas. Estamos há cerca de 50 mil anos no passado. 
              Sobreviver é um desafio todos os dias.”
            </p>
            <button 
              onClick={() => setState({ ...state, step: 'questions' })}
              className="group flex items-center gap-2 mx-auto bg-paleo-earth text-white px-8 py-4 rounded-full font-bold hover:bg-paleo-cave transition-all transform hover:scale-105"
            >
              Começar Sobrevivência
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {state.step === 'questions' && (
          <motion.div 
            key={`q-${currentQuestion.id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl w-full grid md:grid-cols-3 gap-6"
          >
            {/* Sidebar info */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-paleo-earth text-white p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <History className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">Fase {currentQuestion.id} de 7</span>
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">{currentQuestion.title}</h2>
                <p className="text-sm opacity-90 leading-relaxed">{currentQuestion.narrative}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-md border border-paleo-sand">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Conceito</div>
                <div className="text-paleo-earth font-medium">{currentQuestion.concept}</div>
              </div>
            </div>

            {/* Main Question Area */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border-2 border-paleo-sand/30 h-full flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-paleo-earth mb-6">Respondam em grupo:</h3>
                  <ul className="space-y-4 mb-8">
                    {currentQuestion.subQuestions.map((sq, i) => (
                      <li key={i} className="flex gap-3 items-start text-gray-700">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-paleo-fire shrink-0" />
                        {sq}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sugestões de Sobrevivência</div>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.suggestions.map((s, i) => (
                        <button 
                          key={i}
                          onClick={() => addSuggestion(s)}
                          className="text-sm bg-paleo-sand/20 hover:bg-paleo-sand/40 text-paleo-earth px-3 py-1.5 rounded-lg border border-paleo-sand/50 transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea 
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Escrevam aqui a estratégia do grupo..."
                    className="w-full p-4 rounded-2xl border-2 border-paleo-sand focus:border-paleo-fire focus:ring-0 outline-none min-h-[120px] transition-all bg-transparent"
                  />
                  
                  <button 
                    onClick={handleGoToDrafting}
                    disabled={!currentInput.trim() || isAnalyzing}
                    className="w-full flex items-center justify-center gap-2 bg-paleo-fire text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-paleo-fire/20"
                  >
                    {isAnalyzing ? 'Processando...' : 'Seguir Adiante'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {state.step === 'drafting' && (
          <motion.div 
            key="drafting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full grid md:grid-cols-3 gap-6"
          >
            {/* Sidebar info */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-paleo-earth text-white p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">Edição da Crônica</span>
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">Fase {currentQuestion.id}</h2>
                <p className="text-sm opacity-90 leading-relaxed">
                  Transformamos suas respostas em uma história. Agora, revisem e corrijam qualquer erro histórico que o Ancião possa notar.
                </p>
              </div>

              {/* Attention Box - Restored and updated */}
              {(!state.isDraftVerified || verificationFeedback) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl shadow-md border ${state.isDraftVerified ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                  <div className="flex items-center gap-2 mb-2 font-bold">
                    {state.isDraftVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {state.isDraftVerified ? 'Verificado!' : 'Atenção!'}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {verificationFeedback || (state.isDraftVerified ? "Tudo certo com a cronologia!" : "Existem anacronismos ou erros no texto que precisam ser corrigidos.")}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Editor Area */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border-2 border-paleo-sand/30 h-full flex flex-col">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-paleo-earth">Texto da Tribo:</h3>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {state.isDraftVerified ? 'Pronto para seguir' : 'Em edição'}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Visualização da Crônica (Identifique os erros):</div>
                    <div className="p-4 bg-paleo-sand/10 rounded-xl border border-paleo-sand/30 font-serif italic text-gray-800 elder-markdown">
                      <ReactMarkdown>
                        {state.currentDraft.replace(/\[ERRO\](.*?)\[\/ERRO\]/g, "**$1**")}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Editor da Tribo (Corrijam o texto abaixo):</div>
                    <textarea 
                      value={state.currentDraft}
                      onChange={(e) => setState(prev => ({ ...prev, currentDraft: e.target.value, isDraftVerified: false }))}
                      className="w-full p-6 rounded-2xl border-2 border-paleo-sand focus:border-paleo-fire focus:ring-0 outline-none min-h-[200px] transition-all bg-white font-serif text-lg leading-relaxed"
                      placeholder="Removam os marcadores [ERRO] e corrijam o texto..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleConsultElder}
                    disabled={isAnalyzing || state.isDraftVerified}
                    className="flex items-center justify-center gap-2 bg-paleo-earth text-white py-4 rounded-2xl font-bold hover:bg-paleo-cave transition-all disabled:opacity-30"
                    title={state.isDraftVerified ? "História já verificada" : "Consultar Ancião"}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar Ancião
                  </button>
                  
                  <button 
                    onClick={handleVerifyDraft}
                    disabled={isAnalyzing || isVerifying}
                    className="flex items-center justify-center gap-2 bg-paleo-stone text-white py-4 rounded-2xl font-bold hover:bg-paleo-earth transition-all disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Verificar História
                  </button>
                </div>

                <button 
                  onClick={handleNextPhase}
                  disabled={!state.isDraftVerified || isAnalyzing || isVerifying}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-paleo-fire text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-30 shadow-lg shadow-paleo-fire/20"
                >
                  {state.currentQuestionIndex === QUESTIONS.length - 1 ? 'Finalizar Expedição' : 'Próxima Fase'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state.step === 'final-story' && (
          <motion.div 
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl w-full bg-[#fdfbf7] p-10 md:p-16 rounded-[40px] shadow-2xl border border-paleo-sand relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-paleo-earth via-paleo-fire to-paleo-earth" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-10">
                <div className="px-6 py-2 bg-paleo-earth text-white text-xs font-bold uppercase tracking-[0.3em] rounded-full">
                  Crônica da Tribo
                </div>
              </div>

              <div className="prose prose-lg prose-stone max-w-none markdown-body">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-paleo-earth border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif italic text-xl">Pintando as paredes da caverna...</p>
                  </div>
                ) : (
                  <ReactMarkdown>{state.finalStory}</ReactMarkdown>
                )}
              </div>

              {!isAnalyzing && (
                <div className="mt-16 pt-8 border-t border-paleo-sand/50 flex flex-col items-center">
                  <button 
                    onClick={() => setState({ ...state, step: 'intro', currentQuestionIndex: 0, answers: {}, verifiedDrafts: {} })}
                    className="flex items-center gap-2 bg-paleo-earth text-white px-8 py-3 rounded-xl font-bold hover:bg-paleo-cave transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Nova Jornada
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Loading Popup with Tips */}
      <AnimatePresence>
        {isVerifying && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paleo-earth/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white max-w-lg w-full rounded-[32px] shadow-2xl border-4 border-paleo-earth p-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-paleo-fire animate-pulse" />
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-paleo-earth animate-spin" />
                  <Search className="w-6 h-6 text-paleo-fire absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              <h3 className="text-2xl font-serif font-bold text-paleo-earth mb-2">O Ancião está pensando...</h3>
              <p className="text-gray-500 mb-8 italic">Analisando a cronologia da sua história</p>

              <div className="bg-paleo-sand/10 p-6 rounded-2xl border border-paleo-sand/30 relative">
                <Lightbulb className="w-6 h-6 text-paleo-fire absolute -top-3 -left-3 bg-white rounded-full p-1 shadow-sm" />
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={currentTipIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-paleo-earth font-medium leading-relaxed"
                  >
                    {PALEO_TIPS[currentTipIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-paleo-fire animate-ping" />
                Aguardem a sabedoria dos ancestrais
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Draggable Elder Popup */}
      <AnimatePresence>
        {state.isElderOpen && (
          <Draggable nodeRef={nodeRef} handle=".elder-handle" bounds="parent">
            <motion.div 
              ref={nodeRef}
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="fixed bottom-10 right-10 w-80 md:w-96 z-50"
            >
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-paleo-earth overflow-hidden flex flex-col max-h-[500px]">
                <div className="elder-handle bg-paleo-earth p-4 flex items-center justify-between cursor-move">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    <span className="font-serif font-bold">O Ancião da Tribo</span>
                  </div>
                  <button 
                    onClick={() => setState(prev => ({ ...prev, isElderOpen: false }))}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar bg-paleo-sand/5">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center py-8 space-y-3">
                      <div className="w-8 h-8 border-3 border-paleo-fire border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm italic text-paleo-earth">Escutando os ventos...</p>
                    </div>
                  ) : state.elderFeedback ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-2xl ${state.elderFeedback.hasErrors ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {state.elderFeedback.hasErrors ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          <span className={`font-bold text-sm ${state.elderFeedback.hasErrors ? 'text-red-700' : 'text-green-700'}`}>
                            {state.elderFeedback.hasErrors ? 'Algo não está certo...' : 'Sabedoria reconhecida!'}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-800 elder-markdown">
                          <ReactMarkdown>{state.elderFeedback.message}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {state.elderFeedback.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Caminhos de Reflexão:</p>
                          <div className="flex flex-col gap-2">
                            {state.elderFeedback.suggestions.map((s, i) => (
                              <div key={i} className="flex gap-2 items-start text-xs bg-white border border-paleo-sand p-2 rounded-lg text-paleo-earth italic">
                                <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-paleo-fire" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="p-4 bg-gray-50 text-[10px] text-center text-gray-400 border-t border-gray-100">
                  Segure na barra superior para mover o Ancião
                </div>
              </div>
            </motion.div>
          </Draggable>
        )}
      </AnimatePresence>

      {/* Background Icons */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1] overflow-hidden">
        <div className="absolute top-10 left-10"><Skull size={120} /></div>
        <div className="absolute bottom-10 right-10"><Flame size={150} /></div>
        <div className="absolute top-1/2 left-1/4"><Wind size={100} /></div>
        <div className="absolute top-1/4 right-1/4"><Utensils size={110} /></div>
        <div className="absolute bottom-1/4 left-1/3"><MapIcon size={130} /></div>
        <div className="absolute top-1/3 right-10"><Users size={140} /></div>
      </div>

      {/* Attribution Footer */}
      <footer className="fixed bottom-2 w-full text-center pointer-events-none">
        <p className="text-[10px] text-paleo-earth/40 font-medium uppercase tracking-widest">
          Desenvolvido por Bruno Busnardo • Alunos do 6º ano • 08/04/2026
        </p>
      </footer>

      <style>{`
        .elder-markdown strong {
          @apply text-red-600 font-black underline decoration-2 underline-offset-4;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d2b48c;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
