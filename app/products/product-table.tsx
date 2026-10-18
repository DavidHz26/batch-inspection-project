import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";
import Link from "next/link";

export async function ProductTable() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return <p>Select an organization to see its products.</p>;

  const products = await getProducts(organizationId);
  if (products.length === 0) {
    console.info("[products] No hay productos para mostrar");
    return <p>No products registered.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Active</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              <Link href={`/products/${product.id}`} className="underline">
                {product.sku}
              </Link>
            </td>
            <td>{product.name}</td>
            <td>{product.is_active ? "Yes" : "No"}</td>
            <td>{new Date(product.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
