
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  AppState, 
  Category, 
  TopicSuggestion, 
  ScriptOutline 
} from './types.ts';
import { 
  generateTopics, 
  generateOutline, 
  streamFullScript 
} from './services/geminiService.ts';

const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const LightbulbIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
);

const ClipboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);

const PenIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);

const categoryIcons: Record<Category, React.ReactNode> = {
  '뇌과학': <LightbulbIcon />,
  '심리학': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  '자기계발': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  '생산성': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  '직장생활': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  '독서법': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  '공부법': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
  '재테크': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  '건강': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  'IT/기술': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  '동기부여': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" /></svg>,
  '반려견/묘': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10V6a2 2 0 012-2h2M7 4h10M21 4v2a2 2 0 01-2 2h-2M21 14v4a2 2 0 01-2 2h-2M3 14v4a2 2 0 002 2h2m0-10l3 3 3-3m-3 3v6" /></svg>,
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppState>(AppState.CATEGORY_SELECTION);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [outline, setOutline] = useState<ScriptOutline | null>(null);
  const [fullScript, setFullScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const [hasKey, setHasKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  
  const [outlineFeedback, setOutlineFeedback] = useState('');
  const [scriptFeedback, setScriptFeedback] = useState('');

  const categories: Category[] = [
    '뇌과학', '심리학', '자기계발', '생산성', 
    '직장생활', '독서법', '공부법', '재테크',
    '건강', 'IT/기술', '동기부여', '반려견/묘'
  ];

  const charCount = useMemo(() => fullScript.length, [fullScript]);

  // Check for existing key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setHasKey(true);
      setInputKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!inputKey.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }
    localStorage.setItem('gemini_api_key', inputKey.trim());
    setHasKey(true);
    setShowKeyModal(false);
    alert('API 키가 저장되었습니다.');
  };

  const handleClearKey = () => {
    // window.confirm causes issues in some environments.
    // Removing it to ensure the delete action is executed reliably.
    localStorage.removeItem('gemini_api_key');
    setHasKey(false);
    setInputKey('');
    setShowKeyModal(false);
    alert('API 키가 삭제되었습니다.');
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const reset = useCallback(() => {
    setStep(AppState.CATEGORY_SELECTION);
    setSelectedCategories([]);
    setCustomCategory('');
    setTopics([]);
    setSelectedTopic(null);
    setOutline(null);
    setFullScript('');
    setOutlineFeedback('');
    setScriptFeedback('');
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다.');
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('클립보드에 복사되었습니다.');
      } catch (copyErr) {
        alert('복사에 실패했습니다. 직접 복사해주세요.');
      }
      document.body.removeChild(textArea);
    }
  };

  /**
   * Centralized API error handler
   */
  const handleApiError = useCallback(async (error: any, defaultMessage: string) => {
    console.error(error);
    if (error.message?.includes("API key not valid") || error.message?.includes("key not found")) {
      alert('API 키가 유효하지 않습니다. 키를 확인해주세요.');
      // Do not setHasKey(false) here, so the user can still see the delete button to clear the bad key.
      // Instead, just open the modal.
      setShowKeyModal(true);
    } else {
      alert(defaultMessage + " (API 키 상태를 확인해주세요)");
    }
  }, []);

  const handleGenerateTopics = async () => {
    if (!hasKey) {
      alert("API 키를 먼저 설정해주세요.");
      setShowKeyModal(true);
      return;
    }

    const allInputs = [...selectedCategories];
    if (customCategory.trim()) {
      allInputs.push(customCategory.trim() as any);
    }
    if (allInputs.length === 0) return alert('최소 한 개의 카테고리를 선택하거나 입력해주세요.');
    
    setIsLoading(true);
    try {
      const result = await generateTopics(allInputs as any);
      setTopics(result);
      setStep(AppState.TOPIC_SUGGESTION);
    } catch (error: any) {
      await handleApiError(error, '주제 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTopic = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    try {
      const result = await generateOutline(topic);
      setOutline(result);
      setStep(AppState.OUTLINE_GENERATION);
    } catch (error: any) {
      await handleApiError(error, '개요 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineOutline = async () => {
    if (!selectedTopic) return;
    setIsLoading(true);
    try {
      const result = await generateOutline(selectedTopic, outlineFeedback);
      setOutline(result);
      setOutlineFeedback('');
    } catch (error: any) {
      await handleApiError(error, '개요 구체화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScript = async (isRefining: boolean = false) => {
    if (!selectedTopic || !outline) return;
    
    const previousScript = fullScript;
    const feedback = scriptFeedback;

    setStep(AppState.SCRIPT_GENERATION);
    setIsStreaming(true);
    const initialText = isRefining ? '기존 대본을 바탕으로 구체화 중입니다...' : '스크립트를 작성 중입니다...';
    setFullScript(initialText);
    
    try {
      await streamFullScript(
        selectedTopic, 
        outline, 
        (text) => setFullScript(text),
        isRefining ? previousScript : undefined,
        isRefining ? feedback : undefined
      );
      if (isRefining) setScriptFeedback('');
    } catch (error: any) {
      await handleApiError(error, '스크립트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsStreaming(false);
    }
  };

  const isStepClickable = (targetStep: AppState) => {
    if (targetStep === AppState.CATEGORY_SELECTION) return true;
    if (targetStep === AppState.TOPIC_SUGGESTION) return topics.length > 0;
    if (targetStep === AppState.OUTLINE_GENERATION) return outline !== null;
    if (targetStep === AppState.SCRIPT_GENERATION) return fullScript !== '';
    return false;
  };

  const SidebarItem = ({ s, label, currentStep }: { s: AppState, label: string, currentStep: AppState }) => {
    const clickable = isStepClickable(s);
    const active = currentStep === s || (s === AppState.SCRIPT_GENERATION && currentStep === AppState.APPROVED);

    return (
      <button 
        onClick={() => clickable && setStep(s)}
        disabled={!clickable}
        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
          active 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : clickable 
              ? 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600' 
              : 'text-slate-300 cursor-not-allowed opacity-50'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
          active ? 'border-white' : clickable ? 'border-indigo-100' : 'border-slate-100'
        }`}>
          {s + 1}
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden lg:flex flex-col fixed h-full z-10 shadow-sm">
        <div className="mb-8 flex items-center gap-2 px-2 cursor-pointer transition-transform hover:scale-105" onClick={reset}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
            <SparkleIcon />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Script Pro</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <SidebarItem s={AppState.CATEGORY_SELECTION} label="카테고리 선택" currentStep={step} />
          <SidebarItem s={AppState.TOPIC_SUGGESTION} label="주제 리스트" currentStep={step} />
          <SidebarItem s={AppState.OUTLINE_GENERATION} label="개요 상세" currentStep={step} />
          <SidebarItem s={AppState.SCRIPT_GENERATION} label="스크립트 본문" currentStep={step} />
          
          <button 
            onClick={() => setShowGuide(true)}
            className="w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold mt-4"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-indigo-200">
              <InfoIcon />
            </div>
            <span className="text-sm">사용 가이드</span>
          </button>
        </nav>

        <div className="mt-auto space-y-3">
          <div className={`p-4 rounded-2xl border transition-all ${hasKey ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${hasKey ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                <KeyIcon />
              </div>
              <span className={`text-xs font-bold ${hasKey ? 'text-green-700' : 'text-orange-700'}`}>
                {hasKey ? 'API 키 등록됨' : 'API 키 필요'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              {hasKey ? '개인 API 키가 안전하게 저장되었습니다.' : 'Google AI Studio에서 발급받은 무료 키를 입력해주세요.'}
            </p>
            <button 
              onClick={() => setShowKeyModal(true)}
              className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              {hasKey ? 'API 키 변경/삭제' : 'API 키 설정하기'}
            </button>
          </div>
          <button 
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 rounded-2xl font-bold transition-all shadow-sm active:scale-95"
          >
            <HomeIcon /> 홈으로
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-4 md:p-12 pb-24">
        <header className="mb-12 flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === AppState.CATEGORY_SELECTION && "카테고리 융합"}
              {step === AppState.TOPIC_SUGGESTION && "주제 제안"}
              {step === AppState.OUTLINE_GENERATION && "개요 설계"}
              {step === AppState.SCRIPT_GENERATION && "최종 대본"}
              {step === AppState.APPROVED && "기획 완료"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">AI와 함께 완성하는 프리미엄 콘텐츠 스크립트</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowGuide(true)}
              className="lg:hidden p-3 bg-white border border-slate-200 rounded-full text-indigo-500 shadow-sm"
            >
              <InfoIcon />
            </button>
            <button 
              onClick={reset}
              className="lg:hidden p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 shadow-sm transition-all active:scale-90"
            >
              <HomeIcon />
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto glass-card rounded-[2.5rem] p-6 md:p-10 shadow-2xl min-h-[500px] border border-white/50 relative">
          
          {step === AppState.CATEGORY_SELECTION && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                <SparkleIcon /> 어떤 주제를 융합해볼까요?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-sm font-bold text-center group ${
                      selectedCategories.includes(category)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-all ${
                      selectedCategories.includes(category) ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'
                    }`}>
                      {categoryIcons[category]}
                    </div>
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">그외 카테고리 직접 입력</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="예: 초보 요리사, 제주도 여행, 직장인 명상..."
                  className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <button
                onClick={handleGenerateTopics}
                disabled={isLoading || (selectedCategories.length === 0 && !customCategory.trim())}
                className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-2xl shadow-indigo-100 text-lg active:scale-95"
              >
                콘텐츠 아이디어 10가지 생성
              </button>
            </div>
          )}

          {step === AppState.TOPIC_SUGGESTION && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  <LightbulbIcon /> 클릭을 부르는 후킹 주제
                </h2>
                <button 
                  onClick={handleGenerateTopics}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all active:scale-95"
                >
                  <RefreshIcon /> 다시 생성하기
                </button>
              </div>
              <div className="space-y-3">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(t.title)}
                    className={`w-full text-left p-6 bg-white border rounded-2xl transition-all flex items-center gap-5 group active:scale-[0.98] ${
                      selectedTopic === t.title ? 'border-indigo-500 shadow-md ring-2 ring-indigo-50' : 'border-slate-100 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50'
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors ${
                      selectedTopic === t.title ? 'bg-indigo-600 text-white' : 'bg-slate-50 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600'
                    }`}>
                      {t.id}
                    </span>
                    <span className={`font-bold leading-tight ${selectedTopic === t.title ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-900'}`}>
                      {t.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === AppState.OUTLINE_GENERATION && outline && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                <ClipboardIcon /> 스크립트 개요 상세
              </h2>
              <div className="bg-indigo-50/50 rounded-3xl p-6 md:p-8 space-y-10 mb-8 border border-indigo-100 shadow-inner">
                <section>
                  <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3">01. INTRO / HOOKING</h3>
                  <p className="text-slate-800 leading-relaxed font-medium text-lg">{outline.intro}</p>
                </section>
                <section>
                  <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3">02. PROBLEM</h3>
                  <p className="text-slate-700 leading-relaxed">{outline.problem}</p>
                </section>
                <section>
                  <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">03. BODY POINTS</h3>
                  <div className="grid md:grid-cols-1 gap-4">
                    {outline.points.map((p, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2 text-base">
                          <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">{idx+1}</span>
                          {p.title}
                        </h4>
                        <ul className="space-y-2">
                          {p.details.map((d, dIdx) => (
                            <li key={dIdx} className="text-slate-600 text-sm flex gap-2 leading-relaxed">
                              <span className="text-indigo-400 text-xs mt-1.5 shrink-0">●</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3">04. CONCLUSION & CTA</h3>
                  <div className="bg-white/80 p-5 rounded-2xl border border-indigo-50">
                    <p className="text-slate-700 mb-3 font-semibold">{outline.conclusion}</p>
                    <p className="text-slate-400 italic text-sm">{outline.closing}</p>
                  </div>
                </section>
              </div>

              <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white shadow-2xl transition-all">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                   개요 구체화 요청 (선택 사항)
                </h4>
                <textarea
                  value={outlineFeedback}
                  onChange={(e) => setOutlineFeedback(e.target.value)}
                  placeholder="본론 내용을 더 구체적으로 보강해줘, 실천 가능한 팁을 위주로 구성해줘 등..."
                  className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 mb-4 placeholder:text-slate-500 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleRefineOutline}
                    disabled={isLoading || !outlineFeedback.trim()}
                    className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-400 transition-all text-sm disabled:opacity-30 active:scale-95"
                  >
                    개요 다시 구성하기
                  </button>
                  <button
                    onClick={() => handleGenerateScript(false)}
                    className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm active:scale-95"
                  >
                    이대로 대본 작성하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === AppState.SCRIPT_GENERATION && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    <PenIcon /> 스크립트 본문
                  </h2>
                   <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black shadow-sm">
                     {charCount.toLocaleString()} 자
                   </span>
                </div>
              </div>
              
              <div className="relative group mb-8">
                 <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-10 min-h-[600px] whitespace-pre-wrap leading-relaxed text-slate-800 shadow-inner overflow-y-auto max-h-[80vh] font-medium custom-scrollbar">
                  {fullScript}
                </div>
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => copyToClipboard(fullScript)}
                    className="bg-white border border-slate-200 text-slate-600 p-3 rounded-2xl shadow-xl hover:text-indigo-600 transition-all"
                    title="복사하기"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                </div>
              </div>

              {!isStreaming && (
                <div className="bg-slate-100 p-6 rounded-[2rem] space-y-4 shadow-sm border border-slate-200">
                  <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">REFINE OR FINALIZE</h4>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={scriptFeedback}
                        onChange={(e) => setScriptFeedback(e.target.value)}
                        placeholder="전체적으로 더 유머러스하게 고쳐줘, 특정 사례를 삭제해줘 등..."
                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-sm"
                      />
                      <button
                        onClick={() => handleGenerateScript(true)}
                        disabled={!scriptFeedback.trim()}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm disabled:opacity-30 active:scale-95"
                      >
                        본문 구체화 요청
                      </button>
                    </div>
                    <button
                      onClick={() => setStep(AppState.APPROVED)}
                      className="md:w-48 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
                    >
                      본문 승인
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === AppState.APPROVED && (
            <div className="text-center py-20 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-lg">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">대본이 완성되었습니다!</h2>
              <p className="text-slate-500 mb-10 font-medium">이제 멋진 영상을 제작할 준비가 되셨나요?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => copyToClipboard(fullScript)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  최종 대본 복사
                </button>
                <button
                  onClick={reset}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  새로운 기획 시작
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 relative custom-scrollbar">
            <button 
              onClick={() => setShowGuide(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
                <InfoIcon />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">서비스 사용 가이드</h2>
              <p className="text-slate-500 mt-2 font-medium">누구나 쉽게 고퀄리티 유튜브 대본을 만들 수 있어요!</p>
            </div>
            
            <div className="space-y-8">
              
              {/* Intro Box */}
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <h3 className="font-bold text-slate-800 text-lg mb-2">👋 안녕하세요, 크리에이터님!</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   막막한 대본 작성 때문에 고민이 많으셨나요? <br/>
                   이제 키워드 몇 개만 던져주세요. <strong>주제 선정부터 개요, 그리고 2,000자 분량의 전체 대본</strong>까지 AI가 순식간에 완성해 드립니다.
                 </p>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">카테고리 융합 & 아이디어 도출</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      평소 관심 있는 분야들을 선택하거나 직접 입력해보세요. 서로 다른 분야를 섞으면(예: 뇌과학 + 재테크) 남들이 생각지 못한 <strong>창의적인 주제</strong>가 탄생합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">후킹한 주제 선택</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      AI가 조회수를 부르는 <strong>매력적인 제목 10가지</strong>를 제안합니다. 가장 마음에 드는 주제를 클릭하기만 하면 다음 단계로 넘어갑니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">개요 설계 및 대본 완성</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      '도입부-문제제기-본론-결론'으로 짜인 탄탄한 기획안을 먼저 확인하세요. 수정하고 싶은 부분이 있다면 AI에게 피드백을 주어 <strong>완벽한 맞춤형 대본</strong>을 완성할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Key Note */}
               <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4 items-start">
                <div className="mt-1 text-orange-500 flex-shrink-0">
                  <KeyIcon />
                </div>
                <div>
                  <h4 className="font-bold text-orange-800 text-sm mb-1">무료 API Key가 필요해요</h4>
                  <p className="text-xs text-orange-700/80 leading-relaxed">
                    이 서비스는 Google의 Gemini Pro 모델을 사용합니다. 왼쪽 하단 <strong>'API 키 설정하기'</strong> 버튼을 눌러 무료 키를 등록해주세요. 키는 서버에 전송되지 않고 브라우저에만 안전하게 저장됩니다.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowGuide(false)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold mt-10 hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
            >
              이제 시작해볼까요?
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 relative">
             <button 
              onClick={() => setShowKeyModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <KeyIcon />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Gemini API Key 설정</h2>
              <p className="text-slate-500 text-sm mt-2">
                Google AI Studio에서 발급받은<br/>무료 API Key를 입력해주세요.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">API Key</label>
                <input 
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono"
                />
              </div>
              
              <div className="flex gap-2 text-[10px] text-slate-400 justify-center">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 키는 브라우저에만 안전하게 저장됩니다.
              </div>

              <div className="flex gap-3 mt-4">
                {hasKey && (
                  <button 
                    type="button"
                    onClick={handleClearKey}
                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                  >
                    삭제
                  </button>
                )}
                <button 
                  type="button"
                  onClick={handleSaveKey}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  저장하기
                </button>
              </div>

              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center text-xs text-indigo-500 hover:underline font-bold mt-4"
              >
                API Key 무료로 발급받기 →
              </a>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="relative w-24 h-24 mx-auto mb-10">
              <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
              AI가 설계 중입니다
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              잠시만 기다려주세요.<br/>
              최고의 아이디어를 설계하고 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
