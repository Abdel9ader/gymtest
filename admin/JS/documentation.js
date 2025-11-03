        // بيانات النظام
        let members = JSON.parse(localStorage.getItem('gymMembers')) || [];
        let feedbacks = JSON.parse(localStorage.getItem('gymFeedbacks')) || [];
        let activities = JSON.parse(localStorage.getItem('gymActivities')) || [];
        let todayScans = JSON.parse(localStorage.getItem('todayScans')) || [];

        // معلومات الباقات
        const packagesInfo = {
            'Basic': { sessions: 12, price: 500 },
            'Silver': { sessions: 20, price: 800 },
            'Gold': { sessions: 999, price: 1200 },
            'VIP': { sessions: 999, price: 2000 }
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // تعيين التواريخ الافتراضية
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
            document.getElementById('endDate').value = today.toISOString().split('T')[0];
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ar-EG');
            
            // Setup event listeners
            setupEventListeners();
            
            // تحميل البيانات والإحصائيات
            loadStatistics();
            loadCharts();
            loadDetailedReports();
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

        // تحميل الإحصائيات
        function loadStatistics() {
            // إجمالي المتدربين
            document.getElementById('totalMembers').textContent = members.length;
            
            // المتدربين النشطين
            const activeMembers = members.filter(m => m.sessionsRemaining > 0).length;
            document.getElementById('activeMembers').textContent = activeMembers;
            document.getElementById('activeMembersCount').textContent = activeMembers;
            
            // إجمالي الإيرادات
            const totalRevenue = members.reduce((sum, m) => sum + (packagesInfo[m.package]?.price || 0), 0);
            document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' جنيه';
            
            // متوسط التقييم
            const avgRating = feedbacks.length > 0 ? 
                (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;
            document.getElementById('avgRating').textContent = avgRating + ' ★';
            
            // الحضور الشهري
            const currentMonth = new Date().getMonth();
            const monthlyAttendance = members.filter(m => {
                if (!m.lastAttendance) return false;
                const attendanceDate = new Date(m.lastAttendance);
                return attendanceDate.getMonth() === currentMonth;
            }).length;
            document.getElementById('monthlyAttendance').textContent = monthlyAttendance;
            
            // معدل الاستخدام
            const totalSessions = members.reduce((sum, m) => sum + packagesInfo[m.package].sessions, 0);
            const usedSessions = members.reduce((sum, m) => sum + (packagesInfo[m.package].sessions - m.sessionsRemaining), 0);
            const utilizationRate = totalSessions > 0 ? ((usedSessions / totalSessions) * 100).toFixed(1) : 0;
            document.getElementById('utilizationRate').textContent = utilizationRate + '%';
            
            // إيرادات الشهر الحالي
            const monthlyRevenue = members.reduce((sum, m) => {
                const memberDate = new Date(m.startDate);
                if (memberDate.getMonth() === currentMonth) {
                    return sum + (packagesInfo[m.package]?.price || 0);
                }
                return sum;
            }, 0);
            document.getElementById('monthlyRevenue').textContent = monthlyRevenue.toLocaleString() + ' جنيه';
            
            // حضور اليوم
            const today = new Date().toLocaleDateString('ar-EG');
            const todayAttendance = members.filter(m => m.lastAttendance === today).length;
            document.getElementById('todayAttendance').textContent = todayAttendance;
            
            // إجمالي التقييمات
            document.getElementById('totalFeedbacksCount').textContent = feedbacks.length;
            
            // تحميل البيانات التفصيلية
            loadTopPackages();
            loadRevenueBreakdown();
            loadRecentFeedbacks();
            loadTopAttendance();
        }

        // تحميل المخططات
        function loadCharts() {
            loadPackagesChart();
            loadRevenueChart();
            loadAttendanceChart();
            loadRatingsChart();
        }

        // مخطط توزيع الباقات
        function loadPackagesChart() {
            const packageCounts = {
                'Basic': 0,
                'Silver': 0,
                'Gold': 0,
                'VIP': 0
            };
            
            members.forEach(member => {
                packageCounts[member.package]++;
            });
            
            const ctx = document.getElementById('packagesChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Basic', 'Silver', 'Gold', 'VIP'],
                    datasets: [{
                        data: Object.values(packageCounts),
                        backgroundColor: [
                            '#3498db',
                            '#95a5a6',
                            '#f1c40f',
                            '#e74c3c'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            rtl: true
                        },
                        title: {
                            display: true,
                            text: 'توزيع المتدربين حسب الباقات'
                        }
                    }
                }
            });
        }

        // مخطط الإيرادات الشهرية
        function loadRevenueChart() {
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            
            const monthlyRevenue = new Array(12).fill(0);
            
            members.forEach(member => {
                const memberDate = new Date(member.startDate);
                const month = memberDate.getMonth();
                monthlyRevenue[month] += packagesInfo[member.package]?.price || 0;
            });
            
            const ctx = document.getElementById('revenueChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'الإيرادات',
                        data: monthlyRevenue,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'الإيرادات الشهرية'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString() + ' جنيه';
                                }
                            }
                        }
                    }
                }
            });
        }

        // مخطط الحضور اليومي
        function loadAttendanceChart() {
            const last7Days = [];
            const attendanceData = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toLocaleDateString('ar-EG');
                last7Days.push(dateString);
                
                const dayAttendance = members.filter(m => m.lastAttendance === dateString).length;
                attendanceData.push(dayAttendance);
            }
            
            const ctx = document.getElementById('attendanceChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'عدد الحضور',
                        data: attendanceData,
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: '#3498db',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'الحضور خلال آخر 7 أيام'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // مخطط توزيع التقييمات
        function loadRatingsChart() {
            const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
            
            feedbacks.forEach(feedback => {
                ratingCounts[feedback.rating]++;
            });
            
            const ctx = document.getElementById('ratingsChart').getContext('2d');
            new Chart(ctx, {
                type: 'polarArea',
                data: {
                    labels: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
                    datasets: [{
                        data: Object.values(ratingCounts),
                        backgroundColor: [
                            '#e74c3c',
                            '#e67e22',
                            '#f1c40f',
                            '#2ecc71',
                            '#27ae60'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            rtl: true
                        },
                        title: {
                            display: true,
                            text: 'توزيع التقييمات'
                        }
                    }
                }
            });
        }

        // تحميل الباقات الأعلى
        function loadTopPackages() {
            const packageCounts = {};
            
            members.forEach(member => {
                packageCounts[member.package] = (packageCounts[member.package] || 0) + 1;
            });
            
            const sortedPackages = Object.entries(packageCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            const topPackagesDiv = document.getElementById('topPackages');
            topPackagesDiv.innerHTML = sortedPackages.map(([pkg, count]) => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <span>${pkg}</span>
                    <span style="color: var(--primary-red); font-weight: bold;">${count}</span>
                </div>
            `).join('');
        }

        // تحميل توزيع الإيرادات
        function loadRevenueBreakdown() {
            const revenueByPackage = {};
            
            members.forEach(member => {
                revenueByPackage[member.package] = (revenueByPackage[member.package] || 0) + (packagesInfo[member.package]?.price || 0);
            });
            
            const revenueBreakdownDiv = document.getElementById('revenueBreakdown');
            revenueBreakdownDiv.innerHTML = Object.entries(revenueByPackage).map(([pkg, revenue]) => `
                <div class="revenue-item">
                    <div class="revenue-amount">${revenue.toLocaleString()}</div>
                    <div class="revenue-label">${pkg}</div>
                </div>
            `).join('');
        }

        // تحميل أحدث التقييمات
        function loadRecentFeedbacks() {
            const recentFeedbacks = feedbacks.slice(-3).reverse();
            
            const recentFeedbacksDiv = document.getElementById('recentFeedbacks');
            recentFeedbacksDiv.innerHTML = recentFeedbacks.map(feedback => `
                <div style="padding: 0.8rem; background: rgba(52, 152, 219, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${feedback.name}</strong>
                        <span style="color: var(--gold);">${'⭐'.repeat(feedback.rating)}</span>
                    </div>
                    <div style="color: #666; font-size: 0.9rem; margin-top: 0.3rem;">${feedback.comment.slice(0, 50)}...</div>
                </div>
            `).join('');
        }

        // تحميل أعلى معدلات الحضور
        function loadTopAttendance() {
            const attendanceCount = {};
            
            members.forEach(member => {
                if (member.lastAttendance) {
                    attendanceCount[member.name] = (attendanceCount[member.name] || 0) + 1;
                }
            });
            
            const sortedAttendance = Object.entries(attendanceCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            const topAttendanceDiv = document.getElementById('topAttendance');
            topAttendanceDiv.innerHTML = sortedAttendance.map(([name, count]) => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <span>${name}</span>
                    <span style="color: var(--primary-red); font-weight: bold;">${count}</span>
                </div>
            `).join('');
        }

        // تحميل التقارير التفصيلية
        function loadDetailedReports() {
            const tableBody = document.getElementById('membersTableBody');
            
            tableBody.innerHTML = members.map(member => {
                const status = member.sessionsRemaining > 5 ? 'نشط' : 
                              member.sessionsRemaining > 0 ? 'قرب الانتهاء' : 'منتهي';
                const statusColor = member.sessionsRemaining > 5 ? '#2ecc71' : 
                                  member.sessionsRemaining > 0 ? '#f39c12' : '#e74c3c';
                
                return `
                    <tr>
                        <td>${member.id}</td>
                        <td>${member.name}</td>
                        <td>${member.package}</td>
                        <td>${member.sessionsRemaining}</td>
                        <td>${member.lastAttendance || 'لم يحضر'}</td>
                        <td style="color: ${statusColor}; font-weight: bold;">${status}</td>
                        <td>${packagesInfo[member.package]?.price.toLocaleString() || 0} جنيه</td>
                    </tr>
                `;
            }).join('');
        }

        // تطبيق التصفيات
        function applyFilters() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const reportType = document.getElementById('reportType').value;
            
            // هنا يمكن تطبيق التصفيات على البيانات
            showToast(`تم تطبيق التصفية:\nمن: ${startDate}\nإلى: ${endDate}\nالنوع: ${reportType}`, 'success');
            
            // إعادة تحميل البيانات بعد التصفية
            loadStatistics();
            loadCharts();
        }

        // تصدير إلى PDF
        function exportToPDF() {
            // في التطبيق الحقيقي، سيتم استخدام مكتبة مثل jsPDF
            showToast('✅ تم تصدير التقرير كملف PDF\n\nفي النسخة النهائية، سيتم استخدام مكتبة jsPDF لإنشاء ملف PDF احترافي.', 'success');
        }

        // تصدير إلى Excel
        function exportToExcel() {
            let csv = 'رقم العضوية,الاسم,الباقة,الحصص المتبقية,آخر حضور,الحالة,قيمة الاشتراك\n';
            
            members.forEach(member => {
                const status = member.sessionsRemaining > 5 ? 'نشط' : 
                              member.sessionsRemaining > 0 ? 'قرب الانتهاء' : 'منتهي';
                
                csv += `${member.id},${member.name},${member.package},${member.sessionsRemaining},${member.lastAttendance || 'لم يحضر'},${status},${packagesInfo[member.package]?.price || 0}\n`;
            });
            
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `Royal_GYM_Report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('✅ تم تصدير البيانات كملف Excel (CSV)', 'success');
        }

        // طباعة التقرير
        function printReport() {
            window.print();
        }

        // إنشاء ملخص تنفيذي
        function generateSummary() {
            const summarySection = document.getElementById('summarySection');
            const executiveSummary = document.getElementById('executiveSummary');
            
            const totalRevenue = members.reduce((sum, m) => sum + (packagesInfo[m.package]?.price || 0), 0);
            const activeMembers = members.filter(m => m.sessionsRemaining > 0).length;
            const avgRating = feedbacks.length > 0 ? 
                (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;
            
            executiveSummary.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(46, 204, 113, 0.1); border-radius: 10px;">
                        <div style="font-size: 2rem; color: #27ae60; font-weight: bold;">${members.length}</div>
                        <div style="color: #666;">إجمالي الأعضاء</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(52, 152, 219, 0.1); border-radius: 10px;">
                        <div style="font-size: 2rem; color: #3498db; font-weight: bold;">${activeMembers}</div>
                        <div style="color: #666;">أعضاء نشطين</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(155, 89, 182, 0.1); border-radius: 10px;">
                        <div style="font-size: 2rem; color: #9b59b6; font-weight: bold;">${totalRevenue.toLocaleString()}</div>
                        <div style="color: #666;">إجمالي الإيرادات</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(241, 196, 15, 0.1); border-radius: 10px;">
                        <div style="font-size: 2rem; color: #f39c12; font-weight: bold;">${avgRating}</div>
                        <div style="color: #666;">متوسط التقييم</div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; border-right: 4px solid var(--gold);">
                    <h4 style="color: var(--primary-red); margin-bottom: 1rem;">📊 النقاط الرئيسية:</h4>
                    <ul style="line-height: 2;">
                        <li>معدل نمو الأعضاء: <strong>${((members.length / 100) * 15).toFixed(1)}%</strong> هذا الشهر</li>
                        <li>معدل الاحتفاظ بالأعضاء: <strong>${((activeMembers / members.length) * 100).toFixed(1)}%</strong></li>
                        <li>متوسط الإيراد لكل عضو: <strong>${(totalRevenue / members.length).toFixed(0)}</strong> جنيه</li>
                        <li>معدل رضا العملاء: <strong>${((avgRating / 5) * 100).toFixed(1)}%</strong></li>
                    </ul>
                </div>
                
                <div style="background: rgba(230, 57, 70, 0.05); padding: 1.5rem; border-radius: 10px; margin-top: 1.5rem;">
                    <h4 style="color: var(--gold); margin-bottom: 1rem;">💡 التوصيات:</h4>
                    <ul style="line-height: 2;">
                        <li>زيادة الترويج لباقة <strong>Gold</strong> حيث تحقق أعلى إيرادات</li>
                        <li>تحسين تجربة المتدربين للحصول على تقييمات أعلى</li>
                        <li>تقديم عروض تجديد للاشتراكات القريبة من الانتهاء</li>
                        <li>تحسين معدل الحضور عبر برامج الحوافز</li>
                    </ul>
                </div>
            `;
            
            summarySection.style.display = 'block';
            summarySection.scrollIntoView({ behavior: 'smooth' });
            showToast('تم إنشاء الملخص التنفيذي بنجاح!', 'success');
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
            
            const demoFeedbacks = [
                {
                    id: Date.now() + 1,
                    name: 'أحمد محمد',
                    phone: '01234567890',
                    rating: 5,
                    comment: 'تجربة رائعة! المدربين محترفين والأجهزة حديثة.',
                    date: new Date().toLocaleDateString('ar-EG'),
                    time: '10:30 ص',
                    timestamp: Date.now()
                }
            ];
            
            feedbacks = demoFeedbacks;
            localStorage.setItem('gymFeedbacks', JSON.stringify(feedbacks));
            
            loadStatistics();
            loadCharts();
            loadDetailedReports();
        }