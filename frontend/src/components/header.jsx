import { Icon } from '@iconify/react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Badge } from '@heroui/react';
import { useAuthStore } from '../store/auth-store';

export const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-content1 border-b border-divider h-16 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          aria-label="Toggle sidebar"
          onPress={toggleSidebar}
        >
          <Icon icon="lucide:menu" width={20} height={20} />
        </Button>
        <div className="hidden md:block w-64">
          <Input
            placeholder="Search..."
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            size="sm"
            radius="lg"
            classNames={{
              inputWrapper: "bg-default-100"
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button isIconOnly variant="light" aria-label="Notifications" className="relative">
          <Badge content="5" color="danger" shape="circle" size="sm">
            <Icon icon="lucide:bell" width={20} height={20} />
          </Badge>
        </Button>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              className="flex items-center gap-2"
              endContent={<Icon icon="lucide:chevron-down" width={16} height={16} />}
            >
              <Avatar
                src={user?.avatar || "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"}
                size="sm"
                isBordered
                color="primary"
              />
              <span className="hidden md:inline">{user?.name || "Admin"}</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem key="profile" startContent={<Icon icon="lucide:user" width={18} height={18} />}>
              Profile
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Icon icon="lucide:settings" width={18} height={18} />}>
              Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              startContent={<Icon icon="lucide:log-out" width={18} height={18} />}
              className="text-danger"
              color="danger"
              onPress={logout}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};