export const PageHeader = ({ 
  title, 
  subtitle, 
  userName,
  emoji = "👋" 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          {title} {userName && `${userName}!`} {emoji}
        </h1>
        <p className="text-default-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
