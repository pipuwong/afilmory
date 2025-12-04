import { ModalContainer } from '@afilmory/ui'
import { Toaster } from '@afilmory/ui/sonner.jsx'
import { Spring } from '@afilmory/utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { domMax, LazyMotion, MotionConfig } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'

import { jotaiStore } from '~/lib/jotai'
import { queryClient } from '~/lib/query-client'

import { ContextMenuProvider } from './context-menu-provider'
import { EventProvider } from './event-provider'
import { I18nProvider } from './i18n-provider'
import { StableRouterProvider } from './stable-router-provider'

export const RootProviders: FC<PropsWithChildren> = ({ children }) => (
  <LazyMotion features={domMax} strict>
    <MotionConfig transition={Spring.presets.smooth}>
      <QueryClientProvider client={queryClient}>
        <Provider store={jotaiStore}>
          <I18nProvider>
            <EventProvider />
            <StableRouterProvider />

            <ContextMenuProvider />
            <ModalContainer />
            {children}
          </I18nProvider>
        </Provider>
      </QueryClientProvider>
    </MotionConfig>
    <Toaster />
  </LazyMotion>
)
