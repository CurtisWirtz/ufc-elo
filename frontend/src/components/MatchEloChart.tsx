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
      color: "#fb923c",
    },
    fighter2_elo: {
      label: fighter2.name,
      color: "#808080",
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
  // let lastFighter1Elo = null;
  // let lastFighter2Elo = null;

  // const combinedData = sortedData.map((dataPoint) => {
  //   // If a value exists, update the last known value
  //   if (dataPoint.fighter1_elo !== undefined) {
  //     lastFighter1Elo = dataPoint.fighter1_elo;
  //   }
  //   if (dataPoint.fighter2_elo !== undefined) {
  //     lastFighter2Elo = dataPoint.fighter2_elo;
  //   }

  //   // Return a new object with the carried-forward values
  //   return {
  //     ...dataPoint,
  //     fighter1_elo: lastFighter1Elo,
  //     fighter2_elo: lastFighter2Elo,
  //   };
  // });

  const lastDateFighter1 = fighter1.elo_history.length > 0
    ? fighter1.elo_history[fighter1.elo_history.length - 1].date
    : null;
  const lastDateFighter2 = fighter2.elo_history.length > 0
    ? fighter2.elo_history[fighter2.elo_history.length - 1].date
    : null;

  let lastFighter1Elo = null;
  let lastFighter2Elo = null;

  const combinedData = sortedData.map((dataPoint) => {
    // If we've passed the last date for fighter 1, set their Elo to null
    if (new Date(dataPoint.date).getTime() > new Date(lastDateFighter1).getTime()) {
      lastFighter1Elo = null;
    } else if (dataPoint.fighter1_elo !== undefined) {
      // Otherwise, apply the carry-forward logic
      lastFighter1Elo = dataPoint.fighter1_elo;
    }

    // If we've passed the last date for fighter 2, set their Elo to null
    if (new Date(dataPoint.date).getTime() > new Date(lastDateFighter2).getTime()) {
      lastFighter2Elo = null;
    } else if (dataPoint.fighter2_elo !== undefined) {
      // Otherwise, apply the carry-forward logic
      lastFighter2Elo = dataPoint.fighter2_elo;
    }

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
            <Legend width={200} wrapperStyle={{ top: 40, left: 100, backgroundColor: 'transparent', border: '1px solid #d5d5d5', borderRadius: 10, lineHeight: '40px' }} />
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
              name={chartConfig.fighter1_elo.label}
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
              name={chartConfig.fighter2_elo.label}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MatchEloChart;