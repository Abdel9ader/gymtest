    let selectedRating = 0;
    const stars = document.querySelectorAll('.rating-stars i');
    const ratingText = document.getElementById('ratingText');
    const ratingInput = document.getElementById('rating');

    const ratingLabels = {
      1: 'سيء جداً 😞',
      2: 'غير راضٍ 😐',
      3: 'جيد 🙂',
      4: 'ممتاز 😊',
      5: 'رائع جداً! 🤩'
    };

    stars.forEach(star => {
      star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));
        ratingInput.value = selectedRating;
        updateStars(selectedRating);
        ratingText.textContent = ratingLabels[selectedRating];
      });

      star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        updateStars(rating);
      });
    });

    document.getElementById('ratingStars').addEventListener('mouseleave', function() {
      updateStars(selectedRating);
      ratingText.textContent = selectedRating ? ratingLabels[selectedRating] : '';
    });

    function updateStars(rating) {
      stars.forEach((star, i) => star.classList.toggle('active', i < rating));
    }

    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
      e.preventDefault();
      if (selectedRating === 0) {
        alert('⚠️ الرجاء تحديد تقييمك بالنجوم');
        return;
      }

      const feedback = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value || 'غير محدد',
        rating: selectedRating,
        comment: document.getElementById('comment').value,
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG')
      };

      const list = JSON.parse(localStorage.getItem('gymFeedbacks')) || [];
      list.push(feedback);
      localStorage.setItem('gymFeedbacks', JSON.stringify(list));

      document.getElementById('successModal').style.display = 'flex';
      this.reset();
      selectedRating = 0;
      updateStars(0);
      ratingText.textContent = '';
    });

    function closeModal() {
      document.getElementById('successModal').style.display = 'none';
      window.location.href = 'index.html';
    }

    document.getElementById('successModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });