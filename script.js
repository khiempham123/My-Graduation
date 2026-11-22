(function () {
  'use strict';

  var addCalendarBtn = document.getElementById('add-calendar-btn');
  var statusEl = document.getElementById('action-status');

  if (!addCalendarBtn) return;

  function buildIcsContent() {
    // 15:00 - 17:30 GMT+7 on Sunday, December 6, 2026 => 08:00Z - 10:30Z
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pham Gia Khiem//Graduation Invitation//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:graduation-pham-gia-khiem-20261206@khiempham123.github.io',
      'DTSTAMP:20261122T150000Z',
      'DTSTART:20261206T080000Z',
      'DTEND:20261206T103000Z',
      'SUMMARY:Lễ Tốt Nghiệp — Phạm Gia Khiêm',
      'DESCRIPTION:Trân trọng kính mời tham dự Lễ Tốt Nghiệp của Tân Cử nhân Công nghệ Thông tin Phạm Gia Khiêm.\\nBản đồ: https://www.google.com/maps/search/?api=1&query=University+of+Science+227+Nguyen+Van+Cu',
      'LOCATION:Giảng đường 1\\, Cơ sở 227 Nguyễn Văn Cừ\\, Trường Đại học Khoa học Tự nhiên\\, TP. Hồ Chí Minh',
      'URL:https://www.google.com/maps/search/?api=1&query=University+of+Science+227+Nguyen+Van+Cu',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n');
  }

  addCalendarBtn.addEventListener('click', function () {
    var ics = buildIcsContent();
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.href = url;
    link.download = 'Le-Tot-Nghiep-Pham-Gia-Khiem-06-12-2026.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    if (statusEl) {
      statusEl.textContent = 'Đã tải tệp lịch sự kiện (.ics).';
    }
  });
})();
