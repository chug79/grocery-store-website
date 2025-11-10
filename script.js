// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
    // Header UI elements (safe guards)
    const searchForm = document.querySelector('.search-form');
    const shoppingCart = document.querySelector('.shopping-cart');
    const loginForm = document.querySelector('.login-form');
    const navbar = document.querySelector('.navbar');

    const searchBtn = document.querySelector('#search-btn');
    const cartBtn = document.querySelector('#cart-btn');
    const loginBtn = document.querySelector('#login-btn');
    const menuBtn = document.querySelector('#menu-btn');

    if (searchBtn && searchForm) {
        searchBtn.addEventListener('click', () => {
            searchForm.classList.toggle('active');
            shoppingCart?.classList.remove('active');
            loginForm?.classList.remove('active');
            navbar?.classList.remove('active');
        });
    }
    if (cartBtn && shoppingCart) {
        cartBtn.addEventListener('click', () => {
            shoppingCart.classList.toggle('active');
            searchForm?.classList.remove('active');
            loginForm?.classList.remove('active');
            navbar?.classList.remove('active');
        });
    }
    if (loginBtn && loginForm) {
        loginBtn.addEventListener('click', () => {
            loginForm.classList.toggle('active');
            searchForm?.classList.remove('active');
            shoppingCart?.classList.remove('active');
            navbar?.classList.remove('active');
        });
    }
    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
            searchForm?.classList.remove('active');
            shoppingCart?.classList.remove('active');
            loginForm?.classList.remove('active');
        });
    }

    window.addEventListener('scroll', () => {
        searchForm?.classList.remove('active');
        shoppingCart?.classList.remove('active');
        loginForm?.classList.remove('active');
        navbar?.classList.remove('active');
    });

    // Swiper init (only if library loaded)
    if (typeof Swiper !== 'undefined') {
        try {
            new Swiper(".product-slider", {
                loop: true, spaceBetween: 20, autoplay: { delay: 3000, disableOnInteraction: false },
                breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } }
            });
            new Swiper(".review-slider", {
                loop: true, spaceBetween: 20, autoplay: { delay: 3000, disableOnInteraction: false },
                breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } }
            });
        } catch (e) { /* ignore if sliders not present */ }
    }

    // --- Cart & WhatsApp checkout ---
    const addButtons = document.querySelectorAll('.add-to-cart, .btn.add-to-cart');
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const whatsappDefaultHref = checkoutBtn?.getAttribute('href') || 'https://wa.me/+923278641145';
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const parsePrice = (text = '') => {
        const m = text.replace(/,/g, '').match(/[\d.]+/);
        return m ? parseFloat(m[0]) : 0;
    };
    const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

    function buildWhatsAppHref() {
        const m = whatsappDefaultHref.match(/wa\.me\/(\+?\d+)/);
        const phone = m ? m[1].replace(/\+/g, '') : '';
        const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const lines = cart.map(i => `${i.name} x${i.qty} = $${(i.price * i.qty).toFixed(2)}`);
        const message = ['Hello, I would like to place an order:', ...lines, `Total: $${totalPrice.toFixed(2)}`].join('\n');
        return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    function updateCartUI() {
        const totalCount = cart.reduce((s, i) => s + i.qty, 0);
        const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
        if (cartCountEl) cartCountEl.textContent = totalCount;

        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            empty.textContent = 'Your cart is empty';
            cartItemsContainer.appendChild(empty);
        } else {
            cart.forEach(item => {
                const box = document.createElement('div');
                box.className = 'box';
                box.dataset.id = item.id;
                box.innerHTML = `
                    <i class="fas fa-trash remove-item" data-id="${item.id}" title="Remove"></i>
                    <img src="${item.image || 'image/cart-img-1.png'}" alt="">
                    <div class="content">
                        <h3>${item.name}</h3>
                        <span class="price">$${item.price.toFixed(2)}</span>
                        <span class="quantity">qty : ${item.qty}</span>
                    </div>
                `;
                cartItemsContainer.appendChild(box);
            });
        }

        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = `Total: $${totalPrice.toFixed(2)}`;

        if (checkoutBtn) {
            const waHref = buildWhatsAppHref();
            checkoutBtn.setAttribute('href', waHref);
            checkoutBtn.setAttribute('target', '_blank');
            checkoutBtn.setAttribute('rel', 'noopener noreferrer');
            // ensure clicking opens new tab (some browsers block anchor.open in JS)
            checkoutBtn.addEventListener('click', (e) => {
                // allow default but also explicitly open
                window.open(waHref, '_blank', 'noopener');
            }, { once: true });
        }

        saveCart();
    }

    function addToCartFromButton(btn) {
        const box = btn.closest('.box') || btn.closest('.swiper-slide') || btn.parentElement;
        const id = btn.dataset.productId || (box?.querySelector('h3') ? box.querySelector('h3').textContent.trim().toLowerCase().replace(/\s+/g, '-') : 'product-' + Date.now());
        const name = btn.dataset.productName || (box?.querySelector('h3') ? box.querySelector('h3').textContent.trim() : 'Product');
        const price = btn.dataset.productPrice ? parseFloat(btn.dataset.productPrice) : (box?.querySelector('.price') ? parsePrice(box.querySelector('.price').textContent) : 0);
        const image = box?.querySelector('img') ? box.querySelector('img').getAttribute('src') : '';

        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty += 1;
        else cart.push({ id, name, price: Number(price), qty: 1, image });

        updateCartUI();
    }

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCartFromButton(btn);
        });
    });

    document.addEventListener('click', (e) => {
        const rem = e.target.closest('.remove-item');
        if (rem) {
            const id = rem.dataset.id;
            cart = cart.filter(i => i.id !== id);
            updateCartUI();
        }
    });

    updateCartUI();

    // --- Product-only search ---
    const searchBox = document.getElementById('search-box');
    const productsContainer = document.querySelector('.products');

    let noResultsEl = null;
    function createNoResultsMessage() {
        if (noResultsEl) return noResultsEl;
        noResultsEl = document.createElement('div');
        noResultsEl.id = 'search-no-results';
        noResultsEl.style.textAlign = 'center';
        noResultsEl.style.padding = '2rem';
        noResultsEl.style.color = 'var(--light-color, #777)';
        noResultsEl.textContent = 'No products found';
        return noResultsEl;
    }

    function filterProducts(query) {
        const nodeList = document.querySelectorAll('.products .box, .products .swiper-slide.box, .products .swiper-wrapper .box');
        const boxes = Array.from(nodeList).filter(b => !b.classList.contains('swiper-slide-duplicate'));
        if (boxes.length === 0) {
            // nothing to search on this page
            if (productsContainer) {
                const existing = document.getElementById('search-no-results');
                if (!existing && query.length > 0) productsContainer.appendChild(createNoResultsMessage());
            }
            return;
        }

        let shown = 0;
        boxes.forEach(box => {
            const name = (box.querySelector('h3')?.textContent) || '';
            const price = (box.querySelector('.price')?.textContent) || '';
            const combined = (name + ' ' + price).toLowerCase();
            if (!query || combined.includes(query)) {
                box.style.display = '';
                shown++;
            } else {
                box.style.display = 'none';
            }
        });

        if (productsContainer) {
            const existing = document.getElementById('search-no-results');
            if (shown === 0 && query.length > 0) {
                if (!existing) productsContainer.appendChild(createNoResultsMessage());
            } else {
                existing?.remove();
            }
        }
    }

    if (searchBox) {
        const form = searchBox.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                filterProducts((searchBox.value || '').trim().toLowerCase());
            });
        }
        searchBox.addEventListener('input', (e) => {
            filterProducts(((e.target.value) || '').trim().toLowerCase());
        });
    }
});

// ...existing code...
    // --- scroll fade-up animations (faster, exclude header controls) ---
    (function setupScrollAnimations() {
        const selectors = [
            '.products .box',
            '.features .box',
            '.categories .box',
            '.review .box',
            '.blogs .box',
            '.home .content',
            '.heading'
        ].join(', ');

        const nodes = Array.from(document.querySelectorAll(selectors));
        if (nodes.length === 0) return;

        nodes.forEach((el) => el.classList.add('fade-up'));

        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const index = nodes.indexOf(el);
                // smaller stagger (40ms steps) and cap to avoid long delays
                if (index >= 0) el.style.setProperty('--d', `${Math.min(index, 6) * 40}ms`);
                el.classList.add('in-view');
                observer.unobserve(el);
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -8% 0px'
        });

        nodes.slice(0, 200).forEach(n => obs.observe(n));
    })();

// ...existing code...
(function setupContactSend() {
    const contactMessage = document.getElementById('contact-message');
    const contactPhone = document.getElementById('contact-phone');
    const sendWaBtn = document.getElementById('send-wa');

    const supportWaNumber = '+923278641145'; // change if needed

    function getComposedMessage() {
        const msg = (contactMessage?.value || '').trim();
        const phone = (contactPhone?.value || '').trim();
        let body = msg;
        if (phone) body += `\n\nContact phone: ${phone}`;
        return body;
    }

    sendWaBtn?.addEventListener('click', () => {
        const body = getComposedMessage();
        if (!body) { alert('Please enter a message.'); return; }

        const phone = supportWaNumber.replace(/\+/g, '');
        const text = encodeURIComponent(body);
        const waHref = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;

        // update button state
        const origText = sendWaBtn.textContent;
        sendWaBtn.textContent = 'Sent!';
        sendWaBtn.disabled = true;
        sendWaBtn.classList.add('sent');

        // clear inputs immediately so text "vanishes"
        if (contactMessage) contactMessage.value = '';
        if (contactPhone) contactPhone.value = '';

        // open WhatsApp
        window.open(waHref, '_blank', 'noopener');

        // revert button after 3 seconds
        setTimeout(() => {
            sendWaBtn.textContent = origText;
            sendWaBtn.disabled = false;
            sendWaBtn.classList.remove('sent');
        }, 15000);
    });
})();
// ...existing code...