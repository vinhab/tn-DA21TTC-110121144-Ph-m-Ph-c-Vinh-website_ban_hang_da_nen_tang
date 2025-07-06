'use client'

import { useEffect, useState } from 'react'

interface AddressSelectorProps {
  province: string
  district: string
  ward: string
  detail: string
  setProvince: (value: string) => void
  setDistrict: (value: string) => void
  setWard: (value: string) => void
  setDetail: (value: string) => void
}

interface LocationData {
  name: string
  code: string
  districts?: LocationData[]
  wards?: LocationData[]
}

export default function AddressSelector({
  province,
  district,
  ward,
  detail,
  setProvince,
  setDistrict,
  setWard,
  setDetail,
}: AddressSelectorProps) {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [districts, setDistricts] = useState<LocationData[]>([])
  const [wards, setWards] = useState<LocationData[]>([])

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(res => res.json())
      .then(data => setLocations(data))
  }, [])

  useEffect(() => {
    const found = locations.find(p => p.name === province)
    if (found) {
      setDistricts(found.districts || [])
    } else {
      setDistricts([])
    }
    setDistrict('')
    setWard('')
    setWards([])
  }, [province])

  useEffect(() => {
    const p = locations.find(p => p.name === province)
    const d = p?.districts?.find(d => d.name === district)
    if (d) {
      setWards(d.wards || [])
    } else {
      setWards([])
    }
    setWard('')
  }, [district])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <select
        className="input"
        value={province}
        onChange={e => setProvince(e.target.value)}
      >
        <option value="">Chọn tỉnh/thành phố</option>
        {locations.map(p => (
          <option key={p.code} value={p.name}>{p.name}</option>
        ))}
      </select>

      <select
        className="input"
        value={district}
        onChange={e => setDistrict(e.target.value)}
        disabled={!province}
      >
        <option value="">Chọn quận/huyện</option>
        {districts.map(d => (
          <option key={d.code} value={d.name}>{d.name}</option>
        ))}
      </select>

      <select
        className="input"
        value={ward}
        onChange={e => setWard(e.target.value)}
        disabled={!district}
      >
        <option value="">Chọn phường/xã</option>
        {wards.map(w => (
          <option key={w.code} value={w.name}>{w.name}</option>
        ))}
      </select>

      <input
        type="text"
        className="input"
        value={detail}
        onChange={e => setDetail(e.target.value)}
        placeholder="Số nhà, tên đường..."
      />
    </div>
  )
}
