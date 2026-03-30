import Link from 'next/link'
import { notFound } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  phone: string
  website: string
  address: {
    street: string
    city: string
    zipcode: string
  }
  company: {
    name: string
  }
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    next: { revalidate: 60 }
  })
  
  if (!res.ok) {
    notFound() // Redirect ke 404 jika user tidak ditemukan
  }
  
  return res.json()
}

export default async function UserDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const user = await getUser(params.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Detail User
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/users" className="hover:text-blue-600">Users</Link>
          <span className="mx-2">/</span>
          <span>{user.name}</span>
        </nav>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <Link 
            href="/users"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Kembali
          </Link>
          <Link 
            href={`/users/${user.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ✏️ Edit
          </Link>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                {user.name.charAt(0)}
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-blue-100 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Body Card */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  📞 Informasi Kontak
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-blue-600">
                      <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  📍 Alamat
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Jalan</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.address.street}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Kota</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.address.city}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Kode Pos</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.address.zipcode}</dd>
                  </div>
                </dl>
              </div>

              {/* Company */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  🏢 Perusahaan
                </h3>
                <p className="text-sm text-gray-900">{user.company.name}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}