// Mock data - same structure as your original
const mockScheduleData = [
    {
        date: '7/1',
        location: 'プロジェクトA',
        director: '田中太郎',
        staff: ['佐藤花子', '山田次郎']
    },
    {
        date: '7/2',
        location: 'イベントB',
        director: '田中太郎',
        staff: ['佐藤花子', '鈴木一郎']
    },
    {
        date: '7/3',
        location: 'ワークショップC',
        director: '山田次郎',
        staff: ['鈴木一郎', '高橋美智子']
    },
    {
        date: '7/5',
        location: 'セミナーD',
        director: '佐藤花子',
        staff: ['田中太郎', '山田次郎', '高橋美智子']
    },
    {
        date: '7/8',
        location: 'プロジェクトE',
        director: '鈴木一郎',
        staff: ['佐藤花子', '高橋美智子']
    },
    {
        date: '7/10',
        location: 'イベントF',
        director: '田中太郎',
        staff: ['山田次郎', '鈴木一郎']
    },
    {
        date: '7/12',
        location: 'ワークショップG',
        director: '高橋美智子',
        staff: ['田中太郎', '佐藤花子']
    },
    {
        date: '7/15',
        location: 'セミナーH',
        director: '山田次郎',
        staff: ['鈴木一郎', '高橋美智子']
    },
    {
        date: '7/18',
        location: 'プロジェクトI',
        director: '佐藤花子',
        staff: ['田中太郎', '山田次郎']
    },
    {
        date: '7/20',
        location: 'イベントJ',
        director: '鈴木一郎',
        staff: ['佐藤花子', '高橋美智子']
    },
    {
        date: '7/22',
        location: 'ワークショップK',
        director: '田中太郎',
        staff: ['山田次郎', '鈴木一郎']
    },
    {
        date: '7/25',
        location: 'セミナーL',
        director: '高橋美智子',
        staff: ['佐藤花子', '田中太郎']
    },
    {
        date: '7/28',
        location: 'プロジェクトM',
        director: '山田次郎',
        staff: ['鈴木一郎', '高橋美智子']
    },
    {
        date: '7/30',
        location: 'イベントN',
        director: '佐藤花子',
        staff: ['田中太郎', '山田次郎']
    }
];

// Global variables
let currentMonth = 7;
let currentYear = 2024;
let personSchedule = {};
let allPeople = [];

// Month names in Japanese
const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    processScheduleData();
    renderTable();
    updateSummary();
});

// Process the schedule data into the required format
function processScheduleData() {
    const days = generateDays();
    personSchedule = {};
    
    mockScheduleData.forEach(entry => {
        const participants = [entry.director, ...entry.staff];
        
        participants.forEach(person => {
            if (!personSchedule[person]) {
                personSchedule[person] = {};
                days.forEach(day => personSchedule[person][day] = '');
            }
            personSchedule[person][entry.date] = entry.location;
        });
    });
    
    allPeople = Object.keys(personSchedule);
    populatePersonFilter();
}

// Generate days for the current month
function generateDays() {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${currentMonth}/${i + 1}`);
}

// Populate the person filter dropdown
function populatePersonFilter() {
    const select = document.getElementById('personFilter');
    select.innerHTML = '<option value="">全員表示</option>';
    
    allPeople.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        select.appendChild(option);
    });
}

// Render the schedule table
function renderTable() {
    const days = generateDays();
    const table = document.getElementById('scheduleTable');
    const thead = table.querySelector('thead tr');
    const tbody = document.getElementById('scheduleBody');
    
    // Update month display
    document.getElementById('currentMonth').textContent = `${currentYear}年 ${monthNames[currentMonth - 1]}`;
    
    // Clear and rebuild header
    thead.innerHTML = `
        <th class="name-column">
            <div class="header-content">
                👥 スタッフ名
            </div>
        </th>
    `;
    
    days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        thead.appendChild(th);
    });
    
    // Clear and rebuild body
    tbody.innerHTML = '';
    
    const filteredPeople = getFilteredPeople();
    
    filteredPeople.forEach(person => {
        const row = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'name-cell';
        nameCell.innerHTML = `
            <div class="person-info">
                <div class="avatar">${person.charAt(0)}</div>
                ${person}
            </div>
        `;
        row.appendChild(nameCell);
        
        // Schedule cells
        days.forEach(day => {
            const cell = document.createElement('td');
            const content = personSchedule[person][day] || '';
            
            if (content) {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = `schedule-item ${getScheduleClass(content)}`;
                scheduleItem.innerHTML = `📍 ${content}`;
                cell.appendChild(scheduleItem);
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
}

// Get CSS class for schedule item based on content
function getScheduleClass(content) {
    if (content.includes('プロジェクト')) return 'project';
    if (content.includes('イベント')) return 'event';
    if (content.includes('ワークショップ')) return 'workshop';
    if (content.includes('セミナー')) return 'seminar';
    return 'default';
}

// Get filtered people based on search and filter
function getFilteredPeople() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedPerson = document.getElementById('personFilter').value;
    
    return allPeople.filter(person => {
        const matchesSearch = person.toLowerCase().includes(searchTerm);
        const matchesFilter = selectedPerson === '' || person === selectedPerson;
        return matchesSearch && matchesFilter;
    });
}

// Filter table based on search and dropdown
function filterTable() {
    renderTable();
    updateSummary();
}

// Navigate between months
function navigateMonth(direction) {
    if (direction === 'prev') {
        if (currentMonth === 1) {
            currentMonth = 12;
            currentYear--;
        } else {
            currentMonth--;
        }
    } else {
        if (currentMonth === 12) {
            currentMonth = 1;
            currentYear++;
        } else {
            currentMonth++;
        }
    }
    
    processScheduleData();
    renderTable();
    updateSummary();
}

// Update summary statistics
function updateSummary() {
    const filteredPeople = getFilteredPeople();
    document.getElementById('staffCount').textContent = filteredPeople.length;
    document.getElementById('scheduleCount').textContent = mockScheduleData.length;
}