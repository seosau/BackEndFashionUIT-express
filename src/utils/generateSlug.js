const convertToSlug = function (text) {
  // Chuyển đổi các ký tự tiếng Việt sang Latin
  const slug = text
    .toLowerCase()
    .normalize("NFD") // Sử dụng Unicode Normalization Form D (NFD) để phân tách ký tự đặc biệt thành các ký tự cơ bản và dấu phụ
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu thanh từ các ký tự
    .replace(/đ/g, "d") // Thay thế ký tự 'đ' với 'd'
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ các ký tự không phải chữ cái, số, dấu cách, hoặc dấu gạch ngang
    .replace(/\s+/g, "-") // Thay thế dấu cách bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa các dấu gạch ngang liên tiếp
    .trim(); // Xóa khoảng trắng ở đầu và cuối chuỗi
  return slug;
};

module.exports = convertToSlug;
