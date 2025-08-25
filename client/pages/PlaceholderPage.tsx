import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <DashboardLayout>
      <div className="col-span-full">
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ui-03 mb-6">
            <Construction className="h-8 w-8 text-text-02" />
          </div>
          <h1 className="carbon-type-productive-heading-04 text-text-01 mb-4">
            {title}
          </h1>
          <p className="carbon-type-body-02 text-text-02 max-w-lg mb-8">
            {description}
          </p>
          <p className="carbon-type-body-01 text-text-03">
            This page is coming soon. Continue prompting to have this content
            implemented.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
