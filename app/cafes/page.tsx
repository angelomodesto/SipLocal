import cafesData from "../data/cafes.json" assert { type: "json" };

type Cafe = {
  id: number;
  name: string;
  rating: number;
  summary: string;
  image: string;
};

const cafes: Cafe[] = cafesData;


export default function CafesPage() {
  return (
    <main className="p-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6">Cafes</h1>

      {/* A grid layout to show each cafe nicely */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Loop through the cafes list and display each one */}
        {cafes.map((cafe) => (
          <div key={cafe.id} className="p-4 bg-white rounded-2xl shadow">
            {/* Show image */}
            <img
              src={cafe.image}
              alt={cafe.name}
              className="rounded-xl mb-2"
            />
            {/* Show name */}
            <h2 className="text-xl font-semibold">{cafe.name}</h2>
            {/* Show rating */}
            <p className="text-gray-500">{cafe.rating}</p>
            {/* Show summary */}
            <p className="mt-2">{cafe.summary}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
