import { useTranslation } from 'react-i18next'

interface FilterStatsProps {
  count: number
}

export const FilterStats = ({ count }: FilterStatsProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <i className="i-mingcute-filter-line text-base text-white/70" />
      <span className="text-sm font-medium text-white/90">{t('gallery.filter.results', { count })}</span>
    </div>
  )
}
