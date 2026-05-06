/* 
======================================================
   JAVASCRIPT CORE: Xử Lý Logic UI, Giỏ Hàng & Bot Chat
   (No Backend - Simulate Data Store via LocalStorage)
======================================================
*/

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. CHỨC NĂNG CUỘN TRANG MƯỢT (SMOOTH SCROLL)
    // ==========================================
    const scrollLinks = document.querySelectorAll('.nav-link[href^="#"], .btn[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Điều chỉnh bù trừ cho Navbar dính khoảng 90px
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });

    // ==========================================
    // 2. CHỨC NĂNG GIỎ HÀNG BẰNG LOCALSTORAGE
    // ==========================================

    // Lấy dữ liệu Giỏ hàng đã lưu trước đây từ bộ nhớ thiết bị trình duyệt (Nếu có)
    let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

    const cartCountBadge = document.getElementById('navCartCount');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalText = document.getElementById('cart-total');
    const emptyMsg = document.getElementById('empty-cart-msg');

    // Hàm (1) Format Giá Tiền Sang VND
    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    // Hàm (2) Vẽ lại Cấu trúc HTML Giỏ Hàng mỗi khi có thao tác Add/Remove
    const renderCart = () => {
        // Nếu không có sản phẩm
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-muted my-5" id="empty-cart-msg">Giỏ hàng đang trống.</p>';
            cartTotalText.textContent = "0 ₫";
            cartCountBadge.textContent = "0";
            return;
        }

        // Có sản phẩm: dọn dẹp html cũ trước khi lắp mới
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach((item, index) => {
            // Cộng dồn
            total += (item.price * item.qty);
            count += item.qty;

            // Xây dựng template HTML cho thẻ sản phẩm trong giỏ (Offcanvas Menu)
            const itemHTML = `
                <div class="d-flex p-2 border border-secondary border-opacity-25 rounded bg-white position-relative shadow-sm mb-2">
                    <img src="${item.img}" alt="${item.name}" class="object-fit-cover rounded me-3" style="width: 70px; height: 70px;">
                    <div class="flex-grow-1">
                        <h6 class="font-playfair text-dark mb-1 fw-bold text-truncate" style="max-width: 170px;">${item.name}</h6>
                        <small class="text-muted d-block font-poppins mb-1">Slg: ${item.qty}</small>
                        <strong class="text-gold font-poppins">${formatCurrency(item.price)}</strong>
                    </div>
                    <!-- Nút Xóa (Gắn thuộc tính data-index để JS biết xóa phần tử nào) -->
                    <button class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-2 p-1 me-2 remove-item-btn" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            // Bơm template trên vào HTML khung chứa
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        // Gắn sự kiện Xóa Cho Từng Nút Rác Vừa Mới Bơm Bằng JS
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const itemIndex = parseInt(this.getAttribute('data-index'));
                // Cắt phần tử khỏi mảng Array
                cart.splice(itemIndex, 1);
                // Cập nhật lại kho lưu trữ thật
                localStorage.setItem('aura_cart', JSON.stringify(cart));
                // Vẽ lại giao diện
                renderCart();
            });
        });

        // Cập nhật Nhãn Badge số đếm & Tổng Tiền
        cartCountBadge.textContent = count;
        cartTotalText.textContent = formatCurrency(total);
    };

    // Hàm (3) - Bắt sự kiện khi Client Bấm nút "Thêm vào giỏ" dưới bức ảnh SP
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            // Rút trích các data info được lưu trữ từ attribute Button của thẻ html
            const prod = {
                id: this.getAttribute('data-id'),
                name: this.getAttribute('data-name'),
                price: parseFloat(this.getAttribute('data-price')),
                img: this.getAttribute('data-img'),
                qty: 1
            };

            // Quét xem món đó bị trùng chưa
            const existingItem = cart.find(item => item.id === prod.id);
            if (existingItem) {
                existingItem.qty += 1; // Chỉ tăng biến số lượng
            } else {
                cart.push(prod); // Thêm dòng mới
            }

            // Lưu Database Offline Local& Cập nhật màn hình UI
            localStorage.setItem('aura_cart', JSON.stringify(cart));
            renderCart();

            // Nhắc bạn mượt bằng alert thay vì form offcanvas để đỡ choáng
            alert(`Đã nạp thành công "${prod.name}" vào Cốp xe (Giỏ Hàng) của bạn.`);
        });
    });

    // Chạy mặc định để hiện icon đúng khi f5 trang
    renderCart();

    // Nút Thanh toán giả lập (Checkout)
    document.getElementById('checkout-btn')?.addEventListener('click', function () {
        if (cart.length === 0) {
            alert("Vui lòng lấp đầy yêu thương trước khi chốt hóa đơn.");
        } else {
            alert("Mô phỏng Thanh toán Mật Mã Bảo Mật RSA thành công. Đang kết nối Viện kiểm định ngọc học...");
            cart = [];
            localStorage.setItem('aura_cart', JSON.stringify(cart));
            renderCart();
        }
    });

    // ==========================================
    // 3. CHỨC NĂNG VALIDATION LIÊN HỆ GỬI MAIL
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const alertMsgBox = document.getElementById('formAlertMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {

            // Xử Lý Kiểm Tra theo Thuộc Tính Required / Email của HTML 5
            if (!contactForm.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                // NẾU HỢP LỆ THEO RULE (Đủ chữ, pass regex)
                event.preventDefault();

                // Hiển thị Alert Thông Báo Xanh (Thành Công) trên form
                alertMsgBox.classList.remove('d-none', 'alert-danger');
                alertMsgBox.classList.add('alert-success');
                alertMsgBox.innerHTML = `<strong>Tiếp Nhận Thành Công!</strong> Chuyên gia chăm sóc cá nhân sẽ gọi lại cho ${document.getElementById('cfName').value} trong vòng 20 phút.`;

                // Trả Form về như cũ
                contactForm.reset();
                contactForm.classList.remove('was-validated');
                return;
            }

            // Tự Động Thêm Class .was-validated từ Framework Bootstap
            contactForm.classList.add('was-validated');
        });
    }

    // ==========================================
    // 4. CHỨC NĂNG LIVE CHAT BOT (AI FAKES)
    // ==========================================
    const chatWidget = document.getElementById('liveChatWidget');
    const openChatBtn = document.getElementById('openChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatBox = document.getElementById('chatBox');

    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessagesContainer = document.getElementById('chatMessages');

    // Mở Chat UI
    openChatBtn.addEventListener('click', () => {
        chatBox.classList.remove('d-none'); // Mở Cửa sổ
        openChatBtn.classList.add('d-none'); // Giấu đi cục bong bóng hình chat
    });

    // Tắt Chat UI
    closeChatBtn.addEventListener('click', () => {
        chatBox.classList.add('d-none');
        openChatBtn.classList.remove('d-none');
    });

    // Hàm append Bubble tin nhắn vào màn hình chat
    const appendMessage = (text, sender) => {
        const isUser = sender === 'user';
        const msgMarkup = `
            <div class="d-flex mb-3 ${isUser ? 'justify-content-end' : ''}">
                <div class="${isUser ? 'bg-gold text-white' : 'bg-white border text-dark shadow-sm'} rounded-3 px-3 py-2 text-sm" style="max-width:85%">
                    ${text}
                </div>
            </div>
        `;
        chatMessagesContainer.insertAdjacentHTML('beforeend', msgMarkup);
        // Tự scroll xuống cực dưới ngay khi có dòng văn bản mới
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    // Hàm Xử Lý Gửi Tin Nhắn
    const processUserChat = () => {
        const msg = chatInput.value.trim();
        if (!msg) return; // Nếu nhập chuỗi trống

        // 1. Phản hồi Text User Lên Giao Diện
        appendMessage(msg, 'user');
        chatInput.value = ''; // Xóa Input text

        // 2. Kích Hoạt Hành vi Giả Lập Hệ Thống Chat Nhắn Lại (Auto Reply Bot) delay 1 Giây
        setTimeout(() => {
            const replies = [
                "Cảm ơn bạn! Chúng tôi đã ghi nhận chuyên viên tư vấn đang bận một chút, vui lòng để lại SDT.",
                "Sản phẩm kim cương của Aura đều có thiết kế tùy chỉnh (Custom), bạn mong muốn size ni tay như thế nào?",
                "Tất cả sản phẩm đều cam kết độ nét chuẩn mực VVS và đạt chuẩn GIA Hoa Kỳ.",
                "Tôi là Bot Aura AI. Bạn có thắc mắc gì về bảo mật thanh toán hoặc phí giao hàng thẻ VIP không?"
            ];
            // Random câu trả lời logic
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            appendMessage(randomReply, 'bot');
        }, 1200);
    };

    // Click nút gửi
    sendChatBtn.addEventListener('click', processUserChat);

    // Bắt phím Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUserChat();
        }
    });

});

// ==========================================
// 5. CHỨC NĂNG CÀI DATA CHO POPUP (QUICK VIEW)
// ==========================================
// Hàm này nằm ngoài Event Loaded để HTML DOM gắn thẻ Onclick có thể trỏ tới gọi hàm 
function setModalData(title, priceNumeric, imageSrc) {
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalImg = document.getElementById('modalImg');

    if (modalTitle && modalPrice && modalImg) {
        modalTitle.textContent = title;
        // Bơm số vào giá định dạng ngay trên JavaScript
        modalPrice.textContent = new Intl.NumberFormat('vi-VN').format(priceNumeric);
        modalImg.src = imageSrc;
    }
}
