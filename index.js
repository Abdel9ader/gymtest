        // Loading Screen
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('loading').classList.add('hide');
            }, 1500);
        });

        // Toggle Menu
        function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    document.getElementById('navLinks').classList.remove('active');
                }
            });
        });

        // Scroll Effects
        window.addEventListener('scroll', () => {
            const scrollTop = document.getElementById('scrollTop');
            if (window.pageYOffset > 500) {
                scrollTop.classList.add('show');
            } else {
                scrollTop.classList.remove('show');
            }
        });

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // BMI Calculator
        function calculateBMI() {
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const age = parseInt(document.getElementById('age').value);
            const gender = document.getElementById('gender').value;

            if (!height || !weight || !age) {
                alert('⚠️ يرجى إدخال جميع البيانات');
                return;
            }

            const heightM = height / 100;
            const bmi = (weight / (heightM * heightM)).toFixed(1);

            let category, advice, color, percentage;

            if (bmi < 18.5) {
                category = 'نحيف';
                advice = 'يُنصح بزيادة الوزن من خلال نظام غذائي صحي وتمارين بناء العضلات. باقة Gold مثالية لك مع برنامج تغذية متكامل ومتابعة دورية!';
                color = '#3498db';
                percentage = 30;
            } else if (bmi < 25) {
                category = 'وزن طبيعي';
                advice = 'ممتاز! وزنك في المعدل الطبيعي. حافظ على هذا المستوى من خلال التمارين المنتظمة والتغذية المتوازنة. باقة Silver مناسبة لك للحفاظ على لياقتك!';
                color = '#2ecc71';
                percentage = 60;
            } else if (bmi < 30) {
                category = 'وزن زائد';
                advice = 'يُنصح بإنقاص الوزن من خلال نظام غذائي متوازن وتمارين الكارديو المنتظمة. باقة Gold توفر لك متابعة كاملة وبرنامج تغذية احترافي!';
                color = '#f39c12';
                percentage = 80;
            } else {
                category = 'سمنة';
                advice = 'يجب البدء فوراً ببرنامج إنقاص وزن تحت إشراف طبي. باقة VIP توفر لك مدرب خاص ومتابعة طبية كاملة لتحقيق أهدافك بأمان!';
                color = '#e74c3c';
                percentage = 95;
            }

            // Body Fat Estimation
            let bodyFat;
            if (gender === 'male') {
                bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
            } else {
                bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
            }
            bodyFat = Math.max(0, bodyFat).toFixed(1);

            document.getElementById('bmiValue').textContent = bmi;
            document.getElementById('bodyFatValue').textContent = bodyFat + '%';
            document.getElementById('category').textContent = category;
            document.getElementById('advice').textContent = advice;
            
            const progressBar = document.getElementById('progressBar');
            setTimeout(() => {
                progressBar.style.width = percentage + '%';
                progressBar.style.background = `linear-gradient(90deg, ${color}, ${color}dd)`;
                progressBar.textContent = 'BMI: ' + bmi;
            }, 100);

            document.getElementById('result').style.display = 'block';
            document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Scroll Animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.package-card, .feedback-card, .feature-item').forEach(el => {
            observer.observe(el);
        });