"use client";
import { toast } from "sonner";
import { trpc as api } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const useTUser = () => {
  const users = api.user.list.useQuery();
  const utils = api.useUtils?.();
const createUser = api.user.create.useMutation({
    onSuccess: () => {
      utils?.user.list.invalidate();
},
});
return {
    users: users.data,
    isLoading: users.isLoading,
    createUser,
  };
};

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: 48,
            minWidth: 420,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}>
            <h1 style={{ color: '#0070f3', fontSize: 38, marginBottom: 24, fontWeight: 800, letterSpacing: 1 }}>Bienvenue sur l'espace produits</h1>
            <p style={{ fontSize: 22, marginBottom: 36, color: '#333' }}>
              Vous devez être connecté pour accéder à cette page.
            </p>
            <SignInButton mode="modal">
              <button style={{
                padding: '16px 40px',
                background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 22,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'background 0.2s',
              }}>
                Se connecter
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default function ProductPage() {
  const { data: products, isLoading, refetch } = api.product.list.useQuery();
  const createProduct = api.product.create.useMutation({ onSuccess: () => refetch() });
  const updateProduct = api.product.update.useMutation({ onSuccess: () => refetch() });
  const deleteProduct = api.product.delete.useMutation({ onSuccess: () => refetch() });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();

  const { data: userData, isLoading: userLoading } = api.user.getUser.useQuery();
  console.log('userData (profil complet)', userData);

  const [showProfile, setShowProfile] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const startEdit = (product: any) => {
    setEditId(product.id);
    setValue("id", product.id);
    setValue("name", product.name);
    setValue("description", product.description || "");
    setValue("price", product.price);
  };

  const cancelEdit = () => {
    setEditId(null);
    reset();
  };

  const onSubmit = (data: any) => {
    data.price = parseFloat(data.price);
    if (editId) {
      updateProduct.mutate({ ...data, id: editId }, { onSuccess: () => { setEditId(null); reset(); } });
    } else {
      createProduct.mutate(data, { onSuccess: () => reset() });
    }
  };

  return (
    <PrivateRoute>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'Inter, sans-serif',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        transition: 'background 0.2s, color 0.2s',
      }}>
        <style>{`
          :root {
            --bg: #f8fafc;
            --card: #fff;
            --border: #e5e7eb;
            --text: #0f172a;
            --text-secondary: #334155;
            --primary: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
            --danger: #f87171;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #18181b;
              --card: #23232a;
              --border: #31313a;
              --text: #f1f5f9;
              --text-secondary: #cbd5e1;
              --primary: linear-gradient(90deg, #818cf8 0%, #22d3ee 100%);
              --danger: #ef4444;
            }
          }
        `}</style>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          <div style={{
            flex: '1 1 320px',
            minWidth: 280,
            background: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 18,
              padding: 12,
              borderRadius: 8,
              background: 'var(--card)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid var(--border)',
            }}>
              <UserButton appearance={{ elements: { avatarBox: { width: 48, height: 48 } } }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{userData?.email}</span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Rôle : <b>{userLoading ? 'Chargement...' : (userData as any)?.role ?? '-'}</b></span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ID : {userData?.clerkUserId ?? 'inconnu'}</span>
                <button onClick={() => setShowProfile(true)} style={{
                  marginTop: 8,
                  padding: '6px 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'background 0.2s',
                  alignSelf: 'flex-start',
                }}>Voir mon profil</button>
              </div>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{editId ? 'Modifier un produit' : 'Ajouter un produit'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {editId && <input type="hidden" {...register("id")}/>} 
              <input {...register("name", { required: "Le nom est requis" })} placeholder="Nom du produit" style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 15, background: 'var(--card)', color: 'var(--text)' }} />
              {errors.name && <span style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.name.message as string}</span>}
              <input {...register("price", { required: "Le prix est requis", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Prix invalide" } })} placeholder="Prix" type="number" step="0.01" style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 15, background: 'var(--card)', color: 'var(--text)' }} />
              {errors.price && <span style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.price.message as string}</span>}
              <textarea {...register("description")} placeholder="Description" rows={2} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 15, resize: 'vertical', background: 'var(--card)', color: 'var(--text)' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="submit" disabled={isSubmitting || createProduct.isPending || updateProduct.isPending} style={{
                  padding: '8px 18px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'background 0.2s',
                }}>
                  {editId ? (updateProduct.isPending ? 'Modification...' : 'Modifier') : (createProduct.isPending ? 'Ajout...' : 'Ajouter')}
                </button>
                {editId && <button type="button" onClick={cancelEdit} style={{
                  padding: '8px 14px',
                  background: 'var(--border)',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}>Annuler</button>}
              </div>
              {(createProduct.error || updateProduct.error) && (
                <div style={{ color: 'var(--danger)', marginTop: 6, fontSize: 14 }}>
                  Erreur : {(createProduct.error || updateProduct.error)?.message}
                </div>
              )}
            </form>
          </div>
          <div style={{
            flex: '2 1 400px',
            minWidth: 320,
            background: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Liste des produits</h2>
            {isLoading ? (
              <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Chargement...</div>
            ) : products && products.length > 0 ? (
              <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.map((p: any) => (
                  <li key={p.id} style={{
                    marginBottom: 0,
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--card)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{p.description}</div>
                    <div style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 15 }}>Prix : {p.price} €</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => startEdit(p)} style={{
                        padding: '6px 14px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 5,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}>Modifier</button>
                      <button onClick={() => deleteProduct.mutate({ id: p.id })} style={{
                        padding: '6px 14px',
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 5,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}>Supprimer</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Aucun produit trouvé.</div>
            )}
          </div>
        </div>
        {showProfile && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'var(--card)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: 36,
              minWidth: 340,
              maxWidth: 400,
              color: 'var(--text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              position: 'relative',
            }}>
              <button onClick={() => setShowProfile(false)} style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}>&times;</button>
              <UserButton appearance={{ elements: { avatarBox: { width: 64, height: 64 } } }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Mon profil</h2>
              <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div><b>Email :</b> <span style={{ color: 'var(--text-secondary)' }}>{userData?.email ?? '-'}</span></div>
                <div><b>Rôle :</b> <span style={{ color: 'var(--text-secondary)' }}>{userLoading ? 'Chargement...' : (userData as any)?.role ?? '-'}</span></div>
                <div><b>ID Clerk :</b> <span style={{ color: 'var(--text-secondary)' }}>{userData?.clerkUserId ?? '-'}</span></div>
                <div><b>Prénom :</b> <span style={{ color: 'var(--text-secondary)' }}>{userData?.firstName ?? '-'}</span></div>
                <div><b>Nom :</b> <span style={{ color: 'var(--text-secondary)' }}>{userData?.lastName ?? '-'}</span></div>
                <div><b>ID interne :</b> <span style={{ color: 'var(--text-secondary)' }}>{userData?.id ?? '-'}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}