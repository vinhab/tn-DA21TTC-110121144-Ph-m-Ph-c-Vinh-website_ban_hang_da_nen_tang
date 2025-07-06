import {
  FaMicrochip, FaMemory, FaHdd, FaDesktop, FaLayerGroup,
  FaPlug, FaLightbulb, FaHandHolding, FaKey
} from 'react-icons/fa';
import { BsGpuCard } from 'react-icons/bs';
import { MdSpeed, MdMonitor, MdOutlineKeyboardAlt } from 'react-icons/md';
import { GiSwitchWeapon } from 'react-icons/gi';
import { ProductCategory } from '@/types/product-ui';
import React from 'react';

export function renderSpecsAuto(category: ProductCategory, specs: Record<string, string>) {
  if (!specs || typeof specs !== 'object') return null;
  const Item = ({ icon, value }: { icon: React.ReactNode; value: string }) =>
    value ? <span className="flex items-center gap-1">{icon}{value}</span> : null;

  const wrapper = (children: React.ReactNode) => (
    <div className="mt-2 bg-gray-100 rounded px-2 py-2 text-[11.5px] text-gray-700 space-y-1">
      {children}
    </div>
  );

  switch (category) {
    case 'monitor':
      return wrapper(
        <>
          <div className="flex gap-4">
            <Item icon={<MdMonitor className="text-sm" />} value={specs.size || ''} />
            <Item icon={<MdSpeed className="text-sm" />} value={specs.refresh || ''} />
          </div>
          <div className="flex gap-4">
            <Item icon={<FaDesktop className="text-sm" />} value={specs.resolution || ''} />
            <Item icon={<FaLayerGroup className="text-sm" />} value={specs.panel || ''} />
          </div>
        </>
      );

    case 'keyboard':
      return wrapper(
        <>
          <div className="flex gap-4">
            <Item icon={<FaPlug className="text-sm" />} value={specs.connection || ''} />
            <Item icon={<GiSwitchWeapon className="text-sm" />} value={specs.switchType || ''} />
          </div>
          <div className="flex gap-4">
            <Item icon={<MdOutlineKeyboardAlt className="text-sm" />} value={specs.layout || ''} />
            <Item icon={<FaLightbulb className="text-sm" />} value={specs.led || ''} />
          </div>
          <div className="flex gap-4">
            <Item icon={<FaKey className="text-sm" />} value={specs.keycap || ''} />
            <Item icon={<FaHandHolding className="text-sm" />} value={specs.wristRest || ''} />
          </div>
        </>
      );

    case 'mouse':
      return wrapper(
        <>
          <div className="flex gap-4">
            <Item icon={<FaPlug className="text-sm" />} value={specs.wired === 'true' ? 'Có dây' : 'Không dây'} />
            <Item icon={<FaLightbulb className="text-sm" />} value={specs.led || ''} />
          </div>
        </>
      );

    case 'laptop':
    case 'pc':
    default:
      return wrapper(
        <>
          <div className="flex gap-4">
            <Item icon={<FaMicrochip className="text-sm" />} value={specs.cpu || ''} />
            <Item icon={<BsGpuCard className="text-sm" />} value={specs.gpu || ''} />
          </div>
          <div className="flex gap-4">
            <Item icon={<FaMemory className="text-sm" />} value={specs.ram || ''} />
            <Item icon={<FaHdd className="text-sm" />} value={specs.storage || ''} />
          </div>
          <div className="flex gap-4">
            <Item icon={<FaDesktop className="text-sm" />} value={specs.display || ''} />
          </div>
        </>
      );
  }
}
