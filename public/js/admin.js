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
                } else {
                    btn.classList.remove('active');
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

        main.innerHTML = `<div class="animate-fade-in w-100 pb-5">${content}</div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    views: {
        adminHome: () => `
            <div class="mb-4 mt-2">
                <h2 class="fs-3 fw-bold text-dark">System Admin</h2>
                <p class="small text-secondary mt-1">Global oversight & settings</p>
            </div>
            
            <button onclick="app.modals.openTermConfig()" class="w-100 text-start bg-dark rounded-4 p-4 shadow-lg text-white mb-4 position-relative overflow-hidden border-0">
                <div class="position-absolute top-0 end-0 mt-n4 me-n4 bg-primary opacity-25 rounded-circle" style="width: 120px; height: 120px; filter: blur(20px);"></div>
                <div class="position-relative z-1 d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-white-50 text-uppercase fw-bold mb-1" style="font-size: 10px; letter-spacing: 1px;">Current Academic Term</p>
                        <h3 class="fs-5 fw-bold text-white mb-0">${app.state.activeTerm}</h3>
                    </div>
                    <div class="bg-white bg-opacity-10 p-2 rounded-3">
                        <i data-lucide="settings-2" class="text-white" style="width: 20px; height: 20px;"></i>
                    </div>
                </div>
            </button>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="fs-6 fw-bold text-dark text-uppercase m-0" style="letter-spacing: 1px;">Active Courses</h3>
                <button onclick="app.modals.openCourseConfig()" class="btn btn-link text-primary text-decoration-none fw-semibold p-0" style="font-size: 12px;">Manage</button>
            </div>
            
            <div class="bg-white border border-secondary-subtle rounded-4 p-4 shadow-sm mb-4 d-flex gap-2 flex-wrap">
                ${app.state.courses.map(c => `<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-6">${c}</span>`).join('')}
                ${app.state.courses.length === 0 ? '<span class="text-secondary small fst-italic">No courses added yet.</span>' : ''}
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="fs-6 fw-bold text-dark text-uppercase m-0" style="letter-spacing: 1px;">Global Analytics</h3>
            </div>
            
            <div class="row g-3 mb-4">
                <div class="col-6">
                    <div class="bg-white border border-secondary-subtle rounded-4 p-4 shadow-sm h-100">
                        <p class="text-secondary text-uppercase fw-bold mb-1" style="font-size: 10px; letter-spacing: 1px;">Total Collections</p>
                        <h3 class="fs-2 fw-bold text-dark m-0">${app.state.tasks.length}</h3>
                    </div>
                </div>
                <div class="col-6">
                    <div class="bg-white border border-secondary-subtle rounded-4 p-4 shadow-sm h-100">
                        <p class="text-secondary text-uppercase fw-bold mb-1" style="font-size: 10px; letter-spacing: 1px;">Active Term Collections</p>
                        <h3 class="fs-2 fw-bold text-dark m-0">${app.state.tasks.filter(t => t.term === app.state.activeTerm).length}</h3>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="fs-6 fw-bold text-dark text-uppercase m-0" style="letter-spacing: 1px;">Recent Activity</h3>
                <button onclick="app.switchTab('history')" class="btn btn-link text-primary text-decoration-none fw-semibold p-0" style="font-size: 12px;">View All</button>
            </div>
            <div class="d-flex flex-column gap-3">
                ${app.components.activityFeed().slice(0, 2).join('')}
            </div>
        `,
        history: () => {
            const itemsHTML = app.components.activityFeed(true).join('');
            return `
            <div class="mb-4 mt-2">
                <h2 class="fs-3 fw-bold text-dark">Global Audit Log</h2>
                <p class="small text-secondary mt-1">System-wide activity tracker.</p>
            </div>
            <div class="mt-4 d-flex flex-column gap-3">
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
                        <div class="bg-white p-3 p-md-4 rounded-4 shadow-sm border border-secondary-subtle d-flex gap-3 align-items-start">
                            <div class="bg-primary-subtle p-2 rounded-3 text-primary flex-shrink-0 border border-primary-subtle mt-1">
                                <i data-lucide="file-plus" style="width: 16px; height: 16px;"></i>
                            </div>
                            <div>
                                <p class="small text-dark fw-medium m-0">New collection created: ${task.title}</p>
                                <p class="text-secondary m-0" style="font-size: 12px;">Course ${task.course} &bull; Term: ${task.term}</p>
                                <p class="text-secondary mt-1 mb-0" style="font-size: 10px;">By <span class="fw-bold">${task.createdBy || '@unknown'}</span> &bull; ${new Date(task.createdAt).toLocaleString()}</p>
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
                                <div class="bg-white p-3 p-md-4 rounded-4 shadow-sm border border-secondary-subtle d-flex gap-3 align-items-start">
                                    <div class="bg-success-subtle p-2 rounded-3 text-success flex-shrink-0 border border-success-subtle mt-1">
                                        <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                                    </div>
                                    <div>
                                        <p class="small text-dark fw-medium m-0">Payment received from <span class="fw-bold">${studentId}</span></p>
                                        <p class="text-secondary m-0" style="font-size: 12px;">Collection: ${task.title} &bull; Course: ${task.course}</p>
                                        <p class="text-secondary mt-1 mb-0" style="font-size: 10px;">Processed by <span class="fw-bold">${payment.by}</span> &bull; ${new Date(payment.time).toLocaleString()}</p>
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
                return [`<div class="text-center py-5"><p class="text-secondary">No activity recorded yet.</p></div>`];
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
            btn.innerHTML = '<i data-lucide="loader-2" class="spinner-border spinner-border-sm mx-auto"></i>';
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
            <div class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end justify-content-md-center align-items-md-center modal-backdrop-blur animate-fade-in" style="z-index: 1050;" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-100 p-4 animate-slide-up shadow-lg d-flex flex-column position-relative" style="max-width: 500px; border-radius: 2rem 2rem 0 0; max-height: 90vh;">
                    <div class="bg-secondary-subtle rounded-pill mx-auto mb-3 d-md-none" style="width: 48px; height: 6px;"></div>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3 class="fs-4 fw-bold text-dark m-0">Active Term</h3>
                        <button type="button" onclick="app.modals.close()" class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
                    </div>
                    
                    <p class="small text-secondary mb-4">Advancing the term will automatically archive all current collections on the public page. This action affects the entire system.</p>

                    <div class="d-flex flex-column gap-3 mb-3 max-h-60 overflow-y-auto pr-2">
                        ${['1st Semester, A.Y. 2023-2024', '2nd Semester, A.Y. 2023-2024', '1st Semester, A.Y. 2024-2025'].map(term => `
                            <button onclick="
                                app.modals.openConfirm(
                                    'Advance Term',
                                    'Are you sure you want to advance the system term to ${term}? All active collections will be archived.',
                                    () => { app.actions.changeTerm('${term}'); }
                                );
                            " class="btn w-100 text-start p-3 rounded-4 border ${app.state.activeTerm === term ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-white'} d-flex justify-content-between align-items-center">
                                <span class="fw-medium ${app.state.activeTerm === term ? 'text-primary fw-bold' : 'text-dark'}">${term}</span>
                                ${app.state.activeTerm === term ? `<i data-lucide="check-circle-2" class="text-primary" style="width: 20px; height: 20px;"></i>` : `<i data-lucide="chevron-right" class="text-secondary opacity-50" style="width: 20px; height: 20px;"></i>`}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>`;
            this.open(html);
        },
        openCourseConfig() {
            const html = `
            <div class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end justify-content-md-center align-items-md-center modal-backdrop-blur animate-fade-in" style="z-index: 1050;" onclick="if(event.target === this) app.modals.close()">
                <div id="modal-panel" class="bg-white w-100 p-4 animate-slide-up shadow-lg d-flex flex-column position-relative" style="max-width: 500px; border-radius: 2rem 2rem 0 0; max-height: 90vh;">
                    <div class="bg-secondary-subtle rounded-pill mx-auto mb-3 d-md-none" style="width: 48px; height: 6px;"></div>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h3 class="fs-4 fw-bold text-dark m-0">Manage Courses</h3>
                            <p class="small text-secondary mt-1 mb-0">Active Term: ${app.state.activeTerm}</p>
                        </div>
                        <button type="button" onclick="app.modals.close()" class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
                    </div>
                    
                    <form onsubmit="app.actions.addCourse(event)" class="mb-4 d-flex flex-column gap-3">
                        <div>
                            <label class="form-label text-secondary fw-bold text-uppercase mb-1" style="font-size: 11px; letter-spacing: 1px;">New Course / Subject</label>
                            <input type="text" id="new-course-name" required placeholder="e.g. CCS114" class="form-control form-control-lg bg-light border-secondary-subtle rounded-4 fs-6 fw-medium text-dark px-3 py-2 text-uppercase">
                        </div>
                        <div>
                            <label class="form-label text-secondary fw-bold text-uppercase mb-1" style="font-size: 11px; letter-spacing: 1px;">Classlist (CSV)</label>
                            <input type="file" id="new-course-csv" accept=".csv" required class="form-control form-control-lg bg-light border-secondary-subtle rounded-4 fs-6 text-dark px-3 py-2">
                            <p class="text-secondary mt-1 mb-0" style="font-size: 10px;">Format: StudentID, Full Name</p>
                        </div>
                        <div class="pt-2">
                            <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-4 shadow-sm">Add Course</button>
                        </div>
                    </form>

                    <div class="d-flex flex-column gap-2 mb-2 max-h-60 overflow-y-auto pr-2">
                        ${app.state.courses.map(c => `
                            <div class="w-100 text-start p-3 rounded-4 border border-secondary-subtle bg-white d-flex justify-content-between align-items-center">
                                <span class="fw-medium text-dark">${c}</span>
                            </div>
                        `).join('')}
                        ${app.state.courses.length === 0 ? '<p class="text-secondary small fst-italic text-center py-3">No courses available.</p>' : ''}
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
