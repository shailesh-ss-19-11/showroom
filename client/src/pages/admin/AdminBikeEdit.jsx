import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import BikeForm from "../../components/admin/BikeForm";
import ColorManager from "../../components/admin/ColorManager";
import ImageManager from "../../components/admin/ImageManager";
import Loader from "../../components/ui/Loader";

export default function AdminBikeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  const load = useCallback(() => {
    if (isNew) return;
    setLoading(true);
    api.get(`/bikes/${id}`).then((res) => setBike(res.data)).finally(() => setLoading(false));
  }, [id, isNew]);

  useEffect(load, [load]);

  async function handleCreate(payload) {
    const { data } = await api.post("/bikes", payload);
    navigate(`/admin/bikes/${data.id}`, { replace: true });
  }

  async function handleUpdate(payload) {
    const { data } = await api.put(`/bikes/${id}`, payload);
    setBike(data);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link to="/admin/bikes" className="text-sm font-semibold text-brand hover:underline">← Back to bikes</Link>
        {!isNew && bike && (
          <Link to={`/admin/bikes/${bike.id}/view`} className="text-sm font-semibold text-ink hover:underline">
            View Bike →
          </Link>
        )}
      </div>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">{isNew ? "Add New Bike" : `Edit ${bike?.name}`}</h1>

      <div className="mt-6 flex flex-col gap-6">
        <BikeForm
          key={bike?.id || "new"}
          initial={bike || undefined}
          onSubmit={isNew ? handleCreate : handleUpdate}
          submitLabel={isNew ? "Create Bike" : "Save Changes"}
        />

        {isNew && (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-ink-soft">
            Save the bike first — you'll then be able to add colors and upload photos.
          </p>
        )}

        {!isNew && bike && (
          <>
            <ColorManager bikeId={bike.id} colors={bike.colors} onChange={load} />
            <ImageManager bikeId={bike.id} images={bike.images} colors={bike.colors} onChange={load} />
          </>
        )}
      </div>
    </div>
  );
}
