import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { formatDate } from "../lib/dateUtils.ts";

export const description = "A linear line chart, plotting the ratings across time for two fighters";

// export const chartConfig = {
//   fighter1_elo: {
//     label: fighter1.name,
//     color: "var(--chart-3)",
//   },
//   fighter2_elo: {
//     label: fighter2.name,
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig;

const MatchEloChart = ({ fighter1, fighter2 }) => {
  const chartConfig = {
    fighter1_elo: {
      label: fighter1.name,
      color: "var(--chart-3)",
    },
    fighter2_elo: {
      label: fighter2.name,
      color: "var(--chart-1)",
    },
  };

  const combinedDataMap = new Map();

  fighter1.elo_history.forEach((dataPoint) => {
    combinedDataMap.set(dataPoint.date, {
      date: dataPoint.date,
      fighter1_elo: dataPoint.ending_elo,
    });
  });

  fighter2.elo_history.forEach((dataPoint) => {
    const existingData = combinedDataMap.get(dataPoint.date);
    combinedDataMap.set(dataPoint.date, {
      ...existingData,
      date: dataPoint.date,
      fighter2_elo: dataPoint.ending_elo,
    });
  });

  // Sort the combined data by date
  const sortedData = Array.from(combinedDataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Apply the "carry-forward" logic to fill in missing data points
  // we carry the last known rating to align with the date that the other fighter had an Elo update.
  // otherwise, the chart lines are broken up
  let lastFighter1Elo = null;
  let lastFighter2Elo = null;

  const combinedData = sortedData.map((dataPoint) => {
    // If a value exists, update the last known value
    if (dataPoint.fighter1_elo !== undefined) {
      lastFighter1Elo = dataPoint.fighter1_elo;
    }
    if (dataPoint.fighter2_elo !== undefined) {
      lastFighter2Elo = dataPoint.fighter2_elo;
    }

    // Return a new object with the carried-forward values
    return {
      ...dataPoint,
      fighter1_elo: lastFighter1Elo,
      fighter2_elo: lastFighter2Elo,
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex">
          <CardTitle>Fighter Rating History</CardTitle>
          <CardDescription className="ml-5">
            {combinedData.length > 0
              ? `${formatDate(combinedData[0].date)} - ${formatDate(
                  combinedData[combinedData.length - 1].date
                )}`
              : "No data available"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={combinedData}
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
              domain={["dataMin - 25", "dataMax + 25"]}
              tickFormatter={(value) => Math.round(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value, name) => [
                    `${Math.round(value)}`,
                    chartConfig[name]?.label,
                  ]}
                />
              }
            />
            <Legend width={100} wrapperStyle={{ top: 40, left: 100, backgroundColor: 'transparent', border: '1px solid #d5d5d5', borderRadius: 10, lineHeight: '40px' }} />
            <Line
              dataKey="fighter1_elo"
              type="linear"
              stroke="var(--color-fighter1_elo)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-fighter1_elo)",
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="fighter2_elo"
              type="linear"
              stroke="var(--color-fighter2_elo)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-fighter2_elo)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MatchEloChart;