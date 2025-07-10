import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, Filter, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

interface CSVRow {
  [key: string]: string;
}

interface PersonSchedule {
  [person: string]: {
    [date: string]: string;
  };
}

const ScheduleViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [currentMonth, setCurrentMonth] = useState(7);
  const [currentYear, setCurrentYear] = useState(2025);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load CSV data
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch('/schedule-data.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setCsvData(results.data as CSVRow[]);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading CSV:', error);
        setLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Generate days for the current month
  const days = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${currentMonth}/${i + 1}`);
  }, [currentMonth, currentYear]);

  // Process schedule data from CSV
  const personSchedule: PersonSchedule = useMemo(() => {
    if (!csvData.length) return {};
    
    const schedule: PersonSchedule = {};
    
    csvData.forEach(row => {
      // Find the date column (開催日)
      const dateKey = Object.keys(row).find(k => k.includes('開催日'));
      if (!dateKey || !row[dateKey]) return;
      
      const date = String(row[dateKey]).trim();
      
      // Get location from 施策名 and category from プロモ内容
      const location = row['施策名'] ? String(row['施策名']).trim() : '';
      const category = row['プロモ内容'] ? String(row['プロモ内容']).trim() : '';
      if (!location) return;
      
      const participants: string[] = [];
      
      // Add director
      if (row['ディレクター名']) {
        participants.push(String(row['ディレクター名']).trim());
      }
      
      // Add staff members (スタッフ名1-4)
      for (let i = 1; i <= 4; i++) {
        const staffKey = `スタッフ名${i}`;
        if (row[staffKey] && row[staffKey].trim()) {
          participants.push(String(row[staffKey]).trim());
        }
      }
      
      // Add each participant to the schedule
      participants.forEach(person => {
        if (!person) return;
        
        if (!schedule[person]) {
          schedule[person] = {};
          days.forEach(day => schedule[person][day] = '');
        }
        // Store both location and category for display
        schedule[person][date] = `${location}|${category}`;
      });
    });
    
    return schedule;
  }, [csvData, days]);

  // Get unique people and filter based on search
  const people = useMemo(() => {
    const allPeople = Object.keys(personSchedule);
    return allPeople.filter(person => 
      person.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedPerson === '' || person === selectedPerson)
    );
  }, [personSchedule, searchTerm, selectedPerson]);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getCellStyle = (content: string) => {
    if (!content) return '';
    
    // Extract category from content (format: "location|category")
    const category = content.includes('|') ? content.split('|')[1] : '';
    
    const colorMap: { [key: string]: string } = {
      'PL': 'bg-purple-100 text-purple-800',
      '委託': 'bg-yellow-100 text-yellow-800',
      '通常': 'bg-gray-100 text-gray-800',
      'プロジェクト': 'bg-blue-100 text-blue-800',
      'イベント': 'bg-green-100 text-green-800',
      'ワークショップ': 'bg-orange-100 text-orange-800',
      'セミナー': 'bg-red-100 text-red-800',
      '博報堂': 'bg-indigo-100 text-indigo-800',
      '博報堂_委託': 'bg-pink-100 text-pink-800',
    };
    
    // First check category for exact match
    if (category && colorMap[category]) {
      return colorMap[category];
    }
    
    // Fallback to checking content for partial matches
    const location = content.includes('|') ? content.split('|')[0] : content;
    for (const [key, color] of Object.entries(colorMap)) {
      if (location.includes(key)) return color;
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">スケジュールビュー</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-xl font-semibold text-gray-700 min-w-[120px] text-center">
                {currentYear}年 {monthNames[currentMonth - 1]}
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="スタッフ名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">全員表示</option>
                {Object.keys(personSchedule).map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="sticky left-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-left font-semibold min-w-[150px] z-10">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      スタッフ名
                    </div>
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-4 text-center font-semibold min-w-[100px] whitespace-nowrap">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {people.map((person, index) => (
                  <tr key={person} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="sticky left-0 px-6 py-4 font-medium text-gray-900 bg-inherit border-r border-gray-200 z-10">
                      {person}
                    </td>
                    {days.map(day => {
                      const content = personSchedule[person][day] || '';
                      // Extract location for display (remove category part)
                      const displayContent = content.includes('|') ? content.split('|')[0] : content;
                      return (
                        <td key={`${person}-${day}`} className="px-4 py-4 text-center">
                          {displayContent && (
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCellStyle(content)}`}>
                              <MapPin className="w-3 h-3" />
                              {displayContent}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{people.length}</div>
                <div className="text-sm text-gray-500">スタッフ数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{csvData.length}</div>
                <div className="text-sm text-gray-500">予定数</div>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-purple-100"></div>
                <span>PL</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-100"></div>
                <span>委託</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                <span>通常</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-indigo-100"></div>
                <span>博報堂</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-pink-100"></div>
                <span>博報堂_委託</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleViewer;