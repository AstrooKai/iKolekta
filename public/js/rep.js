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
        // localStorage.removeItem('kolekta_state'); // Uncomment to reset state
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
                    btn.classList.remove('text-slate-400', 'text-slate-500');
                    if(btn.closest('.hidden.md\\:flex')) btn.classList.add('text-indigo-600');
                } else {
                    btn.classList.remove('active', 'text-indigo-600');
                    if(btn.closest('.hidden.md\\:flex')) btn.classList.add('text-slate-500');
                    else btn.classList.add('text-slate-400');
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

        main.innerHTML = `<div class="animate-fade-in w-full pb-8">${content}</div>`;
        lucide.createIcons();
    },

    views: {
        repHome: () => `
            <div class="flex justify-between items-end mb-6 mt-2">
                <div>
                    <p class="text-sm font-medium text-slate-500">${app.state.activeTerm}</p>
                    <h2 class="text-2xl font-bold text-slate-900 mt-1">My Collections</h2>
                </div>
                <button onclick="app.modals.openCreateTask()" class="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 hover:shadow-xl focus:ring-4 focus:ring-indigo-100 outline-none">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                </button>
            </div>
            ${app.components.repDashboardStats()}
            <div class="mt-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 space-y-4 md:space-y-0">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 md:col-span-full">Active Collections</h3>
                ${app.state.tasks.filter(t => t.term === app.state.activeTerm).length === 0 ? 
                    `<div class="text-center py-10 bg-white rounded-3xl border border-slate-200 border-dashed md:col-span-full">
                        <i data-lucide="inbox" class="w-10 h-10 text-slate-300 mx-auto mb-2"></i>
                        <p class="text-sm font-medium text-slate-500">No active collections yet</p>
                    </div>` : 
                    app.state.tasks.filter(t => t.term === app.state.activeTerm).map(t => app.components.taskCard(t)).join('')}
            </div>
        `,
        history: () => {
            const archivedTasks = app.state.tasks.filter(t => t.term !== app.state.activeTerm);
            const itemsHTML = archivedTasks.length === 0 
                ? `<div class="text-center py-10"><p class="text-slate-500">No archived collections.</p></div>`
                : archivedTasks.map(t => app.components.taskCard(t, true)).join('');

            return `
            <div class="mb-6 mt-2">
                <h2 class="text-2xl font-bold text-slate-900">History Log</h2>
                <p class="text-sm text-slate-500 mt-1">Archived records and past activity.</p>
            </div>
            <div class="mt-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 space-y-3 md:space-y-0">
                ${itemsHTML}
            </div>
        `},
        profile: () => {
            return `
            <div class="mb-6 mt-2 text-center md:text-left">
                <h2 class="text-2xl font-bold text-slate-900">Profile</h2>
                <p class="text-sm text-slate-500 mt-1">Manage your session.</p>
            </div>
            
            <div class="flex items-center justify-center py-10 md:py-20">
                <a href="/login" onclick="app.showToast('Logging out...', 'success')" class="w-full max-w-sm bg-white rounded-2xl border border-red-200 px-5 py-4 flex items-center justify-center gap-3 text-red-600 font-bold shadow-sm hover:bg-red-50 transition-colors text-center">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
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
            <div onclick="app.modals.openTaskDetail('${task.id}')" class="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-100 cursor-pointer transition-all active:scale-[0.98] focus-within:ring-2 focus-within:ring-indigo-500 outline-none ${isArchived ? 'opacity-80' : ''}" tabindex="0">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-slate-900 text-[17px] leading-tight">${task.title}</h4>
                        <p class="text-xs text-slate-500 font-medium mt-1.5">${task.course} • ${isArchived ? `Archived (${task.term})` : `Due ${new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}</p>
                    </div>
                    <span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100">₱${task.amount.toFixed(2)}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div class="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" style="width: ${percent}%"></div>
                </div>
                <div class="flex justify-between text-xs font-medium">
                    <span class="text-indigo-700 font-semibold flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> ${paidCount} Paid</span>
                    <span class="text-slate-500">${totalStudents - paidCount} Pending</span>
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
            <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <p class="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-1.5 relative z-10">Collected</p>
                    <h3 class="text-2xl font-bold tracking-tight relative z-10">₱${totalCollected.toLocaleString()}</h3>
                </div>
                <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Pending</p>
                    <h3 class="text-2xl font-bold text-slate-900 tracking-tight">₱${pendingDues.toLocaleString()}</h3>
                </div>
            </div>`;
        }
    },

    actions: {
        async createTask(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>';
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
            <div class="fixed inset-0 z-[60] flex flex-col justify-center items-center bg-slate-900/60 backdrop-blur-sm animate-fade-in px-4">
                <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up flex flex-col relative">
                    <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <i data-lucide="help-circle" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">${title}</h3>
                    <p class="text-sm text-slate-500 mb-6">${message}</p>
                    <div class="flex gap-3">
                        <button id="confirm-cancel-btn" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
                        <button id="confirm-ok-btn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors">Confirm</button>
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
                <label class="flex items-center gap-3 p-2 hover:bg-slate-100 cursor-pointer rounded-xl student-checkbox-item" data-courses="${(student.enrolledCourses || []).join(',')}">
                    <input type="checkbox" name="target_students" value="${student.id}" checked class="w-5 h-5 text-indigo-600 bg-white border-slate-300 rounded cursor-pointer accent-indigo-600 shadow-sm">
                    <div>
                        <p class="font-bold text-slate-900 text-sm leading-tight">${student.name}</p>
                        <p class="text-[10px] text-slate-500 font-mono mt-0.5">${student.id}</p>
                    </div>
                </label>
            `).join('');

            const html = `
            <div class="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/40 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-3xl p-6 animate-slide-up shadow-2xl h-[90%] md:h-auto md:max-h-[90vh] flex flex-col relative pb-safe md:pb-6">
                    <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden"></div>
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-slate-900">New Collection</h3>
                        <button type="button" onclick="app.modals.close()" class="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                    
                    <form onsubmit="app.actions.createTask(event)" class="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title <span class="text-red-500">*</span></label>
                            <input type="text" id="new-task-title" required placeholder="e.g. Field Trip Fee" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (₱) <span class="text-red-500">*</span></label>
                                <input type="number" step="0.01" id="new-task-amount" required placeholder="0.00" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Course</label>
                                <select id="new-task-course" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
                                    onchange="
                                        const selected = this.value;
                                        document.querySelectorAll('.student-checkbox-item').forEach(item => {
                                            const cb = item.querySelector('input');
                                            if (!selected) {
                                                item.style.display = 'flex';
                                                cb.checked = true;
                                            } else {
                                                const courses = item.getAttribute('data-courses').split(',');
                                                if(courses.includes(selected)) {
                                                    item.style.display = 'flex';
                                                    cb.checked = true;
                                                } else {
                                                    item.style.display = 'none';
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
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deadline <span class="text-red-500">*</span></label>
                            <input type="date" id="new-task-deadline" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900">
                        </div>
                        
                        <div class="border-t border-slate-200 pt-4">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Enrolled Students</label>
                            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-2 max-h-40 overflow-y-auto space-y-1">
                                ${studentCheckboxes}
                            </div>
                        </div>

                        <div class="pt-4">
                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-transform active:scale-[0.98] focus:ring-4 focus:ring-indigo-100 flex items-center justify-center">
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
                <label class="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-100 last:border-0 ${isPaid ? 'bg-indigo-50/30' : ''}" data-student="${student.id}">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${isPaid ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                            ${initials}
                        </div>
                        <div>
                            <p class="font-bold text-slate-900">${student.name}</p>
                            <p class="text-[11px] text-slate-500 font-mono mt-0.5">${student.id}</p>
                        </div>
                    </div>
                    <div class="relative flex items-center">
                        <input type="checkbox" ${isPaid ? 'checked' : ''} class="w-6 h-6 text-indigo-600 bg-slate-100 border-slate-300 rounded-md cursor-pointer accent-indigo-600" 
                            onchange="
                                app.actions.togglePayment('${taskId}', '${student.id}', this.checked); 
                                const label = this.closest('label');
                                const avatar = label.querySelector('.w-10');
                                if(this.checked) {
                                    label.classList.add('bg-indigo-50/30');
                                    avatar.className = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors bg-indigo-600 text-white';
                                } else {
                                    label.classList.remove('bg-indigo-50/30');
                                    avatar.className = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors bg-slate-100 text-slate-600 border border-slate-200';
                                }
                            ">
                    </div>
                </label>`;
            }).join('');

            const html = `
            <div class="fixed inset-0 z-50 flex flex-col md:justify-center md:items-center bg-slate-50 md:bg-slate-900/40 md:backdrop-blur-sm animate-fade-in md:p-6" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-slate-50 w-full md:max-w-xl md:h-[85vh] md:max-h-[800px] flex flex-col relative md:rounded-3xl shadow-2xl animate-slide-up h-full overflow-hidden">
                    <header class="glass-header px-4 py-4 flex items-center gap-3 sticky top-0 z-20 md:border-b md:border-slate-200">
                        <button onclick="app.modals.close(); app.render()" class="p-2 rounded-full hover:bg-slate-200/50 text-slate-600">
                        <i data-lucide="arrow-left" class="w-6 h-6"></i>
                    </button>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-slate-900 truncate pr-2">${task.title}</h3>
                        <p class="text-xs text-slate-500 font-medium" id="detail-stats">${paidCount}/${filteredStudents.length} Paid</p>
                    </div>
                    <div class="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold text-sm border border-indigo-200">₱${task.amount}</div>
                </header>
                <div class="flex-1 overflow-y-auto pb-safe">
                    <div class="p-4 sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                        <div class="bg-white rounded-xl border border-slate-300 flex items-center p-1 focus-within:ring-2 focus-within:ring-indigo-500 shadow-sm">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 ml-3 shrink-0"></i>
                            <input type="text" placeholder="Search student..." class="w-full bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700" 
                                oninput="
                                    const val = this.value.toLowerCase();
                                    this.closest('.overflow-y-auto').querySelectorAll('label').forEach(el => {
                                        const text = el.textContent.toLowerCase();
                                        el.style.display = text.includes(val) ? 'flex' : 'none';
                                    });
                                ">
                        </div>
                    </div>
                    <div class="bg-white">${studentRows}</div>
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
            container.className = 'absolute bottom-24 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
            document.getElementById('app-root').appendChild(container);
        }
        
        const toast = document.createElement('div');
        const colors = type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white';
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        
        toast.className = `${colors} p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up origin-bottom`;
        toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 opacity-90"></i><p class="font-medium text-sm flex-1">${message}</p>`;
        
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
document.head.insertAdjacentHTML('beforeend', '<style>.pb-safe { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }</style>');
