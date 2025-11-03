        let members = JSON.parse(localStorage.getItem('gymMembers')) || [];
        let todayScans = JSON.parse(localStorage.getItem('todayScans')) || [];

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateStats();
            loadRecentScans();
            setupEventListeners();
        });

        // Setup Event Listeners
        function setupEventListeners() {
            // Menu toggle
            document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !document.getElementById('sidebar').contains(e.target) && 
                    !document.getElementById('menuToggle').contains(e.target) &&
                    document.getElementById('sidebar').classList.contains('active')) {
                    toggleSidebar();
                }
            });
            
            // Keyboard shortcut for member ID input
            document.getElementById('memberId').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkInMember();
                }
            });
            
            // Close alert on outside click
            document.getElementById('alertOverlay').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeAlert();
                }
            });
        }

        // Toggle Sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
            
            const menuIcon = document.querySelector('#menuToggle i');
            if (sidebar.classList.contains('active')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        }

        // Show Toast Notification
        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Update Statistics
        function updateStats() {
            const today = new Date().toLocaleDateString('ar-EG');
            todayScans = todayScans.filter(s => s.date === today);
            
            document.getElementById('todayScans').textContent = todayScans.length;
            document.getElementById('activeNow').textContent = members.filter(m => m.sessionsRemaining > 0).length;
            document.getElementById('avgTime').textContent = '1.5 ساعة';
        }

        // Open Camera (Simulation)
        function openCamera() {
            showAlert('info', 'مسح الكاميرا', 'في النسخة الفعلية، سيتم فتح الكاميرا لمسح QR Code.\n\nللتجربة، استخدم الإدخال اليدوي بالأسفل.');
        }

        // Check In Member
        function checkInMember() {
            const memberId = document.getElementById('memberId').value.trim();
            
            if (!memberId) {
                showAlert('error', 'خطأ', 'الرجاء إدخال رقم المتدرب');
                return;
            }

            const memberIndex = members.findIndex(m => m.id === memberId);
            
            if (memberIndex === -1) {
                showAlert('error', 'غير موجود', `لم يتم العثور على متدرب برقم: ${memberId}\n\nتأكد من الرقم وحاول مرة أخرى.`);
                return;
            }

            const member = members[memberIndex];
            
            if (member.sessionsRemaining <= 0) {
                showExpiredAlert(member);
                return;
            }

            // Deduct session
            members[memberIndex].sessionsRemaining -= 1;
            members[memberIndex].lastAttendance = new Date().toLocaleDateString('ar-EG');
            localStorage.setItem('gymMembers', JSON.stringify(members));

            // Add to today's scans
            const scan = {
                memberId: member.id,
                memberName: member.name,
                package: member.package,
                remainingSessions: members[memberIndex].sessionsRemaining,
                time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString('ar-EG'),
                timestamp: Date.now()
            };
            
            todayScans.push(scan);
            localStorage.setItem('todayScans', JSON.stringify(todayScans));

            // Add activity
            addActivity(`✅ حضور: ${member.name} - الحصص المتبقية: ${members[memberIndex].sessionsRemaining}`);

            // Show success
            showSuccessAlert(member, members[memberIndex].sessionsRemaining);

            // Clear input and update
            document.getElementById('memberId').value = '';
            updateStats();
            loadRecentScans();
        }

        // Show Success Alert
        function showSuccessAlert(member, remaining) {
            const memberInfo = `
                <p><span>الاسم:</span> <strong>${member.name}</strong></p>
                <p><span>رقم العضوية:</span> <strong>${member.id}</strong></p>
                <p><span>الباقة:</span> <strong>${member.package}</strong></p>
                <p><span>الحصص المتبقية:</span> <strong style="color: ${remaining > 5 ? '#2ecc71' : '#f39c12'};">${remaining}</strong></p>
                <p><span>الوقت:</span> <strong>${new Date().toLocaleTimeString('ar-EG')}</strong></p>
            `;

            document.getElementById('alertIcon').innerHTML = '<i class="fas fa-check-circle"></i>';
            document.getElementById('alertIcon').className = 'alert-icon success';
            document.getElementById('alertTitle').textContent = 'تم تسجيل الحضور بنجاح!';
            document.getElementById('alertMessage').textContent = 'تم خصم حصة من اشتراك المتدرب';
            document.getElementById('alertMemberInfo').innerHTML = memberInfo;
            document.getElementById('alertMemberInfo').style.display = 'block';
            document.getElementById('alertButtons').innerHTML = '<button class="alert-btn primary" onclick="closeAlert()">ممتاز!</button>';
            document.getElementById('alertOverlay').classList.add('active');

            if (remaining <= 3 && remaining > 0) {
                setTimeout(() => {
                    showAlert('warning', 'تنبيه', `تبقى ${remaining} حصص فقط لـ ${member.name}\n\nيُنصح بتجديد الاشتراك قريباً.`);
                }, 3000);
            }
        }

        // Show Expired Alert
        function showExpiredAlert(member) {
            const memberInfo = `
                <p><span>الاسم:</span> <strong>${member.name}</strong></p>
                <p><span>رقم الهاتف:</span> <strong>${member.phone}</strong></p>
                <p><span>الباقة:</span> <strong>${member.package}</strong></p>
                <p><span>الحصص المتبقية:</span> <strong style="color: #e74c3c;">0</strong></p>
            `;

            document.getElementById('alertIcon').innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            document.getElementById('alertIcon').className = 'alert-icon warning';
            document.getElementById('alertTitle').textContent = 'اشتراك منتهي!';
            document.getElementById('alertMessage').textContent = 'انتهت حصص هذا المتدرب. يرجى تجديد الاشتراك للمتابعة.';
            document.getElementById('alertMemberInfo').innerHTML = memberInfo;
            document.getElementById('alertMemberInfo').style.display = 'block';
            document.getElementById('alertButtons').innerHTML = `
                <button class="alert-btn secondary" onclick="closeAlert()">إلغاء</button>
                <button class="alert-btn primary" onclick="renewFromAlert('${member.id}')">
                    <i class="fas fa-sync"></i> تجديد الآن
                </button>
            `;
            document.getElementById('alertOverlay').classList.add('active');
        }

        // Renew from Alert
        function renewFromAlert(memberId) {
            window.location.href = `memberManage.html`;
        }

        // Show Alert
        function showAlert(type, title, message) {
            const icons = {
                success: '<i class="fas fa-check-circle"></i>',
                error: '<i class="fas fa-times-circle"></i>',
                warning: '<i class="fas fa-exclamation-triangle"></i>',
                info: '<i class="fas fa-info-circle"></i>'
            };

            document.getElementById('alertIcon').innerHTML = icons[type];
            document.getElementById('alertIcon').className = 'alert-icon ' + type;
            document.getElementById('alertTitle').textContent = title;
            document.getElementById('alertMessage').textContent = message;
            document.getElementById('alertMemberInfo').style.display = 'none';
            document.getElementById('alertButtons').innerHTML = '<button class="alert-btn primary" onclick="closeAlert()">حسناً</button>';
            document.getElementById('alertOverlay').classList.add('active');
        }

        // Close Alert
        function closeAlert() {
            document.getElementById('alertOverlay').classList.remove('active');
        }

        // Load Recent Scans
        function loadRecentScans() {
            const list = document.getElementById('recentScansList');
            const recentScans = todayScans.slice(-10).reverse();

            if (recentScans.length === 0) {
                list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">لا توجد عمليات مسح اليوم</p>';
                return;
            }

            list.innerHTML = '';
            recentScans.forEach(scan => {
                const badge = scan.remainingSessions > 5 ? 'badge-success' : 'badge-warning';
                const statusText = scan.remainingSessions > 5 ? 'نشط' : 'قرب الانتهاء';

                list.innerHTML += `
                    <div class="scan-item">
                        <div class="scan-info">
                            <h4>${scan.memberName}</h4>
                            <div class="scan-details">
                                <span><i class="fas fa-id-card"></i> ${scan.memberId}</span>
                                <span><i class="fas fa-box"></i> ${scan.package}</span>
                                <span><i class="fas fa-clock"></i> ${scan.time}</span>
                            </div>
                        </div>
                        <div>
                            <div class="scan-badge ${badge}">${statusText}</div>
                            <div style="color: var(--gold); margin-top: 0.5rem; font-weight: bold;">
                                ${scan.remainingSessions} حصة متبقية
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Add Activity
        function addActivity(text) {
            const activities = JSON.parse(localStorage.getItem('gymActivities')) || [];
            const now = new Date();
            
            activities.unshift({
                text: text,
                time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + now.toLocaleDateString('ar-EG'),
                timestamp: now.getTime()
            });

            if (activities.length > 50) activities.pop();
            localStorage.setItem('gymActivities', JSON.stringify(activities));
        }

        // Refresh Data
        function refreshData() {
            updateStats();
            loadRecentScans();
            showToast('تم تحديث البيانات بنجاح!', 'success');
        }

        // Add some demo data if empty
        if (members.length === 0) {
            const demoMembers = [
                {
                    id: 'GYM-0001',
                    name: 'أحمد محمد',
                    phone: '01234567890',
                    package: 'Gold',
                    startDate: new Date().toISOString().split('T')[0],
                    sessionsRemaining: 45,
                    totalSessions: 999,
                    lastAttendance: new Date().toLocaleDateString('ar-EG')
                },
                {
                    id: 'GYM-0002',
                    name: 'سارة علي',
                    phone: '01234567891',
                    package: 'Silver',
                    startDate: new Date().toISOString().split('T')[0],
                    sessionsRemaining: 15,
                    totalSessions: 20,
                    lastAttendance: new Date(Date.now() - 86400000).toLocaleDateString('ar-EG')
                }
            ];

            members = demoMembers;
            localStorage.setItem('gymMembers', JSON.stringify(members));
            
            const demoScans = [
                {
                    memberId: 'GYM-0001',
                    memberName: 'أحمد محمد',
                    package: 'Gold',
                    remainingSessions: 45,
                    time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toLocaleDateString('ar-EG'),
                    timestamp: Date.now()
                }
            ];
            
            todayScans = demoScans;
            localStorage.setItem('todayScans', JSON.stringify(todayScans));
            
            updateStats();
            loadRecentScans();
        }