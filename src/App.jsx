import React, { useState, useEffect, useRef } from 'react';
import { Upload, Printer, UserPlus, Settings2, Image as ImageIcon, Trash2, Download, FileUp, Save } from 'lucide-react';

const App = () => {
  const [logo, setLogo] = useState(null);
  const [members, setMembers] = useState([
    { id: 1, company: '八洲建設株式会社', title: '代表取締役', name: '水野 貴之', titleSize: 24, nameSize: 72, companySize: 20 },
    { id: 2, company: '八洲建設株式会社', title: '取締役 経営企画部長', name: '市山 秀典', titleSize: 20, nameSize: 64, companySize: 20 }
  ]);

  // 初期読み込み: localStorageからデータを復元
  useEffect(() => {
    const savedMembers = localStorage.getItem('nameplate-members');
    const savedLogo = localStorage.getItem('nameplate-logo');
    if (savedMembers) {
      try {
        setMembers(JSON.parse(savedMembers));
      } catch (e) {
        console.error('Failed to parse saved members', e);
      }
    }
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  // データの自動保存: members または logo が変更されたら localStorage に保存
  useEffect(() => {
    localStorage.setItem('nameplate-members', JSON.stringify(members));
    if (logo) {
      localStorage.setItem('nameplate-logo', logo);
    } else {
      localStorage.removeItem('nameplate-logo');
    }
  }, [members, logo]);

  // ロゴアップロード処理
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => setLogo(f.target.result);
      reader.readAsDataURL(file);
    }
  };

  // CSVアップロード (簡易版)
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
            companySize: 20
          };
        });
        setMembers(newMembers);
      };
      reader.readAsText(file);
    }
  };

  // JSONダウンロード (設定の書き出し)
  const downloadJSON = () => {
    const data = {
      version: '1.0',
      logo: logo,
      members: members
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nameplate-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSONアップロード (設定の読み込み)
  const handleJSONUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        try {
          const data = JSON.parse(f.target.result);
          if (data.members) setMembers(data.members);
          if (data.logo) setLogo(data.logo);
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
    setMembers(members.filter(m => m.id !== id));
  };

  const addMember = () => {
    setMembers([...members, {
      id: Date.now(),
      company: '八洲建設株式会社',
      title: '役職名',
      name: '氏名',
      titleSize: 24,
      nameSize: 72,
      companySize: 20
    }]);
  };

  const print = () => {
    window.print();
  };

  // 印刷用ページごとに分割（1ページ2名）
  const pages = [];
  for (let i = 0; i < members.length; i += 2) {
    pages.push(members.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24">
      {/* 操作パネル - 印刷時は非表示 */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8 print:hidden border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Settings2 className="text-blue-600" />
          卓上名札ジェネレーター
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">1. 基本設定</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                <Upload size={18} />
                CSVをアップロード
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition">
                <ImageIcon size={18} />
                ロゴ設定
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <button 
                onClick={addMember}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
              >
                <UserPlus size={18} />
                名簿を追加
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2">
              <button 
                onClick={downloadJSON}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <Download size={18} />
                JSONをダウンロード
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg cursor-pointer hover:bg-slate-700 transition">
                <FileUp size={18} />
                JSONをアップロード
                <input type="file" accept=".json" onChange={handleJSONUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-500 italic">※CSV形式: 会社名,役職,氏名</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">2. 出力</label>
            <button 
              onClick={print}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 shadow-lg shadow-red-200 transition active:scale-95"
            >
              <Printer size={24} />
              印刷する (A4用紙)
            </button>
          </div>
        </div>

        {/* 編集エリア */}
        <div className="border-t pt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">3. 個別調整</label>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {members.map((m, idx) => (
              <div key={m.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-600">#{idx + 1} {m.name} 様</span>
                  <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">氏名サイズ: {m.nameSize}px</label>
                    <input type="range" min="30" max="120" value={m.nameSize} onChange={(e) => updateMember(m.id, 'nameSize', parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                    <input type="text" value={m.name} onChange={(e) => updateMember(m.id, 'name', e.target.value)} className="mt-2 w-full p-1 text-sm border rounded" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">役職サイズ: {m.titleSize}px</label>
                    <input type="range" min="10" max="60" value={m.titleSize} onChange={(e) => updateMember(m.id, 'titleSize', parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                    <textarea rows="2" value={m.title} onChange={(e) => updateMember(m.id, 'title', e.target.value)} className="mt-2 w-full p-1 text-sm border rounded" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">社名サイズ: {m.companySize}px</label>
                    <input type="range" min="10" max="40" value={m.companySize} onChange={(e) => updateMember(m.id, 'companySize', parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                    <input type="text" value={m.company} onChange={(e) => updateMember(m.id, 'company', e.target.value)} className="mt-2 w-full p-1 text-sm border rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* プレビュー/印刷エリア */}
      <div className="print-area mx-auto">
        {pages.map((pageMembers, pIdx) => (
          <div key={pIdx} className="a4-page bg-white shadow-2xl mx-auto mb-8 relative overflow-hidden print:shadow-none print:m-0">
            {pageMembers.map((m, mIdx) => (
              <div key={m.id} className={`nameplate-slot relative h-1/2 border-b last:border-0 border-dashed border-slate-300 flex flex-col justify-center`}>
                {/* 山折り部分（反転） */}
                <div className="h-1/2 w-full flex flex-col justify-end items-center pb-12 rotate-180 transform border-b border-slate-100">
                   <div className="flex items-center justify-center gap-3 mb-4">
                    <span style={{ fontSize: `${m.companySize}px` }} className="font-bold text-slate-800 tracking-wider whitespace-nowrap">{m.company}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 w-full px-12">
                    <div style={{ fontSize: `${m.titleSize}px` }} className="font-bold text-slate-700 leading-tight whitespace-pre-line text-right w-1/3">
                      {m.title}
                    </div>
                    <div style={{ fontSize: `${m.nameSize}px`, fontFamily: 'serif' }} className="font-bold text-black flex-1 text-left tracking-widest whitespace-nowrap">
                      {m.name}
                    </div>
                  </div>
                </div>

                {/* 表側 */}
                <div className="h-1/2 w-full flex flex-col justify-center items-center pt-12">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span style={{ fontSize: `${m.companySize}px` }} className="font-bold text-slate-800 tracking-wider whitespace-nowrap">{m.company}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 w-full px-12">
                    <div style={{ fontSize: `${m.titleSize}px` }} className="font-bold text-slate-700 leading-tight whitespace-pre-line text-right w-1/3">
                      {m.title}
                    </div>
                    <div style={{ fontSize: `${m.nameSize}px`, fontFamily: 'serif' }} className="font-bold text-black flex-1 text-left tracking-widest whitespace-nowrap">
                      {m.name}
                    </div>
                  </div>
                </div>
                
                {/* 折り目ガイド線（印刷時は非常に薄く） */}
                <div className="absolute top-1/2 left-0 w-full border-t border-slate-200 border-dotted pointer-events-none"></div>
                <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[8px] text-slate-300 print:hidden font-mono">山折り</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .a4-page {
            width: 210mm;
            height: 297mm;
            padding: 10mm;
          }
        }
        @media print {
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .a4-page {
            width: 210mm;
            height: 297mm;
            padding: 0;
            margin: 0 !important;
            page-break-after: always;
            box-shadow: none !important;
            border: none !important;
          }
          .nameplate-slot {
            border-bottom: 1px dashed #eee !important;
          }
          .print:hidden { display: none !important; }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
        }
      `}} />
    </div>
  );
};

export default App;
