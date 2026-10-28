import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { changePassword, fetchProfile, removeAvatar, updateProfile, uploadAvatar } from "../../services/clientService";
import { updateSessionUser } from "../../services/authService";
import UserAvatar from "../../components/UserAvatar";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const emptyPassword = { currentPassword: "", newPassword: "", confirmPassword: "" };

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#159447]";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ClientProfile() {
  const navigate = useNavigate();
  const { setUser } = useOutletContext();
  const [form, setForm] = useState(null);
  const [password, setPassword] = useState(emptyPassword);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoNotice, setPhotoNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((result) => {
        if (!active) return;
        const profile = result.profile;
        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          city: profile.city || "",
          addressLine: profile.addressLine || "",
          addressDetails: profile.addressDetails || "",
          avatarUrl: profile.avatarUrl || "",
          createdAt: profile.createdAt,
          role: profile.role,
        });
        const next = updateSessionUser(profile);
        if (next) setUser(next);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setUser]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        addressLine: form.addressLine,
        addressDetails: form.addressDetails,
      });
      const profile = result.profile;
      setForm((current) => ({
        ...current,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || "",
        city: profile.city || "",
        addressLine: profile.addressLine || "",
        addressDetails: profile.addressDetails || "",
        avatarUrl: profile.avatarUrl || "",
      }));
      const next = updateSessionUser(profile);
      if (next) setUser(next);
      setNotice("Profil mis à jour.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordNotice("");
    try {
      const result = await changePassword(password);
      setPassword(emptyPassword);
      setPasswordNotice(result.message);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const remember = (profile) => {
    const next = updateSessionUser({
      ...profile,
      avatarUrl:
        profile.avatarUrl && String(profile.avatarUrl).startsWith("/uploads/avatars/")
          ? profile.avatarUrl
          : null,
    });
    if (next) setUser(next);
  };

  const onAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoError("");
    setPhotoNotice("");
    if (!AVATAR_TYPES.includes(file.type)) {
      setPhotoError("Format d'image non accepté. Utilisez JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setPhotoError("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    const local = URL.createObjectURL(file);
    setPreview(local);
    setUploading(true);
    try {
      const result = await uploadAvatar(file);
      setForm((current) => ({ ...current, avatarUrl: result.profile.avatarUrl || "" }));
      remember(result.profile);
      setPhotoNotice("Photo enregistrée.");
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploading(false);
      setPreview("");
    }
  };

  const clearAvatar = async () => {
    setUploading(true);
    setPhotoError("");
    setPhotoNotice("");
    try {
      const result = await removeAvatar();
      setForm((current) => ({ ...current, avatarUrl: "" }));
      remember(result.profile);
      setPhotoNotice("Photo retirée.");
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Chargement du profil…</p>;
  if (!form) return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="border border-neutral-200 bg-white p-5">
        <h1 className="text-2xl font-extrabold">Mon profil</h1>
        <p className="mt-1 text-xs text-slate-400">
          Compte client depuis le {form.createdAt ? dateFormat.format(new Date(form.createdAt)) : "—"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {preview ? (
            <img src={preview} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <UserAvatar user={form} className="h-16 w-16 text-lg" />
          )}
          <div>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-full bg-[#159447] px-3 py-1.5 text-xs font-semibold text-white">
                {uploading ? "Envoi…" : form.avatarUrl ? "Changer la photo" : "Ajouter une photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={onAvatar}
                />
              </label>
              {form.avatarUrl && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  disabled={uploading}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
                >
                  Retirer
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">JPG, PNG ou WEBP, 2 Mo maximum.</p>
          </div>
        </div>
        {photoError && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{photoError}</p>}
        {photoNotice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{photoNotice}</p>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {notice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Prénom"><input required value={form.firstName} onChange={set("firstName")} className={inputClass} /></Field>
          <Field label="Nom"><input required value={form.lastName} onChange={set("lastName")} className={inputClass} /></Field>
          <Field label="E-mail"><input required type="email" value={form.email} onChange={set("email")} className={`${inputClass} sm:col-span-2`} /></Field>
          <Field label="Téléphone"><input value={form.phone} onChange={set("phone")} className={inputClass} /></Field>
          <Field label="Ville"><input value={form.city} onChange={set("city")} className={inputClass} /></Field>
          <Field label="Adresse"><input value={form.addressLine} onChange={set("addressLine")} className={`${inputClass} sm:col-span-2`} /></Field>
          <Field label="Complément"><input value={form.addressDetails} onChange={set("addressDetails")} placeholder="Immeuble, étage, appartement" className={`${inputClass} sm:col-span-2`} /></Field>
        </div>
        <button type="submit" disabled={saving} className="mt-5 h-11 rounded-full bg-[#159447] px-5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </form>

      <form onSubmit={savePassword} className="h-fit border border-neutral-200 bg-white p-5">
        <h2 className="text-xl font-extrabold">Mot de passe</h2>
        {passwordError && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{passwordError}</p>}
        {passwordNotice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{passwordNotice}</p>}
        <div className="mt-4 space-y-4">
          <Field label="Mot de passe actuel">
            <input required type="password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} />
          </Field>
          <Field label="Nouveau mot de passe">
            <input required type="password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} className={inputClass} />
          </Field>
          <Field label="Confirmer">
            <input required type="password" value={password.confirmPassword} onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))} className={inputClass} />
          </Field>
        </div>
        <button type="submit" disabled={savingPassword} className="mt-5 h-11 rounded-full border border-[#159447] px-5 text-sm font-semibold text-[#159447] disabled:opacity-50">
          {savingPassword ? "Mise à jour…" : "Changer le mot de passe"}
        </button>
        <button type="button" onClick={() => navigate("/client")} className="mt-3 block text-xs text-slate-400">
          Le rôle du compte reste Client.
        </button>
      </form>
    </div>
  );
}

export default ClientProfile;
