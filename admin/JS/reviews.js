                let feedbacks = JSON.parse(localStorage.getItem('gymFeedbacks')) || [];
        let currentDeleteId = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Add demo feedbacks if empty
            if (feedbacks.length === 0) {
                feedbacks = [
                    {
                        id: Date.now() + 1,
                        name: 'أحمد محمد',
                        phone: '01234567890',
                        rating: 5,
                        comment: 'تجربة رائعة! المدربين محترفين والأجهزة حديثة. خسرت 15 كيلو في 3 شهور فقط. البيئة محفزة جداً والنتائج مذهلة. أنصح الجميع بالانضمام!',
                        date: new Date().toLocaleDateString('ar-EG'),
                        time: '10:30 ص',
                        timestamp: Date.now()
                    },
                    {
                        id: Date.now() + 2,
                        name: 'سارة علي',
                        phone: '01234567891',
                        rating: 5,
                        comment: 'أفضل جيم في المدينة! الفصول الجماعية ممتعة والمدربات محترفات. الجو العام ممتاز والنظافة على أعلى مستوى.',
                        date: new Date().toLocaleDateString('ar-EG'),
                        time: '02:15 م',
                        timestamp: Date.now() - 86400000
                    },
                    {
                        id: Date.now() + 3,
                        name: 'محمود حسن',
                        phone: '01234567892',
                        rating: 4,
                        comment: 'المدرب الشخصي ساعدني كثيراً في تحقيق أهدافي. النظافة والتنظيم ممتازين. أتمنى فقط زيادة ساعات العمل.',
                        date: new Date(Date.now() - 172800000).toLocaleDateString('ar-EG'),
                        time: '06:45 م',
                        timestamp: Date.now() - 172800000
                    },
                    {
                        id: Date.now() + 4,
                        name: 'فاطمة أحمد',
                        phone: '01234567893',
                        rating: 5,
                        comment: 'بيئة نسائية آمنة ومريحة. المدربات متفهمات واحترافيات. حققت هدفي في خسارة الوزن بفضل البرنامج المتكامل.',
                        date: new Date(Date.now() - 259200000).toLocaleDateString('ar-EG'),
                        time: '09:20 ص',
                        timestamp: Date.now() - 259200000
                    },
                    {
                        id: Date.now() + 5,
                        name: 'كريم عبدالله',
                        phone: '01234567894',
                        rating: 3,
                        comment: 'الجيم جيد بشكل عام، لكن يحتاج لبعض التحديثات في الأجهزة. المدربين جيدين والأسعار معقولة.',
                        date: new Date(Date.now() - 345600000).toLocaleDateString('ar-EG'),
                        time: '04:30 م',
                        timestamp: Date.now() - 345600000
                    }
                ];
                localStorage.setItem('gymFeedbacks', JSON.stringify(feedbacks));
            }

            updateStats();
            loadFeedbacks();
        });

        // Update Statistics
        function updateStats() {
            document.getElementById('totalFeedbacks').textContent = feedbacks.length;

            if (feedbacks.length > 0) {
                const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1);
                document.getElementById('avgRating').textContent = avgRating + ' ★';

                const positiveCount = feedbacks.filter(f => f.rating >= 4).length;
                document.getElementById('positiveCount').textContent = positiveCount;

                const thisMonth = feedbacks.filter(f => {
                    const fDate = new Date(f.timestamp);
                    const now = new Date();
                    return fDate.getMonth() === now.getMonth() && fDate.getFullYear() === now.getFullYear();
                }).length;
                document.getElementById('thisMonth').textContent = thisMonth;
            }
        }

        // Load Feedbacks
        function loadFeedbacks(filtered = null) {
            const feedbacksToShow = filtered || feedbacks;
            const grid = document.getElementById('feedbackGrid');
            const emptyState = document.getElementById('emptyState');

            if (feedbacksToShow.length === 0) {
                grid.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            grid.style.display = 'grid';
            emptyState.style.display = 'none';
            grid.innerHTML = '';

            // Sort by timestamp (newest first)
            const sorted = [...feedbacksToShow].sort((a, b) => b.timestamp - a.timestamp);

            sorted.forEach(feedback => {
                const card = createFeedbackCard(feedback);
                grid.innerHTML += card;
            });
        }

        // Create Feedback Card
        function createFeedbackCard(feedback) {
            const stars = generateStars(feedback.rating);
            const initial = feedback.name.charAt(0);

            return `
                <div class="feedback-card">
                    <div class="feedback-header">
                        <div class="user-info">
                            <div class="user-avatar">${initial}</div>
                            <div class="user-details">
                                <h3>${feedback.name}</h3>
                                <p><i class="fas fa-phone"></i> ${feedback.phone}</p>
                            </div>
                        </div>
                        <div class="rating-display">${stars}</div>
                    </div>

                    <div class="feedback-content">
                        <p class="feedback-text">"${feedback.comment}"</p>
                    </div>

                    <div class="feedback-meta">
                        <div class="feedback-date">
                            <i class="fas fa-calendar"></i> ${feedback.date}
                            <i class="fas fa-clock"></i> ${feedback.time}
                        </div>
                    </div>

                    <div class="feedback-actions">
                        <button class="action-btn" onclick="viewFeedback(${feedback.id})">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                        <button class="action-btn" onclick="contactUser('${feedback.phone}', '${feedback.name}')">
                            <i class="fab fa-whatsapp"></i> تواصل
                        </button>
                        <button class="action-btn" onclick="shareFeedback(${feedback.id})">
                            <i class="fas fa-share"></i> مشاركة
                        </button>
                        <button class="action-btn delete" onclick="confirmDelete(${feedback.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
        }

        // Generate Stars
        function generateStars(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<i class="fas fa-star ${i <= rating ? '' : 'empty'}"></i>`;
            }
            return stars;
        }

        // Apply Filters
        function applyFilters() {
            const ratingFilter = document.getElementById('ratingFilter').value;

            let filtered = feedbacks;

            if (ratingFilter) {
                filtered = filtered.filter(f => f.rating === parseInt(ratingFilter));
            }

            loadFeedbacks(filtered);
        }

        // View Feedback
        function viewFeedback(feedbackId) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return;

            const stars = generateStars(feedback.rating);
            const initial = feedback.name.charAt(0);

            const content = `
                <div class="user-info" style="margin-bottom: 2rem;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem;">${initial}</div>
                    <div class="user-details" style="flex: 1;">
                        <h3 style="color: var(--gold); font-size: 1.5rem; margin-bottom: 0.5rem;">${feedback.name}</h3>
                        <p style="color: #999; margin-bottom: 0.5rem;">
                            <i class="fas fa-phone"></i> ${feedback.phone}
                        </p>
                        <div class="rating-display" style="font-size: 1.5rem;">${stars}</div>
                    </div>
                </div>

                <div style="background: rgba(230, 57, 70, 0.05); padding: 2rem; border-radius: 15px; border-right: 4px solid var(--gold); margin-bottom: 2rem;">
                    <h4 style="color: var(--gold); margin-bottom: 1rem;">
                        <i class="fas fa-comment-dots"></i> التعليق:
                    </h4>
                    <p style="color: var(--light); line-height: 1.8; font-size: 1.1rem;">${feedback.comment}</p>
                </div>

                <div style="background: rgba(0,0,0,0.5); padding: 1.5rem; border-radius: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; color: #ccc;">
                        <div>
                            <i class="fas fa-calendar" style="color: var(--gold);"></i>
                            <strong>التاريخ:</strong> ${feedback.date}
                        </div>
                        <div>
                            <i class="fas fa-clock" style="color: var(--gold);"></i>
                            <strong>الوقت:</strong> ${feedback.time}
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button class="alert-btn secondary" onclick="closeViewModal()" style="flex: 1;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                    <button class="alert-btn primary" onclick="contactUser('${feedback.phone}', '${feedback.name}')" style="flex: 1;">
                        <i class="fab fa-whatsapp"></i> تواصل
                    </button>
                </div>
            `;

            document.getElementById('modalBody').innerHTML = content;
            document.getElementById('viewModal').classList.add('active');
        }

        // Close View Modal
        function closeViewModal() {
            document.getElementById('viewModal').classList.remove('active');
        }

        // Contact User
        function contactUser(phone, name) {
            const message = `مرحباً ${name}!\n\nشكراً لك على تقييمك لـ Royal GYM 🌟\n\nنحن سعداء بكونك جزءاً من عائلتنا الرياضية ونعمل دائماً على تحسين خدماتنا.\n\nإذا كان لديك أي استفسار أو اقتراح، نحن هنا للمساعدة!\n\nRoyal GYM - Get Fit, Stay Strong 💪`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
            closeViewModal();
        }

        // Share Feedback
        function shareFeedback(feedbackId) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return;

            const stars = '⭐'.repeat(feedback.rating);
            const message = `${stars}\n\n"${feedback.comment}"\n\n- ${feedback.name}\n\nRoyal GYM 💪\nأفضل جيم في المدينة!`;
            
            showAlert('success', 'نسخ التقييم', 'تم نسخ التقييم! يمكنك الآن مشاركته على السوشيال ميديا.');
            
            // Copy to clipboard
            navigator.clipboard.writeText(message).catch(() => {
                // Fallback if clipboard not available
            });
        }

        // Confirm Delete
        function confirmDelete(feedbackId) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return;

            currentDeleteId = feedbackId;

            document.getElementById('alertIcon').innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            document.getElementById('alertIcon').className = 'alert-icon warning';
            document.getElementById('alertTitle').textContent = 'تأكيد الحذف';
            document.getElementById('alertMessage').textContent = `هل أنت متأكد من حذف تقييم ${feedback.name}?\n\nلا يمكن التراجع عن هذا الإجراء.`;
            document.getElementById('alertButtons').innerHTML = `
                <button class="alert-btn secondary" onclick="closeAlert()">إلغاء</button>
                <button class="alert-btn primary" onclick="deleteFeedback()">
                    <i class="fas fa-trash"></i> نعم، احذف
                </button>
            `;
            document.getElementById('alertOverlay').classList.add('active');
        }

        // Delete Feedback
        function deleteFeedback() {
            if (!currentDeleteId) return;

            feedbacks = feedbacks.filter(f => f.id !== currentDeleteId);
            localStorage.setItem('gymFeedbacks', JSON.stringify(feedbacks));

            closeAlert();
            updateStats();
            loadFeedbacks();

            showAlert('success', 'تم الحذف', 'تم حذف التقييم بنجاح!');
            currentDeleteId = null;
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
            document.getElementById('alertButtons').innerHTML = '<button class="alert-btn primary" onclick="closeAlert()">حسناً</button>';
            document.getElementById('alertOverlay').classList.add('active');
        }

        // Close Alert
        function closeAlert() {
            document.getElementById('alertOverlay').classList.remove('active');
        }

        // Export Feedbacks as PDF (Simulated)
        function exportFeedbacks() {
            if (feedbacks.length === 0) {
                showAlert('warning', 'لا توجد بيانات', 'لا توجد تقييمات للتصدير.');
                return;
            }

            // In real implementation, use a library like jsPDF
            // For now, we'll create a formatted text file
            let content = '═══════════════════════════════════════\n';
            content += '           Royal GYM - تقرير التقييمات\n';
            content += '═══════════════════════════════════════\n\n';
            content += `التاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
            content += `إجمالي التقييمات: ${feedbacks.length}\n`;
            
            const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1);
            content += `متوسط التقييم: ${avgRating} ⭐\n`;
            content += `التقييمات الإيجابية: ${feedbacks.filter(f => f.rating >= 4).length}\n\n`;
            content += '═══════════════════════════════════════\n\n';

            feedbacks.forEach((f, index) => {
                content += `${index + 1}. ${f.name}\n`;
                content += `   التقييم: ${'⭐'.repeat(f.rating)}\n`;
                content += `   التاريخ: ${f.date} - ${f.time}\n`;
                content += `   الهاتف: ${f.phone}\n`;
                content += `   التعليق: "${f.comment}"\n\n`;
                content += '───────────────────────────────────────\n\n';
            });

            // Create download
            const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `Royal_GYM_Feedbacks_${new Date().toISOString().split('T')[0]}.txt`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showAlert('success', 'تم التصدير', 'تم تصدير التقييمات بنجاح!\n\nللحصول على PDF حقيقي، يتم استخدام مكتبة jsPDF في النسخة النهائية.');
        }

        // Close modals on outside click
        document.getElementById('alertOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeAlert();
            }
        });

        document.getElementById('viewModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeViewModal();
            }
        });