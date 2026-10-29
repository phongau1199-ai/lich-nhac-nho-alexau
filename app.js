"use strict";

const STORAGE_KEY = "lich-viet.events.v1";
const NOTIFICATION_KEY = "lich-viet.notifications.v1";
const EVENTS_RESET_KEY = "lich-viet.events-reset.v1";
const EVENTS_RESET_VERSION = "2026-10-29";
const LANGUAGE_KEY = "lich-viet.language.v1";
const TIME_ZONE = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
let language = "vi";
try {
  language = localStorage.getItem(LANGUAGE_KEY) === "zh" ? "zh" : "vi";
} catch {
  language = "vi";
}

const I18N = {
  vi: {
    documentTitle: "Lịch Việt — Nhịp ngày, trọn tháng",
    metaDescription: "Lịch Việt - quản lý ngày sự kiện, nhắc nhở và xem lịch âm dương.",
    skipLink: "Bỏ qua điều hướng",
    brandHomeLabel: "Lịch Việt - về trang chủ",
    brandName: "Lịch Việt",
    brandTagline: "Nhịp ngày, trọn tháng",
    addEvent: "Thêm sự kiện",
    monthSummaryAria: "Tổng quan tháng",
    monthEventCount: "Sự kiện tháng này",
    nextEventLabel: "Lần tới",
    noneYet: "Chưa có",
    eyebrow: "LỊCH DƯƠNG · LỊCH ÂM",
    heroTitle: "Mỗi ngày đều có một nhịp riêng.",
    heroDescription: "Sắp xếp cuộc hẹn, ngày kỷ niệm và những việc cần nhớ trên một cuốn lịch Việt gần gũi.",
    previousMonth: "Tháng trước",
    nextMonth: "Tháng sau",
    today: "Hôm nay",
    calendarAria: "Lịch tháng",
    legendAria: "Chú thích",
    legendToday: "Hôm nay",
    legendEvents: "Có sự kiện",
    legendPast: "Ngày đã qua",
    legendHolidays: "Lễ & Tết",
    dayAgenda: "Lịch ngày này",
    add: "Thêm",
    upcomingKicker: "ĐỪNG BỎ LỠ",
    upcomingTitle: "Sắp tới",
    searchLabel: "Tìm sự kiện",
    searchPlaceholder: "Tìm sự kiện...",
    storageNotice: "Dữ liệu được lưu riêng trên trình duyệt của bạn.",
    clearAllEvents: "Xoá toàn bộ sự kiện",
    close: "Đóng",
    eventTitleLabel: "Tên sự kiện",
    eventTitlePlaceholder: "Ví dụ: Sinh nhật mẹ",
    emojiPickerAria: "Chọn biểu tượng cho sự kiện",
    emojiOptionLabel: "Chọn biểu tượng {label}",
    eventDateLabel: "Ngày",
    dateHelper: "Chỉ có thể tạo từ hôm nay.",
    eventTimeLabel: "Giờ",
    lunarDateLabel: "Ngày âm lịch",
    lunarPlaceholder: "Chọn ngày để xem âm lịch",
    categoryLabel: "Nhóm sự kiện",
    categoryWork: "Công việc",
    categoryFamily: "Gia đình",
    categoryPersonal: "Cá nhân",
    categoryCelebration: "Kỷ niệm",
    noteLabel: "Ghi chú",
    notePlaceholder: "Thêm địa điểm, người tham dự hoặc điều cần chuẩn bị...",
    reminderLabel: "Nhắc trước",
    reminderNow: "Đúng giờ",
    reminder15: "15 phút",
    reminder60: "1 giờ",
    reminderDay: "1 ngày",
    reminderNone: "Không nhắc",
    delete: "Xoá",
    cancel: "Huỷ",
    saveEvent: "Lưu sự kiện",
    confirmDeleteTitle: "Xoá sự kiện này?",
    confirmDeleteDescription: "Sự kiện sẽ biến mất khỏi lịch và không thể hoàn tác.",
    keep: "Giữ lại",
    deleteEvent: "Xoá sự kiện",
    languageAria: "Chuyển sang tiếng Trung",
    languageButton: "中文",
    notificationsEnable: "Bật nhắc nhở",
    notificationsEnabled: "Đã bật nhắc",
    notificationsTitleEnabled: "Thông báo đã bật",
    notificationsTitleEnable: "Bật thông báo trên trình duyệt",
    notificationsUnsupported: "Trình duyệt này không hỗ trợ thông báo",
    statusToday: "Hôm nay",
    statusTomorrow: "Ngày mai",
    statusPast: "Đã qua",
    addPast: "Đã qua",
    addPastTitle: "Không thể thêm sự kiện cho ngày đã qua",
    noPastEvents: "Ngày này đã qua và không thể thêm sự kiện.",
    noEvents: "Chưa có sự kiện. Thêm một ghi chú cho ngày này?",
    allDay: "Cả ngày",
    lunarAbbreviation: "ÂL",
    searchEmptyTitle: "Không tìm thấy sự kiện",
    searchEmptyText: "Thử một từ khoá khác hoặc xoá ô tìm kiếm.",
    calendarEmptyTitle: "Lịch đang thong thả",
    calendarEmptyText: "Thêm một cuộc hẹn hoặc ngày cần nhớ để bắt đầu.",
    eventCountAria: "{count} sự kiện sắp tới",
    eventCountShort: "{count} sự kiện",
    dateAria: "{weekday}, {day} tháng {month}, {year}. Âm lịch {lunarDay} tháng {lunarMonth}{leap}{holiday}{eventCount}{past}",
    dateAriaHoliday: ". {names}",
    dateAriaEvents: ". {count} sự kiện",
    dateAriaPast: ". Ngày đã qua, không thể thêm sự kiện",
    lunarYearPrefix: "ÂM LỊCH",
    firstDay: "Mùng Một âm lịch",
    fullMoon: "Ngày Rằm",
    countdownToday: "Hôm nay",
    countdownTomorrow: "Ngày mai",
    countdownDays: "{count} ngày",
    countdownWeeks: "{count} tuần",
    countdownMonths: "{count} tháng",
    editEventAria: "Sửa sự kiện {title}, {category}",
    openEventAria: "Mở sự kiện {title}, {countdown}",
    eventDateAria: "Ngày {day} tháng {month}",
    addModalKicker: "THÊM VÀO LỊCH",
    editModalKicker: "CHỈNH SỬA SỰ KIỆN",
    addModalTitle: "Sự kiện mới",
    editModalTitle: "Cập nhật sự kiện",
    titleRequired: "Hãy nhập tên sự kiện.",
    dateRequired: "Hãy chọn ngày cho sự kiện.",
    datePastError: "Không thể tạo sự kiện cho ngày đã qua.",
    formErrors: "Vui lòng kiểm tra các trường được đánh dấu.",
    deleteConfirmDescription: "“{title}” sẽ biến mất khỏi lịch và không thể hoàn tác.",
    clearConfirmTitle: "Xoá toàn bộ sự kiện?",
    clearConfirmDescription: "Tất cả {count} sự kiện sẽ bị xoá khỏi lịch và không thể hoàn tác.",
    clearButton: "Xoá tất cả",
    toastClearAll: "Đã xoá toàn bộ {count} sự kiện.",
    toastDeleted: "Đã xoá “{title}”.",
    toastDeletedGeneric: "Đã xoá sự kiện.",
    toastUpdated: "Đã cập nhật sự kiện.",
    toastCreated: "Đã thêm sự kiện vào lịch.",
    toastStorageError: "Không thể lưu dữ liệu trên trình duyệt.",
    toastNotificationUnsupported: "Trình duyệt này không hỗ trợ thông báo.",
    toastNotificationsOn: "Nhắc nhở đã được bật.",
    toastNotificationBlocked: "Thông báo đang bị chặn trong cài đặt trình duyệt.",
    toastNotificationsEnabled: "Đã bật nhắc nhở cho sự kiện sắp tới.",
    toastNotificationDenied: "Bạn có thể bật lại trong cài đặt trình duyệt.",
    languageChanged: "Đã chuyển sang tiếng Việt.",
    notificationTitle: "Lịch Việt · {title}",
  },
  zh: {
    documentTitle: "越南日历 — 记录每一天",
    metaDescription: "越南日历 - 管理日程和提醒，查看阳历与农历。",
    skipLink: "跳到主要内容",
    brandHomeLabel: "越南日历 - 返回首页",
    brandName: "越南日历",
    brandTagline: "记录每一天",
    addEvent: "添加日程",
    monthSummaryAria: "本月概览",
    monthEventCount: "本月日程",
    nextEventLabel: "下一项",
    noneYet: "暂无",
    eyebrow: "阳历 · 农历",
    heroTitle: "每一天，都有自己的节奏。",
    heroDescription: "把约会、纪念日和每一件重要小事，都整理在亲切易用的越南日历里。",
    previousMonth: "上个月",
    nextMonth: "下个月",
    today: "今天",
    calendarAria: "月历",
    legendAria: "图例",
    legendToday: "今天",
    legendEvents: "有日程",
    legendPast: "已过去",
    legendHolidays: "节日与春节",
    dayAgenda: "当天日程",
    add: "添加",
    upcomingKicker: "别错过",
    upcomingTitle: "即将到来",
    searchLabel: "搜索日程",
    searchPlaceholder: "搜索日程...",
    storageNotice: "数据仅保存在当前浏览器中。",
    clearAllEvents: "删除所有日程",
    close: "关闭",
    eventTitleLabel: "日程名称",
    eventTitlePlaceholder: "例如：妈妈的生日",
    emojiPickerAria: "为日程选择图标",
    emojiOptionLabel: "选择图标：{label}",
    eventDateLabel: "日期",
    dateHelper: "只能选择今天或之后的日期。",
    eventTimeLabel: "时间",
    lunarDateLabel: "农历日期",
    lunarPlaceholder: "选择日期后显示农历",
    categoryLabel: "日程分类",
    categoryWork: "工作",
    categoryFamily: "家庭",
    categoryPersonal: "个人",
    categoryCelebration: "纪念日",
    noteLabel: "备注",
    notePlaceholder: "添加地点、参与人或需要准备的事项...",
    reminderLabel: "提前提醒",
    reminderNow: "准时",
    reminder15: "15 分钟",
    reminder60: "1 小时",
    reminderDay: "1 天",
    reminderNone: "不提醒",
    delete: "删除",
    cancel: "取消",
    saveEvent: "保存日程",
    confirmDeleteTitle: "删除这个日程？",
    confirmDeleteDescription: "该日程将从日历中移除，且无法恢复。",
    keep: "保留",
    deleteEvent: "删除日程",
    languageAria: "切换到越南语",
    languageButton: "VI",
    notificationsEnable: "开启提醒",
    notificationsEnabled: "提醒已开启",
    notificationsTitleEnabled: "通知已开启",
    notificationsTitleEnable: "开启浏览器通知",
    notificationsUnsupported: "此浏览器不支持通知",
    statusToday: "今天",
    statusTomorrow: "明天",
    statusPast: "已过去",
    addPast: "已过去",
    addPastTitle: "不能为已过去的日期添加日程",
    noPastEvents: "该日期已过去，无法添加日程。",
    noEvents: "暂无日程，为这一天添加一条记录吧？",
    allDay: "全天",
    lunarAbbreviation: "农历",
    searchEmptyTitle: "未找到日程",
    searchEmptyText: "请尝试其他关键词或清空搜索框。",
    calendarEmptyTitle: "日历很轻松",
    calendarEmptyText: "添加一个约会或纪念日，开始记录吧。",
    eventCountAria: "{count} 个即将到来的日程",
    eventCountShort: "{count} 个日程",
    dateAria: "{year}年{month}月{day}日，{weekday}。农历{lunarMonth}月{lunarDay}日{leap}{holiday}{eventCount}{past}",
    dateAriaHoliday: "。{names}",
    dateAriaEvents: "。{count} 个日程",
    dateAriaPast: "。该日期已过去，无法添加日程",
    lunarYearPrefix: "农历",
    firstDay: "农历初一",
    fullMoon: "满月",
    countdownToday: "今天",
    countdownTomorrow: "明天",
    countdownDays: "{count} 天后",
    countdownWeeks: "{count} 周后",
    countdownMonths: "{count} 个月后",
    editEventAria: "编辑日程 {title}，{category}",
    openEventAria: "打开日程 {title}，{countdown}",
    eventDateAria: "{month}月{day}日",
    addModalKicker: "添加到日历",
    editModalKicker: "编辑日程",
    addModalTitle: "新日程",
    editModalTitle: "更新日程",
    titleRequired: "请输入日程名称。",
    dateRequired: "请选择日程日期。",
    datePastError: "不能为已过去的日期添加日程。",
    formErrors: "请检查标出的字段。",
    deleteConfirmDescription: "“{title}”将从日历中移除，且无法恢复。",
    clearConfirmTitle: "删除所有日程？",
    clearConfirmDescription: "全部 {count} 个日程将被删除，且无法恢复。",
    clearButton: "全部删除",
    toastClearAll: "已删除全部 {count} 个日程。",
    toastDeleted: "已删除“{title}”。",
    toastDeletedGeneric: "已删除日程。",
    toastUpdated: "日程已更新。",
    toastCreated: "日程已添加到日历。",
    toastStorageError: "无法在浏览器中保存数据。",
    toastNotificationUnsupported: "此浏览器不支持通知。",
    toastNotificationsOn: "提醒已开启。",
    toastNotificationBlocked: "通知已在浏览器设置中被阻止。",
    toastNotificationsEnabled: "已开启即将到来的日程提醒。",
    toastNotificationDenied: "你可以在浏览器设置中重新开启通知。",
    languageChanged: "已切换到中文。",
    notificationTitle: "越南日历 · {title}",
  },
};

const WEEKDAY_NAMES = {
  vi: ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
  zh: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
};
const WEEKDAY_HEADERS = {
  vi: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
  zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
};
const SHORT_MONTHS = {
  vi: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
  zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
};
const CAN = {
  vi: ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"],
  zh: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
};
const CHI = {
  vi: ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"],
  zh: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
};
const CATEGORY_LABELS = {
  vi: { work: "Công việc", family: "Gia đình", personal: "Cá nhân", celebration: "Kỷ niệm" },
  zh: { work: "工作", family: "家庭", personal: "个人", celebration: "纪念日" },
};
const EMOJI_LABELS = {
  vi: {
    pin: "ghim",
    party: "tiệc",
    work: "công việc",
    family: "gia đình",
    birthday: "sinh nhật",
    love: "yêu thương",
    health: "sức khỏe",
    study: "học tập",
    meal: "ăn uống",
    travel: "du lịch",
    car: "xe hơi",
    motorbike: "xe máy",
    laptop: "máy tính xách tay",
    phone: "liên lạc",
    important: "quan trọng",
  },
  zh: {
    pin: "图钉",
    party: "庆祝",
    work: "工作",
    family: "家庭",
    birthday: "生日",
    love: "爱心",
    health: "健康",
    study: "学习",
    meal: "餐饮",
    travel: "旅行",
    car: "汽车",
    motorbike: "摩托车",
    laptop: "笔记本电脑",
    phone: "电话",
    important: "重要",
  },
};
const FIXED_HOLIDAYS = [
  { calendar: "solar", month: 1, day: 1, name: "Tết Dương lịch", nameZh: "元旦", emoji: "🎆" },
  { calendar: "solar", month: 2, day: 3, name: "Thành lập Đảng Cộng sản Việt Nam", nameZh: "越南共产党成立日", emoji: "🚩" },
  { calendar: "solar", month: 3, day: 8, name: "Ngày Quốc tế Phụ nữ", nameZh: "国际妇女节", emoji: "🌷" },
  { calendar: "solar", month: 3, day: 26, name: "Thành lập Đoàn TNCS Hồ Chí Minh", nameZh: "胡志明共青团成立日", emoji: "🎓" },
  { calendar: "solar", month: 4, day: 30, name: "Ngày Giải phóng miền Nam", nameZh: "越南南方解放日", emoji: "🕊️" },
  { calendar: "solar", month: 5, day: 1, name: "Ngày Quốc tế Lao động", nameZh: "国际劳动节", emoji: "⚒️" },
  { calendar: "solar", month: 6, day: 1, name: "Ngày Quốc tế Thiếu nhi", nameZh: "国际儿童节", emoji: "🎈" },
  { calendar: "solar", month: 6, day: 28, name: "Ngày Gia đình Việt Nam", nameZh: "越南家庭日", emoji: "🏡" },
  { calendar: "solar", month: 7, day: 27, name: "Ngày Thương binh Liệt sĩ", nameZh: "越南荣军烈士纪念日", emoji: "🕯️" },
  { calendar: "solar", month: 8, day: 19, name: "Cách mạng Tháng Tám", nameZh: "八月革命纪念日", emoji: "⭐" },
  { calendar: "solar", month: 9, day: 2, name: "Quốc khánh Việt Nam", nameZh: "越南国庆节", emoji: "🇻🇳" },
  { calendar: "solar", month: 10, day: 10, name: "Ngày Giải phóng Thủ đô", nameZh: "首都解放日", emoji: "🏛️" },
  { calendar: "solar", month: 10, day: 20, name: "Ngày Phụ nữ Việt Nam", nameZh: "越南妇女节", emoji: "🌺" },
  { calendar: "solar", month: 11, day: 20, name: "Ngày Nhà giáo Việt Nam", nameZh: "越南教师节", emoji: "🌷" },
  { calendar: "solar", month: 12, day: 22, name: "Thành lập Quân đội Nhân dân Việt Nam", nameZh: "越南人民军建军节", emoji: "🎖️" },
  { calendar: "solar", month: 12, day: 25, name: "Lễ Giáng sinh", nameZh: "圣诞节", emoji: "🎄" },
  { calendar: "lunar", month: 1, day: 1, name: "Tết Nguyên Đán · Mùng 1", nameZh: "春节 · 初一", emoji: "🧧" },
  { calendar: "lunar", month: 1, day: 2, name: "Tết Nguyên Đán · Mùng 2", nameZh: "春节 · 初二", emoji: "🧧" },
  { calendar: "lunar", month: 1, day: 3, name: "Tết Nguyên Đán · Mùng 3", nameZh: "春节 · 初三", emoji: "🧧" },
  { calendar: "lunar", month: 1, day: 15, name: "Tết Nguyên Tiêu", nameZh: "元宵节", emoji: "🏮" },
  { calendar: "lunar", month: 3, day: 3, name: "Tết Hàn Thực", nameZh: "寒食节", emoji: "🍡" },
  { calendar: "lunar", month: 3, day: 10, name: "Giỗ Tổ Hùng Vương", nameZh: "雄王忌辰", emoji: "🏛️" },
  { calendar: "lunar", month: 4, day: 15, name: "Lễ Phật Đản", nameZh: "佛诞节", emoji: "🪷" },
  { calendar: "lunar", month: 5, day: 5, name: "Tết Đoan Ngọ", nameZh: "端午节", emoji: "🍙" },
  { calendar: "lunar", month: 7, day: 15, name: "Lễ Vu Lan", nameZh: "盂兰盆节", emoji: "🪷" },
  { calendar: "lunar", month: 8, day: 15, name: "Tết Trung Thu", nameZh: "中秋节", emoji: "🌕" },
  { calendar: "lunar", month: 12, day: 23, name: "Ông Công Ông Táo", nameZh: "灶王节", emoji: "🍬" },
];

const els = {
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarLunarYear: document.querySelector("#calendar-lunar-year"),
  previousMonth: document.querySelector("#previous-month"),
  nextMonth: document.querySelector("#next-month"),
  goToday: document.querySelector("#go-today"),
  monthEventCount: document.querySelector("#month-event-count"),
  nextEventSummary: document.querySelector("#next-event-summary"),
  selectedDateStatus: document.querySelector("#selected-date-status"),
  selectedDayNumber: document.querySelector("#selected-day-number"),
  selectedDateTitle: document.querySelector("#selected-date-title"),
  selectedLunarDate: document.querySelector("#selected-lunar-date"),
  selectedSpecial: document.querySelector("#selected-special"),
  selectedEvents: document.querySelector("#selected-events"),
  upcomingTitle: document.querySelector("#upcoming-title"),
  upcomingCount: document.querySelector("#upcoming-count"),
  upcomingList: document.querySelector("#upcoming-list"),
  eventSearch: document.querySelector("#event-search"),
  notificationButton: document.querySelector("#notification-button"),
  notificationLabel: document.querySelector("#notification-label"),
  languageButton: document.querySelector("#language-button"),
  languageLabel: document.querySelector("#language-label"),
  openCreateModal: document.querySelector("#open-create-modal"),
  addOnSelectedDate: document.querySelector("#add-on-selected-date"),
  addSelectedLabel: document.querySelector("#add-selected-label"),
  clearAllEvents: document.querySelector("#clear-all-events"),
  eventModal: document.querySelector("#event-modal"),
  eventForm: document.querySelector("#event-form"),
  eventId: document.querySelector("#event-id"),
  eventTitle: document.querySelector("#event-title"),
  eventDate: document.querySelector("#event-date"),
  eventTime: document.querySelector("#event-time"),
  eventNote: document.querySelector("#event-note"),
  eventEmoji: document.querySelector("#event-emoji"),
  eventEmojiPreview: document.querySelector("#event-emoji-preview"),
  emojiPicker: document.querySelector("#emoji-picker"),
  eventReminder: document.querySelector("#event-reminder"),
  eventTitleError: document.querySelector("#event-title-error"),
  eventDateError: document.querySelector("#event-date-error"),
  formErrorSummary: document.querySelector("#form-error-summary"),
  modalKicker: document.querySelector("#modal-kicker"),
  eventModalTitle: document.querySelector("#event-modal-title"),
  modalLunarPreview: document.querySelector("#modal-lunar-preview"),
  deleteEventButton: document.querySelector("#delete-event-button"),
  confirmModal: document.querySelector("#confirm-modal"),
  confirmTitle: document.querySelector("#confirm-title"),
  confirmDescription: document.querySelector("#confirm-description"),
  cancelDelete: document.querySelector("#cancel-delete"),
  confirmDelete: document.querySelector("#confirm-delete"),
  toastRegion: document.querySelector("#toast-region"),
};

const now = new Date();
let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
let selectedDate = startOfDay(now);
let events = loadEvents();
let pendingDeleteId = null;
let reminderTimer = null;
let lastFocusedElement = null;

function pad(value) {
  return String(value).padStart(2, "0");
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function isPastDay(date) {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

function isSameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function daysBetween(from, to) {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toUtc - fromUtc) / DAY_MS);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function t(key, values = {}) {
  let message = I18N[language]?.[key] ?? I18N.vi[key] ?? key;
  Object.entries(values).forEach(([name, value]) => {
    message = message.replaceAll(`{${name}}`, String(value));
  });
  return message;
}

function categoryLabel(category) {
  return CATEGORY_LABELS[language][category] || CATEGORY_LABELS[language].personal;
}

function holidayName(holiday) {
  return language === "zh" ? holiday.nameZh || holiday.name : holiday.name;
}

function weekdayName(index) {
  return WEEKDAY_NAMES[language][index];
}

function lunarYearName(year) {
  const can = CAN[language][(year + 6) % 10];
  const chi = CHI[language][(year + 8) % 12];
  return language === "zh" ? `${can}${chi}` : `${can} ${chi}`;
}

function eventEmoji(event) {
  return event.emoji || "📌";
}

function applyStaticTranslations() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "vi";
  document.title = t("documentTitle");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("metaDescription"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  document.querySelectorAll("[data-weekday-index]").forEach((element) => {
    element.textContent = WEEKDAY_HEADERS[language][Number(element.dataset.weekdayIndex)];
  });

  els.languageLabel.textContent = t("languageButton");
  els.languageButton.setAttribute("aria-label", t("languageAria"));
  els.languageButton.title = t("languageAria");

  els.emojiPicker.querySelectorAll("[data-emoji-key]").forEach((button) => {
    button.setAttribute(
      "aria-label",
      t("emojiOptionLabel", { label: EMOJI_LABELS[language][button.dataset.emojiKey] }),
    );
  });
}

function uid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function int(value) {
  return Math.floor(value);
}

function jdFromDate(day, month, year) {
  const a = int((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;

  if (jd < 2299161) {
    jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - 32083;
  }

  return jd;
}

function newMoon(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;

  let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const moonAnomaly = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let correction = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  correction -= 0.4068 * Math.sin(moonAnomaly * dr) + 0.0161 * Math.sin(dr * 2 * moonAnomaly);
  correction -= 0.0004 * Math.sin(dr * 3 * moonAnomaly);
  correction += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + moonAnomaly));
  correction -= 0.0074 * Math.sin(dr * (M - moonAnomaly)) + 0.0004 * Math.sin(dr * (2 * F + M));
  correction -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + moonAnomaly));
  correction += 0.001 * Math.sin(dr * (2 * F - moonAnomaly)) + 0.0005 * Math.sin(dr * (2 * moonAnomaly + M));

  const deltaT =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;

  return jd + correction - deltaT;
}

function sunLongitude(jd) {
  const T = (jd - 2451545) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  const M = (357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T3) * dr;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(2 * M);
  DL += 0.00029 * Math.sin(3 * M);
  let longitude = (L0 + DL) * dr;
  longitude -= 2 * Math.PI * Math.floor(longitude / (2 * Math.PI));
  return longitude;
}

function newMoonDay(k, timeZone) {
  return int(newMoon(k) + 0.5 + timeZone / 24);
}

function sunLongitudeSegment(dayNumber, timeZone) {
  return int((sunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) * 6);
}

function lunarMonth11(year, timeZone) {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = int(off / 29.530588853);
  let nm = newMoonDay(k, timeZone);
  const sunLong = sunLongitudeSegment(nm, timeZone);
  if (sunLong >= 9) nm = newMoonDay(k - 1, timeZone);
  return nm;
}

function leapMonthOffset(a11, timeZone) {
  const k = int((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let arc = sunLongitudeSegment(newMoonDay(k + 1, timeZone), timeZone);
  let last = 0;
  let i = 1;

  do {
    last = arc;
    i += 1;
    arc = sunLongitudeSegment(newMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);

  return i - 1;
}

function solarToLunar(date, timeZone = TIME_ZONE) {
  const dayNumber = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const k = int((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1, timeZone);

  if (monthStart > dayNumber) monthStart = newMoonDay(k, timeZone);

  let a11 = lunarMonth11(date.getFullYear(), timeZone);
  let b11 = a11;
  let lunarYear = date.getFullYear();

  if (a11 >= monthStart) {
    a11 = lunarMonth11(date.getFullYear() - 1, timeZone);
  } else {
    lunarYear += 1;
    b11 = lunarMonth11(date.getFullYear() + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = int((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  let lunarLeap = false;

  if (b11 - a11 > 365) {
    const leapMonthDiff = leapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = true;
    }
  }

  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap: lunarLeap,
    dayNumber,
    yearName: lunarYearName(lunarYear),
  };
}

function lunarShort(lunar) {
  if (lunar.day === 1) {
    return `${lunar.day}/${lunar.month}${lunar.leap ? "n" : ""}`;
  }
  return String(lunar.day);
}

function getSpecialDay(date) {
  const lunar = solarToLunar(date);
  const holiday = getHolidays(date)[0];
  if (holiday) return holidayName(holiday);
  if (!lunar.leap && (lunar.day === 1 || lunar.day === 15)) {
    return lunar.day === 1 ? t("firstDay") : t("fullMoon");
  }
  return "";
}

function getHolidays(date) {
  const lunar = solarToLunar(date);

  return FIXED_HOLIDAYS.filter((holiday) =>
    holiday.calendar === "solar"
      ? holiday.month === date.getMonth() + 1 && holiday.day === date.getDate()
      : !lunar.leap && holiday.month === lunar.month && holiday.day === lunar.day,
  ).map((holiday) => ({
    ...holiday,
    lunarLabel:
      holiday.calendar === "lunar"
        ? language === "zh"
          ? `农历 ${holiday.month}月${holiday.day}日`
          : `${holiday.day}/${holiday.month} âm lịch`
        : language === "zh"
          ? `阳历 ${holiday.month}月${holiday.day}日`
          : `${holiday.day}/${holiday.month} dương lịch`,
  }));
}

function loadEvents() {
  try {
    if (localStorage.getItem(EVENTS_RESET_KEY) !== EVENTS_RESET_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NOTIFICATION_KEY);
      localStorage.setItem(EVENTS_RESET_KEY, EVENTS_RESET_VERSION);
      return [];
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.warn("Không thể đọc dữ liệu lịch.", error);
  }

  return [];
}

function saveEvents(nextEvents = events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
  } catch (error) {
    showToast(t("toastStorageError"), true);
    console.warn("Không thể lưu dữ liệu lịch.", error);
  }
}

function eventDateTime(event) {
  const date = parseDateKey(event.date);
  if (!event.time) {
    date.setHours(23, 59, 0, 0);
  } else {
    const [hours, minutes] = event.time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

function eventsForDate(date) {
  return events
    .filter((event) => event.date === dateKey(date))
    .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
}

function upcomingEvents(search = "") {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const searchLocale = language === "zh" ? "zh-CN" : "vi";
  const normalizedSearch = search.trim().toLocaleLowerCase(searchLocale);

  return events
    .filter((event) => {
      const dateTime = eventDateTime(event);
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLocaleLowerCase(searchLocale).includes(normalizedSearch) ||
        (event.note || "").toLocaleLowerCase(searchLocale).includes(normalizedSearch);
      return dateTime >= startOfDay(now) && dateTime <= addDays(endOfToday, 120) && matchesSearch;
    })
    .sort((a, b) => eventDateTime(a) - eventDateTime(b));
}

function formatMonthTitle(date) {
  return language === "zh"
    ? `${date.getFullYear()}年${date.getMonth() + 1}月`
    : `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function formatSelectedTitle(date) {
  const weekday = weekdayName(date.getDay());
  return language === "zh"
    ? `${date.getMonth() + 1}月${date.getDate()}日，${weekday}`
    : `${weekday}, ${date.getDate()} tháng ${date.getMonth() + 1}`;
}

function formatLunarFull(date) {
  const lunar = solarToLunar(date);
  return language === "zh"
    ? `${lunar.month}月${lunar.day}日${lunar.leap ? " · 闰月" : ""} · ${lunar.yearName}年`
    : `${lunar.day} tháng ${lunar.month}${lunar.leap ? " nhuận" : ""} · ${lunar.yearName}`;
}

function countdownLabel(dateTime) {
  const diffDays = daysBetween(startOfDay(new Date()), startOfDay(dateTime));
  if (diffDays === 0) return t("countdownToday");
  if (diffDays === 1) return t("countdownTomorrow");
  if (diffDays <= 7) return t("countdownDays", { count: diffDays });
  if (diffDays <= 30) return t("countdownWeeks", { count: Math.ceil(diffDays / 7) });
  return t("countdownMonths", { count: Math.ceil(diffDays / 30) });
}

function render() {
  renderCalendar();
  renderHeaderSummary();
  renderSelectedDate();
  renderUpcoming();
  els.clearAllEvents.hidden = events.length === 0;
  updateNotificationButton();
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLunar = solarToLunar(new Date(year, month, 15));
  els.calendarTitle.textContent = formatMonthTitle(viewDate);
  els.calendarLunarYear.textContent = `${t("lunarYearPrefix")} · ${language === "zh" ? monthLunar.yearName : monthLunar.yearName.toUpperCase()}`;

  const firstWeekdayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = addDays(new Date(year, month, 1), -firstWeekdayIndex);
  const today = startOfDay(new Date());
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const lunar = solarToLunar(date);
    const dailyEvents = eventsForDate(date);
    const isOutside = date.getMonth() !== month;
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, today);
    const isPast = isPastDay(date);
    const holidays = getHolidays(date);
    const special = getSpecialDay(date);
    const cell = document.createElement("div");
    cell.className = [
      "day-cell",
      isOutside ? "is-outside" : "",
      isSelected ? "is-selected" : "",
      isPast ? "is-past" : "",
      holidays.length ? "has-holiday" : "",
      date.getDay() === 0 || date.getDay() === 6 ? "is-weekend" : "",
    ]
      .filter(Boolean)
      .join(" ");
    cell.dataset.date = dateKey(date);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-select-button";
    button.dataset.selectDate = dateKey(date);
    const holidayNames = holidays.map(holidayName);
    const holidayPart = holidays.length
      ? t("dateAriaHoliday", { names: holidayNames.join(language === "zh" ? "、" : ", ") })
      : special
        ? language === "zh"
          ? `。${special}`
          : `. ${special}`
        : "";
    const eventCountPart = dailyEvents.length
      ? t("dateAriaEvents", { count: dailyEvents.length })
      : "";
    button.setAttribute(
      "aria-label",
      t("dateAria", {
        weekday: weekdayName(date.getDay()),
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        leap: lunar.leap ? (language === "zh" ? "，闰月" : " nhuận") : "",
        holiday: holidayPart,
        eventCount: eventCountPart,
        past: isPast ? t("dateAriaPast") : "",
      }),
    );

    const numberWrap = document.createElement("span");
    numberWrap.className = "date-number-wrap";
    numberWrap.innerHTML = `
      <span class="day-number">${date.getDate()}</span>
      <span class="lunar-number">${lunarShort(lunar)}</span>
    `;
    button.append(numberWrap);

    if (isToday) {
      const todayIndicator = document.createElement("span");
      todayIndicator.className = "today-indicator";
      todayIndicator.textContent = language === "zh" ? "今天" : "HÔM NAY";
      todayIndicator.setAttribute("aria-hidden", "true");
      button.append(todayIndicator);
    } else if (!holidays.length && special) {
      const specialIndicator = document.createElement("span");
      specialIndicator.className = "special-day-indicator";
      specialIndicator.textContent = "✦";
      specialIndicator.title = special;
      specialIndicator.setAttribute("aria-hidden", "true");
      button.append(specialIndicator);
    }

    cell.append(button);

    if (holidays.length) {
      const holidayLabel = document.createElement("span");
      holidayLabel.className = "day-holiday";
      holidayLabel.title = holidayNames.join(", ");
      holidayLabel.innerHTML = `
        <span class="day-holiday-emoji" aria-hidden="true">${escapeHTML(holidays[0].emoji)}</span>
        <span class="day-holiday-name">${escapeHTML(holidayNames[0])}</span>
        ${holidays.length > 1 ? `<span class="day-holiday-more">+${holidays.length - 1}</span>` : ""}
      `;
      cell.append(holidayLabel);
    }

    if (dailyEvents.length) {
      const eventWrap = document.createElement("div");
      eventWrap.className = "day-events";
      const eventLimit = window.innerWidth < 721 ? (holidays.length ? 2 : 4) : holidays.length ? 1 : 2;
      const visibleEvents = dailyEvents.slice(0, eventLimit);

      visibleEvents.forEach((event) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = `event-pill category-${event.category}`;
        pill.dataset.editEvent = event.id;
        pill.title = `${event.time ? `${event.time} · ` : ""}${event.title}`;
        pill.setAttribute(
          "aria-label",
          t("editEventAria", { title: event.title, category: categoryLabel(event.category) }),
        );
        pill.innerHTML = `
          <span class="pill-dot" aria-hidden="true"></span>
          <span class="event-pill-emoji" aria-hidden="true">${escapeHTML(eventEmoji(event))}</span>
          <span class="event-pill-title">${escapeHTML(event.title)}</span>
        `;
        eventWrap.append(pill);
      });

      if (dailyEvents.length > visibleEvents.length) {
        const more = document.createElement("span");
        more.className = "more-events";
        more.textContent = `+${dailyEvents.length - visibleEvents.length}`;
        more.title = t("eventCountShort", { count: dailyEvents.length });
        eventWrap.append(more);
      }

      cell.append(eventWrap);
    }

    fragment.append(cell);
  }

  els.calendarGrid.replaceChildren(fragment);
}

function renderHeaderSummary() {
  const monthPrefix = `${viewDate.getFullYear()}-${pad(viewDate.getMonth() + 1)}`;
  const monthEvents = events.filter((event) => event.date.startsWith(monthPrefix));
  els.monthEventCount.textContent = String(monthEvents.length);

  const next = upcomingEvents()[0];
  els.nextEventSummary.textContent = next
    ? `${eventEmoji(next)} ${next.title.length > 16 ? `${next.title.slice(0, 15)}…` : next.title}`
    : t("noneYet");
  els.nextEventSummary.title = next ? next.title : t("noneYet");
}

function renderSelectedDate() {
  const lunar = solarToLunar(selectedDate);
  const today = startOfDay(new Date());
  const isPast = isPastDay(selectedDate);
  const holidays = getHolidays(selectedDate);
  const special = getSpecialDay(selectedDate);
  const selectedEvents = eventsForDate(selectedDate);

  els.selectedDayNumber.textContent = String(selectedDate.getDate());
  els.selectedDateTitle.textContent = formatSelectedTitle(selectedDate);
  els.selectedLunarDate.textContent = formatLunarFull(selectedDate);
  els.selectedDateStatus.textContent = isPast
    ? t("statusPast")
    : isSameDay(selectedDate, today)
      ? t("statusToday")
      : isSameDay(selectedDate, addDays(today, 1))
        ? t("statusTomorrow")
        : language === "zh"
          ? `${lunar.month}月${lunar.day}日`
          : `${lunar.day}/${lunar.month} âm lịch`;
  els.addOnSelectedDate.disabled = isPast;
  els.addOnSelectedDate.title = isPast ? t("addPastTitle") : "";
  els.addSelectedLabel.textContent = isPast ? t("addPast") : t("add");

  els.selectedSpecial.hidden = holidays.length === 0 && !special;
  els.selectedSpecial.innerHTML = holidays.length
    ? holidays
        .map(
          (holiday) => `
            <div class="selected-special-item">
              <span class="selected-special-emoji" aria-hidden="true">${escapeHTML(holiday.emoji)}</span>
              <span>
                <strong>${escapeHTML(holidayName(holiday))}</strong>
                <small>${holiday.lunarLabel}</small>
              </span>
            </div>
          `,
        )
        .join("")
    : `<div class="selected-special-item"><span>✦</span><span><strong>${escapeHTML(special)}</strong></span></div>`;

  if (!selectedEvents.length) {
    els.selectedEvents.innerHTML = `
      <div class="agenda-empty">
        <svg class="icon" aria-hidden="true"><use href="#icon-moon"></use></svg>
        <span>${isPast ? t("noPastEvents") : t("noEvents")}</span>
      </div>
    `;
    return;
  }

  els.selectedEvents.innerHTML = selectedEvents
    .map(
      (event) => `
        <div class="agenda-item">
          <span class="agenda-time">${event.time || t("allDay")}</span>
          <div class="agenda-copy">
            <strong title="${escapeHTML(event.title)}"><span class="event-name-emoji" aria-hidden="true">${escapeHTML(eventEmoji(event))}</span> ${escapeHTML(event.title)}</strong>
            <span><i class="category-dot category-${event.category}"></i> ${categoryLabel(event.category)}</span>
          </div>
          <button class="agenda-edit" type="button" data-edit-event="${event.id}" aria-label="${escapeHTML(t("editEventAria", { title: event.title, category: categoryLabel(event.category) }))}">
            <svg class="icon icon-sm" aria-hidden="true"><use href="#icon-edit"></use></svg>
          </button>
        </div>
      `,
    )
    .join("");
}

function renderUpcoming() {
  const search = els.eventSearch.value;
  const upcoming = upcomingEvents(search);
  els.upcomingCount.textContent = String(upcoming.length);
  els.upcomingCount.setAttribute("aria-label", t("eventCountAria", { count: upcoming.length }));

  if (!upcoming.length) {
    els.upcomingList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">
          <svg class="icon" aria-hidden="true"><use href="#icon-calendar"></use></svg>
        </span>
        <strong>${search ? t("searchEmptyTitle") : t("calendarEmptyTitle")}</strong>
        <p>${search ? t("searchEmptyText") : t("calendarEmptyText")}</p>
      </div>
    `;
    return;
  }

  els.upcomingList.innerHTML = upcoming
    .slice(0, 6)
    .map((event) => {
      const date = parseDateKey(event.date);
      const lunar = solarToLunar(date);
      const countdown = countdownLabel(eventDateTime(event));
      const category = categoryLabel(event.category);
      return `
        <button class="upcoming-item" type="button" data-edit-event="${event.id}" aria-label="${escapeHTML(t("openEventAria", { title: event.title, countdown }))}">
          <span class="upcoming-date" aria-label="${escapeHTML(t("eventDateAria", { day: date.getDate(), month: date.getMonth() + 1 }))}">
            <strong>${pad(date.getDate())}</strong>
            <small>${SHORT_MONTHS[language][date.getMonth()]}</small>
          </span>
          <span class="upcoming-copy">
            <strong title="${escapeHTML(event.title)}"><span class="event-name-emoji" aria-hidden="true">${escapeHTML(eventEmoji(event))}</span> ${escapeHTML(event.title)}</strong>
            <span class="upcoming-meta">
              <i class="category-dot category-${event.category}" aria-hidden="true"></i>
              ${event.time ? escapeHTML(event.time) : t("allDay")} · ${category} · ${t("lunarAbbreviation")} ${lunar.day}/${lunar.month}
            </span>
          </span>
          <span class="countdown ${countdown === t("countdownToday") || countdown === t("countdownTomorrow") ? "is-soon" : ""}">${countdown}</span>
        </button>
      `;
    })
    .join("");
}

function selectDate(date) {
  selectedDate = startOfDay(date);
  if (date.getMonth() !== viewDate.getMonth() || date.getFullYear() !== viewDate.getFullYear()) {
    viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
  }
  render();
}

function setCategory(category) {
  const radio = els.eventForm.querySelector(`input[name="category"][value="${category}"]`);
  if (radio) radio.checked = true;
}

function setEventEmoji(emoji) {
  const selectedEmoji = emoji || "📌";
  els.eventEmoji.value = selectedEmoji;
  els.eventEmojiPreview.textContent = selectedEmoji;

  els.emojiPicker.querySelectorAll("[data-emoji]").forEach((button) => {
    const isSelected = button.dataset.emoji === selectedEmoji;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function updateModalLunarPreview() {
  if (!els.eventDate.value) {
    els.modalLunarPreview.textContent = t("lunarPlaceholder");
    return;
  }

  const date = parseDateKey(els.eventDate.value);
  const special = getSpecialDay(date);
  const holidayNames = getHolidays(date)
    .map((holiday) => `${holiday.emoji} ${holidayName(holiday)}`)
    .join(" · ");
  els.modalLunarPreview.textContent = `${formatLunarFull(date)}${holidayNames || special ? ` · ${holidayNames || special}` : ""}`;
}

function openEventModal(event = null) {
  lastFocusedElement = document.activeElement;
  clearFormErrors();
  els.eventForm.reset();
  els.eventId.value = "";
  const today = startOfDay(new Date());
  els.eventDate.min = dateKey(today);
  els.eventDate.value = dateKey(isPastDay(selectedDate) ? today : selectedDate);
  els.eventTime.value = "";
  els.eventReminder.value = "60";
  setCategory("work");
  setEventEmoji("📌");
  els.deleteEventButton.hidden = true;

  if (event) {
    els.eventId.value = event.id;
    els.eventTitle.value = event.title;
    els.eventDate.value = event.date;
    els.eventTime.value = event.time || "";
    els.eventNote.value = event.note || "";
    els.eventReminder.value = event.reminder || "60";
    setCategory(event.category || "work");
    setEventEmoji(eventEmoji(event));
    els.modalKicker.textContent = t("editModalKicker");
    els.eventModalTitle.textContent = t("editModalTitle");
    els.deleteEventButton.hidden = false;
  } else {
    els.modalKicker.textContent = t("addModalKicker");
    els.eventModalTitle.textContent = t("addModalTitle");
  }

  updateModalLunarPreview();
  els.eventModal.showModal();
  window.setTimeout(() => els.eventTitle.focus(), 30);
}

function closeEventModal() {
  els.eventModal.close();
  lastFocusedElement?.focus?.();
}

function clearFormErrors() {
  els.eventTitleError.textContent = "";
  els.eventDateError.textContent = "";
  els.eventTitle.removeAttribute("aria-invalid");
  els.eventDate.removeAttribute("aria-invalid");
  els.formErrorSummary.hidden = true;
  els.formErrorSummary.textContent = "";
}

function validateForm() {
  clearFormErrors();
  const errors = [];
  if (!els.eventTitle.value.trim()) {
    els.eventTitleError.textContent = t("titleRequired");
    els.eventTitle.setAttribute("aria-invalid", "true");
    errors.push(els.eventTitle);
  }
  if (!els.eventDate.value) {
    els.eventDateError.textContent = t("dateRequired");
    els.eventDate.setAttribute("aria-invalid", "true");
    errors.push(els.eventDate);
  } else if (isPastDay(parseDateKey(els.eventDate.value))) {
    els.eventDateError.textContent = t("datePastError");
    els.eventDate.setAttribute("aria-invalid", "true");
    errors.push(els.eventDate);
  }

  if (errors.length) {
    els.formErrorSummary.textContent = t("formErrors");
    els.formErrorSummary.hidden = false;
    errors[0].focus();
    return false;
  }

  return true;
}

function handleFormSubmit(submitEvent) {
  submitEvent.preventDefault();
  if (!validateForm()) return;

  const existing = events.find((event) => event.id === els.eventId.value);
  const category = els.eventForm.querySelector('input[name="category"]:checked')?.value || "work";
  const event = {
    id: existing?.id || uid(),
    title: els.eventTitle.value.trim(),
    date: els.eventDate.value,
    time: els.eventTime.value,
    category,
    emoji: els.eventEmoji.value || "📌",
    note: els.eventNote.value.trim(),
    reminder: els.eventReminder.value,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  if (existing) {
    events = events.map((item) => (item.id === existing.id ? event : item));
  } else {
    events = [...events, event];
  }

  saveEvents();
  viewDate = new Date(parseDateKey(event.date).getFullYear(), parseDateKey(event.date).getMonth(), 1);
  selectedDate = parseDateKey(event.date);
  closeEventModal();
  render();
  showToast(existing ? t("toastUpdated") : t("toastCreated"));
}

function requestDelete(eventId) {
  const event = events.find((item) => item.id === eventId);
  if (!event) return;
  pendingDeleteId = eventId;
  els.confirmTitle.textContent = t("confirmDeleteTitle");
  els.confirmDescription.textContent = t("deleteConfirmDescription", { title: event.title });
  els.confirmDelete.textContent = t("deleteEvent");
  els.confirmModal.showModal();
  window.setTimeout(() => els.cancelDelete.focus(), 30);
}

function requestClearAll() {
  if (!events.length) return;
  pendingDeleteId = "__all__";
  els.confirmTitle.textContent = t("clearConfirmTitle");
  els.confirmDescription.textContent = t("clearConfirmDescription", { count: events.length });
  els.confirmDelete.textContent = t("clearButton");
  els.confirmModal.showModal();
  window.setTimeout(() => els.cancelDelete.focus(), 30);
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  const isClearAll = pendingDeleteId === "__all__";
  const deleted = events.find((event) => event.id === pendingDeleteId);
  const deletedCount = events.length;
  events = isClearAll ? [] : events.filter((event) => event.id !== pendingDeleteId);
  saveEvents();
  if (isClearAll) {
    try {
      localStorage.removeItem(NOTIFICATION_KEY);
    } catch {
      // The visible event data is still cleared if notification storage is unavailable.
    }
  }
  pendingDeleteId = null;
  els.confirmModal.close();
  if (els.eventModal.open) closeEventModal();
  render();
  showToast(
    isClearAll
      ? t("toastClearAll", { count: deletedCount })
      : deleted
        ? t("toastDeleted", { title: deleted.title })
        : t("toastDeletedGeneric"),
  );
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " is-error" : ""}`;
  toast.innerHTML = `
    <svg class="icon" aria-hidden="true"><use href="#icon-${isError ? "close" : "check"}"></use></svg>
    <span>${escapeHTML(message)}</span>
  `;
  els.toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3800);
}

function updateNotificationButton() {
  const supported = "Notification" in window;
  const enabled = supported && Notification.permission === "granted";
  els.notificationButton.classList.toggle("is-active", enabled);
  els.notificationButton.classList.toggle("is-unavailable", !supported);
  els.notificationButton.setAttribute("aria-pressed", String(enabled));
  els.notificationLabel.textContent = enabled ? t("notificationsEnabled") : t("notificationsEnable");
  els.notificationButton.setAttribute(
    "aria-label",
    enabled
      ? t("notificationsTitleEnabled")
      : supported
        ? t("notificationsTitleEnable")
        : t("notificationsUnsupported"),
  );
  els.notificationButton.title = enabled
    ? t("notificationsTitleEnabled")
    : supported
      ? t("notificationsTitleEnable")
      : t("notificationsUnsupported");
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    showToast(t("toastNotificationUnsupported"), true);
    return;
  }

  if (Notification.permission === "granted") {
    showToast(t("toastNotificationsOn"));
    scheduleReminderCheck();
    return;
  }

  if (Notification.permission === "denied") {
    showToast(t("toastNotificationBlocked"), true);
    return;
  }

  const permission = await Notification.requestPermission();
  updateNotificationButton();
  if (permission === "granted") {
    showToast(t("toastNotificationsEnabled"));
    scheduleReminderCheck();
  } else {
    showToast(t("toastNotificationDenied"), true);
  }
}

function checkReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const currentTime = Date.now();
  let notified = {};
  try {
    notified = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || "{}");
  } catch {
    notified = {};
  }

  events.forEach((event) => {
    if (event.reminder === "none") return;
    const reminderMinutes = Number(event.reminder || 0);
    const startsAt = eventDateTime(event).getTime();
    const remindAt = startsAt - reminderMinutes * 60_000;
    const notificationKey = `${event.id}:${event.date}:${event.time || "all"}:${event.reminder}`;

    if (currentTime >= remindAt && currentTime <= startsAt && !notified[notificationKey]) {
      const notification = new Notification(t("notificationTitle", { title: event.title }), {
        body: `${eventEmoji(event)} ${event.time ? event.time : t("allDay")} · ${formatLunarFull(parseDateKey(event.date))}`,
        tag: notificationKey,
        silent: false,
      });
      notification.onclick = () => {
        window.focus();
        selectDate(parseDateKey(event.date));
      };
      notified[notificationKey] = currentTime;
    }
  });

  try {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notified));
  } catch {
    // Reminders continue to work while the page is open.
  }
}

function scheduleReminderCheck() {
  if (reminderTimer) window.clearInterval(reminderTimer);
  checkReminders();
  reminderTimer = window.setInterval(checkReminders, 30_000);
}

els.previousMonth.addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  render();
});

els.nextMonth.addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  render();
});

els.goToday.addEventListener("click", () => {
  const today = startOfDay(new Date());
  viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate = today;
  render();
});

els.calendarGrid.addEventListener("click", (event) => {
  const dateButton = event.target.closest("[data-select-date]");
  if (dateButton) {
    selectDate(parseDateKey(dateButton.dataset.selectDate));
    return;
  }

  const eventButton = event.target.closest("[data-edit-event]");
  if (eventButton) {
    const matched = events.find((item) => item.id === eventButton.dataset.editEvent);
    if (matched) openEventModal(matched);
  }
});

els.selectedEvents.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-event]");
  if (!editButton) return;
  const matched = events.find((item) => item.id === editButton.dataset.editEvent);
  if (matched) openEventModal(matched);
});

els.upcomingList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-edit-event]");
  if (!item) return;
  const matched = events.find((entry) => entry.id === item.dataset.editEvent);
  if (matched) openEventModal(matched);
});

els.openCreateModal.addEventListener("click", () => openEventModal());
els.addOnSelectedDate.addEventListener("click", () => openEventModal());
els.languageButton.addEventListener("click", () => {
  language = language === "vi" ? "zh" : "vi";
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // The language still changes for the current visit if storage is unavailable.
  }
  applyStaticTranslations();
  render();
  showToast(t("languageChanged"));
});
els.notificationButton.addEventListener("click", enableNotifications);
els.emojiPicker.addEventListener("click", (event) => {
  const emojiButton = event.target.closest("[data-emoji]");
  if (emojiButton) setEventEmoji(emojiButton.dataset.emoji);
});
els.eventSearch.addEventListener("input", renderUpcoming);
els.eventForm.addEventListener("submit", handleFormSubmit);
els.eventDate.addEventListener("change", updateModalLunarPreview);
els.deleteEventButton.addEventListener("click", () => requestDelete(els.eventId.value));
els.cancelDelete.addEventListener("click", () => els.confirmModal.close());
els.confirmDelete.addEventListener("click", confirmDelete);
els.clearAllEvents.addEventListener("click", requestClearAll);

document.querySelectorAll(".modal-close, .modal-cancel").forEach((button) => {
  button.addEventListener("click", closeEventModal);
});

els.eventModal.addEventListener("click", (event) => {
  if (event.target === els.eventModal) closeEventModal();
});

els.eventModal.addEventListener("close", () => {
  lastFocusedElement?.focus?.();
});

els.confirmModal.addEventListener("click", (event) => {
  if (event.target === els.confirmModal) els.confirmModal.close();
});

window.addEventListener("resize", () => {
  // Event labels are condensed on narrow screens; re-render only at layout boundaries.
  if (window.innerWidth === 720 || window.innerWidth === 721) renderCalendar();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) checkReminders();
});

applyStaticTranslations();
render();
if ("Notification" in window && Notification.permission === "granted") scheduleReminderCheck();
