import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { formatDate } from '../lib/dateUtils.ts'

export const description = "A linear line chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

export const chartConfig = {
  ending_elo: {
    label: "Elo Rating",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const FighterEloChart = ({fighter}) => {

  return (
    <Card>
      <CardHeader>
        <div className="flex">
            <CardTitle>Fighter Rating History</CardTitle>
            <CardDescription className="ml-5">{formatDate(fighter.elo_history[0].date)} - {formatDate(fighter.elo_history[fighter.elo_history.length - 1].date)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={fighter.elo_history}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis
              domain={['dataMin - 25', 'dataMax + 25']}
              tickFormatter={(value) => Math.round(value)}
            />
            {/* <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            /> */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(value) => `Date: ${formatDate(value)}`}
                formatter={(value, name) => [`${Math.round(value)} `, chartConfig[name].label]}
              />}
            />
            <Line
              dataKey="ending_elo"
              type="linear"
              stroke="var(--color-ending_elo)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default FighterEloChart