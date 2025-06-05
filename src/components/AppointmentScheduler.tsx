import React, { useState } from 'react';
import { Menu } from '../types';
import { generateTimeOptions, calculateTotalDuration, formatDateJapanese } from '../utils/calendar';

interface AppointmentSchedulerProps {
  defaultDate: Date;
  selectedMenus: Menu[];
  onConfirm: (date: Date, startTime: string) => void;
  onBack: () => void;
  shopInfo?: {
    businessHours?: string;
    lastOrder?: string;
    holiday?: string;
  };
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  defaultDate,
  selectedMenus,
  onConfirm,
  onBack,
  shopInfo
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  const timeOptions = generateTimeOptions();
  const totalDuration = calculateTotalDuration(selectedMenus);
  const menuNames = selectedMenus.map(menu => menu.name).join(', ');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateString = e.target.value;
    const date = new Date(selectedDateString);
    setSelectedDate(date);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleConfirm = () => {
    onConfirm(selectedDate, selectedTime);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">
          来店日時を選択してください
        </h2>
        <p className="text-neutral-600 text-sm">
          ご都合の良い日時をお選びください
        </p>
      </div>

      {/* 選択されたメニューの確認 */}
      <div className="card bg-neutral-50">
        <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
          <span className="text-primary-600 mr-2">📋</span>
          選択メニュー
        </h3>
        <p className="text-sm text-neutral-600 mb-2">{menuNames}</p>
        <p className="text-sm text-primary-600 font-medium">
          所要時間: 約{totalDuration}分
        </p>
      </div>

      {/* 日付選択 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700 mb-2 block">
            来店日
          </span>
          <input
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            min={formatDateForInput(new Date())}
            max={formatDateForInput(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))}
            className="input-field"
          />
        </label>
        
        <div className="text-sm text-neutral-600 bg-primary-50 p-3 rounded-lg">
          <span className="font-medium">📅 選択日: </span>
          {formatDateJapanese(selectedDate)}
        </div>
      </div>

      {/* 時間選択 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700 mb-2 block">
            開始時刻
          </span>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="input-field"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>

        <div className="text-sm text-neutral-600 bg-primary-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <span>開始時刻: {selectedTime}</span>
            <span>終了予定: {
              (() => {
                const [hours, minutes] = selectedTime.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes + totalDuration;
                const endHours = Math.floor(totalMinutes / 60);
                const endMinutes = totalMinutes % 60;
                return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
              })()
            }</span>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
          <span className="mr-2">⚠️</span>
          ご注意
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 営業時間: {shopInfo?.businessHours || '9:00-20:00'}</li>
          <li>• 最終受付: {shopInfo?.lastOrder || '19:00'}</li>
          <li>• 定休日: {shopInfo?.holiday || '毎週月曜日'}</li>
        </ul>
      </div>

      {/* ボタン */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 btn-secondary"
        >
          メニューに戻る
        </button>
        
        <button
          onClick={handleConfirm}
          className="flex-1 btn-primary shadow-luxury"
        >
          内容を確認する
        </button>
      </div>
    </div>
  );
};

export default AppointmentScheduler; 