'use client'

import { useUser } from '@/context/UserContext'
import { useEffect, useRef, useState } from 'react'
import { updateUserInfo, uploadAvatar } from '@/lib/api'
import AddressSelector from '@/components/AddressSelector'
import Image from 'next/image'
import { FiEdit2 } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, updateUser } = useUser()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<'nam' | 'nu'>('nam')
  const [birthday, setBirthday] = useState({ day: '', month: '', year: '' })
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [ward, setWard] = useState('')
  const [detail, setDetail] = useState('')
  const [loadingAvatar, setLoadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setGender(user.gender || 'nam')
      const [year, month, day] = (user.birthday || '').split('-')
      setBirthday({ day: day || '', month: month || '', year: year || '' })
      const [d, c, p, ...rest] = (user.address || '').split(',').map(s => s.trim()).reverse()
      setProvince(p || '')
      setDistrict(c || '')
      setWard(d || '')
      setDetail(rest.reverse().join(', ') || '')
    }
  }, [user])

  const handleSave = async () => {
    const fullBirthday = `${birthday.year}-${birthday.month}-${birthday.day}`
    const fullAddress = `${detail}, ${ward}, ${district}, ${province}`
    try {
      const res = await updateUserInfo({ name, phone, gender, birthday: fullBirthday, address: fullAddress })
      updateUser(res)
      alert('✅ Cập nhật thành công')
    } catch {
      alert('❌ Cập nhật thất bại')
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    try {
      setLoadingAvatar(true)
      const newAvatarUrl = await uploadAvatar(file)
      updateUser({ avatarUrl: newAvatarUrl })
      alert('🖼️ Avatar đã cập nhật!')
    } catch (error) {
      alert('❌ Không thể cập nhật avatar')
    } finally {
      setLoadingAvatar(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-6 text-center md:text-left">Thông tin tài khoản</h2>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div
          className="relative group cursor-pointer"
          onClick={handleAvatarClick}
        >
          <Image
            src={user?.avatarUrl || '/default-avatar.jpg'}
            alt="avatar"
            width={100}
            height={100}
            className="rounded-full border object-cover"
          />

          {/* Overlay loading */}
          {loadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center text-white font-semibold">
              Đang tải...
            </div>
          )}

          {/* Icon cây bút khi hover */}
          {!loadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 hidden group-hover:flex items-center justify-center">
              <FiEdit2 className="text-white text-xl" />
            </div>
          )}
        </div>

        {/* Input file ẩn */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {user?.address && (
        <div className="mb-6 text-sm text-gray-600 text-center md:text-left">
          Địa chỉ giao hàng: <span className="font-medium">{user.address}</span>
        </div>
      )}

      <div className="space-y-5 text-sm">
        <div>
          <label className="block mb-1 font-medium">Họ Tên</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Họ tên"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Giới tính</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                checked={gender === 'nam'}
                onChange={() => setGender('nam')}
              />
              Nam
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                checked={gender === 'nu'}
                onChange={() => setGender('nu')}
              />
              Nữ
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Số điện thoại"
            className="w-full border px-3 py-2 rounded"
            inputMode="tel"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            value={user?.email || ''}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Ngày sinh</label>
          <div className="grid grid-cols-3 gap-3">
            <select
              value={birthday.day}
              onChange={e => setBirthday({ ...birthday, day: e.target.value })}
              className="border px-3 py-2 rounded"
            >
              <option value="">Ngày</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d < 10 ? `0${d}` : `${d}`}>{d}</option>
              ))}
            </select>
            <select
              value={birthday.month}
              onChange={e => setBirthday({ ...birthday, month: e.target.value })}
              className="border px-3 py-2 rounded"
            >
              <option value="">Tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m < 10 ? `0${m}` : `${m}`}>{m}</option>
              ))}
            </select>
            <select
              value={birthday.year}
              onChange={e => setBirthday({ ...birthday, year: e.target.value })}
              className="border px-3 py-2 rounded"
            >
              <option value="">Năm</option>
              {Array.from({ length: 70 }, (_, i) => 2024 - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Địa chỉ</label>
          <AddressSelector
            province={province}
            district={district}
            ward={ward}
            detail={detail}
            setProvince={setProvince}
            setDistrict={setDistrict}
            setWard={setWard}
            setDetail={setDetail}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-4 px-6 py-3 bg-red-600 text-white rounded font-semibold text-lg"
        >
          LƯU THAY ĐỔI
        </button>
      </div>
    </div>
  )
}
