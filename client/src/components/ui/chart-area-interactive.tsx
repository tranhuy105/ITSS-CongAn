import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
export type ChartAreaInteractiveDataPoint = Record<string, number | string>

export type ChartAreaInteractiveProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  data: ChartAreaInteractiveDataPoint[]
  config: ChartConfig
  dateKey?: string
  seriesKeys: [string, string]
  locale?: string
  defaultRange?: "90d" | "30d" | "7d"
}

function daysFromRange(range: "90d" | "30d" | "7d") {
  if (range === "30d") return 30
  if (range === "7d") return 7
  return 90
}

export function ChartAreaInteractive({
  title = "Biểu đồ vùng (tương tác)",
  description = "Số liệu mock (cố định) theo khoảng thời gian",
  data,
  config,
  dateKey = "date",
  seriesKeys,
  locale = "vi-VN",
  defaultRange = "90d",
}: ChartAreaInteractiveProps) {
  type Range = "90d" | "30d" | "7d"
  const initialRange: Range = defaultRange ?? "90d"
  const [timeRange, setTimeRange] = React.useState<Range>(initialRange)

  const referenceDate = React.useMemo(() => {
    const last = data?.[data.length - 1]?.[dateKey]
    return new Date(typeof last === "string" ? last : String(last ?? ""))
  }, [data, dateKey])

  const filteredData = React.useMemo(() => {
    const daysToSubtract = daysFromRange(timeRange)
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return data.filter((item) => {
      const d = new Date(String(item[dateKey]))
      return !Number.isNaN(d.getTime()) && d >= startDate
    })
  }, [data, dateKey, referenceDate, timeRange])

  const [k1, k2] = seriesKeys

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as Range)}
        >
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="90 ngày gần nhất" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              90 ngày gần nhất
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 ngày gần nhất
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 ngày gần nhất
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${k1})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${k1})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${k2})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${k2})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(String(value)).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={k2}
              type="natural"
              fill="url(#fillMobile)"
              stroke={`var(--color-${k2})`}
              stackId="a"
            />
            <Area
              dataKey={k1}
              type="natural"
              fill="url(#fillDesktop)"
              stroke={`var(--color-${k1})`}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
