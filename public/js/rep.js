const app = {
    state: {
        currentRole: 'rep',
        currentUser: '@rep_smith',
        currentTab: 'home',
        activeTerm: '1st Semester, A.Y. 2023-2024',
        courses: ['CCS114', 'IT201', 'GE101'],
        tasks: [],
        students: [
            { id: '2023-0192', name: 'Steven T.', enrolledCourses: ['CCS114', 'IT201'] },
            { id: '2023-0441', name: 'Alice Smith', enrolledCourses: ['IT201', 'GE101'] },
            { id: '2023-0882', name: 'Mark Johnson', enrolledCourses: ['CCS114'] }
        ],
        payments: {}
    },

    init() {
        this.loadState();
        if(this.state.tasks.length === 0) this.seedInitialData();
        this.render();
    },

    api: {
        async createCollection(data) {
            // Mock API delay
            await new Promise(r => setTimeout(r, 400));
            app.state.tasks.unshift(data);
            app.state.payments[data.id] = {};
            app.saveState(); // simulate backend save
            return { success: true };
        },
        async togglePayment(taskId, studentId, isPaid, currentUser) {
            await new Promise(r => setTimeout(r, 200));
            if (!app.state.payments[taskId]) app.state.payments[taskId] = {};
            app.state.payments[taskId][studentId] = isPaid ? { time: Date.now(), by: currentUser } : false;
            app.saveState();
            return { success: true };
        },
        async changeTerm(term) {
            await new Promise(r => setTimeout(r, 200));
            app.state.activeTerm = term;
            app.saveState();
            return { success: true };
        }
    },

    loadState() {
        const saved = localStorage.getItem('kolekta_state');
        this.state.currentUser = localStorage.getItem('kolekta_user') || '@rep_smith';
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.tasks = parsed.tasks || [];
            this.state.payments = parsed.payments || {};
            this.state.activeTerm = parsed.activeTerm || '1st Semester, A.Y. 2023-2024';
            this.state.courses = parsed.courses || ['CCS114', 'IT201', 'GE101'];
            if(parsed.students) this.state.students = parsed.students;
        }
    },

    saveState() {
        localStorage.setItem('kolekta_state', JSON.stringify({
            tasks: this.state.tasks,
            payments: this.state.payments,
            activeTerm: this.state.activeTerm,
            courses: this.state.courses,
            students: this.state.students
        }));
    },

    seedInitialData() {
        const t1 = this.generateId();
        const t2 = this.generateId();
        const t3 = this.generateId();
        
        this.state.tasks = [
            { id: t1, title: 'Midterm Exam Papers', course: 'CCS114', amount: 50, deadline: '2024-10-12', term: this.state.activeTerm, createdAt: Date.now(), createdBy: '@rep_jones', targetStudents: ['2023-0192', '2023-0882'] },
            { id: t2, title: 'Lab Manual Photocopy', course: 'IT201', amount: 120, deadline: '2024-11-05', term: this.state.activeTerm, createdAt: Date.now() - 86400000, createdBy: '@rep_jones', targetStudents: ['2023-0192', '2023-0441'] },
            { id: t3, title: 'Department Shirt', course: 'General', amount: 350, deadline: '2023-09-01', term: '2nd Semester, A.Y. 2022-2023', createdAt: Date.now() - 31536000000, createdBy: '@rep_smith' } // targetStudents undefined means all
        ];

        this.state.payments = {
            [t1]: { '2023-0192': {time: Date.now() - 86400000, by: '@rep_jones'}, '2023-0882': {time: Date.now() - 43200000, by: '@rep_jones'} },
            [t2]: { '2023-0441': {time: Date.now() - 172800000, by: '@rep_smith'} },
            [t3]: { '2023-0192': {time: Date.now() - 86400000, by: '@rep_smith'}, '2023-0441': {time: Date.now() - 172800000, by: '@rep_jones'}, '2023-0882': {time: Date.now() - 43200000, by: '@rep_smith'} }
        };
        this.saveState();
    },

    generateId() { return Math.random().toString(36).substr(2, 9); },

    switchTab(tab) {
        this.state.currentTab = tab;
        this.updateNavUI();
        this.render();
    },

    updateNavUI() {
        ['home', 'history', 'profile'].forEach(t => {
            document.querySelectorAll(`[data-tab="${t}"]`).forEach(btn => {
                if (t === this.state.currentTab) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    },

    render() {
        const main = document.getElementById('main-content');
        if(!main) return;
        main.innerHTML = '';
        
        let content = '';
        if (this.state.currentTab === 'home') content = this.views.repHome();
        else if (this.state.currentTab === 'history') content = this.views.history();
        else if (this.state.currentTab === 'profile') content = this.views.profile();

        main.innerHTML = `<div class="animate-fade-in w-100 pb-5">${content}</div>`;
        lucide.createIcons();
    },

    views: {
        repHome: () => `
            <div class="d-flex justify-content-between align-items-end mb-4 mt-2">
                <div>
                    <p class="small fw-medium text-secondary mb-0">${app.state.activeTerm}</p>
                    <h2 class="fs-3 fw-bold text-dark mt-1">My Collections</h2>
                </div>
                <button onclick="app.modals.openCreateTask()" class="btn btn-primary p-3 rounded-4 shadow-sm transition-all">
                    <i data-lucide="plus" style="width: 20px; height: 20px;"></i>
                </button>
            </div>
            ${app.components.repDashboardStats()}
            <div class="mt-4 row g-3">
                <h3 class="fs-6 fw-bold text-dark text-uppercase mb-2 col-12" style="letter-spacing: 1px;">Active Collections</h3>
                ${app.state.tasks.filter(t => t.term === app.state.activeTerm).length === 0 ? 
                    `<div class="col-12 text-center py-5 bg-white rounded-4 border border-secondary-subtle" style="border-style: dashed !important;">
                        <i data-lucide="inbox" style="width: 40px; height: 40px;" class="text-secondary opacity-50 mx-auto mb-2"></i>
                        <p class="small fw-medium text-secondary">No active collections yet</p>
                    </div>` : 
                    app.state.tasks.filter(t => t.term === app.state.activeTerm).map(t => `<div class="col-12 col-md-6 col-lg-4">${app.components.taskCard(t)}</div>`).join('')}
            </div>
        `,
        history: () => {
            const archivedTasks = app.state.tasks.filter(t => t.term !== app.state.activeTerm);
            const itemsHTML = archivedTasks.length === 0 
                ? `<div class="text-center py-5"><p class="text-secondary">No archived collections.</p></div>`
                : archivedTasks.map(t => `<div class="col-12 col-md-6 col-lg-4">${app.components.taskCard(t, true)}</div>`).join('');

            return `
            <div class="mb-4 mt-2">
                <h2 class="fs-3 fw-bold text-dark">History Log</h2>
                <p class="small text-secondary mt-1">Archived records and past activity.</p>
            </div>
            <div class="mt-4 row g-3">
                ${itemsHTML}
            </div>
        `},
        profile: () => {
            return `
            <div class="mb-4 mt-2 text-center text-md-start">
                <h2 class="fs-3 fw-bold text-dark">Profile</h2>
                <p class="small text-secondary mt-1">Manage your session.</p>
            </div>
            
            <div class="d-flex align-items-center justify-content-center py-5 py-md-5">
                <a href="/login" onclick="app.showToast('Logging out...', 'success')" class="btn btn-outline-danger bg-white rounded-4 px-4 py-3 d-flex align-items-center justify-content-center gap-2 fw-bold shadow-sm text-decoration-none w-100" style="max-width: 300px;">
                    <i data-lucide="log-out" style="width: 20px; height: 20px;"></i>
                    <span>Log Out</span>
                </a>
            </div>
        `}
    },

    components: {
        taskCard: (task, isArchived = false) => {
            const totalStudents = app.state.students.length;
            const payments = app.state.payments[task.id] || {};
            const paidCount = Object.values(payments).filter(v => v).length;
            const percent = Math.round((paidCount / totalStudents) * 100) || 0;
            
            return `
            <div onclick="app.modals.openTaskDetail('${task.id}')" class="bg-white rounded-4 p-4 shadow-sm border border-secondary-subtle cursor-pointer transition-all h-100 d-flex flex-column" tabindex="0" style="${isArchived ? 'opacity: 0.8;' : ''}">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h4 class="fw-bold text-dark m-0" style="font-size: 17px; line-height: 1.2;">${task.title}</h4>
                        <p class="small text-secondary fw-medium mt-1 mb-0">${task.course} &bull; ${isArchived ? `Archived (${task.term})` : `Due ${new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}</p>
                    </div>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-6">&#8369;${task.amount.toFixed(2)}</span>
                </div>
                <div class="progress mb-3 bg-secondary-subtle" style="height: 8px;">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="d-flex justify-content-between small fw-medium mt-auto">
                    <span class="text-primary fw-semibold d-flex align-items-center gap-1">
                        <i data-lucide="check-circle-2" style="width: 14px; height: 14px;"></i> ${paidCount} Paid
                    </span>
                    <span class="text-secondary">${totalStudents - paidCount} Pending</span>
                </div>
            </div>`;
        },
        repDashboardStats: () => {
            let totalCollected = 0;
            let pendingDues = 0;
            app.state.tasks.filter(t=>t.term === app.state.activeTerm).forEach(t => {
                const payments = app.state.payments[t.id] || {};
                const paidCount = Object.values(payments).filter(v => v).length;
                totalCollected += paidCount * t.amount;
                pendingDues += (app.state.students.length - paidCount) * t.amount;
            });
            return `
            <div class="row g-3 mb-4">
                <div class="col-6">
                    <div class="bg-primary rounded-4 p-4 text-white shadow-sm position-relative overflow-hidden h-100">
                        <div class="position-absolute bg-white opacity-10 rounded-circle" style="width: 100px; height: 100px; right: -20px; bottom: -20px;"></div>
                        <p class="text-white-50 text-uppercase fw-bold mb-1 position-relative z-1" style="font-size: 10px; letter-spacing: 1px;">Collected</p>
                        <h3 class="fs-2 fw-bold position-relative z-1 mb-0">&#8369;${totalCollected.toLocaleString()}</h3>
                    </div>
                </div>
                <div class="col-6">
                    <div class="bg-white border border-secondary-subtle rounded-4 p-4 shadow-sm h-100">
                        <p class="text-secondary text-uppercase fw-bold mb-1" style="font-size: 10px; letter-spacing: 1px;">Pending</p>
                        <h3 class="fs-2 fw-bold text-dark mb-0">&#8369;${pendingDues.toLocaleString()}</h3>
                    </div>
                </div>
            </div>`;
        }
    },

    actions: {
        async createTask(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader-2" class="spinner-border spinner-border-sm mx-auto"></i>';
            btn.disabled = true;

            const title = document.getElementById('new-task-title').value;
            const course = document.getElementById('new-task-course').value;
            const amount = parseFloat(document.getElementById('new-task-amount').value);
            const deadline = document.getElementById('new-task-deadline').value;
            
            // Only select visible, checked checkboxes
            const checkboxes = document.querySelectorAll('.student-checkbox-item:not([style*="display: none"]) input[name="target_students"]:checked');
            const targetStudents = Array.from(checkboxes).map(cb => cb.value);

            if(!title || !amount || !deadline) {
                app.showToast('Please fill out all required fields', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            const newTask = {
                id: app.generateId(),
                title, course: course || 'General', amount, deadline, 
                term: app.state.activeTerm, createdAt: Date.now(),
                createdBy: app.state.currentUser,
                targetStudents
            };

            await app.api.createCollection(newTask);
            
            app.render();
            app.modals.close();
            app.showToast('Collection created successfully');
        },

        togglePayment(taskId, studentId, isPaid) {
            const action = isPaid ? "mark this student as PAID" : "mark this student as UNPAID";
            app.modals.openConfirm(
                'Confirm Payment Status',
                `Are you sure you want to ${action}?`,
                async () => {
                    // Confirm
                    await app.api.togglePayment(taskId, studentId, isPaid, app.state.currentUser);
                    
                    const task = app.state.tasks.find(t => t.id === taskId);
                    const payments = app.state.payments[taskId];
                    
                    const targetStudentIds = task.targetStudents || app.state.students.map(s => s.id);
                    const paidCount = Object.keys(payments).filter(id => payments[id] && targetStudentIds.includes(id)).length;
                    const stats = document.getElementById('detail-stats');
                    if (stats) stats.textContent = `${paidCount}/${targetStudentIds.length} Paid`;
                    
                    app.render(); // Update main UI in background too
                    app.showToast(isPaid ? 'Payment marked successfully' : 'Payment reversed successfully', 'success');
                },
                () => {
                    // Cancel visually revert
                    app.modals.openTaskDetail(taskId);
                }
            );
        },
        
        async changeTerm(term) {
            await app.api.changeTerm(term);
            app.render();
            app.modals.close();
            app.showToast(`Term set to ${term}`);
        }
    },

    modals: {
        getContainer() {
            let container = document.getElementById('modal-container');
            if(!container) {
                container = document.createElement('div');
                container.id = 'modal-container';
                document.getElementById('app-root').appendChild(container);
            }
            return container;
        },

        getConfirmContainer() {
            let container = document.getElementById('confirm-container');
            if(!container) {
                container = document.createElement('div');
                container.id = 'confirm-container';
                document.getElementById('app-root').appendChild(container);
            }
            return container;
        },

        openConfirm(title, message, onConfirm, onCancel) {
            const c = this.getConfirmContainer();
            const html = `
            <div class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center modal-backdrop-blur animate-fade-in px-3" style="z-index: 1060;">
                <div class="bg-white w-100 rounded-4 p-4 shadow-lg animate-slide-up d-flex flex-column position-relative" style="max-width: 400px;">
                    <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 48px; height: 48px;">
                        <i data-lucide="help-circle" style="width: 24px; height: 24px;"></i>
                    </div>
                    <h3 class="fs-5 fw-bold text-dark mb-2">${title}</h3>
                    <p class="small text-secondary mb-4">${message}</p>
                    <div class="d-flex gap-2">
                        <button id="confirm-cancel-btn" class="btn btn-light flex-fill fw-semibold py-2 rounded-3 text-secondary border">Cancel</button>
                        <button id="confirm-ok-btn" class="btn btn-primary flex-fill fw-semibold py-2 rounded-3">Confirm</button>
                    </div>
                </div>
            </div>`;
            c.innerHTML = html;
            lucide.createIcons();
            
            document.getElementById('confirm-cancel-btn').onclick = () => {
                c.innerHTML = '';
                if(onCancel) onCancel();
            };
            document.getElementById('confirm-ok-btn').onclick = () => {
                c.innerHTML = '';
                if(onConfirm) onConfirm();
            };
        },
        
        open(html) {
            const container = this.getContainer();
            container.innerHTML = html;
            lucide.createIcons();
        },
        
        close() {
            const container = this.getContainer();
            const panel = document.getElementById('modal-panel');
            if(panel) {
                panel.classList.remove('animate-slide-up');
                panel.classList.add('animate-slide-down');
                setTimeout(() => { container.innerHTML = ''; }, 300);
            } else {
                container.innerHTML = '';
            }
        },

        openCreateTask() {
            const courseOptions = app.state.courses.map(c => `<option value="${c}">${c}</option>`).join('');
            
            const studentCheckboxes = app.state.students.map(student => `
                <label class="d-flex align-items-center gap-3 p-2 cursor-pointer rounded-3 student-checkbox-item" style="cursor:pointer;" data-courses="${(student.enrolledCourses || []).join(',')}">
                    <input type="checkbox" name="target_students" value="${student.id}" checked class="form-check-input mt-0 fs-5">
                    <div>
                        <p class="fw-bold text-dark small m-0" style="line-height: 1.2;">${student.name}</p>
                        <p class="text-secondary mb-0" style="font-size: 10px; font-family: monospace;">${student.id}</p>
                    </div>
                </label>
            `).join('');

            const html = `
            <div class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end justify-content-md-center align-items-md-center modal-backdrop-blur animate-fade-in" style="z-index: 1050;" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-100 p-4 animate-slide-up shadow-lg d-flex flex-column position-relative" style="max-width: 500px; border-radius: 2rem 2rem 0 0; max-height: 90vh;">
                    <div class="bg-secondary-subtle rounded-pill mx-auto mb-3 d-md-none" style="width: 48px; height: 6px;"></div>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3 class="fs-4 fw-bold text-dark m-0">New Collection</h3>
                        <button type="button" onclick="app.modals.close()" class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
                    </div>
                    
                    <form onsubmit="app.actions.createTask(event)" class="flex-grow-1 overflow-y-auto no-scrollbar pb-3 d-flex flex-column gap-3">
                        <div>
                            <label class="form-label text-secondary fw-bold text-uppercase mb-1" style="font-size: 11px; letter-spacing: 1px;">Title <span class="text-danger">*</span></label>
                            <input type="text" id="new-task-title" required placeholder="e.g. Field Trip Fee" class="form-control form-control-lg bg-light border-secondary-subtle rounded-4 fs-6 fw-medium text-dark px-3 py-2">
                        </div>
                        <div class="row g-3">
                            <div class="col-6">
                                <label class="form-label text-secondary fw-bold text-uppercase mb-1" style="font-size: 11px; letter-spacing: 1px;">Amount (&#8369;) <span class="text-danger">*</span></label>
                                <input type="number" step="0.01" id="new-task-amount" required placeholder="0.00" class="form-control form-control-lg bg-light border-secondary-subtle rounded-4 fs-6 fw-bold text-dark px-3 py-2">
                            </div>
                            <div class="col-6">
                                <label class="form-label text-secondary fw-bold text-uppercase mb-1" style="font-size: 11px; letter-spacing: 1px;">Course</label>
                                <select id="new-task-course" class="form-select form-select-lg bg-light border-secondary-subtle rounded-4 fs-6 fw-medium text-dark px-3 py-2"
                                    onchange="
                                        const selected = this.value;
                                        document.querySelectorAll('.student-checkbox-item').forEach(item => {
                                            const cb = item.querySelector('input');
                                            if (!selected) {
                                                item.classList.remove('d-none');
                                                item.classList.add('d-flex');
                                                cb.checked = true;
                                            } else {
                                                const courses = item.getAttribute('data-courses').split(',');
                                                if(courses.includes(selected)) {
                                                    item.classList.remove('d-none');
                                                    item.classList.add('d-flex');
                                                    cb.checked = true;
                                                } else {
                                                    item.classList.remove('d-flex');
                                                    item.classList.add('d-none');
                                                    cb.checked = false;
                                                }
                                            }
                                        });
                                    ">
                                    <option value="">All Courses / General</option>
                                    ${courseOptions}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="form-label text-secondary fw-bold text-uppercase mb-1" style="font-size: 11px; letter-spacing: 1px;">Deadline <span class="text-danger">*</span></label>
                            <input type="date" id="new-task-deadline" required class="form-control form-control-lg bg-light border-secondary-subtle rounded-4 fs-6 fw-medium text-dark px-3 py-2">
                        </div>
                        
                        <div class="border-top pt-3">
                            <label class="form-label text-secondary fw-bold text-uppercase mb-2" style="font-size: 11px; letter-spacing: 1px;">Enrolled Students</label>
                            <div class="bg-light border border-secondary-subtle rounded-4 p-2 overflow-y-auto" style="max-height: 150px;">
                                ${studentCheckboxes}
                            </div>
                        </div>

                        <div class="pt-2 mt-auto">
                            <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center">
                                Create Collection
                            </button>
                        </div>
                    </form>
                </div>
            </div>`;
            this.open(html);
        },

        openTaskDetail(taskId) {
            const task = app.state.tasks.find(t => t.id === taskId);
            if(!task) return;
            
            const payments = app.state.payments[taskId] || {};
            
            const targetStudentIds = task.targetStudents || app.state.students.map(s => s.id);
            const filteredStudents = app.state.students.filter(s => targetStudentIds.includes(s.id));
            const paidCount = Object.keys(payments).filter(id => payments[id] && targetStudentIds.includes(id)).length;

            const studentRows = filteredStudents.map(student => {
                const isPaid = payments[student.id] || false;
                const initials = student.name.split(' ').map(n=>n[0]).join('');
                return `
                <label class="d-flex align-items-center justify-content-between p-3 border-bottom cursor-pointer ${isPaid ? 'bg-primary-subtle' : ''}" style="cursor: pointer;" data-student="${student.id}">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold small shadow-sm transition-colors ${isPaid ? 'bg-primary text-white' : 'bg-light text-secondary border'}" style="width: 40px; height: 40px;">
                            ${initials}
                        </div>
                        <div>
                            <p class="fw-bold text-dark m-0">${student.name}</p>
                            <p class="text-secondary m-0" style="font-size: 11px; font-family: monospace;">${student.id}</p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <input type="checkbox" ${isPaid ? 'checked' : ''} class="form-check-input fs-4 mt-0" 
                            onchange="
                                app.actions.togglePayment('${taskId}', '${student.id}', this.checked); 
                                const label = this.closest('label');
                                const avatar = label.querySelector('.rounded-circle');
                                if(this.checked) {
                                    label.classList.add('bg-primary-subtle');
                                    avatar.className = 'rounded-circle d-flex align-items-center justify-content-center fw-bold small shadow-sm transition-colors bg-primary text-white';
                                } else {
                                    label.classList.remove('bg-primary-subtle');
                                    avatar.className = 'rounded-circle d-flex align-items-center justify-content-center fw-bold small shadow-sm transition-colors bg-light text-secondary border';
                                }
                            ">
                    </div>
                </label>`;
            }).join('');

            const html = `
            <div class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center modal-backdrop-blur animate-fade-in p-md-4" style="z-index: 1050;" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-100 h-100 d-flex flex-column position-relative shadow-lg animate-slide-up overflow-hidden rounded-md-4" style="max-width: 600px; max-height: 800px;">
                    <header class="glass-header px-3 py-3 d-flex align-items-center gap-2 sticky-top z-2 border-bottom">
                        <button onclick="app.modals.close(); app.render()" class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0 text-secondary" style="width: 40px; height: 40px;">
                            <i data-lucide="arrow-left" style="width: 24px; height: 24px;"></i>
                        </button>
                        <div class="flex-grow-1 overflow-hidden">
                            <h3 class="fs-5 fw-bold text-dark text-truncate m-0 pe-2">${task.title}</h3>
                            <p class="small text-secondary fw-medium m-0" id="detail-stats">${paidCount}/${filteredStudents.length} Paid</p>
                        </div>
                        <div class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6 rounded-3">&#8369;${task.amount}</div>
                    </header>
                    <div class="flex-grow-1 overflow-y-auto pb-safe">
                        <div class="p-3 sticky-top bg-white z-1 border-bottom">
                            <div class="bg-light rounded-3 border d-flex align-items-center p-2 shadow-sm">
                                <i data-lucide="search" class="text-secondary ms-2" style="width: 16px; height: 16px;"></i>
                                <input type="text" placeholder="Search student..." class="form-control bg-transparent border-0 shadow-none px-2 py-1 text-sm text-dark" 
                                    oninput="
                                        const val = this.value.toLowerCase();
                                        this.closest('.overflow-y-auto').querySelectorAll('label').forEach(el => {
                                            const text = el.textContent.toLowerCase();
                                            if (text.includes(val)) {
                                                el.classList.remove('d-none');
                                                el.classList.add('d-flex');
                                            } else {
                                                el.classList.remove('d-flex');
                                                el.classList.add('d-none');
                                            }
                                        });
                                    ">
                            </div>
                        </div>
                        <div class="bg-white">${studentRows}</div>
                    </div>
                </div>
            </div>`;
            this.open(html);
        }
    },

    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if(!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed bottom-0 start-50 translate-middle-x d-flex flex-column gap-2 pointer-events-none w-100 px-3';
            container.style.paddingBottom = '5rem'; // Above bottom nav
            container.style.maxWidth = '400px';
            container.style.zIndex = '1070';
            document.getElementById('app-root').appendChild(container);
        }
        
        const toast = document.createElement('div');
        const colors = type === 'success' ? 'bg-dark text-white' : 'bg-danger text-white';
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        
        toast.className = `toast align-items-center border-0 show w-100 ${colors} rounded-4 shadow-lg animate-slide-up mb-2`;
        toast.innerHTML = `
            <div class="d-flex p-3 align-items-center gap-3">
                <i data-lucide="${icon}" style="width: 20px; height: 20px; opacity: 0.9;"></i>
                <div class="toast-body p-0 fw-medium fs-6 flex-grow-1">${message}</div>
            </div>`;
        
        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.classList.remove('animate-slide-up');
            toast.classList.add('animate-slide-down');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
