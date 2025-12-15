import { useEffect, useState } from "react";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { UserInitial } from "./UserInitial";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SearchModal } from "./SearchModal";
import type { UserProfileResponse } from "../interfaces/user";
import type { EnterpriseCreationResponse, UserEnterpriseResponse } from "../interfaces/auth";
import { hasPermission } from "../utils/permissionUtils";

interface AppNavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
}

export function AppNavbar({ darkMode, toggleDarkMode, onLogout, onMobileMenuToggle }: AppNavbarProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [enterpriseData] = useState<EnterpriseCreationResponse | null>(() => {
    const stored = localStorage.getItem('currentEnterprise');
    return stored ? (JSON.parse(stored) as EnterpriseCreationResponse) : null;
  });

  const userRelationEnterprise: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;


  useEffect(() => {
    const data: string = localStorage.getItem('currentUser') ?? '';
    if (data) {
      const parsedData: UserProfileResponse = JSON.parse(data) as UserProfileResponse;
      setProfileData(parsedData);
    }
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/50" style={{ ['--navbar-height' as any]: '4rem' }}>
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Mobile menu button + Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              className="md:hidden rounded-lg"
              size="icon"
              variant="ghost"
              onClick={onMobileMenuToggle}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white">N</span>
            </div>
            <span className="hidden sm:block">Dayrosoft</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <button
              className="relative w-full"
              onClick={() => setSearchModalOpen(true)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <div className="w-full pl-10 pr-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 text-left text-muted-foreground hover:border-blue-500/50 transition-colors">
                Search...
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Search button - Mobile only */}
            <Button
              className="md:hidden rounded-lg"
              size="icon"
              variant="ghost"
              onClick={() => setSearchModalOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Dark mode toggle */}
            <Button
              className="rounded-lg"
              size="icon"
              variant="ghost"
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Profile */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button className="rounded-lg gap-2 px-2" variant="ghost">
                  <UserInitial />
                  <span className="hidden lg:block">{profileData?.firstName ?? "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/50">
                <DropdownMenuLabel> {`${enterpriseData?.name ?? ""} \n ${enterpriseData?.id ?? ""}`} </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>Profile</DropdownMenuItem>
                {(userRelationEnterprise?.enterprises?.[0]?.isOwner || hasPermission('ROLES', ['READ', 'UPDATE', 'MANAGE', 'CREATE', 'DELETE'])) && (
                  <DropdownMenuItem onClick={() => window.location.href = '/roles'}>Roles</DropdownMenuItem>
                )}
                {userRelationEnterprise?.enterprises?.[0]?.isOwner &&
                  (
                    <DropdownMenuItem onClick={() => window.location.href = '/users-settings'}>Users</DropdownMenuItem>
                  )
                }
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
}
