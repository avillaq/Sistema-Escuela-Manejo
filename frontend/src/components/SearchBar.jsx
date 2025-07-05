import { Input, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  isSearching = false,
  placeholder = "Buscar...",
  className = ""
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        placeholder={placeholder}
        value={value}
        onValueChange={onChange}
        onKeyDown={handleKeyPress}
        startContent={<Icon icon="lucide:search" className="text-default-400" />}
        className="flex-1"
        description="Presiona Enter para buscar"
      />
      <Button
        color="primary"
        onPress={onSearch}
        isLoading={isSearching}
        startContent={!isSearching && <Icon icon="lucide:search" width={16} height={16} />}
        className="min-w-[120px]"
      >
        {isSearching ? "Buscando..." : "Buscar"}
      </Button>
    </div>
  );
};