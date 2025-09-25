import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, CheckCircle, XCircle, BookOpen, Code, BrainCircuit, PenSquare, UserCheck, FileText, BotMessageSquare } from 'lucide-react';

// --- API Configuration ---
// This should be your public Codespace URL for the Python server
const API_BASE_URL = 'https://symmetrical-dollop-wrgj69q7xq6j39qv4-5000.app.github.dev';

// ==============================================================================
//      Main Application Component
// ==============================================================================
export default function App() {
  return (
    <>
      {/* Custom Keyframes for Animations */}
      <style>{`
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.4s ease-out forwards; }
      `}</style>

      <div className="relative min-h-screen bg-[#0A0E1B] text-gray-200 font-sans overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
        <div className="absolute top-0 left-[-50%] w-[200%] h-[200%] bg-radial-gradient animate-spin-slow"></div>
        
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <Header />
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <ProjectInfoCard />
            <div className="lg:col-span-2">
              <ToolSuite />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ==============================================================================
//      Layout & Informational Components
// ==============================================================================
const Header = () => (
  <header className="flex items-center justify-between animate-fade-in-up">
    <div className="flex items-center gap-3">
      <BrainCircuit className="w-10 h-10 text-cyan-400" />
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Next-Sentence Prediction & Coherence Engine</h1>
    </div>
  </header>
);

const ProjectInfoCard = () => (
    <div style={{'--delay': '200ms'}} className="opacity-0 bg-black/20 backdrop-blur-lg rounded-xl border border-cyan-400/20 p-6 flex flex-col gap-6 animate-fade-in-up">
        <h2 className="text-xl font-semibold text-cyan-400">About This Project</h2>
        <p className="text-gray-400">This application is a demonstration of a sophisticated Natural Language Processing (NLP) pipeline built for a university project. It showcases two core functionalities of modern transformer models.</p>
        <div className="space-y-4">
            <InfoItem icon={BotMessageSquare} title="Persona-Based Generation">The model can adopt different professional personas (e.g., Doctor, Lawyer) to generate contextually relevant sentence completions.
            </InfoItem>
            <InfoItem icon={UserCheck} title="Semantic Coherence Analysis">It can analyze two sentences to determine if they are logically sequential, providing a confidence score for its prediction.</InfoItem>
        </div>
        <div className="mt-auto pt-6 border-t border-cyan-400/20">
             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Technology Stack</h3>
             <p className="text-gray-400 text-sm"><span className="font-bold text-gray-300">Backend:</span> Python, Flask, PyTorch, and Hugging Face Transformers (GPT-2 & BERT).</p>
             <p className="text-gray-400 text-sm"><span className="font-bold text-gray-300">Frontend:</span> React, Tailwind CSS, and Lucide for a modern, responsive user interface.</p>
        </div>
    </div>
);

const InfoItem = ({ icon: Icon, title, children }) => (
    <div className="flex gap-4">
        <div className="w-8 h-8 bg-cyan-900/50 border border-cyan-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-400">{children}</p>
        </div>
    </div>
);


// ==============================================================================
//      Core Feature Components & Tool Suite
// ==============================================================================
const ToolSuite = () => {
  const [activeTool, setActiveTool] = useState('generator');

  return (
    <div style={{'--delay': '400ms'}} className="opacity-0 bg-black/20 backdrop-blur-lg rounded-xl border border-cyan-400/20 p-2 sm:p-4 animate-fade-in-up">
      <div className="bg-black/20 rounded-lg p-2 flex items-center gap-2 mb-4">
        <TabButton onClick={() => setActiveTool('generator')} isActive={activeTool === 'generator'}>Sentence Generator</TabButton>
        <TabButton onClick={() => setActiveTool('coherence')} isActive={activeTool === 'coherence'}>Coherence Checker</TabButton>
      </div>
      <div className="p-2 sm:p-4">
        {activeTool === 'generator' && <Generator />}
        {activeTool === 'coherence' && <CoherenceChecker />}
      </div>
    </div>
  );
};

const TabButton = ({ children, onClick, isActive }) => (
    <button onClick={onClick} className={`w-full text-center px-4 py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${isActive ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}>
        {children}
    </button>
);

function Generator() {
  const [prompt, setPrompt] = useState('The verdict was read to a silent courtroom');
  const [persona, setPersona] = useState('lawyer');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError('');
    setResults([]);
    try {
      // *** THIS LINE IS UPDATED ***
      const response = await axios.post(`${API_BASE_URL}/api/generate`, { prompt, persona, num_results: 3 });
      setResults(response.data.generated_sentences);
    } catch (err) { setError('Failed to connect to the AI model. Is the server running?'); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="animate-scale-in space-y-6">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-28 p-3 bg-black/20 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" placeholder="Enter the first part of a sentence..."/>
        <PersonaSelector selected={persona} onChange={setPersona} />
        <Button onClick={handleGenerate} isLoading={isLoading} icon={Bot}>Generate Completions</Button>
        <ResultArea isLoading={isLoading} error={error} hasContent={results.length > 0}>
            <ul className="space-y-3">
              {results.map((res, i) => (
                <li key={i} style={{ animationDelay: `${i * 100}ms`}} className="opacity-0 text-gray-300 bg-black/20 p-3 rounded-md border border-cyan-400/10 animate-fade-in-up">
                  <span className="text-cyan-400 font-bold mr-2">{i + 1}.</span>{res}
                </li>
              ))}
            </ul>
        </ResultArea>
    </div>
  );
}

function CoherenceChecker() {
  const [sentenceA, setSentenceA] = useState('The patient showed symptoms of a bacterial infection.');
  const [sentenceB, setSentenceB] = useState('An immediate course of antibiotics was prescribed.');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!sentenceA || !sentenceB) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      // *** THIS LINE IS UPDATED ***
      const response = await axios.post(`${API_BASE_URL}/api/check-coherence`, { sentence_a: sentenceA, sentence_b: sentenceB });
      setResult(response.data);
    } catch (err) { setError('Failed to connect to the AI model. Is the server running?'); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="animate-scale-in space-y-4">
        <textarea value={sentenceA} onChange={e => setSentenceA(e.target.value)} className="w-full h-24 p-3 bg-black/20 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" placeholder="Enter Sentence A..."/>
        <textarea value={sentenceB} onChange={e => setSentenceB(e.target.value)} className="w-full h-24 p-3 bg-black/20 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" placeholder="Enter Sentence B..."/>
        <Button onClick={handleCheck} isLoading={isLoading} icon={CheckCircle}>Check Coherence</Button>
        <ResultArea isLoading={isLoading} error={error} hasContent={!!result}>
            {result && <CoherenceResult result={result} />}
        </ResultArea>
    </div>
  );
}

// ==============================================================================
//      Specialized & Reusable UI Components
// ==============================================================================
const Button = ({ children, onClick, isLoading, icon: Icon }) => (
  <button onClick={onClick} disabled={isLoading} className="w-full font-bold text-white bg-cyan-600/50 border border-cyan-500 rounded-lg h-12 flex items-center justify-center gap-2 hover:bg-cyan-500/70 transition-all duration-300 disabled:bg-gray-600/50 disabled:border-gray-500 disabled:cursor-not-allowed">
    {isLoading ? <Spinner /> : (Icon && <Icon className="w-5 h-5" />)}
    <span>{children}</span>
  </button>
);

const personas = [
  { id: 'writer', name: 'Writer', icon: PenSquare },
  { id: 'doctor', name: 'Doctor', icon: FileText },
  { id: 'lawyer', name: 'Lawyer', icon: BookOpen },
  { id: 'teacher', name: 'Teacher', icon: Code },
];

const PersonaSelector = ({ selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-3">Select AI Persona</label>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {personas.map(p => (
        <button key={p.id} onClick={() => onChange(p.id)} className={`p-4 text-sm font-semibold rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${selected === p.id ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-black/20 border-cyan-400/20 hover:bg-white/10'}`}>
          <p.icon className="w-6 h-6" />
          {p.name}
        </button>
      ))}
    </div>
  </div>
);

const CoherenceResult = ({ result }) => {
  const isCoherent = result.label === 'Coherent';
  return (
    <div className="text-center p-4 animate-scale-in">
      {isCoherent ? <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" /> : <XCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />}
      <p className={`text-2xl font-bold ${isCoherent ? 'text-green-400' : 'text-red-400'}`}>{result.label}</p>
      <p className="text-gray-400">Confidence: <span className="font-mono">{(result.confidence * 100).toFixed(2)}%</span></p>
    </div>
  );
};

const ResultArea = ({ isLoading, error, children, hasContent }) => (
    <div className={`mt-6 min-h-[150px] p-4 bg-black/20 rounded-lg border border-cyan-400/10 flex items-center justify-center transition-all duration-300 ${hasContent ? 'border-cyan-400/30' : ''}`}>
        {isLoading && <Spinner />}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {!isLoading && !error && children}
    </div>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
);

