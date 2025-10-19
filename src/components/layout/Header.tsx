import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import namsaLogo from '@/assets/namsa-logo.png';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  title: string;
  showUserMenu?: boolean;
  bigLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showUserMenu = true, bigLogo = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const getAvatarUrl = () => {
    // Only load avatar if we have a token; otherwise avoid 403 noise
    const token = localStorage.getItem('token');
    if (token && user?.role === 'ARTIST') {
      return `https://api.owellgraphics.com/api/passportphoto/user/${user.id}`;
    }
    return undefined;
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'NA';
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Title + Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <img src={namsaLogo} alt="NAMSA" className={`${bigLogo ? 'h-16 sm:h-20' : 'h-10 sm:h-12'} w-auto object-contain drop-shadow-sm`} />
          <h1 className="text-lg sm:text-xl font-bold text-foreground animate-fade-in truncate max-w-[55vw] sm:max-w-none">
            {title}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover-scale"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {showUserMenu && user && (
            <>
              {/* Mobile sidebar trigger (visible on small screens) */}
              <div className="md:hidden">
                <SidebarTrigger className="hover-scale" />
              </div>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={getAvatarUrl()} 
                        alt={user.email}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-gradient-namsa text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role.toLowerCase()} account
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;