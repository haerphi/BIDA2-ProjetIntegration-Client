import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courtService } from '../../api/court.service';
import type { Court } from '../../interfaces/court.interface';
import Header from '../../layout/header';
import CustomIcon from '../../components/common/Icons/custom-icon';
import ConfirmModal from '../../components/common/confirm-modal';

export default function CourtAdminListPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for deleting a court
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    courtService
      .getAll()
      .then((data) => setCourts(data))
      .catch(() => setError('Impossible de charger la liste des terrains.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!courtToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await courtService.delete(courtToDelete.id);
      setCourts((prev) => prev.filter((court) => court.id !== courtToDelete.id));
      setCourtToDelete(null);
    } catch (err: any) {
      setDeleteError('Une erreur est survenue lors de la suppression du terrain.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Header pageName="Terrains" icon="GeoAlt" />

      <div className="container mt-2">
        <Link to="/courts/create" className="btn btn-success float-end">
          <CustomIcon iconName="PlusCircle" className="me-1" /> Ajouter un terrain
        </Link>
      </div>

      <div className="card bg-white rounded-3 border-stone-200 m-4 shadow-sm overflow-hidden border-0">
        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-emerald-600" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <span className="ms-3 text-stone-500">Chargement des terrains…</span>
          </div>
        ) : (
          <table className="table table-hover mb-0">
            <thead className="bg-stone-50 border-bottom border-stone-200">
              <tr>
                <th className="py-3 px-4 text-stone-600 fw-semibold small text-uppercase" style={{ width: '1%' }}>
                  #
                </th>
                <th className="py-3 px-4 text-stone-600 fw-semibold small text-uppercase">Nom du terrain</th>
                <th
                  className="py-3 px-4 text-stone-600 fw-semibold small text-uppercase text-center"
                  style={{ width: '1%' }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {courts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-stone-500 py-5">
                    Aucun terrain enregistré.
                  </td>
                </tr>
              ) : (
                courts.map((court) => (
                  <tr key={court.id}>
                    <td className="py-3 px-4 text-stone-400 small">{court.id}</td>
                    <td className="py-3 px-4 fw-medium text-stone-800">{court.name}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        className="btn btn-sm btn-outline-danger px-3 py-1 rounded-2"
                        onClick={() => setCourtToDelete(court)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-stone-50 border-top border-stone-200">
              <tr>
                <td colSpan={3} className="py-2 px-4 text-stone-500 small">
                  {courts.length} terrain{courts.length !== 1 ? 's' : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={courtToDelete !== null}
        title="Supprimer le terrain"
        message={
          <div>
            <p>
              Êtes-vous sûr de vouloir supprimer le terrain <strong>{courtToDelete?.name}</strong> ?
            </p>
            <p className="text-danger small mb-0">Cette action est irréversible.</p>
            {deleteError && (
              <div className="alert alert-danger mt-3 py-2 px-3 small mb-0" role="alert">
                {deleteError}
              </div>
            )}
          </div>
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setCourtToDelete(null);
          setDeleteError(null);
        }}
      />
    </>
  );
}
