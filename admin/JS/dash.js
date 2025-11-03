        // Sample Data
        const packagesInfo = {
            'Basic': { sessions: 12, price: 500 },
            'Silver': { sessions: 20, price: 800 },
            'Gold': { sessions: 999, price: 1200 },
            'VIP': { sessions: 999, price: 2000 }
        };

        let members = JSON.parse(localStorage.getItem('gymMembers')) || [];
        let currentQRMember = null;
        let isLoading = false;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Set default date to today
            document.getElementById('memberStartDate').valueAsDate = new Date();
            
            // Load initial data
            updateStats();
            loadMembers();
            loadRecentActivity();
            
            // Setup event listeners
            setupEventListeners();
            
            // Show welcome message
            setTimeout(() => {
                showToast('مرحباً بك في لوحة تحكم Royal GYM!', 'success');
            }, 1000);
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
            
            // Add member form
            document.getElementById('addMemberForm').addEventListener('submit', handleAddMember);
            
            // Close modal when clicking outside
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal(this.id);
                    }
                });
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    refreshData();
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

        // Update Statistics with animation
        function updateStats() {
            if (isLoading) return;
            
            const totalMembersEl = document.getElementById('totalMembers');
            const activeMembersEl = document.getElementById('activeMembers');
            const todayAttendanceEl = document.getElementById('todayAttendance');
            const monthlyRevenueEl = document.getElementById('monthlyRevenue');
            
            const totalMembers = members.length;
            const activeMembers = members.filter(m => m.sessionsRemaining > 0).length;
            
            const today = new Date().toLocaleDateString('ar-EG');
            const todayAttendance = members.filter(m => m.lastAttendance === today).length;
            
            const monthlyRevenue = members.reduce((sum, m) => sum + (packagesInfo[m.package]?.price || 0), 0);
            
            // Animate numbers
            animateValue(totalMembersEl, 0, totalMembers, 1000);
            animateValue(activeMembersEl, 0, activeMembers, 1000);
            animateValue(todayAttendanceEl, 0, todayAttendance, 1000);
            animateValue(monthlyRevenueEl, 0, monthlyRevenue, 1000, true);
        }

        // Animate number values
        function animateValue(element, start, end, duration, isCurrency = false) {
            const range = end - start;
            const increment = end > start ? 1 : -1;
            const stepTime = Math.abs(Math.floor(duration / range));
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                element.textContent = isCurrency ? 
                    current.toLocaleString() + ' جنيه' : 
                    current;
                
                if (current === end) {
                    clearInterval(timer);
                }
            }, stepTime);
        }

        // Load Members Table
        function loadMembers() {
            const tbody = document.getElementById('membersTableBody');
            tbody.innerHTML = '';

            const recentMembers = members.slice(0, 5);
            
            if (recentMembers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">لا توجد بيانات متدربين حالياً</td></tr>';
                return;
            }

            recentMembers.forEach(member => {
                const progress = ((packagesInfo[member.package].sessions - member.sessionsRemaining) / packagesInfo[member.package].sessions) * 100;
                const statusClass = member.sessionsRemaining > 5 ? 'badge-active' : 'badge-expiring';
                const statusText = member.sessionsRemaining > 5 ? 'نشط' : 'قرب الانتهاء';

                const row = `
                    <tr>
                        <td>
                            <strong>${member.name}</strong><br>
                            <small style="color: #999;">${member.phone}</small>
                        </td>
                        <td><span class="badge badge-active">${member.package}</span></td>
                        <td>
                            <strong style="color: var(--gold);">${member.sessionsRemaining}</strong> / ${packagesInfo[member.package].sessions}
                            <div class="progress-container">
                                <div class="progress-bar-fill" style="width: ${progress}%"></div>
                            </div>
                        </td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="viewMemberQR('${member.id}')">
                                <i class="fas fa-qrcode"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Load Recent Activity
        function loadRecentActivity() {
            const activityDiv = document.getElementById('recentActivity');
            const activities = JSON.parse(localStorage.getItem('gymActivities')) || [];
            
            activityDiv.innerHTML = '';
            
            if (activities.length === 0) {
                activityDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">لا توجد نشاطات حديثة</p>';
                return;
            }

            activities.slice(0, 5).forEach(activity => {
                activityDiv.innerHTML += `
                    <div class="activity-item">
                        <div class="activity-time">${activity.time}</div>
                        <div class="activity-text">${activity.text}</div>
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

            // Keep only last 50 activities
            if (activities.length > 50) activities.pop();
            
            localStorage.setItem('gymActivities', JSON.stringify(activities));
            loadRecentActivity();
        }

        // Open Add Member Modal
        function openAddMemberModal() {
            document.getElementById('addMemberModal').classList.add('active');
        }

        // Close Modal
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            if (modalId === 'qrModal') {
                document.getElementById('qrcode').innerHTML = '';
            }
        }

        // Handle Add Member Form
        function handleAddMember(e) {
            e.preventDefault();

            const name = document.getElementById('memberName').value;
            const phone = document.getElementById('memberPhone').value;
            const packageType = document.getElementById('memberPackage').value;
            const startDate = document.getElementById('memberStartDate').value;

            const memberId = 'GYM-' + String(members.length + 1).padStart(4, '0');
            
            const newMember = {
                id: memberId,
                name: name,
                phone: phone,
                package: packageType,
                startDate: startDate,
                sessionsRemaining: packagesInfo[packageType].sessions,
                totalSessions: packagesInfo[packageType].sessions,
                lastAttendance: null,
                qrCode: memberId
            };

            members.push(newMember);
            localStorage.setItem('gymMembers', JSON.stringify(members));

            // Add activity
            addActivity(`✅ تم إضافة متدرب جديد: ${name} - باقة ${packageType}`);

            // Show QR Code
            currentQRMember = newMember;
            showQRCode(newMember);

            // Reset form and close modal
            this.reset();
            closeModal('addMemberModal');

            // Update display
            updateStats();
            loadMembers();
            
            // Show success message
            showToast(`تم إضافة ${name} بنجاح!`, 'success');
        }

        // Show QR Code
        function showQRCode(member) {
            document.getElementById('qrMemberName').textContent = member.name;
            document.getElementById('qrcode').innerHTML = '';
            
            new QRCode(document.getElementById('qrcode'), {
                text: member.id,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            document.getElementById('qrModal').classList.add('active');
        }

        // View Member QR
        function viewMemberQR(memberId) {
            const member = members.find(m => m.id === memberId);
            if (member) {
                currentQRMember = member;
                showQRCode(member);
            }
        }

        // Download QR
        function downloadQR() {
            if (!currentQRMember) return;

            const canvas = document.querySelector('#qrcode canvas');
            const link = document.createElement('a');
            link.download = `${currentQRMember.name}-QR.png`;
            link.href = canvas.toDataURL();
            link.click();

            addActivity(`📥 تم تحميل QR Code للمتدرب: ${currentQRMember.name}`);
            showToast('تم تحميل QR Code بنجاح!', 'success');
        }

        // Share QR via WhatsApp
        function shareQR() {
            if (!currentQRMember) return;

            const canvas = document.querySelector('#qrcode canvas');
            const message = `
مرحباً ${currentQRMember.name}! 🎉

تم تفعيل اشتراكك في Royal GYM بنجاح!

📋 تفاصيل الاشتراك:
• رقم العضوية: ${currentQRMember.id}
• الباقة: ${currentQRMember.package}
• عدد الحصص: ${currentQRMember.totalSessions}
• تاريخ البداية: ${new Date(currentQRMember.startDate).toLocaleDateString('ar-EG')}

⚠️ مهم: احتفظ بـ QR Code الخاص بك لمسحه عند كل زيارة.

نتمنى لك تجربة مميزة معنا! 💪
Royal GYM - Get Fit, Stay Strong
            `.trim();

            const whatsappUrl = `https://wa.me/${currentQRMember.phone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            addActivity(`📤 تم إرسال QR Code عبر واتساب للمتدرب: ${currentQRMember.name}`);
            showToast('تم إرسال QR Code عبر واتساب!', 'success');
        }

        // Open QR Scanner
        function openQRScanner() {
            document.getElementById('qrScannerModal').classList.add('active');
        }

        // Simulate QR Scan (في التطبيق الحقيقي سيتم استخدام كاميرا)
        function simulateQRScan() {
            const memberId = prompt('أدخل رقم المتدرب (مثال: GYM-0001):');
            if (memberId) {
                document.getElementById('manualMemberId').value = memberId;
                checkIn();
            }
        }

        // Check In Member
        function checkIn() {
            const memberId = document.getElementById('manualMemberId').value.trim();
            
            if (!memberId) {
                showToast('⚠️ الرجاء إدخال رقم المتدرب', 'warning');
                return;
            }

            const memberIndex = members.findIndex(m => m.id === memberId);
            
            if (memberIndex === -1) {
                showToast('❌ لم يتم العثور على المتدرب. تأكد من الرقم.', 'error');
                return;
            }

            const member = members[memberIndex];
            
            if (member.sessionsRemaining <= 0) {
                showToast(`⚠️ عذراً، اشتراك ${member.name} قد انتهى.\nالرجاء تجديد الاشتراك.`, 'warning');
                return;
            }

            // Deduct session
            members[memberIndex].sessionsRemaining -= 1;
            members[memberIndex].lastAttendance = new Date().toLocaleDateString('ar-EG');
            
            localStorage.setItem('gymMembers', JSON.stringify(members));

            // Success message
            showToast(`✅ تم تسجيل حضور ${member.name}\n\n📊 الحصص المتبقية: ${members[memberIndex].sessionsRemaining}`, 'success');

            // Add activity
            addActivity(`✅ حضور: ${member.name} - الحصص المتبقية: ${members[memberIndex].sessionsRemaining}`);

            // Update display
            updateStats();
            loadMembers();
            
            // Clear and close
            document.getElementById('manualMemberId').value = '';
            closeModal('qrScannerModal');
        }

        // Refresh Data
        function refreshData() {
            if (isLoading) return;
            
            isLoading = true;
            const refreshBtn = document.querySelector('.btn .fa-sync-alt');
            refreshBtn.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                updateStats();
                loadMembers();
                loadRecentActivity();
                
                refreshBtn.classList.remove('loading');
                isLoading = false;
                
                showToast('تم تحديث البيانات بنجاح!', 'success');
            }, 1000);
        }

        // Add some demo members if empty
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
                },
                {
                    id: 'GYM-0003',
                    name: 'محمود حسن',
                    phone: '01234567892',
                    package: 'VIP',
                    startDate: new Date().toISOString().split('T')[0],
                    sessionsRemaining: 999,
                    totalSessions: 999,
                    lastAttendance: new Date().toLocaleDateString('ar-EG')
                },
                {
                    id: 'GYM-0004',
                    name: 'فاطمة أحمد',
                    phone: '01234567893',
                    package: 'Basic',
                    startDate: new Date().toISOString().split('T')[0],
                    sessionsRemaining: 3,
                    totalSessions: 12,
                    lastAttendance: new Date(Date.now() - 172800000).toLocaleDateString('ar-EG')
                }
            ];

            members = demoMembers;
            localStorage.setItem('gymMembers', JSON.stringify(members));
            
            // Add demo activities
            const demoActivities = [
                { text: '✅ حضور: أحمد محمد - الحصص المتبقية: 45', time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('ar-EG'), timestamp: Date.now() },
                { text: '✅ تم إضافة متدرب جديد: فاطمة أحمد - باقة Basic', time: new Date(Date.now() - 3600000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('ar-EG'), timestamp: Date.now() - 3600000 },
                { text: '✅ حضور: سارة علي - الحصص المتبقية: 15', time: new Date(Date.now() - 7200000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('ar-EG'), timestamp: Date.now() - 7200000 }
            ];
            localStorage.setItem('gymActivities', JSON.stringify(demoActivities));

            updateStats();
            loadMembers();
            loadRecentActivity();
        }
    