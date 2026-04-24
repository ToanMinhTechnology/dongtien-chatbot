'use strict';
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/structured/vani-products.json', 'utf8'));

const contact = {
  phone: '0935 226 206',
  zalo: '0935226206',
  address: '107 Đ. Lê Đình Dương, Nam Dương, Q. Hải Châu, Đà Nẵng',
  email: 'tiembanhvani.com@gmail.com',
};

const clean = (v) => (!v || v === 'null' || v === '0₫' || v === '0') ? '' : v;

const products = data.products.map((p) => ({
  name: p.name,
  description: clean(p.description),
  category: clean(p.category),
  price_range: clean(p.price_range),
}));

const categories = data.categories.filter((c) => c && c !== 'null');

const policies = {
  order_lead_time: '1-2 ngày',
  delivery: 'Nội thành Đà Nẵng, liên hệ để biết phí ship',
  deposit: '50% giá bánh',
};

const P = contact.phone;
const Z = contact.zalo;
const A = contact.address;
const LEAD = '1-2 ngày';
const DEP = '50% giá bánh';

const catList = categories.slice(0, 20).map((c, i) => `${i + 1}. ${c}`).join('\n');
const prodSummary = products.filter((p) => p.name).slice(0, 10).map((p) => `- **${p.name}**`).join('\n');
const cakeMousse = products.filter((p) => /mousse|cheese/i.test(`${p.name} ${p.category}`));
const mousseList = cakeMousse.length > 0
  ? cakeMousse.slice(0, 5).map((p) => `- **${p.name}**`).join('\n')
  : '- Mousse dừa\n- Red velvet mousse\n- Mousse nhiều vị';

const faqs = [
  {
    question: 'Xin chào',
    answer: `👋 **Xin chào! Chào mừng đến với Tiệm Bánh Vani!**\n\nMình có thể giúp bạn:\n🎂 Tư vấn bánh kem sinh nhật\n🧁 Bánh mousse & cheese cake\n🍰 Bánh ngọt hàng ngày\n📦 Cách đặt hàng & giao hàng\n\nBạn cần gì nào?`,
    keywords: ['chào', 'hello', 'hi', 'xin chào', 'hey', 'alo', 'bạn là ai'],
  },
  {
    question: 'Tiệm Bánh Vani là gì',
    answer: `🏪 **Tiệm Bánh Vani** - tiệm bánh handmade tại Đà Nẵng:\n- 🎂 Bánh kem sinh nhật theo yêu cầu\n- 🧁 Mousse & cheese cake\n- 🍰 Bánh ngọt hàng ngày\n\n📍 ${A}\n📱 ${P}`,
    keywords: ['vani', 'tiệm bánh', 'giới thiệu', 'about', 'là gì', 'cửa hàng'],
  },
  {
    question: 'Tiệm Bánh Vani có những loại bánh nào',
    answer: `🎂 **CÁC LOẠI BÁNH VANI**\n\n${catList}\n\n💡 Xem thêm tại: tiembanhvani.com`,
    keywords: ['loại bánh', 'có bánh gì', 'menu', 'danh mục', 'sản phẩm', 'bánh nào'],
  },
  {
    question: 'Giá bánh kem tại Vani bao nhiêu',
    answer: `💰 **GIÁ BÁNH VANI**\n\nGiá phụ thuộc size, thiết kế và loại bánh.\n📱 Nhắn để nhận báo giá: ${Z}\n💡 Vani có nhiều mức giá phù hợp mọi ngân sách!`,
    keywords: ['giá', 'bao nhiêu', 'price', 'mấy tiền', 'phí', 'chi phí', 'bảng giá', 'giá bánh'],
  },
  {
    question: 'Bánh mousse có không',
    answer: `🧁 **MOUSSE & CHEESE CAKE VANI**\n\n${mousseList}\n\nMousse mát lạnh, nhẹ, phù hợp mọi dịp!\n📱 ${P}`,
    keywords: ['mousse', 'cheese cake', 'cheesecake', 'mát', 'lạnh', 'nhẹ'],
  },
  {
    question: 'Bánh kem sinh nhật có những loại gì',
    answer: `🎂 **BÁNH KEM SINH NHẬT VANI**\n\n${prodSummary}\n\n📅 Đặt trước **${LEAD}**\n📱 ${P}`,
    keywords: ['bánh kem', 'bánh sinh nhật', 'kem sinh nhật', 'birthday cake', 'kem'],
  },
  {
    question: 'Cách đặt bánh tại Vani',
    answer: `📦 **CÁCH ĐẶT BÁNH VANI**\n\n**Bước 1:** Liên hệ Vani:\n📱 ${P}\n\n**Bước 2:** Chọn loại bánh, size, thiết kế\n\n**Bước 3:** Đặt cọc **${DEP}**\n\n**Bước 4:** Nhận bánh đúng ngày!\n\n💡 Đặt trước **${LEAD}** để đảm bảo có bánh đẹp!`,
    keywords: ['đặt hàng', 'order', 'cách đặt', 'làm sao', 'mua bánh', 'đặt bánh'],
  },
  {
    question: 'Đặt cọc bao nhiêu',
    answer: `💳 **CHÍNH SÁCH ĐẶT CỌC**\n\n- Đặt cọc: **${DEP}**\n- Phần còn lại thanh toán khi nhận bánh\n\n📱 Liên hệ: ${P}`,
    keywords: ['cọc', 'đặt cọc', 'thanh toán', 'trả tiền', 'chuyển khoản', 'deposit'],
  },
  {
    question: 'Đặt bánh trước bao lâu',
    answer: `⏰ **THỜI GIAN ĐẶT TRƯỚC**\n\n- Bánh thông thường: **${LEAD}**\n- Bánh custom/thiết kế riêng: 3-5 ngày\n- Bánh cưới & sự kiện: **1-2 tuần trước**\n\n📌 Đặt sớm để đảm bảo có bánh đẹp!`,
    keywords: ['đặt trước', 'bao lâu', 'thời gian làm', 'lead time', 'bao nhiêu ngày', 'mấy ngày'],
  },
  {
    question: 'Cần bánh gấp được không',
    answer: `⚡ **ĐẶT BÁNH GẤP**\n\nLiên hệ ngay để hỏi bánh có sẵn:\n📱 ${P}\n\nVani sẽ cố gắng hỗ trợ nếu có nguyên liệu!\nTuy nhiên đặt trước **${LEAD}** sẽ đảm bảo chất lượng tốt nhất.`,
    keywords: ['gấp', 'khẩn', 'hôm nay', 'ngay', 'cần gấp', 'urgent'],
  },
  {
    question: 'Vani có giao hàng không',
    answer: `🚗 **GIAO HÀNG VANI**\n\nCó! Giao hàng nội thành Đà Nẵng.\n\n📱 Nhắn địa chỉ để biết phí ship: ${P}\n💡 Đặt sớm để sắp xếp giờ giao phù hợp!`,
    keywords: ['giao hàng', 'ship', 'delivery', 'giao tận nơi', 'có giao không'],
  },
  {
    question: 'Phí giao hàng bao nhiêu',
    answer: `💵 **PHÍ GIAO HÀNG**\n\nPhí ship phụ thuộc khoảng cách và khu vực.\n\n📱 Nhắn địa chỉ để Vani báo phí chính xác: ${P}`,
    keywords: ['phí ship', 'tiền ship', 'free ship', 'miễn phí giao', 'ship fee', 'phí giao'],
  },
  {
    question: 'Giao bánh mấy giờ',
    answer: `⏰ **THỜI GIAN GIAO HÀNG**\n\nKhi đặt bạn cho Vani biết **khung giờ mong muốn** nhé!\nVani sẽ sắp xếp giao đúng giờ.\n\n📱 ${P}`,
    keywords: ['giao mấy giờ', 'giờ giao', 'sáng', 'chiều', 'tối', 'thời gian giao'],
  },
  {
    question: 'Bánh sinh nhật đẹp tại Vani',
    answer: `🎂 **BÁNH SINH NHẬT VANI**\n\nVani chuyên làm bánh sinh nhật đẹp theo yêu cầu:\n- Thiết kế theo sở thích người nhận\n- Màu sắc, chữ viết tùy chọn\n- Nhiều size từ nhỏ đến lớn\n\n📅 Đặt trước **${LEAD}**\n📱 ${P}`,
    keywords: ['sinh nhật', 'birthday', 'bánh sinh nhật', 'tặng sinh nhật'],
  },
  {
    question: 'Bánh cưới tại Vani',
    answer: `💒 **BÁNH CƯỚI VANI**\n\nVani làm bánh cưới theo concept của bạn:\n- Nhiều tầng sang trọng\n- Hoa, ribbon theo ý\n- Màu sắc đồng bộ tông cưới\n\n📅 Đặt trước **1-2 tuần**\n📱 ${P}`,
    keywords: ['cưới', 'wedding', 'bánh cưới', 'đám cưới', 'hôn lễ'],
  },
  {
    question: 'Bánh cho sự kiện công ty',
    answer: `🏢 **BÁNH SỰ KIỆN / CÔNG TY**\n\nVani nhận đơn bánh cho:\n- Tiệc sinh nhật công ty\n- Khai trương, kỷ niệm\n- Tiệc cuối năm, team building\n\n📱 Báo giá: ${P}`,
    keywords: ['sự kiện', 'công ty', 'event', 'khai trương', 'kỷ niệm', 'tiệc'],
  },
  {
    question: 'Bánh làm quà tặng',
    answer: `🎁 **BÁNH LÀM QUÀ TẶNG**\n\nBánh Vani là quà tặng ý nghĩa:\n- Sinh nhật bạn bè, người thân\n- Cảm ơn, xin lỗi\n- Quà dịp lễ\n\n📦 Có hộp đóng gói đẹp!\n📱 ${P}`,
    keywords: ['quà tặng', 'gift', 'tặng', 'quà', 'present'],
  },
  {
    question: 'Liên hệ Tiệm Bánh Vani',
    answer: `📱 **LIÊN HỆ TIỆM BÁNH VANI**\n\n📞 ${P}\n💬 Zalo: ${Z}\n📧 tiembanhvani.com@gmail.com\n📍 ${A}\n\n🌐 tiembanhvani.com`,
    keywords: ['liên hệ', 'contact', 'số điện thoại', 'zalo', 'phone', 'gọi', 'nhắn'],
  },
  {
    question: 'Địa chỉ Tiệm Bánh Vani ở đâu',
    answer: `📍 **ĐỊA CHỈ TIỆM BÁNH VANI**\n\n${A}\n\n📱 ${P}\n🌐 tiembanhvani.com`,
    keywords: ['địa chỉ', 'ở đâu', 'chỗ', 'đường', 'vị trí', 'location', 'address'],
  },
  {
    question: 'Giờ mở cửa Vani',
    answer: `🕐 **GIỜ MỞ CỬA TIỆM BÁNH VANI**\n\nLiên hệ để biết giờ hoạt động:\n📱 ${P}\n🌐 tiembanhvani.com`,
    keywords: ['giờ mở cửa', 'opening hours', 'mấy giờ', 'làm việc'],
  },
  {
    question: 'Bánh Vani làm từ nguyên liệu gì',
    answer: `🌿 **NGUYÊN LIỆU BÁNH VANI**\n\nVani cam kết:\n- Nguyên liệu tươi, nhập hàng ngày\n- Không chất bảo quản độc hại\n- Kem tươi, bơ sữa chất lượng\n- Trái cây tươi theo mùa\n\n📱 ${P}`,
    keywords: ['nguyên liệu', 'ingredient', 'tươi', 'an toàn', 'chất lượng'],
  },
  {
    question: 'Bánh Vani bảo quản bao lâu',
    answer: `🧊 **BẢO QUẢN BÁNH VANI**\n\n- Bánh kem tươi: 1-2 ngày trong tủ lạnh\n- Mousse & cheese cake: 2-3 ngày trong tủ lạnh\n- Bánh ngọt khô: 3-5 ngày\n\n💡 Nên ăn trong ngày để ngon nhất!\n📱 ${P}`,
    keywords: ['bảo quản', 'để được', 'hạn dùng', 'tủ lạnh', 'storage'],
  },
  {
    question: 'Cupcake tại Vani',
    answer: `🧁 **CUPCAKE VANI**\n\nCupcake nhỏ xinh, đủ màu sắc, làm quà!\n\n📱 Hỏi giá & đặt số lượng: ${P}\n💡 Đặt từ 6 cái trở lên thường có ưu đãi!`,
    keywords: ['cupcake', 'cup cake', 'bánh nhỏ', 'cupcake xinh'],
  },
  {
    question: 'Bánh mừng thọ tại Vani',
    answer: `🙏 **BÁNH MỪNG THỌ VANI**\n\nVani làm bánh mừng thọ đẹp, ý nghĩa:\n- Thiết kế truyền thống hoặc hiện đại\n- Chữ thọ, hoa sen theo yêu cầu\n\n📱 ${P}`,
    keywords: ['mừng thọ', 'thọ', 'ông bà', 'mừng tuổi'],
  },
  {
    question: 'Bánh thiết kế theo yêu cầu',
    answer: `✨ **BÁNH THIẾT KẾ THEO YÊU CẦU**\n\nVani làm bánh custom theo concept riêng:\n- Màu sắc tùy chọn\n- Hình vẽ, nhân vật yêu thích\n- Chữ viết theo ý\n\n📅 Đặt trước **3-5 ngày** (custom)\n📱 Gửi ảnh mẫu: ${P}`,
    keywords: ['thiết kế', 'custom', 'theo yêu cầu', 'ý muốn', 'mẫu riêng'],
  },
  {
    question: 'Cheese cake Vani ngon không',
    answer: `🍰 **CHEESE CAKE VANI**\n\nCó! Cheese cake Vani làm từ cream cheese chất lượng:\n- **New York style** — đậm đà, dense\n- **Nhật style** — mềm mịn, nhẹ hơn\n- **No-bake** — mát lạnh, frothy\n\n📱 ${P}`,
    keywords: ['cheese cake', 'cheesecake', 'phô mai', 'cream cheese'],
  },
  {
    question: 'Bánh ngọt mỗi ngày có gì',
    answer: `🍰 **BÁNH NGỌT HẰNG NGÀY VANI**\n\nVani có bánh ngọt hàng ngày:\n- Bánh cupcake\n- Bánh tart\n- Bánh bông lan\n- Cookie, brownie\n\n📍 ${A}\n📱 ${P}`,
    keywords: ['bánh ngọt', 'hàng ngày', 'mỗi ngày', 'daily', 'tart', 'cookie', 'brownie'],
  },
  {
    question: 'Bánh su tại Vani',
    answer: `🍮 **BÁNH SU VANI**\n\nVani có set bánh su thơm ngon!\n\n📱 Hỏi về set bánh su: ${P}`,
    keywords: ['bánh su', 'su kem', 'cream puff', 'su'],
  },
  {
    question: 'Muốn đặt bánh ngay',
    answer: `🎂 **ĐẶT BÁNH NGAY!**\n\nĐể đặt bánh, cung cấp cho Vani:\n1️⃣ Tên bạn\n2️⃣ Số điện thoại\n3️⃣ Loại bánh & size\n4️⃣ Ngày nhận\n5️⃣ Địa chỉ giao (nếu cần)\n\n📱 Chat Zalo: **${Z}**`,
    keywords: ['đặt ngay', 'đặt bánh ngay', 'mua ngay', 'order ngay', 'muốn đặt'],
  },
];

const kb = { products, faqs, contact, categories, policies };
const nullCheck = faqs.filter((f) => f.answer.includes('null')).length;
const out = `// Tiệm Bánh Vani - Knowledge Base
// Generated from tiembanhvani.com crawl data (data/structured/vani-products.json)
// Re-run: npm run crawl:vani to refresh

export const knowledgeBase = ${JSON.stringify(kb, null, 2)};

export default knowledgeBase;
`;

fs.writeFileSync('./src/data/knowledgeBase.js', out);
console.log(`Products: ${products.length} | FAQs: ${faqs.length} | Categories: ${categories.length} | null-answers: ${nullCheck}`);
