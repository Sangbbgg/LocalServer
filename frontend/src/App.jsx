import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Search, 
  Menu,
  ClipboardList, 
  Wrench,        
  ClipboardCheck, 
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  CalendarDays,
  Truck,
  Activity,
  FileText,
  FilePlus,
  Files,
  Printer,
  Save,
  Download,
  Sun,
  Plus,
  Minus,
  List,
  ArrowLeft,
  ChevronDown as ChevronDownIcon,
  Circle,
  CheckCircle2,
  FileEdit,
  Trash2 
} from 'lucide-react';

// --- Mock Data & Constants ---

// 메뉴 구조
const MENUS = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { 
    id: 'tasks', 
    label: '업무관리', 
    icon: ClipboardList,
    children: [
      { id: 'tasks-daily', label: '일일업무', icon: Calendar },
      { id: 'tasks-weekly', label: '주간업무', icon: CalendarDays },
      { id: 'tasks-external', label: '외부업체 점검/작업', icon: Truck },
    ]
  },
  { 
    id: 'facilities', 
    label: '설비관리', 
    icon: Wrench,
    children: [
      { id: 'facilities-status', label: '설비현황', icon: Activity },
      { id: 'facilities-specs', label: '설비 제원현황', icon: FileText },
      { id: 'facilities-mgmt', label: '설비 관리현황', icon: Settings },
    ]
  },
  { 
    id: 'inspections', 
    label: '예방점검현황', 
    icon: ClipboardCheck,
    children: [
      { id: 'inspection-single', label: '점검기록등록(단일)', icon: FilePlus },
      { id: 'inspection-multi', label: '점검기록등록(복수)', icon: Files },
      { id: 'inspection-report', label: '점검보고서 출력', icon: Printer },
    ]
  },
  { id: 'settings', label: '시스템 설정', icon: Settings },
];

// 대시보드 통계
const MOCK_STATS = [
  { label: '금일 작업 달성률', value: '94%', change: '+2.5%', isPositive: true },
  { label: '가동 중인 설비', value: '18/20', change: '-1기', isPositive: false },
  { label: '예방점검 완료', value: '12/15', change: '진행중', isPositive: true },
  { label: '안전 이슈', value: '0건', change: '정상', isPositive: true },
];

// 목록 보기용 샘플 데이터 (초기 데이터)
const INITIAL_HISTORY_LIST = [
  { 
    id: 107, 
    date: '2025-12-18', 
    day: '목', 
    fullDate: '2025년 12월 18일 (목)', 
    createdAt: '2025-12-18 09:00', 
    updatedAt: null 
  },
  { 
    id: 106, 
    date: '2025-12-17', 
    day: '수', 
    fullDate: '2025년 12월 17일 (수)', 
    createdAt: '2025-12-17 08:50', 
    updatedAt: '2025-12-17 16:30' 
  },
  { 
    id: 105, 
    date: '2025-12-16', 
    day: '화', 
    fullDate: '2025년 12월 16일 (화)', 
    createdAt: '2025-12-16 09:10', 
    updatedAt: null 
  },
  { 
    id: 104, 
    date: '2025-12-15', 
    day: '월', 
    fullDate: '2025년 12월 15일 (월)', 
    createdAt: '2025-12-15 08:45', 
    updatedAt: '2025-12-15 14:20' 
  },
  { 
    id: 101, 
    date: '2025-12-14', 
    day: '일', 
    fullDate: '2025년 12월 14일 (일)', 
    createdAt: '2025-12-14 10:00', 
    updatedAt: null 
  },
  { 
    id: 102, 
    date: '2025-12-13', 
    day: '토', 
    fullDate: '2025년 12월 13일 (토)', 
    createdAt: '2025-12-13 09:30', 
    updatedAt: null 
  },
  { 
    id: 103, 
    date: '2025-12-12', 
    day: '금', 
    fullDate: '2025년 12월 12일 (금)', 
    createdAt: '2025-12-12 08:55', 
    updatedAt: '2025-12-12 11:15' 
  },
];

// 설비 제원
const FACILITY_SPECS = [
  { id: 'F-001', name: '사출성형기 1호', model: 'HJ-2000', maker: '현대정밀', installDate: '2020-05-15', power: '380V / 50kW' },
  { id: 'F-002', name: '사출성형기 2호', model: 'HJ-2500', maker: '현대정밀', installDate: '2021-02-10', power: '380V / 60kW' },
  { id: 'F-003', name: '공기 압축기', model: 'AC-500', maker: '한신', installDate: '2019-11-20', power: '220V / 20kW' },
];

// 날짜 유틸리티
const getDayName = (dateStr) => {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return dayNames[new Date(dateStr).getDay()];
};

const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${getDayName(dateStr)})`;
};

// --- Components ---

const Sidebar = ({ activeMenu, setActiveMenu, expandedMenus, toggleExpanded }) => (
  <div className="w-64 bg-slate-900 text-white flex flex-col h-full fixed left-0 top-0 z-10 hidden md:flex">
    <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">F</div>
      <span className="text-xl font-bold tracking-tight">Facil-ERP</span>
    </div>

    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1 px-3">
        {MENUS.map((menu) => {
          const Icon = menu.icon;
          const hasChildren = menu.children && menu.children.length > 0;
          const isExpanded = expandedMenus.includes(menu.id);
          const isActive = activeMenu === menu.id || (hasChildren && menu.children.some(c => c.id === activeMenu));

          return (
            <li key={menu.id}>
              <button
                onClick={() => hasChildren ? toggleExpanded(menu.id) : setActiveMenu(menu.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive && !hasChildren
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-medium">{menu.label}</span>
                </div>
                {hasChildren && (
                  isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
              </button>

              {hasChildren && isExpanded && (
                <ul className="mt-1 ml-4 border-l-2 border-slate-700 pl-2 space-y-1">
                  {menu.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = activeMenu === child.id;
                    return (
                      <li key={child.id}>
                        <button
                          onClick={() => setActiveMenu(child.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors ${
                            isChildActive
                              ? 'text-indigo-400 font-semibold bg-slate-800'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <ChildIcon size={16} />
                          <span>{child.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  </div>
);

const Header = ({ title }) => (
  <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
    <div className="flex items-center">
      <button className="md:hidden mr-4 text-slate-500">
        <Menu size={24} />
      </button>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>

    <div className="flex items-center space-x-4">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="검색..." 
          className="pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
      </div>
      <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
    </div>
  </header>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    '완료': 'bg-green-100 text-green-700',
    '가동중': 'bg-green-100 text-green-700',
    '양호': 'bg-green-100 text-green-700',
    '정상': 'bg-green-100 text-green-700',
    '진행중': 'bg-blue-100 text-blue-700',
    '계획': 'bg-gray-100 text-gray-700',
    '대기': 'bg-gray-100 text-gray-700',
    '점검중': 'bg-orange-100 text-orange-700',
    '조치필요': 'bg-red-100 text-red-700',
    '작성중': 'bg-gray-200 text-gray-700',
  };
  const style = styles[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>{status}</span>;
};

// --- Sub-View Components ---

// 1. 업무관리 Views
const DailyTaskView = () => {
  const [viewMode, setViewMode] = useState('list'); // 'write' | 'list'
  const [isEditMode, setIsEditMode] = useState(false); // '작성' vs '수정' 모드
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY_LIST); // State for list
  
  // 오늘 날짜 YYYY-MM-DD
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 초기 폼 상태
  const initialFormState = {
    id: null,
    rawDate: todayStr, // input date value용
    date: formatDateWithDay(todayStr), // 표시용
    weather: '',
    section1: [{ id: Date.now(), time: '', title: '', detail: '', status: '진행중' }],
    section2: [{ id: Date.now() + 1, time: '', title: '', detail: '', status: '진행중' }],
    section3: [{ id: Date.now() + 2, time: '', title: '', detail: '', status: '진행중' }],
    note: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // 날짜 변경 핸들러 (중복 체크)
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    
    // 중복 체크: 이미 존재하는 날짜인지 확인 (수정 모드일 경우 자기 자신 제외)
    const isDuplicate = historyList.some(item => 
      item.date === newDate && item.id !== formData.id
    );
    
    if (isDuplicate) {
      alert(`[${newDate}] 일자는 이미 작성된 일지가 존재합니다.`);
      return; 
    }

    setFormData(prev => ({
      ...prev,
      rawDate: newDate,
      date: formatDateWithDay(newDate)
    }));
  };

  // Row 핸들러
  const addRow = (sectionKey) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], { id: Date.now() + Math.random(), time: '', title: '', detail: '', status: '진행중' }]
    }));
  };

  const removeRow = (sectionKey, id) => {
    setFormData(prev => {
      return {
        ...prev,
        [sectionKey]: prev[sectionKey].filter(row => row.id !== id)
      };
    });
  };

  const updateRow = (sectionKey, id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    }));
  };

  // Textarea 자동 높이 조절
  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // 목록에서 항목 클릭 (수정 모드 진입)
  const handleItemClick = (log) => {
    setFormData({
      ...initialFormState,
      id: log.id,
      rawDate: log.date,
      date: log.fullDate, 
      // 실제로는 여기서 log 데이터를 기반으로 내용을 채워야 함
    });
    setIsEditMode(true);
    setViewMode('write');
  };

  // 항목 삭제 핸들러
  const handleDelete = (e, id) => {
    e.stopPropagation(); // 부모(tr) 클릭 이벤트 전파 중단
    if (window.confirm('정말로 이 일지를 삭제하시겠습니까?')) {
      setHistoryList(prev => prev.filter(item => item.id !== id));
    }
  };

  // 새 일지 작성 클릭 (작성 모드 진입)
  const handleNewClick = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setViewMode('write');
  };

  // 저장/수정 버튼 클릭
  const handleSave = () => {
    const msg = isEditMode ? "수정되었습니다." : "저장되었습니다.";
    alert(msg);
    setViewMode('list');
  };

  // --- 화면 렌더링 ---

  // 1. 목록 화면 (List Mode)
  if (viewMode === 'list') {
    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList size={20} /> 일일업무일지 목록
          </h3>
          <button 
            onClick={handleNewClick}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={16} /> 새 일지 작성
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">
                      일자
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">
                      작성일(최초)
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">
                      수정일
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-20">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyList.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => handleItemClick(log)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {log.fullDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">
                        {log.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">
                        {log.updatedAt || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={(e) => handleDelete(e, log.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 2. 작성 화면 (Write Mode)
  return (
    <div className="flex flex-col items-center">
      {/* Toolbar */}
      <div className="w-full max-w-[210mm] flex justify-between items-center mb-4">
         <button 
           onClick={() => setViewMode('list')}
           className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-50 text-sm font-bold"
         >
           <List size={16}/> 목록
         </button>
         
         <div className="flex space-x-2">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded shadow text-sm font-bold transition-colors
                ${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
            >
              {isEditMode ? <FileEdit size={16}/> : <Save size={16}/>}
              {isEditMode ? '수정' : '저장'}
            </button>
            <button 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm font-bold"
              onClick={() => alert("목업 화면입니다. 실제 다운로드 기능은 제외되었습니다.")}
            >
              <Download size={16}/> HWP 다운로드
            </button>
         </div>
      </div>

      {/* A4 Paper Form Container (Editable) */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-slate-300 p-[15mm] relative text-black">
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8 underline decoration-2 underline-offset-4">
          유지보수 수행 일지(신인천)
        </h1>

        {/* Top Section: Date & Weather Input */}
        <div className="flex justify-between items-end mb-4">
          <div className="text-lg font-bold mb-2 flex items-center">
            {/* 날짜 선택 (입력 가능) */}
            <input 
              type="date" 
              className="font-bold bg-transparent focus:outline-none focus:bg-blue-50 cursor-pointer mr-2"
              value={formData.rawDate}
              onChange={handleDateChange}
            />
            <span className="text-slate-500 text-base font-normal mr-2">
              ({getDayName(formData.rawDate)})
            </span>
            <span className="mx-2 text-slate-400">|</span>
            <span className="flex items-center gap-1">
               날씨: 
               <input 
                 type="text" 
                 className="border-b border-black w-32 focus:outline-none focus:border-blue-500 px-1 text-center bg-transparent"
                 placeholder="날씨 입력"
                 value={formData.weather}
                 onChange={(e) => setFormData(p => ({...p, weather: e.target.value}))}
               />
               <Sun size={16} className="text-orange-500"/>
            </span>
          </div>
          
          {/* Signature Box */}
          <table className="border-collapse border border-black w-32 text-center">
            <tbody>
              <tr>
                <td className="bg-gray-100 border border-black p-1 font-bold text-sm">담 당</td>
              </tr>
              <tr>
                <td className="border border-black h-16 align-middle cursor-pointer hover:bg-gray-50 text-gray-400 text-xs">
                  (인)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Main Table Content */}
        <div className="border-2 border-black">
          <div className="flex border-b border-black bg-gray-100 text-center font-bold">
            <div className="w-[85%] py-2 border-r border-black">수 행 내 역</div>
            <div className="w-[15%] py-2">수행결과</div>
          </div>

          {/* Helper Component for Rendering Sections */}
          {[
            { key: 'section1', title: '1. 유지보수 업무' },
            { key: 'section2', title: '2. 장애처리 및 단순공사' },
            { key: 'section3', title: '3. 기타' }
          ].map((section) => (
            <div key={section.key} className="border-b border-black last:border-b-0">
              <div className="px-2 py-1 font-bold bg-gray-50 border-b border-black border-dashed flex justify-between items-center group">
                <span>{section.title}</span>
                <button 
                  onClick={() => addRow(section.key)}
                  className="bg-blue-100 text-blue-600 rounded-full p-0.5 hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="행 추가"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {formData[section.key].map((row, index) => {
                // Determine active states for time buttons
                const isAm = row.time === '오전' || row.time === '종일';
                const isPm = row.time === '오후' || row.time === '종일';

                const toggleTime = (type) => {
                  let newTime = row.time;
                  if (type === 'am') {
                    if (isAm) {
                      newTime = isPm ? '오후' : '';
                    } else {
                      newTime = isPm ? '종일' : '오전';
                    }
                  } else {
                    if (isPm) {
                      newTime = isAm ? '오전' : '';
                    } else {
                      newTime = isAm ? '종일' : '오후';
                    }
                  }
                  updateRow(section.key, row.id, 'time', newTime);
                };

                return (
                  <div key={row.id} className="flex border-b border-gray-300 last:border-0 min-h-[80px] relative group items-stretch">
                    {/* Content Column (85%) - Split into Time(Left) and Content(Right) */}
                    <div className="w-[85%] flex border-r border-black">
                      
                      {/* 1. Time Column (Merged Row) */}
                      <div className="w-[110px] flex flex-row justify-center items-center border-r border-gray-300 bg-slate-50 p-2 gap-3 shrink-0 select-none">
                        <button 
                          onClick={() => toggleTime('am')}
                          className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none group/btn"
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isAm ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white'}`}>
                            {isAm && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-xs font-bold ${isAm ? 'text-blue-700' : 'text-slate-500'}`}>오전</span>
                        </button>
                        
                        <button 
                          onClick={() => toggleTime('pm')}
                          className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none group/btn"
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isPm ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white'}`}>
                            {isPm && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-xs font-bold ${isPm ? 'text-blue-700' : 'text-slate-500'}`}>오후</span>
                        </button>
                      </div>

                      {/* 2. Content Column */}
                      <div className="flex-1 flex flex-col">
                        {/* Title Row */}
                        <div className="border-b border-gray-300 p-2 flex items-center h-[40px]">
                           <input 
                             className="w-full font-bold focus:outline-none focus:bg-blue-50 bg-transparent placeholder-gray-400 text-black px-1"
                             value={row.title}
                             onChange={(e) => updateRow(section.key, row.id, 'title', e.target.value)}
                             placeholder="제목"
                           />
                        </div>
                        {/* Detail Row (Auto-expanding) */}
                        <div className="flex-1 p-2 flex items-start h-auto">
                           <textarea 
                             rows={1}
                             onInput={handleTextareaResize}
                             className="w-full h-full resize-none focus:outline-none focus:bg-blue-50 text-sm leading-relaxed bg-transparent overflow-hidden placeholder-gray-400 px-1"
                             value={row.detail}
                             onChange={(e) => updateRow(section.key, row.id, 'detail', e.target.value)}
                             placeholder="상세 내용을 입력하세요"
                           />
                        </div>
                      </div>

                    </div>
                    
                    {/* Status Column: Select Box */}
                    <div className="w-[15%] flex items-center justify-center p-1 relative bg-transparent">
                      <select
                        className={`w-full h-full text-center focus:outline-none text-sm font-bold bg-transparent cursor-pointer
                          ${row.status === '완료' ? 'text-blue-600' : 'text-slate-600'}
                        `}
                        value={row.status}
                        onChange={(e) => updateRow(section.key, row.id, 'status', e.target.value)}
                      >
                        <option value="진행중">진행중</option>
                        <option value="완료">완료</option>
                      </select>
                      
                      {/* Delete Button (Visible on Hover) */}
                      <button 
                        onClick={() => removeRow(section.key, row.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-opacity shadow-sm z-10"
                        title="행 삭제"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty Placeholder */}
              {formData[section.key].length === 0 && (
                <div className="h-[60px] flex items-center justify-center text-gray-300 text-sm">
                  (내용 없음)
                  <button onClick={() => addRow(section.key)} className="ml-2 text-blue-500 hover:underline">행 추가</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer: 특이사항 */}
        <div className="mt-4 border-2 border-black min-h-[150px] p-2">
          <div className="font-bold mb-2">【특이 사항】</div>
          <textarea 
            className="w-full h-full min-h-[100px] resize-none focus:outline-none bg-transparent leading-relaxed"
            placeholder="특이사항을 입력하세요."
            value={formData.note}
            onChange={(e) => setFormData(p => ({...p, note: e.target.value}))}
          />
        </div>

      </div>
    </div>
  );
};

const WeeklyTaskView = () => (
  <Card>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold">주간 업무 계획 (10월 4주차)</h3>
      <button className="border border-slate-300 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">주간 보고서 다운로드</button>
    </div>
    <div className="space-y-4">
      {[{ id: 'W-01', week: '10월 4주차', title: '공조기 필터 전수 교체', progress: 40, status: '진행중' },
        { id: 'W-02', week: '10월 4주차', title: '소방 시설 합동 점검', progress: 0, status: '계획' }].map(task => (
        <div key={task.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">{task.title}</p>
            <p className="text-sm text-slate-500">{task.week} | 진행률: {task.progress}%</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
      ))}
    </div>
  </Card>
);

const ExternalTaskView = () => (
  <Card>
    <h3 className="text-lg font-bold mb-4">외부 업체 점검/공사 현황</h3>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
      <AlertCircle className="text-yellow-600 shrink-0" size={20} />
      <div>
        <p className="text-yellow-800 font-bold text-sm">금일 출입 예정 업체</p>
        <p className="text-yellow-700 text-sm">한전KPS (배전반 점검, 14:00~), 세스코 (방역, 16:00~)</p>
      </div>
    </div>
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">업체명</th>
          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">방문목적</th>
          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">방문일시</th>
          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">인솔자</th>
          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">작업허가서</th>
        </tr>
      </thead>
      <tbody>
        <tr className="hover:bg-slate-50">
          <td className="px-6 py-4 text-sm font-medium">한전KPS</td>
          <td className="px-6 py-4 text-sm">정기 배전반 점검</td>
          <td className="px-6 py-4 text-sm">2023-10-25 14:00</td>
          <td className="px-6 py-4 text-sm">최지은</td>
          <td className="px-6 py-4"><span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">승인완료</span></td>
        </tr>
      </tbody>
    </table>
  </Card>
);

// 2. 설비관리 Views
const FacilityStatusView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-slate-100 p-3 rounded-lg">
            <Wrench className="text-slate-600" size={24} />
          </div>
          <StatusBadge status={i === 2 ? '점검중' : '가동중'} />
        </div>
        <h4 className="text-lg font-bold text-slate-800 mb-1">사출성형기 {i}호</h4>
        <p className="text-sm text-slate-500 mb-4">A동 생산라인</p>
        <div className="flex items-center text-xs text-slate-400 space-x-4">
          <span className="flex items-center"><Activity size={14} className="mr-1" /> 85% 부하</span>
          <span className="flex items-center"><Clock size={14} className="mr-1" /> 120h 가동</span>
        </div>
      </Card>
    ))}
  </div>
);

const FacilitySpecView = () => (
  <Card>
    <h3 className="text-lg font-bold mb-6">설비 제원 대장</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">관리번호</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">설비명</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">모델명</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">제조사</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">설치일자</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">전원사양</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {FACILITY_SPECS.map(spec => (
            <tr key={spec.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-500">{spec.id}</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800">{spec.name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{spec.model}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{spec.maker}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{spec.installDate}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{spec.power}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const FacilityMgmtView = () => (
  <Card>
    <div className="flex justify-between mb-4">
      <h3 className="text-lg font-bold">설비 유지보수 이력</h3>
      <input type="month" className="border rounded px-2 text-sm" />
    </div>
    <div className="border-l-2 border-slate-200 pl-4 space-y-6">
      <div className="relative">
        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
        <p className="text-sm text-slate-400 mb-1">2023-10-20</p>
        <p className="font-bold text-slate-800">2호기 유압유 교체 및 필터 청소</p>
        <p className="text-sm text-slate-600 mt-1">작업자: 시설팀 전원 | 소요시간: 4H</p>
      </div>
      <div className="relative">
        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
        <p className="text-sm text-slate-400 mb-1">2023-10-15</p>
        <p className="font-bold text-slate-800">1호기 컨트롤러 펌웨어 업데이트</p>
        <p className="text-sm text-slate-600 mt-1">작업자: 제조사 엔지니어</p>
      </div>
    </div>
  </Card>
);

// 3. 예방점검현황 Views
const InspectionRegisterSingleView = () => (
  <Card className="max-w-2xl mx-auto">
    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
      <FilePlus size={20} /> 점검 기록 등록 (단일)
    </h3>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">점검 대상 설비</label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-white">
            <option>사출성형기 1호</option>
            <option>사출성형기 2호</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">점검 구분</label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-white">
            <option>정기점검</option>
            <option>특별점검</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">점검일자</label>
        <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">특이사항 및 조치내역</label>
        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 h-32" placeholder="점검 결과 특이사항을 입력하세요."></textarea>
      </div>
      <div className="flex items-center space-x-4">
        <label className="block text-sm font-medium text-slate-700">최종 판정:</label>
        <label className="flex items-center space-x-2"><input type="radio" name="result" defaultChecked /> <span>적합</span></label>
        <label className="flex items-center space-x-2"><input type="radio" name="result" /> <span>부적합</span></label>
      </div>
      <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2">
        <Save size={18} /> 저장하기
      </button>
    </div>
  </Card>
);

const InspectionRegisterMultiView = () => (
  <Card>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Files size={20} /> 일괄 점검 기록 등록
      </h3>
      <button className="text-sm text-indigo-600 hover:underline">엑셀 양식 다운로드</button>
    </div>
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full min-w-[800px]">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">No</th>
            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase w-48">설비명</th>
            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">점검항목</th>
            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">수치(온도/압력)</th>
            <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase">판정</th>
            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase w-64">비고</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row}>
              <td className="p-3 text-sm text-slate-500">{row}</td>
              <td className="p-3"><input type="text" className="w-full border rounded px-2 py-1 text-sm" defaultValue={row === 1 ? "사출성형기 1호" : ""} /></td>
              <td className="p-3"><input type="text" className="w-full border rounded px-2 py-1 text-sm" /></td>
              <td className="p-3"><input type="text" className="w-full border rounded px-2 py-1 text-sm" /></td>
              <td className="p-3 text-center">
                 <select className="border rounded px-2 py-1 text-sm"><option>O</option><option>X</option></select>
              </td>
              <td className="p-3"><input type="text" className="w-full border rounded px-2 py-1 text-sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-4 flex justify-end">
      <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">일괄 저장</button>
    </div>
  </Card>
);

const InspectionReportView = () => (
  <div className="h-full flex flex-col">
    <Card className="mb-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">기간 선택</label>
          <div className="flex items-center gap-2">
            <input type="date" className="border rounded px-2 py-1.5 text-sm" />
            <span>~</span>
            <input type="date" className="border rounded px-2 py-1.5 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">대상 설비</label>
          <select className="border rounded px-4 py-1.5 text-sm bg-white"><option>전체 설비</option></select>
        </div>
        <button className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-slate-700">조회</button>
      </div>
    </Card>

    <div className="flex-1 bg-slate-200 rounded-xl border border-slate-300 p-8 flex items-center justify-center overflow-auto">
      {/* A4 Paper Mockup */}
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-lg p-[20mm] relative">
        <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-4">설비 예방 점검 결과 보고서</h1>
        <div className="mb-6 flex justify-between text-sm">
          <span>작성일: 2023. 10. 25</span>
          <span>작성자: 시설팀 김철수</span>
        </div>
        <table className="w-full border-collapse border border-black text-sm mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2">점검명</th>
              <th className="border border-black p-2">대상</th>
              <th className="border border-black p-2">결과</th>
              <th className="border border-black p-2">비고</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">10월 정기점검</td>
              <td className="border border-black p-2 text-center">전체 설비</td>
              <td className="border border-black p-2 text-center">양호</td>
              <td className="border border-black p-2">특이사항 없음</td>
            </tr>
            {/* ... More rows for PDF look ... */}
            {[1,2,3].map(i => (
              <tr key={i}>
                <td className="border border-black p-2 text-center">&nbsp;</td>
                <td className="border border-black p-2 text-center">&nbsp;</td>
                <td className="border border-black p-2 text-center">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center">
           <p className="font-bold text-lg mb-8">2023년 10월 25일</p>
           <p className="font-bold text-xl">(주) 넥스트 팩토리 공장장 (인)</p>
        </div>
      </div>
    </div>
    <div className="mt-4 flex justify-end gap-2">
      <button className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded shadow hover:bg-slate-700"><Download size={16}/> PDF 저장</button>
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"><Printer size={16}/> 인쇄</button>
    </div>
  </div>
);

// 기본 Dashboard
const DashboardView = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {MOCK_STATS.map((stat, idx) => (
        <Card key={idx}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
        </Card>
      ))}
    </div>
    <Card className="min-h-[300px] flex items-center justify-center text-slate-400 border-dashed">
      대시보드 차트 및 요약 현황
    </Card>
  </div>
);

const SettingsView = () => (
  <Card>
    <h3 className="text-lg font-bold">시스템 설정</h3>
    <p className="text-slate-500 mt-2">사용자 권한 및 알림 설정 화면입니다.</p>
  </Card>
);

// --- Main App Component ---

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['tasks', 'facilities', 'inspections']); 

  const toggleExpanded = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <DashboardView />;
      // 업무관리
      case 'tasks-daily': return <DailyTaskView />;
      case 'tasks-weekly': return <WeeklyTaskView />;
      case 'tasks-external': return <ExternalTaskView />;
      // 설비관리
      case 'facilities-status': return <FacilityStatusView />;
      case 'facilities-specs': return <FacilitySpecView />;
      case 'facilities-mgmt': return <FacilityMgmtView />;
      // 예방점검현황
      case 'inspection-single': return <InspectionRegisterSingleView />;
      case 'inspection-multi': return <InspectionRegisterMultiView />;
      case 'inspection-report': return <InspectionReportView />;
      
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const getTitle = () => {
    // Find nested title
    for (const menu of MENUS) {
      if (menu.id === activeMenu) return menu.label;
      if (menu.children) {
        const child = menu.children.find(c => c.id === activeMenu);
        if (child) return `${menu.label} > ${child.label}`;
      }
    }
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        expandedMenus={expandedMenus}
        toggleExpanded={toggleExpanded}
      />
      
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header title={getTitle()} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}