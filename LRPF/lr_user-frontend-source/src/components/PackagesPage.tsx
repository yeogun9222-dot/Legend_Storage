import { PackageSection } from './PackageSection';

export const PackagesPage = ({
  onInvestClick,
  packages,
}: {
  onInvestClick: (id: string) => void;
  packages?: any[];
}) => {
  return (
    <div className="pt-24 pb-24 px-6 lg:px-10 max-w-7xl mx-auto">
      <PackageSection onSelect={onInvestClick} packages={packages} />
    </div>
  );
};
