import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label
} from "recharts";

const WordFrequencyBar = ({ wordFrequencies }) => {
  // ✅ HARD GUARD
  if (!wordFrequencies || Object.keys(wordFrequencies).length === 0) {
    return <p style={{ textAlign: "center", opacity: 0.6 }}>No word data</p>;
  }

 const data = wordFrequencies
  ? Object.entries(wordFrequencies)
      .map(([word, count]) => ({ word, count }))
      .slice(0, 15)
  : [];


  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
      >
        <CartesianGrid stroke="#2a2f45" strokeDasharray="3 3" />

        <XAxis type="number" stroke="#cbd5e1">
          <Label
            value="Frequency"
            position="insideBottom"
            offset={-20}
            fill="#cbd5e1"
          />
        </XAxis>

        <YAxis
          type="category"
          dataKey="word"
          stroke="#cbd5e1"
          width={90}
        >
          <Label
            value="Words"
            angle={-90}
            position="insideLeft"
            offset={-40}
            fill="#cbd5e1"
          />
        </YAxis>

        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #22d3ee",
            color: "#e5e7eb"
          }}
        />

        <Bar dataKey="count" fill="#2ef2d3" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WordFrequencyBar;
