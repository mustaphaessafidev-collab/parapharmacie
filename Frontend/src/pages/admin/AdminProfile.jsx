import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { changePassword, fetchProfile, updateProfile } from "../../services/adminService";
import { clearSession, getSession, updateSessionUser } from "../../services/authService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AdminProfile() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(getSession()?.user);
  const [form, setForm] = useState(null);
  const [password, setPassword] = useState(emptyPassword);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

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
          role: profile.role,
          createdAt: profile.createdAt,
        });
        setSessionUser(updateSessionUser(profile) || profile);
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
  }, []);

  const saveProfile = async (event) => {
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
      });
      const profile = result.profile;
      setForm((current) => ({
        ...current,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || "",
        role: profile.role,
        createdAt: profile.createdAt,
      }));
      setSessionUser(updateSessionUser(profile) || profile);
      setNotice("Profil enregistré.");
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

    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      setSavingPassword(false);
      return;
    }

    try {
      await changePassword(password);
      setPassword(emptyPassword);
      setPasswordNotice("Mot de passe mis à jour.");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const fullName = `${form?.firstName || ""} ${form?.lastName || ""}`.trim() || "Admin";

  return (
    <AdminLayout
      user={sessionUser}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Profil"
    >
      <h1 className="text-2xl font-semibold text-slate-900">Profil</h1>
      <p className="mt-1 text-sm text-slate-400">
        Informations du compte administrateur connecté.
      </p>

      {loading && <p className="mt-8 text-sm text-slate-400">Chargement du profil…</p>}
      {!loading && error && !form && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      {form && (
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <form
            onSubmit={saveProfile}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-xl font-semibold text-[#1f9d55]">
                {fullName.slice(0, 1)}
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900">{fullName}</p>
                <p className="text-sm text-slate-400">Admin</p>
                <p className="mt-1 text-xs text-slate-400">
                  Photo de profil non prévue dans le compte.
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Rôle</dt>
                <dd className="font-medium text-slate-800">Admin</dd>
              </div>
              <div>
                <dt className="text-slate-400">Création du compte</dt>
                <dd className="font-medium text-slate-800">
                  {form.createdAt ? dateFormat.format(new Date(form.createdAt)) : "—"}
                </dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            )}
            {notice && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {notice}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-600">
                Prénom
                <input
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  required
                  maxLength={100}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
              <label className="text-sm text-slate-600">
                Nom
                <input
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  required
                  maxLength={100}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
              <label className="text-sm text-slate-600 sm:col-span-2">
                Adresse e-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                  maxLength={255}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
              <label className="text-sm text-slate-600 sm:col-span-2">
                Téléphone
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  maxLength={20}
                  placeholder="06XXXXXXXX"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-5 rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </form>

          <form
            onSubmit={savePassword}
            className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <h2 className="text-lg font-semibold text-slate-900">Mot de passe</h2>
            <p className="mt-1 text-sm text-slate-400">
              8 caractères minimum, avec une majuscule et un chiffre.
            </p>
            {passwordError && (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {passwordError}
              </p>
            )}
            {passwordNotice && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {passwordNotice}
              </p>
            )}
            <label className="mt-4 block text-sm text-slate-600">
              Mot de passe actuel
              <input
                type="password"
                value={password.currentPassword}
                onChange={(event) =>
                  setPassword({ ...password, currentPassword: event.target.value })
                }
                required
                autoComplete="current-password"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <label className="mt-4 block text-sm text-slate-600">
              Nouveau mot de passe
              <input
                type="password"
                value={password.newPassword}
                onChange={(event) =>
                  setPassword({ ...password, newPassword: event.target.value })
                }
                required
                autoComplete="new-password"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <label className="mt-4 block text-sm text-slate-600">
              Confirmer le mot de passe
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(event) =>
                  setPassword({ ...password, confirmPassword: event.target.value })
                }
                required
                autoComplete="new-password"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <button
              type="submit"
              disabled={savingPassword}
              className="mt-5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              {savingPassword ? "Mise à jour…" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProfile;
