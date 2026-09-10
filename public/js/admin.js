const app = {
    state: {
        currentRole: 'admin',
        currentUser: '@admin_jones',
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
        async addCourse(courseName, file) {
            // Mock API delay
            await new Promise(r => setTimeout(r, 500));
            if (app.state.courses.includes(courseName)) {
                return { success: false, error: 'Course already exists' };
            }
            app.state.courses.push(courseName);
            
            if (file) {
                const text = await file.text();
                const lines = text.split('\n').filter(l => l.trim());
                // Simple CSV parse: id, name
                for(let i = 1; i < lines.length; i++) {
                    const parts = lines[i].split(',');
                    if (parts.length >= 2) {
                        const id = parts[0].trim();
                        const name = parts[1].trim();
                        const existing = app.state.students.find(s => s.id === id);
                        if (existing) {
                            if (!existing.enrolledCourses) existing.enrolledCourses = [];
                            if (!existing.enrolledCourses.includes(courseName)) {
                                existing.enrolledCourses.push(courseName);
                            }
                        } else {
                            app.state.students.push({ id, name, enrolledCourses: [courseName] });
                        }
                    }
                }
            }
            app.saveState(); // Simulates backend persisting the new state
            return { success: true };
        }
    },

    loadState() {
        const saved = localStorage.getItem('kolekta_state');
        this.state.currentUser = localStorage.getItem('kolekta_user') || '@admin_jones';
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
            { id: t3, title: 'Department Shirt', course: 'General', amount: 350, deadline: '2023-09-01', term: '2nd Semester, A.Y. 2022-2023', createdAt: Date.now() - 31536000000, createdBy: '@rep_smith' }
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
        ['home', 'history'].forEach(t => {
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
        
        let content = '';
        if (this.state.currentTab === 'home') content = this.views.adminHome();
        else if (this.state.currentTab === 'history') content = this.views.history();

        main.innerHTML = `<div class="animate-fade-in w-full pb-8">${content}</div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    views: {
        adminHome: () => `
            <div class="mb-6 mt-2">
                <h2 class="text-2xl font-bold text-slate-900">System Admin</h2>
                <p class="text-sm text-slate-500 mt-1">Global oversight & settings</p>
            </div>
            
            <button onclick="app.modals.openTermConfig()" class="w-full text-left bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/10 text-white mb-6 relative overflow-hidden group hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-300 outline-none">
                <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all"></div>
                <div class="relative z-10 flex justify-between items-center">
                    <div>
                        <p class="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1.5">Current Academic Term</p>
                        <h3 class="text-lg font-bold text-white tracking-wide">${app.state.activeTerm}</h3>
                    </div>
                    <div class="bg-white/10 p-2.5 rounded-xl backdrop-blur">
                        <i data-lucide="settings-2" class="w-5 h-5 text-white"></i>
                    </div>
                </div>
            </button>

            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">Active Courses</h3>
                <button onclick="app.modals.openCourseConfig()" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Manage</button>
            </div>
            
            <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-8 flex gap-2 flex-wrap">
                ${app.state.courses.map(c => `<span class="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">${c}</span>`).join('')}
                ${app.state.courses.length === 0 ? '<span class="text-slate-400 text-sm italic">No courses added yet.</span>' : ''}
            </div>
            
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">Global Analytics</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-8">
                <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Total Collections</p>
                    <h3 class="text-2xl font-bold text-slate-900 tracking-tight">${app.state.tasks.length}</h3>
                </div>
                <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Active Term Collections</p>
                    <h3 class="text-2xl font-bold text-slate-900 tracking-tight">${app.state.tasks.filter(t => t.term === app.state.activeTerm).length}</h3>
                </div>
            </div>

            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                <button onclick="app.switchTab('history')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View All</button>
            </div>
            <div class="space-y-3">
                ${app.components.activityFeed().slice(0, 2).join('')}
            </div>
        `,
        history: () => {
            const itemsHTML = app.components.activityFeed(true).join('');
            return `
            <div class="mb-6 mt-2">
                <h2 class="text-2xl font-bold text-slate-900">Global Audit Log</h2>
                <p class="text-sm text-slate-500 mt-1">System-wide activity tracker.</p>
            </div>
            <div class="mt-6 space-y-3">
                ${itemsHTML}
            </div>
        `}
    },

    components: {
        activityFeed: (extended = false) => {
            // Generate audit log from payments
            let feed = [];
            
            app.state.tasks.forEach(task => {
                // Add Task Creation to feed
                feed.push({
                    time: task.createdAt,
                    html: `
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-start">
                            <div class="bg-indigo-50 p-2 rounded-xl text-indigo-600 shrink-0 border border-indigo-100 mt-0.5">
                                <i data-lucide="file-plus" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <p class="text-sm text-slate-900 font-medium">New collection created: ${task.title}</p>
                                <p class="text-xs text-slate-500 mt-1">Course ${task.course} • Term: ${task.term}</p>
                                <p class="text-[10px] text-slate-400 mt-1">By <span class="font-bold">${task.createdBy || '@unknown'}</span> • ${new Date(task.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    `
                });

                // Add Payments to feed
                const payments = app.state.payments[task.id] || {};
                Object.keys(payments).forEach(studentId => {
                    const payment = payments[studentId];
                    if(payment && typeof payment === 'object') {
                        feed.push({
                            time: payment.time,
                            html: `
                                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-start">
                                    <div class="bg-emerald-50 p-2 rounded-xl text-emerald-600 shrink-0 border border-emerald-100 mt-0.5">
                                        <i data-lucide="check" class="w-4 h-4"></i>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-900 font-medium">Payment received from <span class="font-bold">${studentId}</span></p>
                                        <p class="text-xs text-slate-500 mt-1">Collection: ${task.title} • Course: ${task.course}</p>
                                        <p class="text-[10px] text-slate-400 mt-1">Processed by <span class="font-bold">${payment.by}</span> • ${new Date(payment.time).toLocaleString()}</p>
                                    </div>
                                </div>
                            `
                        });
                    }
                });
            });

            // Sort feed by time descending
            feed.sort((a, b) => b.time - a.time);
            
            if (feed.length === 0) {
                return [`<div class="text-center py-10"><p class="text-slate-500">No activity recorded yet.</p></div>`];
            }

            return feed.map(item => item.html);
        }
    },

    actions: {
        async changeTerm(term) {
            await new Promise(r => setTimeout(r, 200));
            app.state.activeTerm = term;
            app.saveState();
            
            app.render();
            app.modals.close();
            app.showToast(`Term advanced to ${term}`, 'success');
        },
        async addCourse(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin mx-auto"></i>';
            btn.disabled = true;

            const input = document.getElementById('new-course-name');
            const fileInput = document.getElementById('new-course-csv');
            const courseName = input.value.trim().toUpperCase();
            
            const file = fileInput.files[0];
            
            const result = await app.api.addCourse(courseName, file);
            
            if (result.success) {
                app.render();
                app.modals.close();
                app.showToast(`Course ${courseName} added successfully`, 'success');
            } else {
                app.showToast(result.error, 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
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
            const c = this.getContainer();
            c.innerHTML = html;
            lucide.createIcons();
            document.body.style.overflow = 'hidden';
        },
        close() {
            const c = this.getContainer();
            const panel = c.querySelector('#modal-panel');
            if (panel) {
                panel.classList.remove('animate-slide-up');
                panel.classList.add('animate-slide-down');
                setTimeout(() => {
                    c.innerHTML = '';
                    document.body.style.overflow = '';
                }, 300);
            } else {
                c.innerHTML = '';
                document.body.style.overflow = '';
            }
        },
        openTermConfig() {
            const html = `
            <div class="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/40 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-3xl p-6 animate-slide-up shadow-2xl h-auto md:max-h-[90vh] flex flex-col relative pb-safe md:pb-6">
                    <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-slate-900">Active Term</h3>
                        <button onclick="app.modals.close()" class="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                    
                    <p class="text-sm text-slate-500 mb-6">Advancing the term will automatically archive all current collections on the public page. This action affects the entire system.</p>

                    <div class="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2">
                        ${['1st Semester, A.Y. 2023-2024', '2nd Semester, A.Y. 2023-2024', '1st Semester, A.Y. 2024-2025'].map(term => `
                            <button onclick="
                                app.modals.openConfirm(
                                    'Advance Term',
                                    'Are you sure you want to advance the system term to ${term}? All active collections will be archived.',
                                    () => { app.actions.changeTerm('${term}'); }
                                );
                            " class="w-full text-left p-4 rounded-2xl border ${app.state.activeTerm === term ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'} transition-all flex justify-between items-center group">
                                <span class="font-medium ${app.state.activeTerm === term ? 'text-indigo-700 font-bold' : 'text-slate-700'}">${term}</span>
                                ${app.state.activeTerm === term ? `<i data-lucide="check-circle-2" class="w-5 h-5 text-indigo-600"></i>` : `<i data-lucide="chevron-right" class="w-5 h-5 text-slate-300 group-hover:text-indigo-400"></i>`}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>`;
            this.open(html);
        },
        openCourseConfig() {
            const html = `
            <div class="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/40 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-3xl p-6 animate-slide-up shadow-2xl h-auto md:max-h-[90vh] flex flex-col relative pb-safe md:pb-6">
                    <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-slate-900">Manage Courses</h3>
                            <p class="text-sm text-slate-500 mt-1">Active Term: ${app.state.activeTerm}</p>
                        </div>
                        <button onclick="app.modals.close()" class="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                    
                    <form onsubmit="app.actions.addCourse(event)" class="mb-6 space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Course / Subject</label>
                            <input type="text" id="new-course-name" required placeholder="e.g. CCS114" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 uppercase">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Classlist (CSV)</label>
                            <input type="file" id="new-course-csv" accept=".csv" required class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                            <p class="text-[10px] text-slate-400 mt-1">Format: StudentID, Full Name</p>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-transform active:scale-[0.98]">Add Course</button>
                    </form>

                    <div class="space-y-3 mb-2 max-h-60 overflow-y-auto pr-2">
                        ${app.state.courses.map(c => `
                            <div class="w-full text-left p-4 rounded-2xl border border-slate-200 bg-white flex justify-between items-center">
                                <span class="font-medium text-slate-700">${c}</span>
                            </div>
                        `).join('')}
                        ${app.state.courses.length === 0 ? '<p class="text-slate-500 text-sm italic text-center py-4">No courses available.</p>' : ''}
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
