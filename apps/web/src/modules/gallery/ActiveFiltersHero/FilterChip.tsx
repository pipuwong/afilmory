import { Spring } from '@afilmory/utils'
import { m as motion } from 'motion/react'

interface FilterChipProps {
  type: 'tag' | 'camera' | 'lens' | 'rating'
  label: string
  onRemove: () => void
  icon?: string
}

export const FilterChip = ({ type, label, onRemove, icon }: FilterChipProps) => {
  const getIcon = () => {
    if (icon) return icon
    switch (type) {
      case 'tag': {
        return 'i-lucide-tag'
      }
      case 'camera': {
        return 'i-lucide-camera'
      }
      case 'lens': {
        return 'i-lucide-aperture'
      }
      case 'rating': {
        return 'i-lucide-star'
      }
      default: {
        return 'i-lucide-filter'
      }
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={Spring.presets.snappy}
      className="group flex max-w-[280px] min-w-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/15 sm:max-w-[320px]"
    >
      <i className={`${getIcon()} shrink-0 text-xs text-white/70`} />
      <span className="min-w-0 truncate text-white/90">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 flex shrink-0 items-center justify-center rounded-full p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
        aria-label="Remove filter"
      >
        <i className="i-lucide-x text-xs" />
      </button>
    </motion.div>
  )
}
