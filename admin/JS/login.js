        const validCredentials = {
            email: 'admin@royalgym.com',
            password: 'admin123'
        };

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            const errorMsg = document.getElementById('errorMessage');
            const successMsg = document.getElementById('successMessage');

            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            if (email === validCredentials.email && password === validCredentials.password) {
                const sessionData = {
                    email: email,
                    loginTime: new Date().toISOString(),
                    isAdmin: true
                };

                if (remember) {
                    localStorage.setItem('adminSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
                }

                successMsg.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                errorMsg.style.display = 'block';

                const container = document.querySelector('.login-container');
                container.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    container.style.animation = '';
                }, 500);
            }
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                75% { transform: translateX(8px); }
            }
        `;
        document.head.appendChild(style);

        window.addEventListener('load', () => {
            const session = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
            if (session) {
                window.location.href = 'dashboard.html';
            }
        });