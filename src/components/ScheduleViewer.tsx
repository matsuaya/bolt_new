import React, { useState, useMemo } from 'react';
import { Calendar, Search, Filter, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockScheduleData } from '../data/mockScheduleData';
import { PersonSchedule } from '../types/schedule';

const ScheduleViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [currentMonth, setCurrentMonth] = useState(7);
  const [currentYear, setCurrentYear] = useState(2024);

  // Generate days for the current month
  const days = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${currentMonth}/${i + 1}`);
  }, [currentMonth, currentYear]);

  // Process schedule data
  const personSchedule: PersonSchedule = useMemo(() => {
    const schedule: PersonSchedule = {};
    
    mockScheduleData.forEach(entry => {
      const participants = [entry.director, ...entry.staff];
      
      participants.forEach(person => {
        if (!schedule[person]) {
          schedule[person] = {};
          days.forEach(day => schedule[person][day] = '');
        }
        schedule[person][entry.date] = entry.location;
      });
    });
    
    return schedule;
  }, [days]);

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
    
    const colorMap: { [key: string]: string } = {
      'プロジェクト': 'bg-blue-100 text-blue-800',
      'イベント': 'bg-green-100 text-green-800',
      'ワークショップ': 'bg-purple-100 text-purple-800',
      'セミナー': 'bg-orange-100 text-orange-800',
    };
    
    for (const [key, color] of Object.entries(colorMap)) {
      if (content.includes(key)) return color;
    }
    
    return 'bg-gray-100 text-gray-800';
  };

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
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {person.charAt(0)}
                        </div>
                        {person}
                      </div>
                    </td>
                    {days.map(day => {
                      const content = personSchedule[person][day] || '';
                      return (
                        <td key={`${person}-${day}`} className="px-4 py-4 text-center">
                          {content && (
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCellStyle(content)}`}>
                              <MapPin className="w-3 h-3" />
                              {content}
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
                <div className="text-2xl font-bold text-green-600">{mockScheduleData.length}</div>
                <div className="text-sm text-gray-500">予定数</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                <span>プロジェクト</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-100"></div>
                <span>イベント</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-purple-100"></div>
                <span>ワークショップ</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-orange-100"></div>
                <span>セミナー</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleViewer;