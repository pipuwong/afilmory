import { AnimatePresence } from 'motion/react'

import { FilterChip } from './FilterChip'

interface FilterChipsProps {
  tags: string[]
  cameras: string[]
  lenses: string[]
  rating: number | null
  onRemoveTag: (tag: string) => void
  onRemoveCamera: (camera: string) => void
  onRemoveLens: (lens: string) => void
  onRemoveRating: () => void
}

export const FilterChips = ({
  tags,
  cameras,
  lenses,
  rating,
  onRemoveTag,
  onRemoveCamera,
  onRemoveLens,
  onRemoveRating,
}: FilterChipsProps) => {
  const hasFilters = tags.length > 0 || cameras.length > 0 || lenses.length > 0 || rating !== null

  if (!hasFilters) return null

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <AnimatePresence mode="popLayout">
        {tags.map((tag) => (
          <FilterChip key={`tag-${tag}`} type="tag" label={tag} onRemove={() => onRemoveTag(tag)} />
        ))}
        {cameras.map((camera) => (
          <FilterChip key={`camera-${camera}`} type="camera" label={camera} onRemove={() => onRemoveCamera(camera)} />
        ))}
        {lenses.map((lens) => (
          <FilterChip key={`lens-${lens}`} type="lens" label={lens} onRemove={() => onRemoveLens(lens)} />
        ))}
        {rating !== null && (
          <FilterChip key="rating" type="rating" label={`${rating}+`} onRemove={onRemoveRating} icon="i-lucide-star" />
        )}
      </AnimatePresence>
    </div>
  )
}
