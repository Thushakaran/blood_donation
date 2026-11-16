export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-rose-800">About Us</h1>
      <div className="grid gap-8 rounded-3xl bg-white p-8 shadow md:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-700 to-red-400 p-10 text-center text-white">
          <p className="text-3xl font-semibold">Every donation is a lifeline.</p>
        </div>
        <p className="self-center text-slate-600 leading-7">
          Our blood bank is a cornerstone of lifesaving care, committed to providing a continuous and
          safe supply of blood and blood products. We collect, test, and store donations with the
          utmost care, ensuring that blood is always available to those in need. From red blood cells
          to plasma and platelets, our facilities prepare and distribute these essential components,
          supporting a wide range of medical treatments. Donate today and be the lifeline someone
          needs tomorrow.
        </p>
      </div>
    </div>
  );
}
