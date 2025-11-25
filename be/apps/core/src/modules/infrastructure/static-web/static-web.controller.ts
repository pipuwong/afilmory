import { ContextParam, Controller, Get, Param } from '@afilmory/framework'
import { SkipTenantGuard } from 'core/decorators/skip-tenant.decorator'
import type { Context } from 'hono'

import { StaticBaseController } from './static-base.controller'
import { StaticControllerUtils } from './static-controller.utils'
import { StaticDashboardService } from './static-dashboard.service'
import { StaticWebService } from './static-web.service'

@Controller({ bypassGlobalPrefix: true })
export class StaticWebController extends StaticBaseController {
  constructor(staticWebService: StaticWebService, staticDashboardService: StaticDashboardService) {
    super(staticWebService, staticDashboardService)
  }

  @Get('/')
  @Get('/explory')
  @SkipTenantGuard()
  async getStaticWebIndex(@ContextParam() context: Context) {
    if (StaticControllerUtils.isReservedTenant({ root: true })) {
      return await StaticControllerUtils.renderTenantRestrictedPage(this.staticDashboardService)
    }
    if (StaticControllerUtils.shouldRenderTenantMissingPage()) {
      return await StaticControllerUtils.renderTenantMissingPage(this.staticDashboardService)
    }

    const response = await this.serve(context, this.staticWebService, false)
    if (response.status === 404) {
      return await StaticControllerUtils.renderTenantMissingPage(this.staticDashboardService)
    }
    return await this.staticWebService.decorateHomepageResponse(context, response)
  }

  @Get('/photos/:photoId')
  async getStaticPhotoPage(@ContextParam() context: Context, @Param('photoId') photoId: string) {
    if (StaticControllerUtils.isReservedTenant({ root: true })) {
      return await StaticControllerUtils.renderTenantRestrictedPage(this.staticDashboardService)
    }
    if (StaticControllerUtils.shouldRenderTenantMissingPage()) {
      return await StaticControllerUtils.renderTenantMissingPage(this.staticDashboardService)
    }
    const response = await this.serve(context, this.staticWebService, false)
    if (response.status === 404) {
      return await StaticControllerUtils.renderTenantMissingPage(this.staticDashboardService)
    }
    return await this.staticWebService.decoratePhotoPageResponse(context, photoId, response)
  }
}
