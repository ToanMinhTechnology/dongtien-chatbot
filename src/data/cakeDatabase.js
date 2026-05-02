/**
 * cakeDatabase.js
 * Nguồn: crawl thực tế từ dongtienbakery.com.vn/san-pham/cream-cake
 * Cập nhật: 2026-04-27
 *
 * availability:
 *   "in-store"      — bánh có sẵn tại cửa hàng, giao ngay
 *   "factory"       — bánh có sẵn tại xưởng, cần vận chuyển về cửa hàng trước
 *   "custom-order"  — bánh đặt ngoài, cần 3h làm + theo ca bếp
 *
 * Quy tắc ưu tiên (từ tài liệu nghiệp vụ DOTICOM):
 *   Nếu bánh có ở cả cửa hàng VÀ xưởng → ưu tiên cửa hàng gần nhất
 *   Lý do: xuất hàng có hạn sử dụng nhỏ hơn trước
 */

export const CAKE_DATABASE = [

  // ─── NHÓM 1: BÁNH KEM THIẾU NHI (6 sản phẩm) ───
  // Availability: in-store (bánh kem thiếu nhi thường có sẵn tại cửa hàng)
  {
    id: "1S3-011",
    name: "Bánh kem sữa tươi 1S3-011",
    category: "banh-kem-thieu-nhi",
    categoryLabel: "Bánh kem thiếu nhi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 170000,
    availability: "in-store",
    occasions: ["sinh-nhat-tre-em", "sinh-nhat"],
    keywords: ["thiếu nhi", "trẻ em", "sữa tươi", "động vật dễ thương"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1S3-011-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/fresh-cream-cake/273-cute-animal-cream-cake_374",
    note: "Trang trí động vật cute"
  },
  {
    id: "1S3-023",
    name: "Bánh kem sữa tươi 1S3-023",
    category: "banh-kem-thieu-nhi",
    categoryLabel: "Bánh kem thiếu nhi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 155000,
    availability: "in-store",
    occasions: ["sinh-nhat-tre-em", "sinh-nhat"],
    keywords: ["thiếu nhi", "trẻ em", "sữa tươi"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1S3-023-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/fresh-cream-cake/607-1s3-023"
  },
  {
    id: "1S3-024",
    name: "Bánh kem sữa tươi 1S3-024",
    category: "banh-kem-thieu-nhi",
    categoryLabel: "Bánh kem thiếu nhi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 155000,
    availability: "in-store",
    occasions: ["sinh-nhat-tre-em", "sinh-nhat"],
    keywords: ["thiếu nhi", "trẻ em", "sữa tươi"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1S3-024-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/fresh-cream-cake/608-1s3-024"
  },
  {
    id: "1ST3-008",
    name: "Bánh kem sữa tươi 1ST3-008",
    category: "banh-kem-thieu-nhi",
    categoryLabel: "Bánh kem thiếu nhi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 155000,
    availability: "in-store",
    occasions: ["sinh-nhat-tre-em", "sinh-nhat"],
    keywords: ["thiếu nhi", "trẻ em", "sữa tươi"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1ST3-008-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/fresh-cream-cake/609-1st3-008"
  },
  {
    id: "1ST3-029",
    name: "Bánh kem sữa tươi 1ST3-029",
    category: "banh-kem-thieu-nhi",
    categoryLabel: "Bánh kem thiếu nhi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 140000,
    availability: "in-store",
    occasions: ["sinh-nhat-tre-em", "sinh-nhat"],
    keywords: ["thiếu nhi", "trẻ em", "sữa tươi", "giá rẻ"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1ST3-029-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/fresh-cream-cake/610-1st3-029"
  },
  {
    id: "A1ST4-001",
    name: "Bánh kem sữa tươi A1ST4-001",
    category: "banh-kem-thieu-nhi",
    categoryLabel: "Bánh kem thiếu nhi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 240000,
    availability: "in-store",
    occasions: ["sinh-nhat-tre-em", "sinh-nhat"],
    keywords: ["thiếu nhi", "trẻ em", "sữa tươi", "size lớn"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/A1ST4-001-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/fresh-cream-cake/611-a1st4-001",
    note: "Size 4 — phù hợp tiệc đông người"
  },

  // ─── NHÓM 2: BÁNH KEM SỮA TƯƠI (2 sản phẩm) ───
  // Availability: in-store
  {
    id: "1ST3-004",
    name: "Bánh kem sữa tươi 1ST3-004",
    category: "banh-kem-sua-tuoi",
    categoryLabel: "Bánh kem sữa tươi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 95000,
    availability: "in-store",
    occasions: ["sinh-nhat", "hang-ngay"],
    keywords: ["sữa tươi", "giá rẻ", "sinh nhật", "hàng ngày"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/BKST_w-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/cream-cake for girl/721-banh-kem-sua-tuoi-1st3-004"
  },
  {
    id: "1ST3-041",
    name: "Bánh kem sữa tươi 1ST3-041",
    category: "banh-kem-sua-tuoi",
    categoryLabel: "Bánh kem sữa tươi",
    flavor: "sua-tuoi",
    flavorLabel: "Sữa tươi",
    price: 95000,
    availability: "in-store",
    occasions: ["sinh-nhat", "hang-ngay"],
    keywords: ["sữa tươi", "giá rẻ", "sinh nhật"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1ST3-041-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/cream-cake for girl/banh-kem-1ST3-041"
  },

  // ─── NHÓM 3: BÁNH KEM TIRAMISU (3 sản phẩm) ───
  // Availability: factory (tiramisu thường làm theo đơn từ xưởng)
  {
    id: "1TIS-003",
    name: "Bánh Tiramisu 1TIS-003",
    category: "banh-kem-tiramisu",
    categoryLabel: "Bánh kem Tiramisu",
    flavor: "tiramisu",
    flavorLabel: "Tiramisu",
    price: 185000,
    availability: "factory",
    occasions: ["sinh-nhat", "ky-niem", "tang-qua"],
    keywords: ["tiramisu", "cà phê", "sinh nhật người lớn", "tặng quà"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1TIS-003-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/tiramisu/272-tiramisu-cake_373"
  },
  {
    id: "1TIS-004",
    name: "Bánh Tiramisu 1TIS-004",
    category: "banh-kem-tiramisu",
    categoryLabel: "Bánh kem Tiramisu",
    flavor: "tiramisu",
    flavorLabel: "Tiramisu",
    price: 185000,
    availability: "factory",
    occasions: ["sinh-nhat", "ky-niem", "tang-qua"],
    keywords: ["tiramisu", "cà phê", "sinh nhật người lớn", "tặng quà"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/Tiramisu-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/tiramisu/Tiramisu-1TIS-004"
  },
  {
    id: "1TIT-008",
    name: "Bánh Tiramisu 1TIT-008",
    category: "banh-kem-tiramisu",
    categoryLabel: "Bánh kem Tiramisu",
    flavor: "tiramisu",
    flavorLabel: "Tiramisu",
    price: 210000,
    availability: "factory",
    occasions: ["sinh-nhat", "ky-niem", "tang-qua"],
    keywords: ["tiramisu", "cà phê", "chanh dây", "sinh nhật người lớn"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1TIT-008-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/tiramisu/399-passion-fruit-cream-cake_416",
    note: "Vị đặc biệt — tiramisu kết hợp chanh dây"
  },

  // ─── NHÓM 4: BÁNH KEM CHANH DÂY (2 sản phẩm) ───
  // Availability: factory
  {
    id: "1CDS-004",
    name: "Bánh kem Phô mai chanh dây 1CDS-004",
    category: "banh-kem-chanh-day",
    categoryLabel: "Bánh kem chanh dây",
    flavor: "pho-mai-chanh-day",
    flavorLabel: "Phô mai chanh dây",
    price: 185000,
    availability: "factory",
    occasions: ["sinh-nhat", "ky-niem", "tang-qua"],
    keywords: ["chanh dây", "phô mai", "cheese", "chua ngọt", "sinh nhật người lớn"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/1CDS-004-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/adasdasd/397-passion-fruit-cream-cake_410"
  },
  {
    id: "1CDS-005",
    name: "Bánh kem phô mai chanh dây 1CDS-005",
    category: "banh-kem-chanh-day",
    categoryLabel: "Bánh kem chanh dây",
    flavor: "pho-mai-chanh-day",
    flavorLabel: "Phô mai chanh dây",
    price: 185000,
    availability: "factory",
    occasions: ["sinh-nhat", "ky-niem", "tang-qua"],
    keywords: ["chanh dây", "phô mai", "cheese", "chua ngọt"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/417-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/adasdasd/398-passion-fruit-cream-cake_417"
  },

  // ─── NHÓM 5: BÁNH KEM RAU CÂU (5 sản phẩm) ───
  // Availability: mix — size nhỏ (1RCS) in-store, size lớn (3RCS) factory
  {
    id: "1RCS-001",
    name: "Bánh kem rau câu 1RCS-001",
    category: "banh-kem-rau-cau",
    categoryLabel: "Bánh kem rau câu",
    flavor: "rau-cau",
    flavorLabel: "Rau câu",
    price: 195000,
    availability: "in-store",
    occasions: ["sinh-nhat", "hang-ngay"],
    keywords: ["rau câu", "mát lạnh", "hải sản", "sinh nhật mùa hè"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/raucau_471-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/seaweed-cream-cake/411-banh-kem-rau-cau_471",
    note: "Size 1 — phù hợp 4-6 người"
  },
  {
    id: "1RCS-002",
    name: "Bánh kem rau câu 1RCS-002",
    category: "banh-kem-rau-cau",
    categoryLabel: "Bánh kem rau câu",
    flavor: "rau-cau",
    flavorLabel: "Rau câu",
    price: 195000,
    availability: "in-store",
    occasions: ["sinh-nhat", "hang-ngay"],
    keywords: ["rau câu", "mát lạnh", "sinh nhật mùa hè"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/raucau_469-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/seaweed-cream-cake/286-gracilaria-ice-cream-cake"
  },
  {
    id: "1RCS-003",
    name: "Bánh kem rau câu 1RCS-003",
    category: "banh-kem-rau-cau",
    categoryLabel: "Bánh kem rau câu",
    flavor: "rau-cau",
    flavorLabel: "Rau câu",
    price: 195000,
    availability: "in-store",
    occasions: ["sinh-nhat", "hang-ngay"],
    keywords: ["rau câu", "mát lạnh", "sinh nhật mùa hè"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/raucau_470-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/seaweed-cream-cake/410-banh-kem-rau-cau_470"
  },
  {
    id: "3RCS-001",
    name: "Bánh kem rau câu 3RCS-001",
    category: "banh-kem-rau-cau",
    categoryLabel: "Bánh kem rau câu",
    flavor: "rau-cau",
    flavorLabel: "Rau câu",
    price: 250000,
    availability: "factory",
    occasions: ["sinh-nhat", "tiec-dong-nguoi"],
    keywords: ["rau câu", "size lớn", "tiệc", "đông người"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/raucau_468-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/seaweed-cream-cake/287-gracilaria-ice-cream-cake",
    note: "Size 3 — phù hợp 10-15 người"
  },
  {
    id: "3RCS-002",
    name: "Bánh kem rau câu 3RCS-002",
    category: "banh-kem-rau-cau",
    categoryLabel: "Bánh kem rau câu",
    flavor: "rau-cau",
    flavorLabel: "Rau câu",
    price: 250000,
    availability: "factory",
    occasions: ["sinh-nhat", "tiec-dong-nguoi"],
    keywords: ["rau câu", "size lớn", "tiệc", "đông người"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/raucau_472-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/seaweed-cream-cake/409-banh-kem-rau-cau_472",
    note: "Size 3 — phù hợp 10-15 người"
  },

  // ─── NHÓM 6: BÁNH KEM SET NHIỀU VỊ (2 sản phẩm) ───
  // Availability: factory (set đặc biệt)
  {
    id: "SET-9HU",
    name: "Bánh kem Set Nhiều Vị (9 hũ)",
    category: "banh-kem-set",
    categoryLabel: "Bánh kem set nhiều vị",
    flavor: "nhieu-vi",
    flavorLabel: "Nhiều vị",
    price: 180000,
    availability: "factory",
    occasions: ["sinh-nhat", "tang-qua", "tiec-nhom"],
    keywords: ["set", "nhiều vị", "hũ", "đa dạng", "tặng quà", "tiệc nhóm", "9 người"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/Set 9 hur-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/Bánh kem set nhiều vị/592-banh-kem-set-nhieu-vi-(9-hu)",
    note: "9 hũ bánh kem với nhiều vị khác nhau — phù hợp nhóm nhỏ"
  },
  {
    id: "SET-16HU",
    name: "Bánh kem Set Nhiều Vị (16 hũ)",
    category: "banh-kem-set",
    categoryLabel: "Bánh kem set nhiều vị",
    flavor: "nhieu-vi",
    flavorLabel: "Nhiều vị",
    price: 295000,
    availability: "factory",
    occasions: ["sinh-nhat", "tang-qua", "tiec-nhom", "tiec-cong-ty"],
    keywords: ["set", "nhiều vị", "hũ", "đa dạng", "tặng quà", "tiệc", "16 người", "công ty"],
    imageUrl: "https://dongtienbakery.com.vn/image/cache/data/Product_Bánh kem/2026/set 16 hu-370x253f.jpg",
    productUrl: "http://dongtienbakery.com.vn/san-pham/cream-cake/Bánh kem set nhiều vị/593-banh-kem-banh-kem-set-nhieu-vi-(16-hu)",
    note: "16 hũ bánh kem với nhiều vị khác nhau — phù hợp tiệc công ty, nhóm lớn"
  }
];

// ─── HELPERS ───────────────────────────────────────────────

/**
 * Lấy tất cả bánh theo availability
 * @param {"in-store"|"factory"|"custom-order"} type
 */
export function getCakesByAvailability(type) {
  return CAKE_DATABASE.filter(c => c.availability === type);
}

/**
 * Tìm bánh theo từ khóa (tên, keyword, vị, dịp)
 * @param {string} query — mô tả từ khách hàng
 * @returns {Array} danh sách bánh phù hợp, sắp xếp theo relevance
 */
export function searchCakes(query) {
  const q = query.toLowerCase();
  return CAKE_DATABASE
    .map(cake => {
      let score = 0;
      if (cake.name.toLowerCase().includes(q)) score += 10;
      if (cake.flavorLabel.toLowerCase().includes(q)) score += 8;
      if (cake.categoryLabel.toLowerCase().includes(q)) score += 6;
      if (cake.keywords.some(k => q.includes(k) || k.includes(q))) score += 5;
      if (cake.occasions.some(o => q.includes(o))) score += 4;
      if (cake.note && cake.note.toLowerCase().includes(q)) score += 3;
      return { ...cake, _score: score };
    })
    .filter(c => c._score > 0)
    .sort((a, b) => b._score - a._score);
}

/**
 * Lấy bánh có sẵn (in-store + factory), sắp xếp ưu tiên in-store trước
 * Dùng khi khách cần giao nhanh
 */
export function getAvailableCakes() {
  const inStore  = CAKE_DATABASE.filter(c => c.availability === "in-store");
  const factory  = CAKE_DATABASE.filter(c => c.availability === "factory");
  return [...inStore, ...factory];
}

/**
 * Tìm bánh tương tự (cùng category hoặc giá gần nhau) khi bánh khách muốn không có
 * @param {string} cakeId
 * @param {"in-store"|"factory"} preferredAvailability
 */
export function getSimilarCakes(cakeId, preferredAvailability = "in-store") {
  const target = CAKE_DATABASE.find(c => c.id === cakeId);
  if (!target) return [];
  return CAKE_DATABASE
    .filter(c =>
      c.id !== cakeId &&
      (c.category === target.category || Math.abs(c.price - target.price) <= 50000)
    )
    .sort((a, b) => {
      // Ưu tiên theo availability
      const aScore = a.availability === preferredAvailability ? 1 : 0;
      const bScore = b.availability === preferredAvailability ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 3);
}

export default CAKE_DATABASE;
