        let members = JSON.parse(localStorage.getItem('gymMembers')) || [];
        let currentMember = null;
        let currentEditId = null;

        const packagesInfo = {
            'Basic': { sessions: 12, price: 500 },
            'Silver': { sessions: 20, price: 800 },
            'Gold': { sessions: 999, price: 1200 },
            'VIP': { sessions: 999, price: 2000 }
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadMembers();
            setupFilters();
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
            
            // Edit member form
            document.getElementById('editForm').addEventListener('submit', handleEditMember);
            
            // Close modal when clicking outside
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal(this.id);
                    }
                });
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

        // Load Members
        function loadMembers(filteredMembers = null) {
            const membersToShow = filteredMembers || members;
            const grid = document.getElementById('membersGrid');
            const emptyState = document.getElementById('emptyState');

            if (membersToShow.length === 0) {
                grid.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            grid.style.display = 'grid';
            emptyState.style.display = 'none';
            grid.innerHTML = '';

            membersToShow.forEach(member => {
                const card = createMemberCard(member);
                grid.innerHTML += card;
            });
        }

        // Create Member Card
        function createMemberCard(member) {
            const totalSessions = packagesInfo[member.package].sessions;
            const usedSessions = totalSessions - member.sessionsRemaining;
            const progress = (usedSessions / totalSessions) * 100;
            
            let statusClass = 'package-' + member.package.toLowerCase();
            let statusText = 'نشط';
            
            if (member.sessionsRemaining === 0) {
                statusText = 'منتهي';
            } else if (member.sessionsRemaining <= 5 && totalSessions < 100) {
                statusText = 'قرب الانتهاء';
            }

            const lastAttendanceText = member.lastAttendance || 'لم يحضر بعد';

            return `
                <div class="member-card">
                    <div class="member-header">
                        <div class="member-info">
                            <h3>${member.name}</h3>
                            <p><i class="fas fa-phone"></i> ${member.phone}</p>
                        </div>
                        <div class="member-id">${member.id}</div>
                    </div>

                    <div class="package-badge ${statusClass}">
                        <i class="fas fa-crown"></i> ${member.package}
                    </div>

                    <div class="sessions-info">
                        <div class="sessions-count">
                            <div>
                                <div class="sessions-label">الحصص المتبقية</div>
                                <strong>${member.sessionsRemaining}</strong> <span style="color: #666;">/ ${totalSessions}</span>
                            </div>
                            <div style="text-align: left;">
                                <div class="sessions-label">الحالة</div>
                                <strong style="color: ${member.sessionsRemaining > 5 ? '#2ecc71' : '#e74c3c'}; font-size: 1rem;">${statusText}</strong>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <div class="member-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(member.startDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${lastAttendanceText}</span>
                        </div>
                    </div>

                    <div class="member-actions">
                        <button class="btn-action" onclick="viewQR('${member.id}')">
                            <i class="fas fa-qrcode"></i> QR Code
                        </button>
                        <button class="btn-action" onclick="editMember('${member.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-action" onclick="renewSubscription('${member.id}')">
                            <i class="fas fa-sync"></i> تجديد
                        </button>
                        <button class="btn-action danger" onclick="deleteMember('${member.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
        }

        // Setup Filters
        function setupFilters() {
            const searchInput = document.getElementById('searchInput');
            const packageFilter = document.getElementById('packageFilter');
            const statusFilter = document.getElementById('statusFilter');

            searchInput.addEventListener('input', applyFilters);
            packageFilter.addEventListener('change', applyFilters);
            statusFilter.addEventListener('change', applyFilters);
        }

        // Apply Filters
        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const packageFilter = document.getElementById('packageFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;

            let filtered = members.filter(member => {
                const matchesSearch = member.name.toLowerCase().includes(searchTerm) ||
                                    member.phone.includes(searchTerm) ||
                                    member.id.toLowerCase().includes(searchTerm);

                const matchesPackage = !packageFilter || member.package === packageFilter;

                let matchesStatus = true;
                if (statusFilter === 'active') {
                    matchesStatus = member.sessionsRemaining > 5;
                } else if (statusFilter === 'expiring') {
                    matchesStatus = member.sessionsRemaining > 0 && member.sessionsRemaining <= 5;
                } else if (statusFilter === 'expired') {
                    matchesStatus = member.sessionsRemaining === 0;
                }

                return matchesSearch && matchesPackage && matchesStatus;
            });

            loadMembers(filtered);
        }

        // View QR
        function viewQR(memberId) {
            currentMember = members.find(m => m.id === memberId);
            if (!currentMember) return;

            document.getElementById('qrMemberName').textContent = currentMember.name;
            document.getElementById('qrcode').innerHTML = '';
            
            new QRCode(document.getElementById('qrcode'), {
                text: currentMember.id,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            document.getElementById('qrModal').classList.add('active');
        }

        // Download QR
        function downloadQR() {
            if (!currentMember) return;
            const canvas = document.querySelector('#qrcode canvas');
            const link = document.createElement('a');
            link.download = `${currentMember.name}-QR.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('تم تحميل QR Code بنجاح!', 'success');
        }

        // Share QR
        function shareQR() {
            if (!currentMember) return;
            const message = `مرحباً ${currentMember.name}!\n\nرقم عضويتك: ${currentMember.id}\nالباقة: ${currentMember.package}\nالحصص المتبقية: ${currentMember.sessionsRemaining}\n\nRoyal GYM`;
            window.open(`https://wa.me/${currentMember.phone}?text=${encodeURIComponent(message)}`, '_blank');
            showToast('تم إرسال QR Code عبر واتساب!', 'success');
        }

        // Edit Member
        function editMember(memberId) {
            currentEditId = memberId;
            const member = members.find(m => m.id === memberId);
            if (!member) return;

            document.getElementById('editName').value = member.name;
            document.getElementById('editPhone').value = member.phone;
            document.getElementById('editPackage').value = member.package;

            document.getElementById('editModal').classList.add('active');
        }

        // Edit Form Submit
        function handleEditMember(e) {
            e.preventDefault();
            
            const memberIndex = members.findIndex(m => m.id === currentEditId);
            if (memberIndex === -1) return;

            members[memberIndex].name = document.getElementById('editName').value;
            members[memberIndex].phone = document.getElementById('editPhone').value;
            members[memberIndex].package = document.getElementById('editPackage').value;

            localStorage.setItem('gymMembers', JSON.stringify(members));
            
            closeModal('editModal');
            loadMembers();
            
            showToast('✅ تم تحديث بيانات المتدرب بنجاح!', 'success');
        }

        // Renew Subscription
        function renewSubscription(memberId) {
            const memberIndex = members.findIndex(m => m.id === memberId);
            if (memberIndex === -1) return;

            const member = members[memberIndex];
            const newSessions = packagesInfo[member.package].sessions;

            if (confirm(`هل تريد تجديد اشتراك ${member.name}؟\n\nسيتم إضافة ${newSessions} حصة جديدة.`)) {
                members[memberIndex].sessionsRemaining = newSessions;
                members[memberIndex].startDate = new Date().toISOString().split('T')[0];
                
                localStorage.setItem('gymMembers', JSON.stringify(members));
                loadMembers();
                
                showToast(`✅ تم تجديد اشتراك ${member.name} بنجاح!\n\nالحصص الجديدة: ${newSessions}`, 'success');
            }
        }

        // Delete Member
        function deleteMember(memberId) {
            const member = members.find(m => m.id === memberId);
            if (!member) return;

            if (confirm(`⚠️ هل أنت متأكد من حذف ${member.name}؟\n\nلا يمكن التراجع عن هذا الإجراء!`)) {
                members = members.filter(m => m.id !== memberId);
                localStorage.setItem('gymMembers', JSON.stringify(members));
                loadMembers();
                
                showToast('✅ تم حذف المتدرب بنجاح!', 'success');
            }
        }

        // Export to Excel (CSV)
        function exportToExcel() {
            if (members.length === 0) {
                showToast('⚠️ لا توجد بيانات للتصدير', 'warning');
                return;
            }

            let csv = 'رقم العضوية,الاسم,رقم الهاتف,الباقة,تاريخ البداية,الحصص المتبقية,آخر حضور\n';
            
            members.forEach(member => {
                csv += `${member.id},${member.name},${member.phone},${member.package},${member.startDate},${member.sessionsRemaining},${member.lastAttendance || 'لم يحضر'}\n`;
            });

            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `Royal_GYM_Members_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('✅ تم تصدير البيانات بنجاح!', 'success');
        }

        // Refresh Data
        function refreshData() {
            loadMembers();
            showToast('تم تحديث البيانات بنجاح!', 'success');
        }

        // Open Add Member Modal
        function openAddMemberModal() {
            window.location.href = 'dashboard.html';
        }

        // Close Modal
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            if (modalId === 'qrModal') {
                document.getElementById('qrcode').innerHTML = '';
            }
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
            loadMembers();
        }