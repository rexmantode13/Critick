document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    // 2. Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.movie-card, .review-card, .category-card, .stat-card, .cast-card, .glass-panel').forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });

    // 3. Interactive Search Functionality (index.html)
    const searchInput = document.getElementById('hero-search-input');
    const searchBtn = document.getElementById('hero-search-btn');
    if (searchInput && searchBtn) {
        function handleSearch() {
            const query = searchInput.value.trim();
            if (query) {
                searchBtn.innerHTML = '<span style="opacity:0.7">Searching...</span>';
                setTimeout(() => {
                    window.location.href = `movies.html?search=${encodeURIComponent(query)}`;
                }, 400);
            } else {
                searchInput.style.border = '1px solid var(--danger)';
                setTimeout(() => searchInput.style.border = 'none', 1000);
            }
        }
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // 4. Movies Page - Handle Search and Filters (movies.html)
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const genreQuery = urlParams.get('genre');
    
    const heading = document.getElementById('page-heading');
    const sidebarSearch = document.getElementById('sidebar-search');
    const filterBtn = document.getElementById('apply-filters-btn');

    if (heading && sidebarSearch) {
        if (searchQuery) {
            heading.innerText = `Search Results for "${searchQuery}"`;
            sidebarSearch.value = searchQuery;
            document.querySelectorAll('.movie-card').forEach(card => {
                const title = card.querySelector('.movie-title');
                if (title && !title.innerText.toLowerCase().includes(searchQuery.toLowerCase())) {
                    card.style.display = 'none';
                }
            });
        } else if (genreQuery) {
            heading.innerText = `${genreQuery.charAt(0).toUpperCase() + genreQuery.slice(1)} Movies`;
            document.querySelectorAll('.checkbox-group').forEach(group => {
                const span = group.querySelector('span');
                const checkbox = group.querySelector('input');
                if (span && span.innerText.toLowerCase() === genreQuery.toLowerCase()) {
                    checkbox.checked = true;
                } else if (checkbox) {
                    checkbox.checked = false;
                }
            });
        }
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            filterBtn.innerHTML = '<span style="opacity:0.7">Applying...</span>';
            setTimeout(() => {
                filterBtn.innerHTML = 'Apply Filters';
                document.querySelectorAll('.movie-card').forEach(card => {
                    if (card.style.display !== 'none') {
                        card.style.animation = 'none';
                        card.offsetHeight;
                        card.style.animation = null; 
                        card.classList.remove('visible');
                        setTimeout(() => card.classList.add('visible'), 50);
                    }
                });
            }, 600);
        });
    }

    // 5. Interactive Helpful Buttons
    document.querySelectorAll('button').forEach(btn => {
        if(btn.innerText.includes('Helpful')) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if(!this.classList.contains('liked')) {
                    this.classList.add('liked');
                    this.style.color = 'var(--success)';
                    this.style.borderColor = 'var(--success)';
                    this.style.background = 'rgba(34, 197, 94, 0.1)';
                    const numMatch = this.innerText.match(/\d+/);
                    if(numMatch) {
                        this.innerHTML = `👍 Helpful (${parseInt(numMatch[0]) + 1})`;
                    }
                } else {
                    this.classList.remove('liked');
                    this.style.color = 'var(--text-secondary)';
                    this.style.borderColor = 'var(--border-color)';
                    this.style.background = 'transparent';
                    const numMatch = this.innerText.match(/\d+/);
                    if(numMatch) {
                        this.innerHTML = `👍 Helpful (${parseInt(numMatch[0]) - 1})`;
                    }
                }
            });
        }
    });

    // 6. Pro Page - Billing Toggle & FAQ
    window.setBilling = function(type) {
        const isYearly = type === 'yearly';
        document.getElementById('monthlyBtn')?.classList.toggle('active', !isYearly);
        document.getElementById('yearlyBtn')?.classList.toggle('active', isYearly);
        
        const proPrice = document.getElementById('proPrice');
        if(proPrice) proPrice.innerHTML = isYearly ? '<sup>₹</sup>1,659<span id="proPeriod">/yr</span>' : '<sup>₹</sup>199<span id="proPeriod">/mo</span>';
        
        const criticPrice = document.getElementById('criticPrice');
        if(criticPrice) criticPrice.innerHTML = isYearly ? '<sup>₹</sup>2,499<span id="criticPeriod">/yr</span>' : '<sup>₹</sup>299<span id="criticPeriod">/mo</span>';
    };

    window.toggleFaq = function(el) {
        el.parentElement.classList.toggle('open');
    };

    // 7. Interactive Bookmarks / Badges (New interactivity)
    document.querySelectorAll('.badge, .movie-rating-badge').forEach(badge => {
        if (!badge.innerText.includes('★') && !badge.innerText.includes('HD')) {
            badge.style.cursor = 'pointer';
            badge.addEventListener('click', function(e) {
                e.stopPropagation(); 
                if(this.classList.contains('active-badge')) {
                    this.classList.remove('active-badge');
                    this.style.transform = 'scale(1)';
                    this.style.backgroundColor = '';
                    this.style.color = '';
                } else {
                    this.classList.add('active-badge');
                    this.style.transform = 'scale(1.05)';
                    this.style.backgroundColor = 'var(--success)';
                    this.style.color = '#fff';
                }
            });
        }
    });

    // 8. Form Focus Interactions (Login/Register Forms)
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(-2px)';
                this.parentElement.style.transition = 'transform 0.3s ease';
            }
        });
        input.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(0)';
            }
        });
    });

    // 9. Profile Page "Follow" Button Interaction
    const followBtn = document.querySelector('.profile-actions .btn-primary');
    if (followBtn && (followBtn.innerText.includes('Follow') || followBtn.innerText.includes('Edit'))) {
        followBtn.addEventListener('click', function() {
            if (this.innerText === 'Follow') {
                this.innerText = 'Following';
                this.style.background = 'transparent';
                this.style.border = '1px solid var(--success)';
                this.style.color = 'var(--success)';
            } else if (this.innerText === 'Following') {
                this.innerText = 'Follow';
                this.style.background = 'var(--accent)';
                this.style.border = 'none';
                this.style.color = '#000';
            }
        });
    }
});
