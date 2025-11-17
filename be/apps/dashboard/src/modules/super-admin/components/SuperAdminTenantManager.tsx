import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@afilmory/ui'
import { Spring } from '@afilmory/utils'
import { RefreshCcwIcon } from 'lucide-react'
import { m } from 'motion/react'
import { toast } from 'sonner'

import { LinearBorderPanel } from '~/components/common/GlassPanel'

import { useSuperAdminTenantsQuery, useUpdateTenantBanMutation, useUpdateTenantPlanMutation } from '../hooks'
import type { BillingPlanDefinition, SuperAdminTenantSummary } from '../types'

const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function SuperAdminTenantManager() {
  const tenantsQuery = useSuperAdminTenantsQuery()
  const updatePlanMutation = useUpdateTenantPlanMutation()
  const updateBanMutation = useUpdateTenantBanMutation()

  const { isLoading } = tenantsQuery
  const { isError } = tenantsQuery
  const { data } = tenantsQuery

  const plans = data?.plans ?? []
  const tenants = data?.tenants ?? []

  const handlePlanChange = (tenant: SuperAdminTenantSummary, planId: string) => {
    if (planId === tenant.planId) {
      return
    }
    updatePlanMutation.mutate(
      { tenantId: tenant.id, planId },
      {
        onSuccess: () => {
          toast.success(`已将 ${tenant.name} 切换到 ${planId} 计划`)
        },
        onError: (error) => {
          toast.error('更新订阅失败', {
            description: error instanceof Error ? error.message : '请稍后再试',
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
          toast.success(next ? `已封禁租户 ${tenant.name}` : `已解除封禁 ${tenant.name}`)
        },
        onError: (error) => {
          toast.error('更新封禁状态失败', {
            description: error instanceof Error ? error.message : '请稍后再试',
          })
        },
      },
    )
  }

  const isPlanUpdating = (tenantId: string) =>
    updatePlanMutation.isPending && updatePlanMutation.variables?.tenantId === tenantId

  const isBanUpdating = (tenantId: string) =>
    updateBanMutation.isPending && updateBanMutation.variables?.tenantId === tenantId

  if (isError) {
    return (
      <LinearBorderPanel className="p-6 text-sm text-red">
        无法加载租户数据：{tenantsQuery.error instanceof Error ? tenantsQuery.error.message : '未知错误'}
      </LinearBorderPanel>
    )
  }

  if (isLoading) {
    return <TenantSkeleton />
  }

  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={Spring.presets.smooth}>
      <LinearBorderPanel className="p-6 bg-background-secondary">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-text text-lg font-semibold">租户列表</h2>
            <p className="text-text-secondary text-sm">手动切换订阅计划或封禁违规租户。</p>
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
            {tenantsQuery.isFetching ? '正在刷新…' : '刷新列表'}
          </Button>
        </header>

        {tenants.length === 0 ? (
          <p className="text-text-secondary text-sm">当前没有可管理的租户。</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-border/40 text-sm">
              <thead>
                <tr className="text-text-tertiary text-xs uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">租户</th>
                  <th className="px-3 py-2 text-left">订阅计划</th>
                  <th className="px-3 py-2 text-center">状态</th>
                  <th className="px-3 py-2 text-center">封禁</th>
                  <th className="px-3 py-2 text-left">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-text">{tenant.name}</div>
                      <div className="text-text-secondary text-xs">{tenant.slug}</div>
                    </td>
                    <td className="px-3 py-3">
                      <PlanSelector
                        value={tenant.planId}
                        plans={plans}
                        disabled={isPlanUpdating(tenant.id)}
                        onChange={(nextPlan) => handlePlanChange(tenant, nextPlan)}
                      />
                    </td>
                    <td className="px-3 flex mt-4 justify-center">
                      <StatusBadge status={tenant.status} banned={tenant.banned} />
                    </td>
                    <td className="px-3 flex mt-4 justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={tenant.banned ? 'text-rose-400' : undefined}
                        onClick={() => handleToggleBanned(tenant)}
                        disabled={isBanUpdating(tenant.id)}
                      >
                        {isBanUpdating(tenant.id) ? '处理中…' : tenant.banned ? '解除封禁' : '封禁'}
                      </Button>
                    </td>
                    <td className="px-3 py-3 text-text-secondary text-xs">{formatDateLabel(tenant.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LinearBorderPanel>
    </m.div>
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
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={(value) => onChange(value)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="选择订阅计划" />
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

function PlanDescription({ plan }: { plan: BillingPlanDefinition | undefined }) {
  if (!plan) {
    return null
  }
  return <p className="text-text-tertiary text-xs">{plan.description}</p>
}

function StatusBadge({ status, banned }: { status: SuperAdminTenantSummary['status']; banned: boolean }) {
  if (banned) {
    return <span className="bg-rose-500/10 text-rose-400 rounded-full px-2 py-0.5 text-xs">已封禁</span>
  }
  if (status === 'active') {
    return <span className="bg-emerald-500/10 text-emerald-400 rounded-full px-2 py-0.5 text-xs">活跃</span>
  }
  if (status === 'suspended') {
    return <span className="bg-amber-500/10 text-amber-400 rounded-full px-2 py-0.5 text-xs">已暂停</span>
  }
  return <span className="bg-slate-500/10 text-slate-400 rounded-full px-2 py-0.5 text-xs">未激活</span>
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
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`tenant-skeleton-${index}`} className="bg-fill/20 h-14 animate-pulse rounded" />
        ))}
      </div>
    </LinearBorderPanel>
  )
}
