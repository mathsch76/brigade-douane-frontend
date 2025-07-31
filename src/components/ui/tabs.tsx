// src/components/ui/tabs.tsx
import { Tabs as ShadTabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

export const Tabs = ({ value, onValueChange, children, className }: any) => (
  <ShadTabs value={value} onValueChange={onValueChange} className={className}>
    <TabsList className="flex space-x-2 border-b border-gray-700 mb-4">
      {children.map((tab: any) => (
        <TabsTrigger
          key={tab.props.value}
          value={tab.props.value}
          className={`px-4 py-2 cursor-pointer font-medium text-white rounded-t ${
            value === tab.props.value ? "bg-gray-700" : "bg-gray-900"
          }`}
        >
          {tab.props.children}
        </TabsTrigger>
      ))}
    </TabsList>
    {children.map((tab: any) => (
      <TabsContent key={tab.props.value} value={tab.props.value}>
        {value === tab.props.value && tab.props.children}
      </TabsContent>
    ))}
  </ShadTabs>
)

export const Tab = ({ children }: { children: React.ReactNode }) => <>{children}</>
