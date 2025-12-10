import { Button, Input } from '@afilmory/ui'
import { ChevronLeftIcon, ChevronRightIcon, RefreshCcwIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LinearBorderPanel } from '~/components/common/LinearBorderPanel'
import { buildTenantUrl } from '~/modules/auth/utils/domain'

import { useSuperAdminTenantsQuery } from '../hooks'
import type { StoragePlanDefinition } from '../types'
import { formatBytes } from './TenantUsageCell'

export function TenantStoragePanel() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language ?? i18n.resolvedLanguage ?? 'en'
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const tenantsQuery = useSuperAdminTenantsQuery({
    page,
    limit,
    search: debouncedSearch,
    sortBy: 'name',
    sortDir: 'asc',
  })

  const { data, isLoading, isError } = tenantsQuery
  const tenants = data?.tenants ?? []
  const storagePlans = data?.storagePlans ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const planMap = useMemo(() => {
    const entries = new Map<string, StoragePlanDefinition>()
    storagePlans.forEach((plan) => entries.set(plan.id, plan))
    return entries
  }, [storagePlans])

  const rows = useMemo(() => {
    return tenants
      .filter((tenant) => Boolean(tenant.storagePlanId))
      .map((tenant) => ({
        tenant,
        plan: tenant.storagePlanId ? planMap.get(tenant.storagePlanId) : undefined,
        usage: tenant.storageUsage ?? null,
      }))
      .sort((a, b) => (b.usage?.totalBytes ?? 0) - (a.usage?.totalBytes ?? 0))
  }, [planMap, tenants])

  const showSkeleton = isLoading && rows.length === 0

  if (isError) {
    return (
      <LinearBorderPanel className="p-6 text-sm text-red">
        {t('superadmin.tenants.error.loading', {
          reason: tenantsQuery.error instanceof Error ? tenantsQuery.error.message : t('common.unknown-error'),
        })}
      </LinearBorderPanel>
    )
  }

  const resolveCapacityLabel = (plan?: StoragePlanDefinition) => {
    if (!plan) {
      return t('superadmin.tenants.storage.usage.unknown')
    }
    if (plan.capacityBytes === null) {
      return t('superadmin.tenants.storage.usage.unlimited')
    }
    if (typeof plan.capacityBytes !== 'number' || plan.capacityBytes <= 0) {
      return t('superadmin.tenants.storage.usage.unknown')
    }
    return formatBytes(plan.capacityBytes)
  }

  return (
    <LinearBorderPanel className="p-6 bg-background-secondary flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="w-[240px] relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary pointer-events-none" />
          <Input
            className="pl-9"
            placeholder={t('superadmin.tenants.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => tenantsQuery.refetch()}
          disabled={tenantsQuery.isFetching}
        >
          <RefreshCcwIcon className="size-4" />
          <span>
            {tenantsQuery.isFetching ? t('superadmin.tenants.refresh.loading') : t('superadmin.tenants.refresh.button')}
          </span>
        </Button>
      </div>

      {showSkeleton ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`storage-tenant-skeleton-${index}`} className="bg-fill/20 h-16 animate-pulse rounded" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-text-secondary text-sm">{t('superadmin.tenants.storage.empty')}</p>
      ) : (
        <>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-border/40 text-sm">
              <thead>
                <tr className="text-text-tertiary text-xs uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">{t('superadmin.tenants.storage.columns.tenant')}</th>
                  <th className="px-3 py-2 text-left">{t('superadmin.tenants.storage.columns.plan')}</th>
                  <th className="px-3 py-2 text-left">{t('superadmin.tenants.storage.columns.usage')}</th>
                  <th className="px-3 py-2 text-right">{t('superadmin.tenants.storage.columns.files')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {rows.map(({ tenant, plan, usage }) => {
                  const capacityLabel = resolveCapacityLabel(plan)
                  const usageLabel = usage
                    ? t('superadmin.tenants.storage.usage.of', {
                        used: formatBytes(usage.totalBytes),
                        total: capacityLabel,
                      })
                    : t('superadmin.tenants.storage.usage.unknown')
                  const progress =
                    usage && typeof plan?.capacityBytes === 'number' && plan.capacityBytes > 0
                      ? Math.min(100, (usage.totalBytes / plan.capacityBytes) * 100)
                      : null
                  const filesLabel = usage ? numberFormatter.format(usage.fileCount ?? 0) : '—'

                  return (
                    <tr key={tenant.id}>
                      <td className="px-3 py-3 align-top">
                        <div className="font-medium text-text">
                          <a
                            href={buildTenantUrl(tenant.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {tenant.name}
                          </a>
                        </div>
                        <div className="text-text-secondary text-xs">{tenant.slug}</div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="font-medium text-text">
                          {plan?.name ?? t('superadmin.tenants.storage.usage.unknown')}
                        </div>
                        <div className="text-text-secondary text-xs">{capacityLabel}</div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-text text-sm font-medium">{usageLabel}</div>
                        {progress !== null && (
                          <div className="bg-fill/20 mt-2 h-1.5 w-full rounded-full overflow-hidden">
                            <div className="bg-accent/70 h-full" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-right text-text-secondary text-sm">{filesLabel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <div className="text-xs text-text-tertiary">
              {t('superadmin.tenants.pagination.showing', {
                start: (page - 1) * limit + 1,
                end: Math.min(page * limit, total),
                total,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={page <= 1 || tenantsQuery.isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <div className="text-sm text-text-secondary font-medium">
                <span>{page}</span> / <span>{totalPages || 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                disabled={page >= totalPages || tenantsQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </LinearBorderPanel>
  )
}
