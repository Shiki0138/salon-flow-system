import QRCode from 'qrcode';
import { addMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Menu, ReservationDetails } from '../types';

// デフォルト来店目安日を計算
export const calculateDefaultAppointmentDate = (menus: Menu[]): Date => {
  if (menus.length === 0) return addMonths(new Date(), 1);
  
  // 最も長い間隔を取得
  const maxInterval = Math.max(...menus.map(menu => menu.defaultIntervalMonth));
  return addMonths(new Date(), maxInterval);
};

// 所要時間を計算
export const calculateTotalDuration = (menus: Menu[]): number => {
  return menus.reduce((total, menu) => total + menu.durationMin, 0);
};

// 終了時刻を計算
export const calculateEndTime = (startTime: string, durationMin: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

// Google Calendar URL を生成（可能な限りリマインダー情報を含む）
export const generateGoogleCalendarURL = (
  reservation: ReservationDetails,
  shopName: string,
  shopAddress: string
): string => {
  const { selectedMenus, appointmentDate, startTime, endTime } = reservation;
  
  const menuNames = selectedMenus.map(menu => menu.name).join(', ');
  const startDateTime = new Date(appointmentDate);
  const [startHour, startMin] = startTime.split(':').map(Number);
  startDateTime.setHours(startHour, startMin, 0, 0);
  
  const endDateTime = new Date(appointmentDate);
  const [endHour, endMin] = endTime.split(':').map(Number);
  endDateTime.setHours(endHour, endMin, 0, 0);

  // Google Calendar用の日時フォーマット (YYYYMMDDTHHMMSSZ)
  const formatForGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const title = encodeURIComponent(`${shopName} - ${menuNames}`);
  
  // 詳細説明にリマインダー設定の案内を含める
  const description = encodeURIComponent(
    `施術内容: ${menuNames}\n料金: ¥${reservation.discountedAmount.toLocaleString()}\n店舗: ${shopName}\n\n【重要】予約登録後、必ず「3日前」のリマインダー通知を設定してください。\n\n・Google Calendar: イベント詳細 > 通知を追加 > 3日前\n・iPhone: カレンダー > 通知 > カスタム > 3日前\n・Android: カレンダー > リマインダー > 3日前`
  );
  
  const location = encodeURIComponent(shopAddress);
  const startDate = formatForGoogle(startDateTime);
  const endDate = formatForGoogle(endDateTime);

  // Google CalendarのURLにreminder parameterを試行（非公式だが一部動作する場合がある）
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}&remind=3d`;
};

// 軽量QRコードを生成（Google Calendar URLベース）
export const generateQRCode = async (
  reservation: ReservationDetails,
  shopName: string,
  shopAddress: string
): Promise<string> => {
  try {
    const googleCalendarURL = generateGoogleCalendarURL(reservation, shopName, shopAddress);
    // QRコード生成時の互換性を最大化（iQR対応はライブラリ依存のため、エラー訂正レベルを最大にし、マージンも広げる）
    const qrCodeDataUrl = await QRCode.toDataURL(googleCalendarURL, {
      width: 256,
      margin: 4, // マージンを広げる
      errorCorrectionLevel: 'H', // 最高レベルのエラー訂正
      color: {
        dark: '#262626',
        light: '#ffffff'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`QRコード生成エラー: ${error}`);
  }
};

// iOS/Android用のカレンダーファイルを生成（複数のリマインダー設定付き）
export const generateICSFile = (
  reservation: ReservationDetails,
  shopName: string,
  shopAddress: string
): string => {
  const { selectedMenus, appointmentDate, startTime, endTime } = reservation;
  
  const menuNames = selectedMenus.map(menu => menu.name).join(', ');
  const startDateTime = new Date(appointmentDate);
  const [startHour, startMin] = startTime.split(':').map(Number);
  startDateTime.setHours(startHour, startMin, 0, 0);
  
  const endDateTime = new Date(appointmentDate);
  const [endHour, endMin] = endTime.split(':').map(Number);
  endDateTime.setHours(endHour, endMin, 0, 0);

  // ICS形式の日時フォーマット
  const formatForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // UIDを生成（より一意性を保つ）
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@beautysalon.local`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Beauty Salon LUXE//Reservation System//JA
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatForICS(new Date())}
DTSTART:${formatForICS(startDateTime)}
DTEND:${formatForICS(endDateTime)}
SUMMARY:${shopName} - ${menuNames}
DESCRIPTION:施術内容: ${menuNames}\\n料金: ¥${reservation.discountedAmount.toLocaleString()}\\n店舗: ${shopName}\\n\\n※このイベントには3日前のリマインダーが設定されています
LOCATION:${shopAddress}
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-P3D
ACTION:DISPLAY
DESCRIPTION:美容室予約のリマインダー - 3日後に ${shopName} でのご予約があります（${menuNames}）
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:美容室予約のリマインダー - 明日 ${shopName} でのご予約があります（${menuNames}）
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:美容室予約のリマインダー - 2時間後に ${shopName} でのご予約があります（${menuNames}）
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

// リマインダー設定用のWebcalプロトコルURLを生成（iOSで有効）
export const generateWebcalURL = (icsContent: string): string => {
  // Base64エンコードしてwebcalプロトコルで返す
  const base64Content = btoa(encodeURIComponent(icsContent));
  return `data:text/calendar;base64,${base64Content}`;
};

// 時間のオプションを生成（30分刻み）
export const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

// 日付を日本語形式でフォーマット
export const formatDateJapanese = (date: Date): string => {
  return format(date, 'yyyy年MM月dd日 (E)', { locale: ja });
}; 