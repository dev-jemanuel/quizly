export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F0EFFE] pb-24">

      {/* Navbar skeleton */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="w-24 h-7 bg-purple-100 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          <div className="w-9 h-9 bg-white rounded-xl animate-pulse" />
          <div className="w-9 h-9 bg-white rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="px-4">

        {/* Hero skeleton */}
        <div className="bg-purple-200 rounded-2xl p-5 mb-5 h-36 animate-pulse" />

        {/* Categorias skeleton */}
        <div className="flex gap-2 mb-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-shrink-0 w-24 h-8 bg-white rounded-full animate-pulse" />
          ))}
        </div>

        {/* Destaque skeleton */}
        <div className="w-32 h-5 bg-gray-200 rounded-lg mb-3 animate-pulse" />
        <div className="bg-white rounded-2xl overflow-hidden mb-6 animate-pulse">
          <div className="w-full h-44 bg-purple-100" />
          <div className="p-4 space-y-3">
            <div className="w-24 h-4 bg-gray-100 rounded-lg" />
            <div className="w-full h-5 bg-gray-100 rounded-lg" />
            <div className="w-3/4 h-4 bg-gray-100 rounded-lg" />
            <div className="flex justify-between">
              <div className="w-20 h-4 bg-gray-100 rounded-lg" />
              <div className="w-24 h-8 bg-purple-100 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Seção skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-32 h-5 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-16 h-4 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Grid 2 colunas skeleton */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-28 bg-purple-100" />
              <div className="p-3 space-y-2">
                <div className="w-20 h-4 bg-gray-100 rounded-lg" />
                <div className="w-full h-4 bg-gray-100 rounded-lg" />
                <div className="w-3/4 h-4 bg-gray-100 rounded-lg" />
                <div className="flex gap-2">
                  <div className="w-12 h-4 bg-gray-100 rounded-md" />
                  <div className="w-16 h-4 bg-gray-100 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Segunda seção skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-28 h-5 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-16 h-4 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-28 bg-purple-100" />
              <div className="p-3 space-y-2">
                <div className="w-20 h-4 bg-gray-100 rounded-lg" />
                <div className="w-full h-4 bg-gray-100 rounded-lg" />
                <div className="flex gap-2">
                  <div className="w-12 h-4 bg-gray-100 rounded-md" />
                  <div className="w-16 h-4 bg-gray-100 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}