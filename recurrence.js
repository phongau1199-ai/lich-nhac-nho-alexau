/**
 * Lịch Việt — lõi lịch âm dương và tính lặp hằng năm
 *
 * Module thuần (không phụ thuộc DOM) để có thể kiểm thử bằng Node.
 * Thuật toán âm lịch: Hồ Ngọc Đức (múi giờ mặc định UTC+7).
 *
 * Cung cấp:
 *   LVRecurrence.solarToLunar(date)                 → { day, month, year, leap, dayNumber }
 *   LVRecurrence.lunarToSolar(day, month, year)     → Date
 *   LVRecurrence.buildOccurrences(events, from, to) → các lần xuất hiện trong khoảng
 *   LVRecurrence.occurrenceInYear(event, year)      → { start, end } | null
 */
(function (global) {
  "use strict";

  var DEFAULT_TZ = 7;
  var DAY_MS = 24 * 60 * 60 * 1000;

  /* ---------------------------------------------------------------- */
  /* Tiện ích ngày                                                     */
  /* ---------------------------------------------------------------- */

  function int(value) {
    return Math.floor(value);
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function parseDateKey(value) {
    var parts = String(value || "").split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addDays(date, count) {
    var next = new Date(date);
    next.setDate(next.getDate() + count);
    return next;
  }

  function daysBetween(from, to) {
    return Math.round(
      (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
        Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
        DAY_MS,
    );
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  /* ---------------------------------------------------------------- */
  /* Âm lịch (Hồ Ngọc Đức)                                             */
  /* ---------------------------------------------------------------- */

  function jdFromDate(day, month, year) {
    var a = int((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    var jd =
      day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;

    if (jd < 2299161) {
      jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - 32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    var a;
    var b;
    var c;
    var d;
    var e;
    var m;

    if (jd > 2299160) {
      a = jd + 32044;
      b = int((4 * a + 3) / 146097);
      c = a - int((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }

    d = int((4 * c + 3) / 1461);
    e = c - int((1461 * d) / 4);
    m = int((5 * e + 2) / 153);

    var day = e - int((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * int(m / 10);
    var year = b * 100 + d - 4800 + int(m / 10);
    return new Date(year, month - 1, day);
  }

  function newMoon(k) {
    var T = k / 1236.85;
    var T2 = T * T;
    var T3 = T2 * T;
    var dr = Math.PI / 180;

    var jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var moonAnomaly = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

    var correction = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    correction -= 0.4068 * Math.sin(moonAnomaly * dr) + 0.0161 * Math.sin(dr * 2 * moonAnomaly);
    correction -= 0.0004 * Math.sin(dr * 3 * moonAnomaly);
    correction += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + moonAnomaly));
    correction -= 0.0074 * Math.sin(dr * (M - moonAnomaly)) + 0.0004 * Math.sin(dr * (2 * F + M));
    correction -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + moonAnomaly));
    correction += 0.001 * Math.sin(dr * (2 * F - moonAnomaly)) + 0.0005 * Math.sin(dr * (2 * moonAnomaly + M));

    var deltaT =
      T < -11
        ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
        : -0.000278 + 0.000265 * T + 0.000262 * T2;

    return jd + correction - deltaT;
  }

  function sunLongitude(jd) {
    var T = (jd - 2451545) / 36525;
    var T2 = T * T;
    var T3 = T2 * T;
    var dr = Math.PI / 180;
    var M = (357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T3) * dr;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(2 * M);
    DL += 0.00029 * Math.sin(3 * M);

    var longitude = (L0 + DL) * dr;
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
    var off = jdFromDate(31, 12, year) - 2415021;
    var k = int(off / 29.530588853);
    var nm = newMoonDay(k, timeZone);
    var sunLong = sunLongitudeSegment(nm, timeZone);
    if (sunLong >= 9) nm = newMoonDay(k - 1, timeZone);
    return nm;
  }

  function leapMonthOffset(a11, timeZone) {
    var k = int((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var arc = sunLongitudeSegment(newMoonDay(k + 1, timeZone), timeZone);
    var last = 0;
    var i = 1;

    do {
      last = arc;
      i += 1;
      arc = sunLongitudeSegment(newMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);

    return i - 1;
  }

  function solarToLunar(date, timeZone) {
    var tz = timeZone === undefined ? DEFAULT_TZ : timeZone;
    var dayNumber = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
    var k = int((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = newMoonDay(k + 1, tz);

    if (monthStart > dayNumber) monthStart = newMoonDay(k, tz);

    var a11 = lunarMonth11(date.getFullYear(), tz);
    var b11 = a11;
    var lunarYear = date.getFullYear();

    if (a11 >= monthStart) {
      a11 = lunarMonth11(date.getFullYear() - 1, tz);
    } else {
      lunarYear += 1;
      b11 = lunarMonth11(date.getFullYear() + 1, tz);
    }

    var lunarDay = dayNumber - monthStart + 1;
    var diff = int((monthStart - a11) / 29);
    var lunarMonth = diff + 11;
    var lunarLeap = false;

    if (b11 - a11 > 365) {
      var leapMonthDiff = leapMonthOffset(a11, tz);
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
      dayNumber: dayNumber,
    };
  }

  var solarCache = Object.create(null);

  /**
   * Chuyển âm → dương.
   *
   * `timeZone` là tham số thứ 4, `leap` (âm lịch nhuận) là tham số thứ 5 —
   * mặc định false, tức là luôn chọn tháng không nhuận, đúng tập quán làm
   * giỗ/sinh nhật theo âm lịch.
   *
   * Nếu tháng âm đó chỉ có 29 ngày mà đòi ngày 30, tự lùi về ngày 29.
   */
  function lunarToSolar(lunarDay, lunarMonth, lunarYear, timeZone, leap) {
    var tz = timeZone === undefined ? DEFAULT_TZ : timeZone;
    var cacheKey = lunarDay + "/" + lunarMonth + "/" + lunarYear + "/" + (leap ? 1 : 0) + "/" + tz;

    if (solarCache[cacheKey]) return new Date(solarCache[cacheKey].getTime());

    var day = lunarDay;

    for (var attempt = 0; attempt < 3; attempt += 1) {
      var date = convertLunar2Solar(day, lunarMonth, lunarYear, !!leap, tz);
      var check = solarToLunar(date, tz);
      if (check.day === day && check.month === lunarMonth) {
        solarCache[cacheKey] = date;
        return date;
      }
      if (day <= 1) break;
      day -= 1;
    }

    var fallback = convertLunar2Solar(Math.max(1, day), lunarMonth, lunarYear, !!leap, tz);
    solarCache[cacheKey] = fallback;
    return new Date(fallback.getTime());
  }

  function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) {
    var a11;
    var b11;

    if (lunarMonth < 11) {
      a11 = lunarMonth11(lunarYear - 1, timeZone);
      b11 = lunarMonth11(lunarYear, timeZone);
    } else {
      a11 = lunarMonth11(lunarYear, timeZone);
      b11 = lunarMonth11(lunarYear + 1, timeZone);
    }

    // Vị trí "tự nhiên" của tháng, đếm từ tháng 11 (0..11).
    var natural = lunarMonth - 11;
    if (natural < 0) natural += 12;

    var diff = natural;

    if (b11 - a11 > 365) {
      // Năm có tháng nhuận: mọi tháng nằm từ tháng nhuận trở đi bị đẩy
      // thêm một tuần trăng; bản thân tháng nhuận nằm ngay sau vị trí đó.
      var leapDiff = leapMonthOffset(a11, timeZone);
      if (lunarLeap || natural >= leapDiff) diff = natural + 1;
    }

    var k = int(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    var monthStart = newMoonDay(k + diff, timeZone);
    return jdToDate(monthStart + lunarDay - 1);
  }

  /* ---------------------------------------------------------------- */
  /* Lặp hằng năm                                                      */
  /* ---------------------------------------------------------------- */

  var REPEAT_MODES = ["none", "solar", "lunar"];

  function normaliseRepeat(value) {
    return REPEAT_MODES.indexOf(String(value)) >= 0 ? String(value) : "none";
  }

  function spanDaysOf(event) {
    var start = parseDateKey(event.date);
    var end = parseDateKey(event.endDate || event.date);
    var span = daysBetween(start, end);
    return span > 0 ? span : 0;
  }

  /**
   * Ngày bắt đầu của lần xuất hiện trong một năm dương lịch.
   * - solar: giữ nguyên ngày/tháng dương lịch.
   * - lunar: giữ nguyên ngày/tháng âm lịch của mốc gốc.
   */
  function startInYear(event, year, timeZone) {
    var tz = timeZone === undefined ? DEFAULT_TZ : timeZone;
    var anchor = parseDateKey(event.date);
    var mode = normaliseRepeat(event.repeat);

    if (mode === "none") return anchor;

    if (mode === "solar") {
      var month = anchor.getMonth() + 1;
      var day = anchor.getDate();
      var safeDay = Math.min(day, daysInMonth(year, month));
      if (month === 2 && day === 29 && !isLeapYear(year)) safeDay = 28;
      return new Date(year, month - 1, safeDay);
    }

    var lunar = solarToLunar(anchor, tz);
    return lunarToSolar(lunar.day, lunar.month, year, tz);
  }

  /**
   * Lần xuất hiện của một sự kiện trong năm dương lịch `year`.
   * Trả về { start, end } hoặc null nếu không có.
   */
  function occurrenceInYear(event, year, timeZone) {
    var tz = timeZone === undefined ? DEFAULT_TZ : timeZone;
    var anchor = parseDateKey(event.date);
    var span = spanDaysOf(event);
    var start;

    if (normaliseRepeat(event.repeat) === "none") {
      start = anchor;
    } else {
      start = startInYear(event, year, tz);
      // Không hiển thị lần lặp trước ngày gốc của sự kiện.
      if (start.getTime() < anchor.getTime()) return null;
    }

    return { start: start, end: addDays(start, span), span: span };
  }

  /**
   * Tất cả lần xuất hiện giao với khoảng [from, to] (tính cả ngày).
   * Trả về mảng { event, start, end, startKey, endKey, span, isRecurring }.
   */
  function buildOccurrences(events, from, to, timeZone) {
    var tz = timeZone === undefined ? DEFAULT_TZ : timeZone;
    var list = [];
    var fromKey = dateKey(from);
    var toKey = dateKey(to);
    var fromYear = from.getFullYear() - 1;
    var toYear = to.getFullYear() + 1;

    (events || []).forEach(function (event) {
      if (!event || !event.date) return;
      var mode = normaliseRepeat(event.repeat);
      var years;

      if (mode === "none") {
        years = [parseDateKey(event.date).getFullYear()];
      } else {
        years = [];
        for (var year = fromYear; year <= toYear; year += 1) years.push(year);
      }

      var seen = Object.create(null);

      years.forEach(function (year) {
        var occurrence = occurrenceInYear(event, year, tz);
        if (!occurrence) return;

        var startKey = dateKey(occurrence.start);
        var endKey = dateKey(occurrence.end);
        if (endKey < fromKey || startKey > toKey) return;
        if (seen[startKey]) return;
        seen[startKey] = true;

        list.push({
          event: event,
          start: occurrence.start,
          end: occurrence.end,
          startKey: startKey,
          endKey: endKey,
          span: occurrence.span,
          isRecurring: mode !== "none",
        });
      });
    });

    return list;
  }

  /** Lần xuất hiện kế tiếp tính từ `from` (tính cả hôm nay), hoặc null. */
  function nextOccurrence(event, from, timeZone) {
    var tz = timeZone === undefined ? DEFAULT_TZ : timeZone;
    var cursor = new Date(from.getTime());
    cursor.setDate(cursor.getDate() - 1);

    var found = buildOccurrences([event], cursor, addDays(from, 400), tz);
    if (!found.length) return null;

    found.sort(function (a, b) {
      return a.start - b.start;
    });

    for (var i = 0; i < found.length; i += 1) {
      if (found[i].end >= cursor) return found[i];
    }
    return null;
  }

  global.LVRecurrence = {
    DEFAULT_TZ: DEFAULT_TZ,
    REPEAT_MODES: REPEAT_MODES,
    int: int,
    pad: pad,
    dateKey: dateKey,
    parseDateKey: parseDateKey,
    addDays: addDays,
    daysBetween: daysBetween,
    isLeapYear: isLeapYear,
    daysInMonth: daysInMonth,
    solarToLunar: solarToLunar,
    lunarToSolar: lunarToSolar,
    normaliseRepeat: normaliseRepeat,
    spanDaysOf: spanDaysOf,
    startInYear: startInYear,
    occurrenceInYear: occurrenceInYear,
    buildOccurrences: buildOccurrences,
    nextOccurrence: nextOccurrence,
  };
})(typeof window !== "undefined" ? window : globalThis);
