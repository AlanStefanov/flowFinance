import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-8 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-[#7a8480] hover:text-[#e8ebe9] transition-colors"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">Categorías</h1>
          <p className="text-[#7a8480] mt-1">
            Gestiona tus categorías personalizadas
          </p>
        </div>
      </div>

      <CategoriesClient initialCategories={categories} />
    </main>
  );
}
