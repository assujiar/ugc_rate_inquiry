export default function NoAccessPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-gray-900">No Access</h1>
      <p className="text-sm text-gray-600">
        Anda tidak memiliki permission untuk membuka halaman ini. Silakan hubungi Admin untuk update role/permission.
      </p>
    </div>
  );
}
