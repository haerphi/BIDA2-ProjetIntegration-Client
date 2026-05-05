export default function CourtListingPage() {
  return (
    <>
      <header className="bg-white border-bottom border-stone-200 px-4 py-3 d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0 fw-semibold text-stone-800">Planning des terrains</h2>
      </header>

      <div className="card bg-white rounded-3 border-stone-200 m-4 shadow-sm overflow-hidden border-0">
        <div className="bg-stone-50 p-3 border-bottom border-stone-200 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary bg-white border-stone-300">Aujourd'hui</button>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-secondary bg-white border-stone-300">&lt;</button>
              <button className="btn btn-sm btn-outline-secondary bg-white border-stone-300">&gt;</button>
            </div>
          </div>
          <div className="d-flex gap-3 small text-stone-700">
            <span className="d-flex align-items-center gap-1">
              <i className="text-emerald-500" style={{ fontStyle: 'normal' }}>
                ●
              </i>{' '}
              Libre
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="text-primary" style={{ fontStyle: 'normal' }}>
                ●
              </i>{' '}
              Ma réservation
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="text-stone-500" style={{ fontStyle: 'normal' }}>
                ●
              </i>{' '}
              Réservé
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered mb-0 text-center align-middle" style={{ fontSize: '0.875rem' }}>
            <thead className="bg-stone-50 border-stone-200 text-stone-700">
              <tr>
                <th className="py-3 bg-stone-50 border-stone-200 fw-medium" style={{ width: '100px' }}>
                  Heure
                </th>
                <th className="py-3 bg-stone-50 border-stone-200 fw-medium">Terrain 1</th>
                <th className="py-3 bg-stone-50 border-stone-200 fw-medium">Terrain 2</th>
                <th className="py-3 bg-stone-50 border-stone-200 fw-medium">Terrain 3</th>
                <th className="py-3 bg-stone-50 border-stone-200 fw-medium">Terrain 4</th>
              </tr>
            </thead>
            <tbody className="border-stone-100">
              <tr>
                <td className="bg-stone-50 border-stone-200 fw-medium text-stone-600 py-3">10h00</td>
                <td className="p-1 border-stone-200" style={{ height: '72px' }}>
                  <div className="bg-stone-200 text-stone-500 rounded h-100 d-flex align-items-center justify-content-center">
                    Réservé
                  </div>
                </td>
                <td className="p-1 border-stone-200" style={{ height: '72px' }}>
                  <div
                    className="border border-2 border-emerald-400 bg-emerald-50 text-emerald-600 fw-medium rounded h-100 d-flex align-items-center justify-content-center hover-bg-emerald-50 transition"
                    style={{ cursor: 'pointer', borderStyle: 'dashed !important' }}
                  >
                    Réserver
                  </div>
                </td>
                <td className="p-1 border-stone-200"></td>
                <td className="p-1 border-stone-200"></td>
              </tr>
              <tr>
                <td className="bg-stone-50 border-stone-200 fw-medium text-stone-600 py-3">18h00</td>
                <td className="p-1 border-stone-200" style={{ height: '72px' }}></td>
                <td className="p-1 border-stone-200" style={{ height: '72px' }}>
                  <div
                    className="bg-primary text-white rounded h-100 p-2 text-start lh-sm"
                    style={{ fontSize: '11px' }}
                  >
                    <strong className="d-block mb-1">Simple</strong>avec M. Curie
                  </div>
                </td>
                <td className="p-1 border-stone-200"></td>
                <td className="p-1 border-stone-200"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
