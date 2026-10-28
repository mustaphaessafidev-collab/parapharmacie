function UserAvatar({ user, className = "" }) {
  const initial = (`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "C")
    .slice(0, 1)
    .toUpperCase();
  const src =
    typeof user?.avatarUrl === "string" && user.avatarUrl.startsWith("/uploads/avatars/")
      ? user.avatarUrl
      : "";

  if (src) {
    return <img src={src} alt="" className={`rounded-full object-cover ${className}`} />;
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full bg-emerald-50 font-semibold text-[#159447] ${className}`}
    >
      {initial}
    </span>
  );
}

export default UserAvatar;
