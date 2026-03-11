import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Printer, UserPlus, Settings2, Image as ImageIcon, 
  Trash2, Download, FileUp, Plus, ChevronRight, Layout,
  Type, Building2, User
} from 'lucide-react';

const App = () => {
  const [members, setMembers] = useState([
    { id: 1, company: '八洲建設株式会社', title: '代表取締役', name: '水野 貴之', titleSize: 24, nameSize: 72, companySize: 20, logo: null },
    { id: 2, company: '八洲建設株式会社', title: '取締役 経営企画部長', name: '市山 秀典', titleSize: 20, nameSize: 64, companySize: 20, logo: null }
  ]);

  // 初期読み込み: localStorageからデータを復元
  useEffect(() => {
    const savedMembers = localStorage.getItem('nameplate-members-v2');
    if (savedMembers) {
      try {
        setMembers(JSON.parse(savedMembers));
      } catch (e) {
        console.error('Failed to parse saved members', e);
      }
    }
  }, []);

  // データの自動保存
  useEffect(() => {
    localStorage.setItem('nameplate-members-v2', JSON.stringify(members));
  }, [members]);

  const handleLogoUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => updateMember(id, 'logo', f.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const text = f.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newMembers = lines.slice(1).map((line, index) => {
          const [company, title, name] = line.split(',');
          return {
            id: Date.now() + index,
            company: company || '八洲建設株式会社',
            title: title || '',
            name: name || '',
            titleSize: 24,
            nameSize: 72,
            companySize: 20,
            logo: null
          };
        });
        setMembers([...members, ...newMembers]);
      };
      reader.readAsText(file);
    }
  };

  const downloadJSON = () => {
    const data = { version: '2.0', members };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nameplate-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJSONUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        try {
          const data = JSON.parse(f.target.result);
          if (data.members) setMembers(data.members);
          alert('設定を読み込みました');
        } catch (e) {
          alert('JSONファイルの読み込みに失敗しました');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMember = (id) => {
    if (confirm('この名札を削除してもよろしいですか？')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const addMember = () => {
    setMembers([...members, {
      id: Date.now(),
      company: '会社名を入力',
      title: '役職名',
      name: '氏名',
      titleSize: 24,
      nameSize: 72,
      companySize: 20,
      logo: null
    }]);
  };

  const print = () => window.print();

  const pages = [];
  for (let i = 0; i < members.length; i += 2) {
    pages.push(members.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row print-root">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@700&family=Inter:wght@400;700&display=swap');
        
        body { font-family: 'Noto Sans JP', sans-serif; }
        .serif { font-family: 'Noto Serif JP', serif; }
        
        @media screen {
          .preview-scroll {
            height: 100vh;
            overflow-y: auto;
            padding: 2rem 1rem;
          }
          .page-wrapper {
            /* 210mm * 0.5 = 105mm ≈ 397px, 297mm * 0.5 = 148.5mm ≈ 561px */
            width: 397px;
            height: 561px;
            margin: 0 auto 1.5rem auto;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          .a4-page {
            width: 210mm;
            height: 297mm;
            padding: 0;
            background: white;
            transform-origin: top left;
            transform: scale(0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15mm;
          }
          /* Screen preview nameplate styling */
          .nameplate-slot {
            width: 180mm;
            height: 130mm;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .nameplate-half {
            height: 65mm;
            min-height: 65mm;
            max-height: 65mm;
            overflow: hidden;
          }
        }

        @media screen and (min-width: 1280px) {
          .page-wrapper {
            /* 210mm * 0.55 ≈ 437px, 297mm * 0.55 ≈ 617px */
            width: 437px;
            height: 617px;
          }
          .a4-page { transform: scale(0.55); }
        }

        @media screen and (min-width: 1536px) {
          .page-wrapper {
            width: 476px;
            height: 672px;
          }
          .a4-page { transform: scale(0.6); }
        }

        @media print {
          @page {
            size: 210mm 297mm;
            margin: 0;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          .no-print { display: none !important; }
          
          /* Reset parent containers */
          .print-root {
            min-height: 0 !important;
            display: block !important;
            width: 210mm !important;
          }
          .print-container {
            flex: none !important;
            display: block !important;
            width: 210mm !important;
            background: white !important;
          }
          .preview-scroll {
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            display: block !important;
          }
          .preview-scroll > div {
            display: block !important;
            width: 210mm !important;
          }
          
          /* Page wrapper = exactly A4 */
          .page-wrapper {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .a4-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 15mm !important;
          }
          
          /* Each nameplate = exactly 180x130mm */
          .nameplate-slot {
            width: 180mm !important;
            height: 130mm !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            overflow: hidden !important;
            border: 1px solid #ddd !important;
          }
          /* Top half (mountain fold) and bottom half (front) */
          .nameplate-half {
            height: 65mm !important;
            min-height: 65mm !important;
            max-height: 65mm !important;
            overflow: hidden !important;
          }
          
          .fold-guide { display: none !important; }
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}} />

      {/* エディタパネル (左) */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-slate-200 no-print shrink-0 shadow-xl z-10 flex flex-col h-screen">
        {/* 固定ヘッダー＋ツールバー */}
        <div className="shrink-0 p-6 pb-4">
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Layout className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">卓上名札ジェネレーター</h1>
            </div>
            <p className="text-slate-500 text-sm">高品質な卓上名札をA4用紙で作成</p>
          </header>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer group">
                <FileUp className="text-slate-400 group-hover:text-blue-500 mb-1" size={20} />
                <span className="text-xs font-medium text-slate-600">CSV読込</span>
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>
              <button 
                onClick={downloadJSON}
                className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition group"
              >
                <Download className="text-slate-400 group-hover:text-orange-500 mb-1" size={20} />
                <span className="text-xs font-medium text-slate-600">JSON保存</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer group">
                <FileUp className="text-slate-400 group-hover:text-slate-600 mb-1" size={20} />
                <span className="text-xs font-medium text-slate-600">JSON設定読込</span>
                <input type="file" accept=".json" onChange={handleJSONUpload} className="hidden" />
              </label>
              <button 
                onClick={addMember}
                className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-900 rounded-xl hover:bg-slate-800 transition group"
              >
                <Plus className="text-white group-hover:scale-110 transition" size={20} />
                <span className="text-xs font-medium text-white">名簿追加</span>
              </button>
            </div>

            <button 
              onClick={print}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 shadow-md"
            >
              <Printer size={22} />
              A4 印刷する
            </button>
          </div>
        </div>

        {/* スクロール可能な名簿リスト */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 border-t border-slate-100">
          <div className="pt-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
              個別調整 <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs">{members.length}件</span>
            </h2>
            
            <div className="space-y-4">
              {members.map((m, idx) => (
                <div key={m.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400">名札 #{idx + 1}</span>
                    <button onClick={() => removeMember(m.id)} className="text-slate-300 hover:text-red-500 transition p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="shrink-0">
                        <label className="block w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 bg-white cursor-pointer hover:border-blue-400 transition overflow-hidden relative" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {m.logo ? (
                            <img src={m.logo} className="w-full h-full object-contain p-1" alt="logo" />
                          ) : (
                            <ImageIcon className="text-slate-300" size={24} />
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(m.id, e)} className="hidden" />
                          {m.logo && (
                            <button 
                              onClick={(e) => { e.preventDefault(); updateMember(m.id, 'logo', null); }}
                              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition"
                            >
                              <Trash2 size={16} className="text-white" />
                            </button>
                          )}
                        </label>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="relative">
                          <Building2 className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            placeholder="会社名" 
                            value={m.company} 
                            onChange={(e) => updateMember(m.id, 'company', e.target.value)} 
                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none font-bold" 
                          />
                        </div>
                        <div className="relative">
                          <User className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            placeholder="氏名" 
                            value={m.name} 
                            onChange={(e) => updateMember(m.id, 'name', e.target.value)} 
                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none font-bold" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <Type className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                      <textarea 
                        placeholder="役職名" 
                        rows="1"
                        value={m.title} 
                        onChange={(e) => updateMember(m.id, 'title', e.target.value)} 
                        className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none" 
                      />
                    </div>

                    <div className="px-1 space-y-3 pt-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">氏名サイズ</span>
                          <span className="text-xs font-bold text-blue-600">{m.nameSize}px</span>
                        </div>
                        <input type="range" min="30" max="150" value={m.nameSize} onChange={(e) => updateMember(m.id, 'nameSize', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">役職</span>
                            <span className="text-xs font-bold text-blue-600">{m.titleSize}px</span>
                          </div>
                          <input type="range" min="10" max="60" value={m.titleSize} onChange={(e) => updateMember(m.id, 'titleSize', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">社名</span>
                            <span className="text-xs font-bold text-blue-600">{m.companySize}px</span>
                          </div>
                          <input type="range" min="10" max="60" value={m.companySize} onChange={(e) => updateMember(m.id, 'companySize', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* プレビューパネル (右) - 印刷時はこれがそのまま出力される */}
      <div className="flex-1 bg-[#f1f5f9] print-container">
        <div className="preview-scroll">
          <div className="flex flex-col items-center">
          {pages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 mt-20">
              <Layout size={64} opacity={0.2} />
              <p>名札を追加するとプレビューが表示されます</p>
            </div>
          ) : (
            pages.map((pageMembers, pIdx) => (
              <div key={pIdx} className="page-wrapper">
              <div className="a4-page relative overflow-hidden">
                {pageMembers.map((m, mIdx) => (
                  <div key={m.id} className="nameplate-slot relative">
                    {/* 山折り部分（反転） */}
                    <div className="nameplate-half flex flex-col justify-end items-center pb-6 rotate-180 transform border-b border-slate-50">
                      <div className="flex flex-col items-center justify-center w-full px-16">
                        <div className="flex items-center justify-center gap-4 mb-3 h-10">
                          {m.logo && <img src={m.logo} className="h-full object-contain max-w-[50px]" alt="logo" />}
                          <span style={{ fontSize: `${m.companySize}px` }} className="font-bold text-slate-800 tracking-[0.15em] whitespace-nowrap">{m.company}</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-6 w-full">
                          <div style={{ fontSize: `${m.titleSize}px` }} className="font-bold text-slate-700 leading-tight whitespace-pre-line text-right w-[40%]">
                            {m.title}
                          </div>
                          <div style={{ fontSize: `${m.nameSize}px` }} className="serif font-bold text-black flex-1 text-left tracking-[0.2em] whitespace-nowrap leading-none py-2">
                            {m.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 表側 */}
                    <div className="nameplate-half flex flex-col justify-center items-center pt-6">
                      <div className="flex flex-col items-center justify-center w-full px-16">
                        <div className="flex items-center justify-center gap-4 mb-3 h-10">
                          {m.logo && <img src={m.logo} className="h-full object-contain max-w-[50px]" alt="logo" />}
                          <span style={{ fontSize: `${m.companySize}px` }} className="font-bold text-slate-800 tracking-[0.15em] whitespace-nowrap">{m.company}</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-6 w-full">
                          <div style={{ fontSize: `${m.titleSize}px` }} className="font-bold text-slate-700 leading-tight whitespace-pre-line text-right w-[40%]">
                            {m.title}
                          </div>
                          <div style={{ fontSize: `${m.nameSize}px` }} className="serif font-bold text-black flex-1 text-left tracking-[0.2em] whitespace-nowrap leading-none py-2">
                            {m.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 折り目ガイド線 */}
                    <div className="fold-guide absolute top-1/2 left-0 w-full border-t border-slate-200 border-dotted pointer-events-none"></div>
                    <div className="fold-guide absolute top-1/2 left-2 -translate-y-1/2 text-[10px] text-slate-300 font-mono">山折り</div>
                  </div>
                ))}
              </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default App;

