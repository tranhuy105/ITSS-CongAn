import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  type TooltipContentProps as RechartsTooltipContentProps,
} from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
  }
>

type ChartContextValue = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChart must be used within <ChartContainer />")
  return ctx
}

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
  children: React.ReactElement
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  // Inject CSS variables like: --color-mobile, --color-desktop
  const styleVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(config)) {
      if (value?.color) vars[`--color-${key}`] = value.color
    }
    return vars as React.CSSProperties
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("w-full", className)}
        style={styleVars}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

type TooltipPayloadItem = {
  dataKey?: string
  name?: string
  value?: number | string
  color?: string
}

function defaultGetItemLabel(
  cfg: ChartConfig,
  item: TooltipPayloadItem
): string {
  // Với PieChart, item.dataKey thường là "value" (tên field), còn item.name mới là slice name.
  // Nên ưu tiên name trước để tránh hiện "value".
  const key = String(item.name ?? item.dataKey ?? "")
  return cfg[key]?.label ?? key
}

export function ChartTooltip(props: React.ComponentProps<typeof RechartsTooltip>) {
  return <RechartsTooltip {...props} />
}

export type ChartTooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  labelFormatter?: (label: unknown) => React.ReactNode
  indicator?: "dot" | "line" | "none"
  formatter?: (value: unknown, name: unknown) => React.ReactNode
}

type RechartsContentProps = RechartsTooltipContentProps<number | string, string>

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  labelFormatter,
  indicator = "dot",
  formatter,
}: ChartTooltipContentProps & Partial<RechartsContentProps>) {
  const { config } = useChart()

  // Recharts uses payload items with many shapes; we only need a small subset.
  const items = (payload ?? []) as TooltipPayloadItem[]

  if (!active || !items.length) return null

  const title = labelFormatter ? labelFormatter(label) : String(label ?? "")

  return (
    <div
      className={cn(
        "rounded-lg border bg-background px-3 py-2 text-sm shadow-md",
        className
      )}
    >
      <div className="mb-2 font-medium leading-none">{title}</div>
      <div className="space-y-1">
        {items.map((item, idx) => {
          const key = String(item.dataKey ?? item.name ?? idx)
          const color =
            item.color ??
            (config[key]?.color ? `var(--color-${key})` : undefined)
          const labelText = defaultGetItemLabel(config, item)
          const valueNode = formatter
            ? formatter(item.value, item.name)
            : String(item.value ?? "")

          return (
            <div key={key} className="flex items-center gap-2">
              {indicator !== "none" && (
                <span
                  className={cn(
                    "inline-block",
                    indicator === "dot" && "h-2 w-2 rounded-full",
                    indicator === "line" && "h-0.5 w-3 rounded-full"
                  )}
                  style={{ background: color }}
                />
              )}
              <span className="text-muted-foreground">{labelText}</span>
              <span className="ml-auto tabular-nums">{valueNode}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegend(props: React.ComponentProps<typeof RechartsLegend>) {
  return <RechartsLegend {...props} />
}

export function ChartLegendContent({
  className,
  payload,
}: React.HTMLAttributes<HTMLDivElement> & {
  payload?: Array<{ dataKey?: string; value?: string; color?: string }>
}) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs", className)}>
      {payload.map((entry, idx) => {
        const key = String(entry.dataKey ?? entry.value ?? idx)
        const label = config[key]?.label ?? entry.value ?? key
        const color =
          entry.color ?? (config[key]?.color ? `var(--color-${key})` : undefined)
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: color }}
            />
            <span className="text-muted-foreground">{label}</span>
          </div>
        )
      })}
    </div>
  )
}


