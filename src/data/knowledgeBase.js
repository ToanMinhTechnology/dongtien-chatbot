// Đồng Tiền Bakery - Knowledge Base
// Decision tree-based FAQ (không dùng RAG - keyword matching thay vì AI)

// Cấu trúc: { intent, keywords, answer, followUp? }

export const knowledgeBase = [
  // ====== GIÁ BÁNH KEM ======
  {
    intent: "PRICE_14CM",
    keywords: ["14cm", "nhỏ", "size nhỏ", "bánh nhỏ", "giá 14", "14 cm"],
    question: "bánh 14cm giá bao nhiêu",
    answer: "🍰 **Bánh kem 14cm (4-6 người)**\n\n- Bánh kem basic: **95.000đ**\n- Bánh kem viết chữ: **120.000đ**\n- Bánh kem hoa fondant: **150.000đ**\n\n🎂 Đặt trước **1 ngày** là có nha!"
  },
  {
    intent: "PRICE_16CM",
    keywords: ["16cm", "vừa", "size vừa", "bánh vừa", "giá 16", "16 cm"],
    question: "bánh 16cm giá bao nhiêu",
    answer: "🍰 **Bánh kem 16cm (6-8 người)**\n\n- Bánh kem basic: **135.000đ**\n- Bánh kem viết chữ: **165.000đ**\n- Bánh kem hoa fondant: **200.000đ**\n\n🎂 Đặt trước **1 ngày** là có nha!"
  },
  {
    intent: "PRICE_18CM",
    keywords: ["18cm", "lớn", "size lớn", "bánh lớn", "giá 18", "18 cm"],
    question: "bánh 18cm giá bao nhiêu",
    answer: "🍰 **Bánh kem 18cm (8-12 người)**\n\n- Bánh kem basic: **175.000đ**\n- Bánh kem viết chữ: **210.000đ**\n- Bánh kem hoa fondant: **250.000đ**\n\n🎂 Đặt trước **1-2 ngày** nha!"
  },
  {
    intent: "PRICE_20CM",
    keywords: ["20cm", "khổng lồ", "size khổng lồ", "20 cm", "bánh 20"],
    question: "bánh 20cm giá bao nhiêu",
    answer: "🍰 **Bánh kem 20cm (12-20 người)**\n\n- Bánh kem basic: **220.000đ**\n- Bánh kem viết chữ: **260.000đ**\n- Bánh kem hoa fondant: **320.000đ**\n\n🎂 Đặt trước **2 ngày** nha! Giá mềm hơn bánh 2 lớp nha!"
  },
  {
    intent: "PRICE_TWO_LAYER",
    keywords: ["2 lớp", "hai lớp", "bánh 2 lớp", "2 layers", "layer"],
    question: "bánh 2 lớp giá bao nhiêu",
    answer: "🎂 **Bánh kem 2 lớp**\n\n- Size 16cm (6-8 người): **250.000đ**\n- Size 18cm (8-12 người): **320.000đ**\n- Size 20cm (12-20 người): **400.000đ**\n\n✨ Bánh 2 lớp cao hơn, nhìn sang trọng hơn!\n📅 Đặt trước **2-3 ngày** nha!"
  },
  {
    intent: "PRICE_ALL",
    keywords: ["bảng giá", "giá", "giá bánh", "price", "bao nhiêu", "hết bao nhiêu", "mấy tiền"],
    question: "bảng giá bánh kem",
    answer: "📋 **BẢNG GIÁ BÁNH KEM ĐỒNG TIỀN**\n\n**Size thường:**\n| Size | Basic | Viết chữ | Fondant |\n|------|-------|----------|---------|\n| 14cm | 95k | 120k | 150k |\n| 16cm | 135k | 165k | 200k |\n| 18cm | 175k | 210k | 250k |\n| 20cm | 220k | 260k | 320k |\n\n**Bánh 2 lớp:**\n| Size | Basic |\n|------|-------|\n| 16cm | 250k |\n| 18cm | 320k |\n| 20cm | 400k |\n\n💡 Bánh fondants nhìn sang trọng, fondant ăn ngon và đẹp lắm nha!"
  },

  // ====== THỜI GIAN ĐẶT TRƯỚC ======
  {
    intent: "LEAD_TIME_NORMAL",
    keywords: ["đặt trước", "làm mấy ngày", "thời gian làm", "ngày", "ngày làm", "hôm nào"],
    question: "đặt bánh trước bao lâu",
    answer: "⏰ **THỜI GIAN ĐẶT TRƯỚC**\n\n**Bánh có sẵn:**\n- Bánh basic, viết chữ: **1 ngày** là lấy được\n\n**Bánh custom/cá nhân hóa:**\n- Bánh hoa fondant: **2-3 ngày**\n- Bánh 2 lớp: **2-3 ngày**\n- Bánh thiết kế riêng: **3-5 ngày**\n\n📌 **Mẹo:** Đặt càng sớm càng chắc chồn nha! Đặt trước 2-3 ngày là ok nhất!"
  },
  {
    intent: "LEAD_TIME_URGENT",
    keywords: ["gấp", "khẩn", "cần gấp", "ngay", "hôm nay", "today", "emergency"],
    question: "cần bánh gấp được không",
    answer: "⚡ **ĐẶT GẤP**\n\nNếu bạn cần bánh gấp, liên hệ ngay:\n📱 **Zalo: 0935226206**\n\nMình sẽ xem bánh có sẵn không, nếu có thì **2-4 tiếng** sau là lấy được!\n\nNhưng tốt nhất vẫn là đặt trước 1 ngày để đảm bảo có bánh đẹp nha!"
  },

  // ====== CÁCH ĐẶT HÀNG ======
  {
    intent: "ORDER_METHOD",
    keywords: ["đặt hàng", "order", "cách đặt", "làm sao đặt", "muốn đặt", "đặt bánh"],
    question: "cách đặt bánh",
    answer: "📦 **CÁCH ĐẶT BÁNH**\n\n**Bước 1:** Chat Zalo với mình\n📱 **Zalo: 0935226206**\n\n**Bước 2:** Chọn bánh (size, loại, viết gì)\n\n**Bước 3:** Đặt cọc **50%** giá bánh\n\n**Bước 4:** Mình làm và giao đúng ngày!\n\n💡 Đặt cọc qua chuyển khoản:\n🏦 VietinBank: 1012345678 - LÊ ĐÌNH DƯƠNG"
  },
  {
    intent: "DEPOSIT",
    keywords: ["cọc", "đặt cọc", "thanh toán", "trả tiền", "chuyển khoản", "bank"],
    question: "đặt cọc bao nhiêu",
    answer: "💰 **CHÍNH SÁCH ĐẶT CỌC**\n\n- Đặt cọc **50%** giá bánh\n- Còn lại thanh toán khi nhận bánh\n\n**Chuyển khoản:**\n🏦 VietinBank\n📱 0935226206\n👤 Lê Đình Dương\n\n📝 Nội dung: \"Đặt bánh [tên bạn] - [ngày nhận]\""
  },
  {
    intent: "PHONE",
    keywords: ["số điện thoại", "zalo", "phone", "liên hệ", "contact", "gọi", "messenger", "facebook"],
    question: "liên hệ như thế nào",
    answer: "📱 **LIÊN HỆ ĐỒNG TIỀN**\n\n**Zalo (ưu tiên):** 0935226206\n\n**Facebook:** Messager Đồng Tiền Bakery\n\n**Địa chỉ:** 107 Lê Đình Dương, Q. Hải Châu, Đà Nẵng\n\n⏰ Mình reply Zalo nhanh nhất nha!"
  },

  // ====== GIAO HÀNG ======
  {
    intent: "DELIVERY_AREA",
    keywords: ["giao hàng", "ship", "delivery", "chỗ khác", "nơi khác", "quận nào", "tp đà nẵng", "đà nẵng"],
    question: "giao hàng ở đâu",
    answer: "🚗 **GIAO HÀNG ĐÀ NẴNG**\n\n**Nội thành Đà Nẵng:**\n- Q. Hải Châu: **MIỄN PHÍ**\n- Q. Thanh Khê, Q. Sơn Trà, Q. Ngũ Hành Sơn: **15.000đ**\n- Q. Liên Chiểu, Q. Hòa Vang: **25.000-40.000đ** (tùy khoảng cách)\n\n**Ngoại thành/ tỉnh khác:**\nLiên hệ Zalo 0935226206 để báo giá cụ thể nha!"
  },
  {
    intent: "DELIVERY_FEE",
    keywords: ["phí ship", "phí giao", "tiền ship", "free", "miễn phí"],
    question: "phí giao hàng bao nhiêu",
    answer: "💵 **PHÍ GIAO HÀNG**\n\n| Khu vực | Phí |\n|---------|-----|\n| Q. Hải Châu | **MIỄN PHÍ** |\n| Q. Thanh Khê, Sơn Trà, Ngũ Hành Sơn | **15.000đ** |\n| Q. Liên Chiểu, Hòa Vang | **25.000-40.000đ** |\n\n💡 Đặt bánh ở Hải Châu là **FREE** nha!"
  },
  {
    intent: "DELIVERY_TIME",
    keywords: ["mấy giờ giao", "giờ giao", "thời gian giao", "sáng", "chiều", "tối"],
    question: "giao bánh mấy giờ",
    answer: "⏰ **THỜI GIAN GIAO BÁN**\n\nMình giao bánh trong khung giờ:\n- **Sáng:** 7h00 - 10h00\n- **Chiều:** 14h00 - 17h00\n- **Tối:** 18h00 - 20h00\n\n📌 Khi đặt, bạn cho mình biết **khung giờ mong muốn** nhé!\nMình sẽ cố gắng sắp xếp giao đúng giờ!"
  },

  // ====== LOẠI BÁNH ======
  {
    intent: "CAKE_TYPES",
    keywords: ["loại bánh", "bánh gì", "có bánh gì", "menu", "danh mục", "bánh nào", "type", "bánh gì ngon"],
    question: "đồng tiền có những loại bánh nào",
    answer: "🎂 **CÁC LOẠI BÁNH TẠI ĐỒNG TIỀN**\n\n1. **Bánh kem** - Truyền thống, viết chữ, hoa fondant\n2. **Bánh mousse** - Nhẹ, mát, nhiều vị\n3. **Bông lan trứng muối** - Bánh bông lan mềm xốp\n4. **Cupcake** - Bánh nhỏ xinh, tiện chia\n5. **Bánh cưới** - Bánh cưới sang trọng\n6. **Bánh custom** - Thiết kế theo yêu cầu riêng\n\nBạn quan tâm loại nào? Mình tư vấn chi tiết hơn nha!"
  },
  {
    intent: "MOUSSE",
    keywords: ["mousse", "bánh mousse", "kem mát", "mát lạnh"],
    question: "bánh mousse có không",
    answer: "🧁 **BÁNH MOUSSE ĐỒNG TIỀN**\n\nCó có! Mousse mát lạnh, nhẹ nhàng, nhiều người thích lắm!\n\n**Mousse có các vị:**\n- 🍫 Mousse socola\n- 🍓 Mousse dâu\n- 🧡 Mousse cam\n- 🥭 Mousse xoài\n- 🍵 Mousse trà xanh\n\n💰 Giá: **45.000đ - 65.000đ** (tùy size)\n📅 Đặt trước **1 ngày** nha!"
  },
  {
    intent: "CUPCAKE",
    keywords: ["cupcake", "bánh cupcake", "cup cake", "bánh nhỏ"],
    question: "cupcake có không",
    answer: "🧁 **CUPCAKE ĐỒNG TIỀN**\n\nCó! Cupcake xinh xắn, đủ màu sắc!\n\n**Cupcake đơn giản:** 18.000đ/cái\n**Cupcake viết chữ:** 25.000đ/cái\n**Cupcake fondant:** 35.000đ/cái\n\n🎉 **Đặt từ 12 cái trở lên được giảm 10%**\n\nMàu sắc theo yêu cầu nha!"
  },
  {
    intent: "WEDDING_CAKE",
    keywords: ["cưới", "wedding", "bánh cưới", "cưới hỏi", "đám cưới"],
    question: "làm bánh cưới không",
    answer: "💒 **BÁNH CƯỚI ĐỒNG TIỀN**\n\nCó làm! Bánh cưới làm theo yêu cầu riêng của các bạn!\n\n**Bánh cưới bao gồm:**\n- Thiết kế theo concept cưới\n- Màu sắc theo ý\n- Hoa fondant theo yêu cầu\n- Gắn 2 dp nhỏ (tượng trưng)\n\n💰 Giá từ **500.000đ - 2.000.000đ** (tùy design)\n📅 Đặt trước **1-2 tuần** nha!\n\nLiên hệ Zalo 0935226206 để được tư vấn cụ thể!"
  },
  {
    intent: "EGG_CAKE",
    keywords: ["bông lan", "bánh bông lan", "trứng muối", "bánh trứng", "pound cake"],
    question: "bánh bông lan có không",
    answer: "🍰 **BÔNG LAN TRỨNG MUỐI ĐỒNG TIỀN**\n\nCó! Bánh bông lan trứng muối mềm xốp, ăn không ngán!\n\n**Các loại:**\n- Plain (không nhân): 25.000đ\n- Có nhân (socola, dâu, xoài): 35.000đ\n- Bông lan cuộn: 40.000đ\n\n📅 Đặt trước **1 ngày** nha!"
  },

  // ====== ĐỊA CHỈ ======
  {
    intent: "ADDRESS",
    keywords: ["địa chỉ", "ở đâu", "chỗ", "đường", "quán", "cửa hàng", "shop", "address", "ở đâu"],
    question: "đồng tiền ở đâu",
    answer: "📍 **ĐỊA CHỈ ĐỒNG TIỀN**\n\n🏠 **107 Lê Đình Dương, Q. Hải Châu, TP. Đà Nẵng**\n\n🗺️ [Xem trên Google Maps](https://maps.google.com/?q=107+Lê+Đình+Dương,+Đà+Nẵng)\n\n**Giờ mở cửa:**\n- Sáng: 7h00 - 11h00\n- Chiều: 14h00 - 20h00\n\nĐường Lê Đình Dương gần ngã tư Lý Thái Tổ nha!"
  },
  {
    intent: "PARKING",
    keywords: ["đỗ xe", "parking", "xe", "ô tô", "máy", "để xe"],
    question: "đỗ xe ở đâu",
    answer: "🅿️ **ĐỖ XE GẦN ĐỒNG TIỀN**\n\nĐỗ xe dọc đường Lê Đình Dương được nha!\n\n- Sáng sớm/chiều: dễ đỗ\n- Tối cuối tuần: hơi đông, cố gắng đỗ xa điểm mấy mét\n\nMình hay thấy khách đỗ xe ở:\n- Trước cửa tiệm (nếu trống)\n- Dọc theo đường Lê Đình Dương\n- Khu vực Lý Thái Tổ gần đó"
  },

  // ====== CHATBOT HỖ TRỢ ======
  {
    intent: "CHATBOT",
    keywords: ["chatbot", "bot", "AI", "tự động", "robot", "automated"],
    question: "ai là chatbot",
    answer: "🤖 **XIN CHÀO!**\n\nMình là chatbot của Đồng Tiền Bakery! Mình có thể trả lời nhanh các câu hỏi về:\n\n🍰 Giá bánh các loại\n📅 Thời gian đặt trước\n🚗 Giao hàng\n📍 Địa chỉ\n💳 Thanh toán\n\nNếu mình không trả lời được, bạn chat Zalo **0935226206** để được hỗ trợ trực tiếp nha!"
  },

  // ====== OPENING ======
  {
    intent: "OPENING",
    keywords: ["chào", "hello", "hi", "xin chào", "hey", "alo", "bạn là ai"],
    question: "chào hỏi",
    answer: "👋 **XIN CHÀO QUÝ KHÁCH!**\n\nMình là chatbot của **Đồng Tiền Bakery** - tiệm bánh kem sinh nhật ngon tại Đà Nẵng!\n\nMình có thể giúp bạn:\n🍰 Biết giá bánh\n📅 Đặt bánh\n🚗 Giao hàng\n📍 Tìm địa chỉ\n\nBạn cần gì nào?"
  },

  // ====== DEFAULT/ORDER INTENT ======
  {
    intent: "ORDER_NOW",
    keywords: ["đặt ngay", "đặt bánh ngay", "mua ngay", "order ngay", "muốn đặt bánh"],
    question: "muốn đặt bánh ngay",
    answer: "🎂 **ĐẶT BÁNH NGAY!**\n\nĐể đặt bánh, bạn cung cấp cho mình:\n\n1️⃣ **Tên bạn:** \n2️⃣ **Số điện thoại:**\n3️⃣ **Loại bánh & size:**\n4️⃣ **Ngày nhận:**\n5️⃣ **Địa chỉ giao (nếu cần):**\n\nMình sẽ tư vấn và xác nhận đơn cho bạn!\n\n📱 Hoặc chat trực tiếp Zalo: **0935226206** nha!"
  }
];

// Intent groups for faster matching
export const intentGroups = {
  PRICE: ["PRICE_14CM", "PRICE_16CM", "PRICE_18CM", "PRICE_20CM", "PRICE_TWO_LAYER", "PRICE_ALL"],
  LEAD_TIME: ["LEAD_TIME_NORMAL", "LEAD_TIME_URGENT"],
  ORDER: ["ORDER_METHOD", "DEPOSIT", "ORDER_NOW"],
  DELIVERY: ["DELIVERY_AREA", "DELIVERY_FEE", "DELIVERY_TIME"],
  CAKE_TYPE: ["CAKE_TYPES", "MOUSSE", "CUPCAKE", "WEDDING_CAKE", "EGG_CAKE"],
  LOCATION: ["ADDRESS", "PARKING"],
  CONTACT: ["PHONE"],
  INFO: ["CHATBOT", "OPENING"]
};

export default knowledgeBase;
