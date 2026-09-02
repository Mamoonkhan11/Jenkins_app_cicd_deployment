// Initialize Lucide Icons
lucide.createIcons();

// Initial State Data
let employees = [
    { id: 101, name: 'Sarah Jenkins', dept: 'DevOps & Cloud', baseSalary: 6000, daysInMonth: 22, daysPresent: 22, status: 'Present' },
    { id: 102, name: 'Michael Chen', dept: 'Engineering', baseSalary: 5500, daysInMonth: 22, daysPresent: 20, status: 'Present' },
    { id: 103, name: 'Emily Rodriguez', dept: 'Human Resources', baseSalary: 4800, daysInMonth: 22, daysPresent: 18, status: 'Absent' },
    { id: 104, name: 'David Kim', dept: 'Finance', baseSalary: 5200, daysInMonth: 22, daysPresent: 21, status: 'Present' }
];

// DOM Elements
const tableBody = document.getElementById('employee-table-body');
const searchInput = document.getElementById('search-input');
const statTotalEmp = document.getElementById('stat-total-emp');
const statPresent = document.getElementById('stat-present');
const statAbsent = document.getElementById('stat-absent');
const statPayroll = document.getElementById('stat-payroll');

// Modal Elements
const modalEmp = document.getElementById('modal-employee');
const btnAddEmp = document.getElementById('btn-add-employee');
const btnCloseEmp = document.getElementById('close-modal-emp');
const btnCancelEmp = document.getElementById('btn-cancel-emp');
const formAddEmp = document.getElementById('form-add-employee');

const modalPayslip = document.getElementById('modal-payslip');
const btnClosePayslip = document.getElementById('close-modal-payslip');
const payslipContent = document.getElementById('payslip-content');

// Salary Calculation Logic
function calculateNetSalary(emp) {
    const dailyRate = emp.baseSalary / emp.daysInMonth;
    const grossSalary = dailyRate * emp.daysPresent;
    const taxDeduction = grossSalary * 0.10; // 10% tax
    return (grossSalary - taxDeduction).toFixed(2);
}

// Render Dashboard & Table
function render() {
    tableBody.innerHTML = '';
    let totalPayroll = 0;
    let presentCount = 0;

    const query = searchInput.value.toLowerCase();
    const filtered = employees.filter(e => e.name.toLowerCase().includes(query) || e.dept.toLowerCase().includes(query));

    filtered.forEach(emp => {
        const netPay = calculateNetSalary(emp);
        totalPayroll += parseFloat(netPay);
        if (emp.status === 'Present') presentCount++;

        const attendancePct = Math.round((emp.daysPresent / emp.daysInMonth) * 100);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${emp.name}</strong></td>
            <td>${emp.dept}</td>
            <td>$${emp.baseSalary.toLocaleString()}</td>
            <td>
                <button class="action-btn" onclick="adjustDays(${emp.id}, -1)">-</button>
                <span>${emp.daysPresent} / ${emp.daysInMonth}</span>
                <button class="action-btn" onclick="adjustDays(${emp.id}, 1)">+</button>
            </td>
            <td>${attendancePct}%</td>
            <td><strong>$${parseFloat(netPay).toLocaleString()}</strong></td>
            <td><span class="badge ${emp.status.toLowerCase()}">${emp.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewPayslip(${emp.id})" title="View Payslip"><i data-lucide="file-text"></i></button>
                <button class="action-btn" onclick="toggleStatus(${emp.id})" title="Toggle Attendance"><i data-lucide="check-square"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update Stats
    statTotalEmp.textContent = employees.length;
    statPresent.textContent = presentCount;
    statAbsent.textContent = employees.length - presentCount;
    statPayroll.textContent = `$${totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    lucide.createIcons();
}

// Interactivity handlers
function adjustDays(id, delta) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
        emp.daysPresent = Math.max(0, Math.min(emp.daysInMonth, emp.daysPresent + delta));
        render();
    }
}

function toggleStatus(id) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
        emp.status = emp.status === 'Present' ? 'Absent' : 'Present';
        render();
    }
}

function viewPayslip(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    const dailyRate = (emp.baseSalary / emp.daysInMonth).toFixed(2);
    const gross = (dailyRate * emp.daysPresent).toFixed(2);
    const tax = (gross * 0.10).toFixed(2);
    const net = (gross - tax).toFixed(2);

    payslipContent.innerHTML = `
        <div class="payslip-row"><span>Employee Name:</span><strong>${emp.name}</strong></div>
        <div class="payslip-row"><span>Department:</span><span>${emp.dept}</span></div>
        <div class="payslip-row"><span>Base Salary:</span><span>$${emp.baseSalary.toLocaleString()}</span></div>
        <div class="payslip-row"><span>Attendance:</span><span>${emp.daysPresent} of ${emp.daysInMonth} Days</span></div>
        <div class="payslip-row"><span>Gross Salary:</span><span>$${parseFloat(gross).toLocaleString()}</span></div>
        <div class="payslip-row"><span>Tax Deduction (10%):</span><span>-$${parseFloat(tax).toLocaleString()}</span></div>
        <div class="payslip-row total"><span>Net Payable Salary:</span><span>$${parseFloat(net).toLocaleString()}</span></div>
    `;
    modalPayslip.style.display = 'flex';
}

// Modal Control
btnAddEmp.addEventListener('click', () => modalEmp.style.display = 'flex');
btnCloseEmp.addEventListener('click', () => modalEmp.style.display = 'none');
btnCancelEmp.addEventListener('click', () => modalEmp.style.display = 'none');
btnClosePayslip.addEventListener('click', () => modalPayslip.style.display = 'none');

formAddEmp.addEventListener('submit', (e) => {
    e.preventDefault();
    const newEmp = {
        id: Date.now(),
        name: document.getElementById('emp-name').value,
        dept: document.getElementById('emp-dept').value,
        baseSalary: parseFloat(document.getElementById('emp-salary').value),
        daysInMonth: parseInt(document.getElementById('emp-days').value),
        daysPresent: parseInt(document.getElementById('emp-days').value),
        status: 'Present'
    };
    employees.push(newEmp);
    modalEmp.style.display = 'none';
    formAddEmp.reset();
    render();
});

searchInput.addEventListener('input', render);

// Initial Load
render();
