/**
 * Lịch Việt — cấu hình kết nối Google Sheets
 *
 * Bạn KHÔNG bắt buộc phải sửa file này: mở website, bấm nút "Sheets" trên
 * thanh trên cùng và dán URL + token vào đó (được lưu trong localStorage).
 *
 * File này chỉ dùng để đặt giá trị mặc định cho mọi máy/trình duyệt, ví dụ
 * khi bạn deploy lên hosting riêng.
 *
 * endpoint : URL Web App, luôn kết thúc bằng /exec
 *            (Apps Script → Deploy → New deployment → Web app)
 * token    : API_TOKEN in ra ở Execution log khi chạy hàm setup()
 * autoSync : true  = tự tải dữ liệu khi mở trang
 * pollSeconds : tự tải lại mỗi N giây (0 = tắt)
 */
window.LICH_VIET_SHEETS = {
  endpoint: "",
  token: "",
  autoSync: true,
  pollSeconds: 120,
};
