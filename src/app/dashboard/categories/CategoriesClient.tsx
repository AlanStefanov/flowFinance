"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string | null;
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

const PRESET_COLORS = [
  "#4ef07c", // green
  "#4eb8f0", // blue
  "#f0b84e", // yellow
  "#f07a4e", // orange
  "#e84ec7", // pink
  "#4ef0e8", // cyan
  "#f04e4e", // red
  "#a84ef0", // purple
];

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]!);
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setColor(PRESET_COLORS[0]!);
    setIcon("");
    setEditingCategory(null);
    setShowForm(false);
    setError("");
  };

  const openEditForm = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      const savedCategory = await res.json();

      if (editingCategory) {
        setCategories(
          categories.map((c) =>
            c.id === savedCategory.id ? savedCategory : c
          )
        );
      } else {
        setCategories([...categories, savedCategory]);
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setCategories(categories.filter((c) => c.id !== id));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
        >
          + Nueva Categoría
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#161918] border border-white/10 rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-medium">
            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          </h2>

          {error && (
            <div className="text-[#f07a4e] text-sm bg-[rgba(240,122,78,0.1)] p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-[#7a8480] mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              placeholder="Ej: Supermercado"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#7a8480] mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    color === c ? "ring-2 ring-white scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#7a8480] mb-1">
              Icono (opcional)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              placeholder="Ej: 🏪"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors disabled:opacity-50"
            >
              {loading
                ? "Guardando..."
                : editingCategory
                  ? "Actualizar"
                  : "Crear"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="bg-[#161918] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium">
            Tus Categorías ({categories.length})
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#4a5450]">
            No tenés categorías aún. ¡Creá tu primera categoría!
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm">{cat.icon && `${cat.icon} `}{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(cat)}
                    className="text-xs text-[#4eb8f0] hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-xs text-[#f07a4e] hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
