'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  MicrophoneIcon,
  VideoCameraIcon,
  UserGroupIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
  ShareIcon,
  CodeBracketIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Datos Básicos', href: '/dashboard/basic-data', icon: Cog6ToothIcon },
  { name: 'Redes Sociales', href: '/dashboard/social-networks', icon: ShareIcon },
  { name: 'Programas', href: '/dashboard/programs', icon: MicrophoneIcon },
  { name: 'Noticias', href: '/dashboard/news', icon: DocumentTextIcon },
  { name: 'Ranking Videos', href: '/dashboard/videos', icon: VideoCameraIcon },
  { name: 'Auspiciadores', href: '/dashboard/sponsors', icon: UserGroupIcon },
  { name: 'Promociones', href: '/dashboard/promotions', icon: MegaphoneIcon },
  { name: 'Prueba API', href: '/dashboard/api-test', icon: CodeBracketIcon },
  { name: 'Acerca de', href: '/dashboard/about', icon: InformationCircleIcon },
]

interface SidebarProps {
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto gradient-bg px-6 pb-4 shadow-2xl border-r border-gray-700">
      <div className="flex h-20 shrink-0 items-center justify-center">
        <img
          src="/logo-ipstream.png"
          alt="IPStream Panel"
          className="h-12 w-auto filter drop-shadow-lg"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={`sidebar-item group ${
                        isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-l-full"></div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        </ul>
      </nav>
      
      {/* Footer del sidebar */}
      <div className="glass-effect rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400">IPStream Panel</p>
        <p className="text-xs text-gray-500">v1.0</p>
      </div>
    </div>
  )
}

export function Sidebar({ sidebarOpen = false, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => setSidebarOpen?.(false)}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen?.(false)}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent onLinkClick={() => setSidebarOpen?.(false)} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}