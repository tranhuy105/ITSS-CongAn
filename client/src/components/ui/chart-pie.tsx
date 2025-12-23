import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type ChartPieDatum = {
  key: string
  value: number
}

export type ChartPieProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  data: ChartPieDatum[]
  config: ChartConfig
  valueKey?: string
  nameKey?: string
  innerRadius?: number
  showLegend?: boolean
}

export function ChartPie({
  title = "Biểu đồ tròn",
  description,
  data,
  config,
  valueKey = "value",
  nameKey = "key",
  innerRadius = 62,
  showLegend = true,
}: ChartPieProps) {
  const total = React.useMemo(
    () => data.reduce((acc, cur) => acc + (cur.value ?? 0), 0),
    [data]
  )

  const legendItems = React.useMemo(() => {
    return (data ?? [])
      .filter((d) => d && typeof d.key === "string")
      .map((d) => ({
        key: d.key,
        label: config?.[d.key]?.label ?? d.key,
        // Legend nằm ngoài ChartContainer nên không dùng được --color-<key>.
        // Lấy màu trực tiếp từ config (thường là var(--chart-n)).
        color: config?.[d.key]?.color ?? `var(--color-${d.key})`,
      }))
  }, [config, data])

  return (
    <Card className="pt-0">
      <CardHeader className="space-y-1 border-b py-5">
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    // name thường là key; hiển thị % cho dễ nhìn
                    const v = Number(value ?? 0)
                    const pct =
                      total > 0 ? ` (${Math.round((v / total) * 100)}%)` : ""
                    return (
                      <span className="tabular-nums">
                        {v.toLocaleString("vi-VN")}
                        {pct}
                      </span>
                    )
                  }}
                  indicator="dot"
                />
              }
            />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
              strokeWidth={2}
            >
              {(data ?? []).map((entry) => (
                <Cell
                  key={entry.key}
                  fill={`var(--color-${entry.key})`}
                  stroke="hsl(var(--background))"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {showLegend ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            {legendItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}


