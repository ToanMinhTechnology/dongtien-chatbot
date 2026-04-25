/**
 * Firecrawl crawler for tiembanhvani.com
 * Run: node --env-file=.env scripts/crawl-vani.js
 *
 * Task 1 → data/raw/vani-crawl.json
 * Task 2 → data/structured/vani-products.json
 * Task 3 → src/data/knowledgeBase.js
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const _app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
// v4.x SDK exposes methods under .v1
const firecrawl = _app.v1 ?? _app;

const IMPORTANT_URLS = [
  'https://tiembanhvani.com/collections/all',
  'https://tiembanhvani.com/pages/banh-kem',
  'https://tiembanhvani.com/pages/mousse-cheese-cake',
  'https://tiembanhvani.com/collections/banh-ngot-moi-ngay',
  'https://tiembanhvani.com/pages/about-us',
  'https://tiembanhvani.com/pages/lien-he',
];

const EXTRACTION_PROMPT = `
Extract all useful information from this bakery page in Vietnamese. Return JSON with:
- products: array of {name, description, category, price_range} — every product or cake type mentioned
- contact: {phone, address, email, zalo} — all contact info found
- categories: array of strings — all cake/product category names
- policies: {order_lead_time, delivery, deposit} — ordering policies, delivery info, deposit requirements

If a field is not found on this page, return null or an empty array for that field.
Extract as much detail as possible about each product, including flavors, sizes, and prices.
`.trim();

// ─────────────────────────────────────────────
// TASK 1: Crawl toàn bộ site
// ─────────────────────────────────────────────
async function task1_crawl() {
  console.log('\n=== TASK 1: Crawling tiembanhvani.com ===');

  const result = await firecrawl.crawlUrl('https://tiembanhvani.com', {
    limit: 100,
    scrapeOptions: { formats: ['markdown'] },
  });

  if (!result.success) {
    throw new Error(`Crawl failed: ${result.error ?? 'unknown error'}`);
  }

  const outPath = path.join(ROOT, 'data/raw/vani-crawl.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

  const pageCount = result.data?.length ?? 0;
  console.log(`✓ Crawled ${pageCount} pages → ${outPath}`);
  return result;
}

// ─────────────────────────────────────────────
// TASK 2: Scrape structured JSON từ các trang quan trọng
// ─────────────────────────────────────────────
async function task2_scrapeStructured() {
  console.log('\n=== TASK 2: Scraping structured data ===');

  const allData = {
    products: [],
    contact: {},
    categories: [],
    policies: {},
    _sources: [],
  };

  for (const url of IMPORTANT_URLS) {
    console.log(`  Scraping: ${url}`);
    try {
      const result = await firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'json'],
        jsonOptions: {
          prompt: EXTRACTION_PROMPT,
        },
      });

      if (!result.success) {
        console.warn(`  ✗ Failed (${result.error ?? 'unknown'}): ${url}`);
        continue;
      }

      const json = result.json ?? {};
      allData._sources.push({ url, json });

      // Merge products (deduplicate by name)
      if (Array.isArray(json.products)) {
        const existingNames = new Set(allData.products.map((p) => p.name?.toLowerCase()));
        for (const p of json.products) {
          if (p.name && !existingNames.has(p.name.toLowerCase())) {
            allData.products.push(p);
            existingNames.add(p.name.toLowerCase());
          }
        }
      }

      // Merge contact (later pages override earlier nulls)
      if (json.contact) {
        for (const [k, v] of Object.entries(json.contact)) {
          if (v && !allData.contact[k]) allData.contact[k] = v;
        }
      }

      // Merge categories (deduplicate)
      if (Array.isArray(json.categories)) {
        const existingCats = new Set(allData.categories.map((c) => c.toLowerCase()));
        for (const c of json.categories) {
          if (c && !existingCats.has(c.toLowerCase())) {
            allData.categories.push(c);
            existingCats.add(c.toLowerCase());
          }
        }
      }

      // Merge policies (later pages override earlier nulls)
      if (json.policies) {
        for (const [k, v] of Object.entries(json.policies)) {
          if (v && !allData.policies[k]) allData.policies[k] = v;
        }
      }

      console.log(
        `  ✓ ${json.products?.length ?? 0} products, cats: ${json.categories?.length ?? 0}`
      );
    } catch (err) {
      console.warn(`  ✗ Error scraping ${url}: ${err.message}`);
    }
  }

  // Normalise: replace 'null' strings and clean up prices
  const clean = (v) => (!v || v === 'null' || v === '0₫' || v === '0') ? '' : v;

  allData.products = allData.products.map((p) => ({
    name: p.name,
    description: clean(p.description),
    category: clean(p.category),
    price_range: clean(p.price_range),
  }));
  allData.categories = allData.categories.filter((c) => c && c !== 'null');

  // Ensure contact always has real values from lien-he page
  const lienheSrc = allData._sources.find((s) => s.url.includes('lien-he'));
  if (lienheSrc?.json?.contact?.address && lienheSrc.json.contact.address !== 'null') {
    Object.assign(allData.contact, lienheSrc.json.contact);
  }
  // Hardcode fallback if crawl missed it
  if (!allData.contact.address || allData.contact.address === 'null') {
    allData.contact.address = '107 Đ. Lê Đình Dương, Nam Dương, Q. Hải Châu, Đà Nẵng';
  }
  if (!allData.contact.email || allData.contact.email === 'null') {
    allData.contact.email = 'tiembanhvani.com@gmail.com';
  }
  if (!allData.contact.zalo || allData.contact.zalo.startsWith('https')) {
    allData.contact.zalo = '0935226206';
  }

  // Policies defaults
  allData.policies = {
    order_lead_time: allData.policies?.order_lead_time && allData.policies.order_lead_time !== 'null'
      ? allData.policies.order_lead_time : '1-2 ngày',
    delivery: allData.policies?.delivery && allData.policies.delivery !== 'null'
      ? allData.policies.delivery : 'Nội thành Đà Nẵng, liên hệ để biết phí ship',
    deposit: allData.policies?.deposit && allData.policies.deposit !== 'null'
      ? allData.policies.deposit : '50% giá bánh',
  };

  const outPath = path.join(ROOT, 'data/structured/vani-products.json');
  fs.writeFileSync(outPath, JSON.stringify(allData, null, 2), 'utf8');

  console.log(`✓ ${allData.products.length} products total → ${outPath}`);
  return allData;
}

// ─────────────────────────────────────────────
// TASK 3: Transform → src/data/knowledgeBase.js
// ─────────────────────────────────────────────
function buildFaqs(data) {
  const { products, contact, categories, policies } = data;

  const phone = contact?.phone ?? contact?.zalo ?? '(liên hệ cửa hàng)';
  const address = contact?.address ?? 'tiembanhvani.com';
  const leadTime = policies?.order_lead_time ?? '1-2 ngày';
  const deposit = policies?.deposit ?? '50% giá bánh';
  const delivery = policies?.delivery ?? 'trong thành phố';

  // Build category list string
  const catList = categories.length
    ? categories.map((c, i) => `${i + 1}. ${c}`).join('\n')
    : '(xem tại tiembanhvani.com)';

  // Build product list for FAQ answers
  const productSummary =
    products.length > 0
      ? products
          .slice(0, 8)
          .map((p) => `- **${p.name}**${p.price_range ? `: ${p.price_range}` : ''}`)
          .join('\n')
      : '(xem tại tiembanhvani.com)';

  // Cake categories from products
  const cakeKem = products.filter((p) =>
    /kem|birthday|sinh nhật/i.test(`${p.name} ${p.category}`)
  );
  const cakeMousse = products.filter((p) => /mousse|cheese/i.test(`${p.name} ${p.category}`));
  const cakeDaily = products.filter((p) =>
    /ngày|daily|hằng ngày|mỗi ngày/i.test(`${p.name} ${p.category}`)
  );

  const faqs = [
    // ── Chào hỏi ──────────────────────────────────────────────
    {
      question: 'Xin chào',
      answer: `👋 **Xin chào! Chào mừng đến với Tiệm Bánh Vani!**\n\nMình có thể giúp bạn:\n🎂 Tư vấn bánh kem sinh nhật\n🧁 Bánh mousse & cheese cake\n🍰 Bánh ngọt hàng ngày\n📦 Cách đặt hàng & giao hàng\n\nBạn cần gì nào?`,
      keywords: ['chào', 'hello', 'hi', 'xin chào', 'hey', 'alo', 'bạn là ai'],
    },

    // ── Giới thiệu ────────────────────────────────────────────
    {
      question: 'Tiệm Bánh Vani là gì',
      answer: `🏪 **Tiệm Bánh Vani** là tiệm bánh handmade chuyên:\n- 🎂 Bánh kem sinh nhật theo yêu cầu\n- 🧁 Mousse & cheese cake\n- 🍰 Bánh ngọt hàng ngày\n\n📍 ${address}\n📱 ${phone}\n\nTất cả bánh được làm tươi, nguyên liệu chất lượng!`,
      keywords: ['vani', 'tiệm bánh', 'giới thiệu', 'about', 'là gì', 'cửa hàng'],
    },

    // ── Sản phẩm ──────────────────────────────────────────────
    {
      question: 'Tiệm Bánh Vani có những loại bánh nào',
      answer: `🎂 **CÁC LOẠI BÁNH TẠI TIỆM BÁNH VANI**\n\n${catList}\n\n💡 Xem chi tiết tại: tiembanhvani.com`,
      keywords: ['loại bánh', 'có bánh gì', 'menu', 'danh mục', 'sản phẩm', 'bánh nào'],
    },
    {
      question: 'Xem danh sách sản phẩm',
      answer: `📋 **MỘT SỐ SẢN PHẨM NỔI BẬT**\n\n${productSummary}\n\n📱 Chat để hỏi thêm về sản phẩm cụ thể!\n📞 ${phone}`,
      keywords: ['sản phẩm', 'product', 'danh sách', 'liệt kê', 'tất cả bánh'],
    },

    // ── Bánh kem ──────────────────────────────────────────────
    {
      question: 'Bánh kem sinh nhật có những loại gì',
      answer:
        cakeKem.length > 0
          ? `🎂 **BÁNH KEM SINH NHẬT VANI**\n\n${cakeKem.map((p) => `- **${p.name}**${p.price_range ? ` — ${p.price_range}` : ''}${p.description ? `\n  ${p.description}` : ''}`).join('\n')}\n\n📅 Đặt trước **${leadTime}** nha!\n📱 ${phone}`
          : `🎂 **BÁNH KEM SINH NHẬT VANI**\n\nVani có nhiều loại bánh kem đẹp, thiết kế theo yêu cầu!\n\n📅 Đặt trước **${leadTime}**\n📱 Liên hệ: ${phone} để xem menu đầy đủ`,
      keywords: ['bánh kem', 'bánh sinh nhật', 'kem sinh nhật', 'birthday cake', 'kem'],
    },
    {
      question: 'Bánh kem thiết kế theo yêu cầu được không',
      answer: `✨ **BÁNH KEM THIẾT KẾ THEO YÊU CẦU**\n\nCó! Vani làm bánh theo concept riêng của bạn:\n- Màu sắc tùy chọn\n- Hình vẽ, nhân vật yêu thích\n- Chữ viết theo ý\n- Hoa fondant, decor đặc biệt\n\n📅 Đặt trước **${leadTime}** (custom cần sớm hơn)\n📱 Gửi ảnh mẫu qua: ${phone}`,
      keywords: ['thiết kế', 'custom', 'theo yêu cầu', 'ý muốn', 'hình ảnh', 'mẫu riêng'],
    },
    {
      question: 'Bánh kem có những vị gì',
      answer: `🍰 **VỊ BÁNH KEM PHỔ BIẾN TẠI VANI**\n\n- 🍫 Socola\n- 🍓 Dâu tây\n- 🥭 Xoài\n- 🍵 Trà xanh matcha\n- 🧁 Vanilla\n- 🥥 Dừa\n- 🍊 Cam chanh\n\n📱 Hỏi thêm về vị tại: ${phone}`,
      keywords: ['vị bánh', 'hương vị', 'flavor', 'socola', 'dâu', 'matcha', 'vị gì'],
    },

    // ── Mousse & Cheese cake ───────────────────────────────────
    {
      question: 'Bánh mousse và cheese cake tại Vani',
      answer:
        cakeMousse.length > 0
          ? `🧁 **MOUSSE & CHEESE CAKE VANI**\n\n${cakeMousse.map((p) => `- **${p.name}**${p.price_range ? ` — ${p.price_range}` : ''}`).join('\n')}\n\nMousse mát lạnh, nhẹ nhàng, phù hợp mọi dịp!\n📱 ${phone}`
          : `🧁 **MOUSSE & CHEESE CAKE VANI**\n\nVani có các loại mousse mát lạnh, nhẹ, không ngán:\n- Mousse socola\n- Mousse trái cây (dâu, xoài, cam)\n- Cheese cake New York\n- Cheese cake Nhật\n\n📱 Hỏi chi tiết: ${phone}`,
      keywords: ['mousse', 'cheese cake', 'cheesecake', 'mát', 'lạnh', 'nhẹ'],
    },
    {
      question: 'Cheese cake Vani ngon không',
      answer: `🍰 **CHEESE CAKE TẠI VANI**\n\nCó! Cheese cake Vani được làm từ cream cheese chất lượng, vỏ cookie giòn:\n\n- **Cheese cake New York style** — đậm đà, dense\n- **Cheese cake Nhật** — mềm mịn, nhẹ hơn\n- **No-bake cheese cake** — mát lạnh, frothy\n\n📱 Hỏi giá & đặt: ${phone}`,
      keywords: ['cheese cake', 'cheesecake', 'phô mai', 'cream cheese'],
    },

    // ── Bánh ngọt hàng ngày ───────────────────────────────────
    {
      question: 'Bánh ngọt hàng ngày có gì',
      answer:
        cakeDaily.length > 0
          ? `🍰 **BÁNH NGỌT HẰNG NGÀY**\n\n${cakeDaily.map((p) => `- **${p.name}**${p.price_range ? ` — ${p.price_range}` : ''}`).join('\n')}\n\n📍 Có sẵn tại: ${address}`
          : `🍰 **BÁNH NGỌT HẰNG NGÀY**\n\nVani có các loại bánh ngọt phù hợp ăn hàng ngày:\n- Bánh cupcake\n- Bánh tart\n- Bánh bông lan\n- Cookie, brownie\n\n📍 ${address}\n📱 ${phone}`,
      keywords: ['bánh ngọt', 'hàng ngày', 'mỗi ngày', 'daily', 'cupcake', 'tart', 'cookie'],
    },
    {
      question: 'Cupcake tại Vani giá bao nhiêu',
      answer: `🧁 **CUPCAKE VANI**\n\nCupcake nhỏ xinh, đủ màu sắc, thích hợp làm quà!\n\n📱 Hỏi giá & đặt số lượng: ${phone}\n\n💡 Đặt từ 6 cái trở lên thường có ưu đãi nha!`,
      keywords: ['cupcake', 'cup cake', 'bánh nhỏ', 'bánh nhỏ xinh'],
    },

    // ── Giá bánh ──────────────────────────────────────────────
    {
      question: 'Giá bánh kem tại Vani bao nhiêu',
      answer: `💰 **GIÁ BÁNH KEM VANI**\n\nGiá phụ thuộc vào size, thiết kế và loại bánh.\n\n📱 Nhắn tin để nhận báo giá chi tiết: ${phone}\n\n💡 Vani có nhiều mức giá phù hợp mọi ngân sách!`,
      keywords: ['giá', 'bao nhiêu', 'price', 'mấy tiền', 'phí', 'chi phí', 'bảng giá'],
    },
    {
      question: 'Bánh Vani đắt không',
      answer: `💰 **GIÁ CẢ PHỢ HỢP TẠI VANI**\n\nVani có nhiều mức giá phù hợp:\n- Bánh ngọt hàng ngày: giá bình dân\n- Bánh kem basic: tầm trung\n- Bánh custom/thiết kế riêng: theo độ phức tạp\n\n📱 Chat để nhận tư vấn & báo giá: ${phone}`,
      keywords: ['đắt', 'rẻ', 'giá cả', 'tầm tiền', 'affordable', 'budget'],
    },

    // ── Đặt hàng ──────────────────────────────────────────────
    {
      question: 'Cách đặt bánh tại Vani',
      answer: `📦 **CÁCH ĐẶT BÁNH VANI**\n\n**Bước 1:** Liên hệ Vani qua:\n📱 ${phone}\n\n**Bước 2:** Chọn loại bánh, size, thiết kế\n\n**Bước 3:** Đặt cọc ${deposit}\n\n**Bước 4:** Nhận bánh đúng ngày!\n\n💡 Đặt trước ${leadTime} để đảm bảo có bánh đẹp!`,
      keywords: ['đặt hàng', 'order', 'cách đặt', 'làm sao', 'mua bánh', 'đặt bánh'],
    },
    {
      question: 'Đặt cọc bao nhiêu khi đặt bánh Vani',
      answer: `💳 **CHÍNH SÁCH ĐẶT CỌC**\n\n- Đặt cọc: **${deposit}**\n- Phần còn lại thanh toán khi nhận bánh\n\n📱 Liên hệ để biết cách chuyển khoản: ${phone}`,
      keywords: ['cọc', 'đặt cọc', 'thanh toán', 'trả tiền', 'chuyển khoản', 'deposit'],
    },
    {
      question: 'Đặt bánh trước bao lâu',
      answer: `⏰ **THỜI GIAN ĐẶT TRƯỚC**\n\n- Bánh thông thường: **${leadTime}**\n- Bánh custom/thiết kế riêng: cần thêm thời gian\n- Bánh cưới & sự kiện lớn: **1-2 tuần trước**\n\n📌 Đặt sớm để đảm bảo có bánh đẹp theo ý!`,
      keywords: ['đặt trước', 'bao lâu', 'thời gian làm', 'lead time', 'bao nhiêu ngày'],
    },
    {
      question: 'Có thể đặt bánh gấp không',
      answer: `⚡ **ĐẶT BÁNH GẤP**\n\nLiên hệ ngay để hỏi bánh có sẵn:\n📱 ${phone}\n\nNếu có nguyên liệu sẵn, Vani sẽ cố gắng hỗ trợ!\nTuy nhiên đặt trước ${leadTime} sẽ đảm bảo chất lượng tốt nhất.`,
      keywords: ['gấp', 'khẩn', 'hôm nay', 'ngay', 'cần gấp', 'urgent'],
    },

    // ── Giao hàng ─────────────────────────────────────────────
    {
      question: 'Vani có giao hàng không',
      answer: `🚗 **GIAO HÀNG**\n\n${delivery}\n\n📱 Hỏi phí ship cụ thể: ${phone}\n\n💡 Đặt sớm để sắp xếp giờ giao phù hợp!`,
      keywords: ['giao hàng', 'ship', 'delivery', 'giao tận nơi', 'có giao không'],
    },
    {
      question: 'Phí giao hàng bao nhiêu',
      answer: `💵 **PHÍ GIAO HÀNG**\n\nPhí ship phụ thuộc vào khoảng cách và khu vực.\n\n📱 Nhắn địa chỉ để Vani báo phí ship chính xác: ${phone}`,
      keywords: ['phí ship', 'tiền ship', 'free ship', 'miễn phí giao', 'ship fee'],
    },
    {
      question: 'Giao hàng mấy giờ',
      answer: `⏰ **THỜI GIAN GIAO HÀNG**\n\nKhi đặt bạn cho Vani biết **khung giờ mong muốn** nhé!\nVani sẽ sắp xếp giao đúng giờ.\n\n📱 ${phone}`,
      keywords: ['giao mấy giờ', 'giờ giao', 'sáng', 'chiều', 'tối', 'thời gian giao'],
    },

    // ── Theo dịp ──────────────────────────────────────────────
    {
      question: 'Bánh sinh nhật đẹp tại Vani',
      answer: `🎂 **BÁNH SINH NHẬT VANI**\n\nVani chuyên làm bánh sinh nhật đẹp theo yêu cầu:\n- Thiết kế theo sở thích người nhận\n- Màu sắc, chữ viết tùy chọn\n- Nhiều size từ nhỏ đến lớn\n\n📅 Đặt trước ${leadTime}\n📱 ${phone}`,
      keywords: ['sinh nhật', 'birthday', 'bánh sinh nhật', 'tặng sinh nhật'],
    },
    {
      question: 'Bánh cưới tại Vani',
      answer: `💒 **BÁNH CƯỚI VANI**\n\nVani làm bánh cưới theo concept của bạn:\n- Nhiều tầng sang trọng\n- Thiết kế hoa, ribbon theo ý\n- Màu sắc đồng bộ với tông cưới\n\n📅 Đặt trước **1-2 tuần**\n📱 Tư vấn: ${phone}`,
      keywords: ['cưới', 'wedding', 'bánh cưới', 'đám cưới', 'hôn lễ'],
    },
    {
      question: 'Bánh cho sự kiện công ty',
      answer: `🏢 **BÁNH SỰ KIỆN / CÔNG TY**\n\nVani nhận đơn bánh cho:\n- Tiệc sinh nhật công ty\n- Khai trương, kỷ niệm\n- Tiệc cuối năm, team building\n\n📦 Có thể đặt số lượng lớn\n📱 Hỏi báo giá: ${phone}`,
      keywords: ['sự kiện', 'công ty', 'event', 'khai trương', 'kỷ niệm', 'tiệc'],
    },
    {
      question: 'Đặt bánh làm quà tặng',
      answer: `🎁 **BÁNH LÀM QUÀ TẶNG**\n\nBánh Vani là quà tặng ý nghĩa cho:\n- Sinh nhật bạn bè, người thân\n- Cảm ơn, xin lỗi\n- Quà tặng dịp lễ\n\n📦 Có hộp đóng gói đẹp!\n📱 ${phone}`,
      keywords: ['quà tặng', 'gift', 'tặng', 'quà', 'present'],
    },

    // ── Liên hệ & địa chỉ ────────────────────────────────────
    {
      question: 'Liên hệ Tiệm Bánh Vani như thế nào',
      answer: `📱 **LIÊN HỆ TIỆM BÁNH VANI**\n\n${contact?.phone ? `📞 ${contact.phone}` : ''}\n${contact?.zalo ? `💬 Zalo: ${contact.zalo}` : ''}\n${contact?.email ? `📧 ${contact.email}` : ''}\n📍 ${address}\n\n🌐 tiembanhvani.com`,
      keywords: ['liên hệ', 'contact', 'số điện thoại', 'zalo', 'phone', 'gọi', 'nhắn'],
    },
    {
      question: 'Địa chỉ Tiệm Bánh Vani ở đâu',
      answer: `📍 **ĐỊA CHỈ TIỆM BÁNH VANI**\n\n${address}\n\n📱 ${phone}\n🌐 tiembanhvani.com`,
      keywords: ['địa chỉ', 'ở đâu', 'chỗ', 'đường', 'vị trí', 'location', 'address'],
    },
    {
      question: 'Giờ mở cửa Vani',
      answer: `🕐 **GIỜ MỞ CỬA TIỆM BÁNH VANI**\n\nLiên hệ để biết giờ hoạt động chính xác:\n📱 ${phone}\n🌐 tiembanhvani.com`,
      keywords: ['giờ mở cửa', 'opening hours', 'mấy giờ', 'làm việc', 'giờ làm'],
    },

    // ── Chất lượng & nguyên liệu ─────────────────────────────
    {
      question: 'Bánh Vani làm từ nguyên liệu gì',
      answer: `🌿 **NGUYÊN LIỆU BÁNH VANI**\n\nVani cam kết dùng nguyên liệu:\n- Tươi, nhập hàng ngày\n- Không chất bảo quản độc hại\n- Kem tươi, bơ sữa chất lượng\n- Trái cây tươi theo mùa\n\n💡 Bánh làm theo đặt hàng, đảm bảo độ tươi!\n📱 ${phone}`,
      keywords: ['nguyên liệu', 'ingredient', 'tươi', 'an toàn', 'chất lượng', 'bảo quản'],
    },
    {
      question: 'Bánh Vani bảo quản bao lâu',
      answer: `🧊 **BẢO QUẢN BÁNH VANI**\n\n- **Bánh kem tươi:** 1-2 ngày trong tủ lạnh\n- **Mousse & cheese cake:** 2-3 ngày trong tủ lạnh\n- **Bánh ngọt khô:** 3-5 ngày\n\n💡 Nên ăn trong ngày để ngon nhất!\n📱 Hỏi thêm: ${phone}`,
      keywords: ['bảo quản', 'để được', 'hạn dùng', 'tủ lạnh', 'storage', 'để lâu'],
    },
  ];

  return faqs;
}

async function task3_buildKnowledgeBase(structuredData) {
  console.log('\n=== TASK 3: Building knowledge base ===');

  const { products, contact, categories } = structuredData;
  const faqs = buildFaqs(structuredData);

  const knowledgeBase = {
    products,
    faqs,
    contact,
    categories,
  };

  const outPath = path.join(ROOT, 'src/data/knowledgeBase.js');
  const fileContent = `// Tiệm Bánh Vani - Knowledge Base
// Auto-generated by scripts/crawl-vani.js from tiembanhvani.com
// DO NOT edit manually — re-run the crawl script to update.

export const knowledgeBase = ${JSON.stringify(knowledgeBase, null, 2)};

export default knowledgeBase;
`;

  fs.writeFileSync(outPath, fileContent, 'utf8');

  console.log(`✓ ${products.length} products`);
  console.log(`✓ ${faqs.length} FAQs`);
  console.log(`✓ ${categories.length} categories`);
  console.log(`✓ Written → ${outPath}`);

  return knowledgeBase;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not set. Run with: node --env-file=.env scripts/crawl-vani.js');
    process.exit(1);
  }

  console.log('🚀 Starting Vani crawl pipeline...');
  const startTime = Date.now();

  try {
    await task1_crawl();
    const structuredData = await task2_scrapeStructured();
    const kb = await task3_buildKnowledgeBase(structuredData);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done in ${elapsed}s`);
    console.log(`   Products extracted: ${kb.products.length}`);
    console.log(`   FAQs generated:     ${kb.faqs.length}`);
    console.log(`   Categories:         ${kb.categories.length}`);
  } catch (err) {
    console.error('\n❌ Pipeline failed:', err.message);
    process.exit(1);
  }
}

main();
