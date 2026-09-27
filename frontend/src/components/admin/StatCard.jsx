const TONES = {
  indigo: "bg-indigo-50 text-indigo-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
};

const StatCard = ({ label, value, icon: Icon, tone = "indigo" }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[tone]}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default StatCard;