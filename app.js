// Initialize Lucide Icons
lucide.createIcons();

// Indian Currency Formatter (INR ₹)
const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});

// Sample Indian Workforce Dataset
let employees = [
    { id: 101, name: 'Aarav Sharma', dept: 'DevOps & Cloud', location: 'Bengaluru', baseSalary: 95000, daysInMonth: 22, daysPresent: 22, status: 'Present' },
    { id: 102, name: 'Priya Patel', dept: 'Engineering', location: 'Mumbai', baseSalary: 120000, daysInMonth: 22, daysPresent: 21, status: 'Present' },
    { id: 103, name: 'Rajesh Kumar', dept: 'Human Resources', location: 'Delhi NCR', baseSalary: 65000, daysInMonth: 22, daysPresent: 18, status: 'Absent' },
    { id: 104, name: 'Ananya Iyer', dept: 'Finance', location: 'Hyderabad', baseSalary: 75000, daysInMonth: 22, daysPresent: 22, status: 'Present' },
    { id: 105, name: 'Vikram Malhotra', dept: 'DevOps & Cloud', location: 'Pune', baseSalary: 110000, daysInMonth: 22, daysPresent: 20, status: 'Present' },
    { id: 106, name: 'Sneha Reddy', dept: 'Product', location: 'Bengaluru', baseSalary: 105000, daysInMonth: 22, daysPresent: 19, status: 'Present' }
];

// DOM Elements
const tableBody = document.getElementById('employee-table-body');
const searchInput = document.getElementById('search-input');
const filterLocation = document.getElementById('filter-location');
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

// Indian Payroll & Tax Engine Calculation
function calculateIndianPayroll(emp) {
    const dailyRate = emp.baseSalary / emp.daysInMonth;
    const earnedBasic = dailyRate * emp.daysPresent;
    const hraAllowance = earnedBasic * 0.2; // 20% HRA
    const grossSalary = earnedBasic + hraAllowance;

    // Deductions
    const pfDeduction = earnedBasic * 0.12; // 12% Provident Fund
    const ptDeduction = grossSalary > 15000 ? 200 : 0; // Professional Tax ₹200
    const tdsDeduction = grossSalary > 50000 ? grossSalary * 0.1 : 0; // 10% TDS for higher slabs

    const totalDeductions = pfDeduction + ptDeduction + tdsDeduction;
    const netPayable = Math.max(0, grossSalary - totalDeductions);

    return {
        earnedBasic: earnedBasic.toFixed(2),
        hraAllowance: hraAllowance.toFixed(2),
        grossSalary: grossSalary.toFixed(2),
        pfDeduction: pfDeduction.toFixed(2),
        ptDeduction: ptDeduction.toFixed(2),
        tdsDeduction: tdsDeduction.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        netPayable: netPayable.toFixed(2)
    };
}

// Render Dashboard & Data Table
function render() {
    tableBody.innerHTML = '';
    let totalPayroll = 0;
    let presentCount = 0;

    const query = searchInput.value.toLowerCase();
    const loc = filterLocation.value;

    const filtered = employees.filter(emp => {
        const matchesQuery = emp.name.toLowerCase().includes(query) || emp.dept.toLowerCase().includes(query);
        const matchesLocation = (loc === 'ALL') || (emp.location === loc);
        return matchesQuery && matchesLocation;
    });

    filtered.forEach(emp => {
        const payroll = calculateIndianPayroll(emp);
        const netPayFloat = Number.parseFloat(payroll.netPayable);
        totalPayroll += netPayFloat;

        if (emp.status === 'Present') presentCount++;

        const attendancePct = Math.round((emp.daysPresent / emp.daysInMonth) * 100);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${emp.name}</strong>
            </td>
            <td>
                <div>${emp.dept}</div>
                <small class="location-tag"><i data-lucide="map-pin"></i> ${emp.location}, India</small>
            </td>
            <td>${inrFormatter.format(emp.baseSalary)}</td>
            <td>
                <div class="attendance-stepper">
                    <button class="action-btn" onclick="adjustDays(${emp.id}, -1)">-</button>
                    <span>${emp.daysPresent} / ${emp.daysInMonth}</span>
                    <button class="action-btn" onclick="adjustDays(${emp.id}, 1)">+</button>
                </div>
            </td>
            <td>
                <span class="pct-pill ${attendancePct >= 80 ? 'high' : 'low'}">${attendancePct}%</span>
            </td>
            <td><strong>${inrFormatter.format(netPayFloat)}</strong></td>
            <td><span class="badge ${emp.status.toLowerCase()}">${emp.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewPayslip(${emp.id})" title="View Indian Payslip"><i data-lucide="file-text"></i></button>
                <button class="action-btn" onclick="toggleStatus(${emp.id})" title="Toggle Attendance"><i data-lucide="check-square"></i></button>
                <button class="action-btn danger" onclick="deleteEmployee(${emp.id})" title="Remove Employee"><i data-lucide="trash-2"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update Top Metric Cards
    statTotalEmp.textContent = employees.length;
    statPresent.textContent = presentCount;
    statAbsent.textContent = employees.length - presentCount;
    statPayroll.textContent = inrFormatter.format(totalPayroll);

    lucide.createIcons();
}

// Attendance Interactivity Handlers
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

function deleteEmployee(id) {
    if (confirm('Are you sure you want to remove this employee record?')) {
        employees = employees.filter(e => e.id !== id);
        render();
    }
}

// Render Detailed Indian Payslip Modal
function viewPayslip(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    const p = calculateIndianPayroll(emp);

    payslipContent.innerHTML = `
        <div class="payslip-header">
            <h4>PULSE HR SOLUTIONS INDIA PVT LTD</h4>
            <p>Location: ${emp.location} Hub | Financial Year 2026-27</p>
        </div>
        <div class="payslip-grid">
            <div class="payslip-row"><span>Employee Name:</span><strong>${emp.name}</strong></div>
            <div class="payslip-row"><span>Department:</span><span>${emp.dept}</span></div>
            <div class="payslip-row"><span>Location:</span><span>${emp.location}, India</span></div>
            <div class="payslip-row"><span>Attendance:</span><span>${emp.daysPresent} of ${emp.daysInMonth} Days (${Math.round((emp.daysPresent/emp.daysInMonth)*100)}%)</span></div>
        </div>
        <hr class="payslip-divider">
        <h5>EARNINGS & BREAKDOWN</h5>
        <div class="payslip-grid">
            <div class="payslip-row"><span>Earned Basic Salary:</span><span>${inrFormatter.format(p.earnedBasic)}</span></div>
            <div class="payslip-row"><span>HRA Allowance (20%):</span><span>+${inrFormatter.format(p.hraAllowance)}</span></div>
            <div class="payslip-row highlight"><span>Gross Salary:</span><strong>${inrFormatter.format(p.grossSalary)}</strong></div>
        </div>
        <hr class="payslip-divider">
        <h5>DEDUCTIONS (STATUTORY INDIA)</h5>
        <div class="payslip-grid">
            <div class="payslip-row"><span>Provident Fund (PF - 12%):</span><span>-${inrFormatter.format(p.pfDeduction)}</span></div>
            <div class="payslip-row"><span>Professional Tax (PT):</span><span>-${inrFormatter.format(p.ptDeduction)}</span></div>
            <div class="payslip-row"><span>TDS (Income Tax):</span><span>-${inrFormatter.format(p.tdsDeduction)}</span></div>
            <div class="payslip-row highlight-red"><span>Total Deductions:</span><strong>-${inrFormatter.format(p.totalDeductions)}</strong></div>
        </div>
        <hr class="payslip-divider">
        <div class="payslip-row total">
            <span>Net Transferable Salary (INR ₹):</span>
            <strong>${inrFormatter.format(p.netPayable)}</strong>
        </div>
    `;
    modalPayslip.style.display = 'flex';
}

// Modal Control Event Listeners
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
        location: document.getElementById('emp-location').value,
        baseSalary: Number.parseFloat(document.getElementById('emp-salary').value),
        daysInMonth: Number.parseInt(document.getElementById('emp-days').value, 10),
        daysPresent: Number.parseInt(document.getElementById('emp-days').value, 10),
        status: 'Present'
    };
    employees.push(newEmp);
    modalEmp.style.display = 'none';
    formAddEmp.reset();
    render();
});

// Event Listeners for Dynamic Filters
searchInput.addEventListener('input', render);
filterLocation.addEventListener('change', render);

// Initial Application Load
render();
