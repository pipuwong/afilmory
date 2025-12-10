import {
  Button,
  Input,
  Modal,
  Prompt,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@afilmory/ui'
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, RefreshCcwIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { LinearBorderPanel } from '~/components/common/LinearBorderPanel'
import { getRequestErrorMessage } from '~/lib/errors'
import { buildTenantUrl } from '~/modules/auth/utils/domain'

import {
  useDeleteTenantMutation,
  useSuperAdminTenantsQuery,
  useUpdateTenantBanMutation,
  useUpdateTenantPlanMutation,
  useUpdateTenantStoragePlanMutation,
} from '../hooks'
import type { BillingPlanDefinition, StoragePlanDefinition, SuperAdminTenantSummary } from '../types'
import { TenantDetailModal } from './TenantDetailModal'
import { TenantUsageCell } from './TenantUsageCell'

const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function TenantSubscriptionsPanel() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status, setStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { t } = useTranslation()

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
    status: status === 'all' ? undefined : status,
    sortBy,
    sortDir,
  })

  const updatePlanMutation = useUpdateTenantPlanMutation()
  const updateStoragePlanMutation = useUpdateTenantStoragePlanMutation()
  const updateBanMutation = useUpdateTenantBanMutation()
  const deleteTenantMutation = useDeleteTenantMutation()

  const { data, isLoading, isError } = tenantsQuery
  const plans = data?.plans ?? []
  const storagePlans = data?.storagePlans ?? []
  const tenants = data?.tenants ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  const showSkeleton = isLoading && tenants.length === 0

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const handlePlanChange = (tenant: SuperAdminTenantSummary, planId: string) => {
    if (planId === tenant.planId) {
      return
    }
    updatePlanMutation.mutate(
      { tenantId: tenant.id, planId },
      {
        onSuccess: () => {
          toast.success(t('superadmin.tenants.toast.plan-success', { name: tenant.name, planId }))
        },
        onError: (error) => {
          toast.error(t('superadmin.tenants.toast.plan-error'), {
            description: error instanceof Error ? error.message : t('common.retry-later'),
          })
        },
      },
    )
  }

  const handleStoragePlanChange = (tenant: SuperAdminTenantSummary, storagePlanId: string | null) => {
    const nextId = storagePlanId === 'default' ? null : storagePlanId
    if (nextId === tenant.storagePlanId) {
      return
    }
    updateStoragePlanMutation.mutate(
      { tenantId: tenant.id, storagePlanId: nextId },
      {
        onSuccess: () => {
          toast.success(t('superadmin.tenants.toast.storage-plan-success', { name: tenant.name }))
        },
        onError: (error) => {
          toast.error(t('superadmin.tenants.toast.storage-plan-error'), {
            description: error instanceof Error ? error.message : t('common.retry-later'),
          })
        },
      },
    )
  }

  const handleToggleBanned = (tenant: SuperAdminTenantSummary) => {
    const next = !tenant.banned
    updateBanMutation.mutate(
      { tenantId: tenant.id, banned: next },
      {
        onSuccess: () => {
          toast.success(
            next
              ? t('superadmin.tenants.toast.ban-success', { name: tenant.name })
              : t('superadmin.tenants.toast.unban-success', { name: tenant.name }),
          )
        },
        onError: (error) => {
          toast.error(t('superadmin.tenants.toast.ban-error'), {
            description: error instanceof Error ? error.message : t('common.retry-later'),
          })
        },
      },
    )
  }

  const isPlanUpdating = (tenantId: string) =>
    updatePlanMutation.isPending && updatePlanMutation.variables?.tenantId === tenantId
  const isStoragePlanUpdating = (tenantId: string) =>
    updateStoragePlanMutation.isPending && updateStoragePlanMutation.variables?.tenantId === tenantId
  const isBanUpdating = (tenantId: string) =>
    updateBanMutation.isPending && updateBanMutation.variables?.tenantId === tenantId
  const isDeleting = (tenantId: string) => deleteTenantMutation.isPending && deleteTenantMutation.variables === tenantId

  const handleDeleteTenant = (tenant: SuperAdminTenantSummary) => {
    const requiredSlug = tenant.slug.trim()

    Prompt.input({
      title: t('superadmin.tenants.prompt.delete.title'),
      description: t('superadmin.tenants.prompt.delete.description', { name: tenant.name }),
      placeholder: t('superadmin.tenants.prompt.delete.placeholder', { slug: requiredSlug }),
      variant: 'danger',
      onConfirmText: t('superadmin.tenants.prompt.delete.confirm'),
      onCancelText: t('superadmin.tenants.prompt.delete.cancel'),
      onConfirm: (input) => {
        const normalized = input.trim()
        if (normalized !== requiredSlug) {
          toast.error(t('superadmin.tenants.prompt.delete.mismatch'), {
            description: t('superadmin.tenants.prompt.delete.placeholder', { slug: requiredSlug }),
          })
          return
        }

        deleteTenantMutation.mutate(tenant.id, {
          onSuccess: () => {
            toast.success(t('superadmin.tenants.toast.delete-success', { name: tenant.name }))
          },
          onError: (error) => {
            const description = getRequestErrorMessage(error, t('common.retry-later'))
            toast.error(t('superadmin.tenants.toast.delete-error'), { description })
          },
        })
      },
    })
  }

  const handleOpenTenantDetail = (tenant: SuperAdminTenantSummary) => {
    Modal.present(TenantDetailModal, { tenant })
  }

  if (isError) {
    return (
      <LinearBorderPanel className="p-6 text-sm text-red">
        {t('superadmin.tenants.error.loading', {
          reason: tenantsQuery.error instanceof Error ? tenantsQuery.error.message : t('common.unknown-error'),
        })}
      </LinearBorderPanel>
    )
  }

  if (showSkeleton) {
    return <TenantSkeleton />
  }

  return (
    <LinearBorderPanel className="p-6 bg-background-secondary flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[200px]">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('superadmin.tenants.filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('superadmin.tenants.filter.all')}</SelectItem>
                <SelectItem value="active">{t('superadmin.tenants.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('superadmin.tenants.status.inactive')}</SelectItem>
                <SelectItem value="suspended">{t('superadmin.tenants.status.suspended')}</SelectItem>
                <SelectItem value="pending">{t('superadmin.tenants.status.pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[240px] relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary pointer-events-none" />
            <Input
              className="pl-9"
              placeholder={t('superadmin.tenants.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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

      {tenants.length === 0 ? (
        <p className="text-text-secondary text-sm">{t('superadmin.tenants.empty')}</p>
      ) : (
        <>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-border/40 text-sm">
              <thead>
                <tr className="text-text-tertiary text-xs uppercase tracking-wide">
                  <th
                    className="px-3 py-2 text-left cursor-pointer hover:text-text select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      {t('superadmin.tenants.table.tenant')}
                      <SortIcon field="name" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left">{t('superadmin.tenants.table.plan')}</th>
                  <th className="px-3 py-2 text-left">{t('superadmin.tenants.table.storage-plan')}</th>
                  <th className="px-3 py-2 text-left">{t('superadmin.tenants.table.usage')}</th>
                  <th className="px-3 py-2 text-center">{t('superadmin.tenants.table.status')}</th>
                  <th
                    className="px-3 py-2 text-left cursor-pointer hover:text-text select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      {t('superadmin.tenants.table.created')}
                      <SortIcon field="createdAt" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right">{t('superadmin.tenants.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {tenants.map((tenant) => (
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
                      <PlanSelector
                        value={tenant.planId}
                        plans={plans}
                        disabled={isPlanUpdating(tenant.id)}
                        onChange={(nextPlan) => handlePlanChange(tenant, nextPlan)}
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StoragePlanSelector
                        value={tenant.storagePlanId}
                        plans={storagePlans}
                        disabled={isStoragePlanUpdating(tenant.id)}
                        onChange={(nextPlan) => handleStoragePlanChange(tenant, nextPlan)}
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleOpenTenantDetail(tenant)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleOpenTenantDetail(tenant)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <TenantUsageCell usageTotals={tenant.usageTotals} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center align-top">
                      <StatusBadge status={tenant.status} banned={tenant.banned} />
                    </td>
                    <td className="px-3 py-3 align-top text-text-secondary text-xs">
                      {formatDateLabel(tenant.createdAt)}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className={tenant.banned ? 'text-rose-400' : undefined}
                          onClick={() => handleToggleBanned(tenant)}
                          disabled={isBanUpdating(tenant.id)}
                        >
                          {isBanUpdating(tenant.id)
                            ? t('superadmin.tenants.button.processing')
                            : tenant.banned
                              ? t('superadmin.tenants.button.unban')
                              : t('superadmin.tenants.button.ban')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={isDeleting(tenant.id)}
                          onClick={() => handleDeleteTenant(tenant)}
                        >
                          {isDeleting(tenant.id)
                            ? t('superadmin.tenants.button.processing')
                            : t('superadmin.tenants.button.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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

function PlanSelector({
  value,
  plans,
  disabled,
  onChange,
}: {
  value: string
  plans: BillingPlanDefinition[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={(next) => onChange(next)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={t('superadmin.tenants.plan.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem value={plan.id} key={plan.id}>
              {plan.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <PlanDescription plan={plans.find((plan) => plan.id === value)} />
    </div>
  )
}

function StoragePlanSelector({
  value,
  plans,
  disabled,
  onChange,
}: {
  value?: string | null
  plans: StoragePlanDefinition[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const current = value ?? 'default'
  return (
    <div className="space-y-1">
      <Select value={current} onValueChange={(next) => onChange(next)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={t('superadmin.tenants.storage-plan.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">{t('superadmin.tenants.storage-plan.default')}</SelectItem>
          {plans.map((plan) => (
            <SelectItem value={plan.id} key={plan.id}>
              {plan.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {current !== 'default' && <PlanDescription plan={plans.find((p) => p.id === current)} />}
    </div>
  )
}

function PlanDescription({ plan }: { plan: BillingPlanDefinition | StoragePlanDefinition | undefined }) {
  if (!plan) {
    return null
  }
  return <p className="text-text-tertiary text-xs">{plan.description}</p>
}

function StatusBadge({ status, banned }: { status: SuperAdminTenantSummary['status']; banned: boolean }) {
  const { t } = useTranslation()
  if (banned) {
    return (
      <span className="bg-rose-500/10 text-rose-400 rounded-full px-2 py-0.5 text-xs">
        {t('superadmin.tenants.status.banned')}
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="bg-emerald-500/10 text-emerald-400 rounded-full px-2 py-0.5 text-xs">
        {t('superadmin.tenants.status.active')}
      </span>
    )
  }
  if (status === 'suspended') {
    return (
      <span className="bg-amber-500/10 text-amber-400 rounded-full px-2 py-0.5 text-xs">
        {t('superadmin.tenants.status.suspended')}
      </span>
    )
  }

  return (
    <span className="bg-slate-500/10 text-slate-400 rounded-full px-2 py-0.5 text-xs">
      {t('superadmin.tenants.status.inactive')}
    </span>
  )
}

function SortIcon({ field, sortBy, sortDir }: { field: string; sortBy: string; sortDir: 'asc' | 'desc' }) {
  if (sortBy !== field) {
    return null
  }
  return sortDir === 'asc' ? <ArrowUpIcon className="size-3 ml-1" /> : <ArrowDownIcon className="size-3 ml-1" />
}

function formatDateLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return DATE_FORMATTER.format(date)
}

function TenantSkeleton() {
  return (
    <LinearBorderPanel className="space-y-4 p-6">
      <div className="bg-fill/40 h-6 w-1/3 animate-pulse rounded" />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`tenant-skeleton-${index}`} className="bg-fill/20 h-14 animate-pulse rounded" />
        ))}
      </div>
    </LinearBorderPanel>
  )
}
